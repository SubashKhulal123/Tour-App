const { body, param, query } = require("express-validator");

const mongoIdParam = [param("id").isMongoId().withMessage("Invalid tour id")];

const itineraryRules = [
  body("itinerary").isArray({ min: 1 }).withMessage("Itinerary must include at least one day"),
  body("itinerary.*.day").isInt({ min: 1 }).withMessage("Each itinerary day must be a positive number"),
  body("itinerary.*.title").trim().notEmpty().withMessage("Each itinerary day needs a title"),
  body("itinerary.*.description").trim().notEmpty().withMessage("Each itinerary day needs a description")
];

const createTourRules = [
  body("title").trim().isLength({ min: 3, max: 140 }).withMessage("Title must be 3 to 140 characters"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be zero or greater"),
  body("duration").isInt({ min: 1 }).withMessage("Duration must be at least one day"),
  body("description").trim().isLength({ min: 20 }).withMessage("Description must be at least 20 characters"),
  body("images").isArray({ min: 1 }).withMessage("At least one image is required"),
  body("images.*").isURL().withMessage("Each image must be a valid URL"),
  body("maxGroupSize").isInt({ min: 1 }).withMessage("Maximum group size must be at least 1"),
  ...itineraryRules
];

const updateTourRules = [
  ...mongoIdParam,
  body("title").optional().trim().isLength({ min: 3, max: 140 }).withMessage("Title must be 3 to 140 characters"),
  body("location").optional().trim().notEmpty().withMessage("Location cannot be empty"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be zero or greater"),
  body("duration").optional().isInt({ min: 1 }).withMessage("Duration must be at least one day"),
  body("description").optional().trim().isLength({ min: 20 }).withMessage("Description must be at least 20 characters"),
  body("images").optional().isArray({ min: 1 }).withMessage("Images must include at least one URL"),
  body("images.*").optional().isURL().withMessage("Each image must be a valid URL"),
  body("maxGroupSize").optional().isInt({ min: 1 }).withMessage("Maximum group size must be at least 1"),
  body("itinerary").optional().isArray({ min: 1 }).withMessage("Itinerary must include at least one day"),
  body("itinerary.*.day").optional().isInt({ min: 1 }).withMessage("Each itinerary day must be a positive number"),
  body("itinerary.*.title").optional().trim().notEmpty().withMessage("Each itinerary day needs a title"),
  body("itinerary.*.description").optional().trim().notEmpty().withMessage("Each itinerary day needs a description")
];

const listTourRules = [
  query("priceMin").optional().isFloat({ min: 0 }).withMessage("Minimum price must be zero or greater"),
  query("priceMax").optional().isFloat({ min: 0 }).withMessage("Maximum price must be zero or greater"),
  query("durationMin").optional().isInt({ min: 1 }).withMessage("Minimum duration must be at least 1"),
  query("durationMax").optional().isInt({ min: 1 }).withMessage("Maximum duration must be at least 1"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be at least 1"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50")
];

module.exports = {
  createTourRules,
  updateTourRules,
  listTourRules,
  mongoIdParam
};

