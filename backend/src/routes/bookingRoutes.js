const express = require("express");
const bookingController = require("../controllers/bookingController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createBookingRules,
  updateBookingStatusRules,
  bookingIdParam,
  listBookingRules
} = require("../validators/bookingValidators");

const router = express.Router();

// Stripe webhook must be BEFORE authenticate and body parsers add JSON parsing
router.post("/webhook", express.raw({ type: "application/json" }), bookingController.stripeWebhook);

router.use(authenticate);

router.post("/", createBookingRules, validateRequest, bookingController.createBooking);
router.post("/checkout-session", bookingController.createCheckoutSession);
router.get("/my", bookingController.getMyBookings);
router.get("/monthly-stats", authorize("admin"), bookingController.getMonthlyStats);
router.get("/", authorize("admin"), listBookingRules, validateRequest, bookingController.getBookings);
router.get("/:id/ticket", bookingController.getTicket);
router.get("/:id", bookingIdParam, validateRequest, bookingController.getBooking);
router.patch(
  "/:id/status",
  authorize("admin"),
  updateBookingStatusRules,
  validateRequest,
  bookingController.updateBookingStatus
);

module.exports = router;

