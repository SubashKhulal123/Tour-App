const express = require("express");
const reviewController = require("../controllers/reviewController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

router.route("/")
  .get(reviewController.getAllReviews)
  .post(authenticate, reviewController.createReview);  

router.route("/:id")
  .delete(authenticate, reviewController.deleteReview);  

module.exports = router;