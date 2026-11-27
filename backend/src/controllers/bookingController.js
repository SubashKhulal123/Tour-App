const Booking = require("../models/Booking");
const Tour = require("../models/Tour");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createBooking = catchAsync(async (req, res, next) => {
  const { tourId, numberOfPeople } = req.body;
  const tour = await Tour.findById(tourId);

  if (!tour) {
    return next(new AppError("Tour not found", 404));
  }

  if (numberOfPeople > tour.maxGroupSize) {
    return next(new AppError(`This tour allows a maximum group size of ${tour.maxGroupSize}`, 400));
  }

  const booking = await Booking.create({
    userId: req.user._id,
    tourId,
    numberOfPeople,
    totalPrice: tour.price * numberOfPeople,
    status: "pending"
  });

  await booking.populate(["tourId", "userId"]);

  // 1) Send Email notification (non-blocking)
  sendEmail({
    email: req.user.email,
    subject: `Booking Confirmed: ${tour.name}`,
    message: `Thank you for booking ${tour.name} for ${numberOfPeople} people. Total price: $${booking.totalPrice}. Your booking is pending payment.`
  }).catch((err) => console.error("Email send failed:", err));

  // 2) Generate eSewa Payment Signature
  // In a real app, product_code and secret are provided by eSewa
  const amount = booking.totalPrice;
  const transactionUuid = booking._id.toString();
  const productCode = "EPAYTEST"; 
  const secretKey = "8gBm/:&EnhH.1/q"; 
  
  const message = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const signature = crypto.createHmac("sha256", secretKey).update(message).digest("base64");

  res.status(201).json({
    status: "success",
    data: { 
      booking,
      esewa: {
        amount,
        tax_amount: "0",
        total_amount: amount,
        transaction_uuid: transactionUuid,
        product_code: productCode,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: "http://localhost:5173/tours",
        failure_url: "http://localhost:5173/tours",
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature
      }
    }
  });
});

const getMyBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate("tourId")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: { bookings }
  });
});

const getBookings = catchAsync(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const bookings = await Booking.find(filter)
    .populate("userId", "name email role")
    .populate("tourId")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: { bookings }
  });
});

const getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate("userId", "name email role")
    .populate("tourId");

  if (!booking) {
    return next(new AppError("Booking not found", 404));
  }

  const isOwner = booking.userId._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new AppError("You can only view your own bookings", 403));
  }

  res.status(200).json({
    status: "success",
    data: { booking }
  });
});

const updateBookingStatus = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  )
    .populate("userId", "name email role")
    .populate("tourId");

  if (!booking) {
    return next(new AppError("Booking not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { booking }
  });
});

const getMonthlyStats = catchAsync(async (req, res) => {
  const stats = await Booking.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        bookings: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            { $arrayElemAt: [[ "", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ], "$_id.month"] },
            " ",
            { $toString: "$_id.year" }
          ]
        },
        revenue: 1,
        bookings: 1
      }
    }
  ]);

  res.status(200).json({
    status: "success",
    data: { stats }
  });
});

const getTicket = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate("userId", "name email")
    .populate("tourId", "title location duration price");

  if (!booking) return next(new AppError("Booking not found", 404));

  const isOwner = booking.userId._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new AppError("You can only download your own ticket", 403));
  }

  // Generate QR Code as data URL
  const qrData = JSON.stringify({ bookingId: booking._id, tour: booking.tourId.title, user: booking.userId.name });
  const qrCodeDataUrl = await QRCode.toDataURL(qrData);
  const qrBuffer = Buffer.from(qrCodeDataUrl.split(",")[1], "base64");

  // Build PDF
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=ticket-${booking._id}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(28).fillColor("#0d9488").text("🏔 Tour Ticket", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#6b7280").text(`Booking ID: ${booking._id}`, { align: "center" });
  doc.moveDown(1);

  // Divider
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#e5e7eb");
  doc.moveDown(1);

  // Details
  doc.fontSize(14).fillColor("#111827").text("Tour Details", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor("#374151");
  doc.text(`Tour:         ${booking.tourId.title}`);
  doc.text(`Location:     ${booking.tourId.location}`);
  doc.text(`Duration:     ${booking.tourId.duration} days`);
  doc.moveDown(1);

  doc.fontSize(14).fillColor("#111827").text("Booking Details", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor("#374151");
  doc.text(`Passenger:    ${booking.userId.name}`);
  doc.text(`Email:        ${booking.userId.email}`);
  doc.text(`Travelers:    ${booking.numberOfPeople}`);
  doc.text(`Total Paid:   $${booking.totalPrice}`);
  doc.text(`Status:       ${booking.status.toUpperCase()}`);
  doc.text(`Booked on:    ${new Date(booking.createdAt).toDateString()}`);
  doc.moveDown(1.5);

  // QR Code
  doc.fontSize(12).fillColor("#6b7280").text("Scan QR code to verify booking:", { align: "center" });
  doc.moveDown(0.5);
  doc.image(qrBuffer, { fit: [150, 150], align: "center" });
  doc.moveDown(1);
  doc.fontSize(10).fillColor("#9ca3af").text("Thank you for booking with Tour App!", { align: "center" });

  doc.end();
});

const createCheckoutSession = catchAsync(async (req, res, next) => {
  const { tourId, numberOfPeople } = req.body;
  const tour = await Tour.findById(tourId);
  if (!tour) return next(new AppError("Tour not found", 404));

  const totalPrice = tour.price * Number(numberOfPeople);

  // Create a pending booking first
  const booking = await Booking.create({
    userId: req.user._id,
    tourId,
    numberOfPeople,
    totalPrice,
    status: "pending"
  });

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: {
          name: tour.title,
          description: `${numberOfPeople} traveler(s) — ${tour.location}`,
          images: tour.images?.slice(0, 1) || []
        },
        unit_amount: Math.round(totalPrice * 100) // cents
      },
      quantity: 1
    }],
    mode: "payment",
    success_url: `${process.env.CORS_ORIGIN.split(",")[0]}/payment-success?bookingId=${booking._id}`,
    cancel_url: `${process.env.CORS_ORIGIN.split(",")[0]}/tours/${tourId}`,
    client_reference_id: booking._id.toString(),
    customer_email: req.user.email
  });

  res.status(200).json({
    status: "success",
    data: { sessionUrl: session.url, bookingId: booking._id }
  });
});

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.client_reference_id;
    await Booking.findByIdAndUpdate(bookingId, { status: "confirmed" });
    console.log(`Booking ${bookingId} confirmed via Stripe webhook`);
  }

  res.status(200).json({ received: true });
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookings,
  getBooking,
  updateBookingStatus,
  getMonthlyStats,
  getTicket,
  createCheckoutSession,
  stripeWebhook
};

