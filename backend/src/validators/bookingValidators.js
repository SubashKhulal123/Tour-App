const { body, param, query } = require("express-validator");

const createBookingRules = [
  body("tourId").isMongoId().withMessage("Valid tour id is required"),
  body("numberOfPeople").isInt({ min: 1 }).withMessage("At least one person is required")
];

const updateBookingStatusRules = [
  param("id").isMongoId().withMessage("Invalid booking id"),
  body("status")
    .isIn(["pending", "confirmed", "cancelled"])
    .withMessage("Status must be pending, confirmed, or cancelled")
];

const bookingIdParam = [param("id").isMongoId().withMessage("Invalid booking id")];

const listBookingRules = [
  query("status").optional().isIn(["pending", "confirmed", "cancelled"]).withMessage("Invalid status filter")
];

module.exports = {
  createBookingRules,
  updateBookingStatusRules,
  bookingIdParam,
  listBookingRules
};

