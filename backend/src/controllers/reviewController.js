const Review = require("../models/Review");
const Booking = require("../models/Booking");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.getAllReviews = catchAsync(async (req, res) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: { reviews }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  // Check if user has a confirmed booking for this tour
  const bookings = await Booking.find({ 
    userId: req.user.id, 
    tourId: req.body.tour, 
    status: "confirmed" 
  });

  if (bookings.length === 0) {
    return next(new AppError("You must have a confirmed booking for this tour to leave a review.", 403));
  }

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: { review: newReview }
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) return next(new AppError("No review found with that ID", 404));

  if (review.user._id.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("You can only delete your own reviews", 403));
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null
  });
});
