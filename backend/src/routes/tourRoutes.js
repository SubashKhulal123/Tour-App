const express = require("express");
const tourController = require("../controllers/tourController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createTourRules,
  updateTourRules,
  listTourRules,
  mongoIdParam
} = require("../validators/tourValidators");

const router = express.Router();

router
  .route("/")
  .get(listTourRules, validateRequest, tourController.getTours)
  .post(authenticate, authorize("admin"), createTourRules, validateRequest, tourController.createTour);

router
  .route("/:id")
  .get(mongoIdParam, validateRequest, tourController.getTour)
  .patch(authenticate, authorize("admin"), updateTourRules, validateRequest, tourController.updateTour)
  .delete(authenticate, authorize("admin"), mongoIdParam, validateRequest, tourController.deleteTour);

module.exports = router;

