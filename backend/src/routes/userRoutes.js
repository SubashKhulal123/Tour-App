const express = require("express");
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { userIdParam, wishlistTourParam, updateRoleRules } = require("../validators/userValidators");
const { uploadPhoto } = require("../utils/upload");

const router = express.Router();

router.use(authenticate);

router.get("/me/wishlist", userController.getWishlist);
router.post("/me/wishlist/:tourId", wishlistTourParam, validateRequest, userController.addToWishlist);
router.delete("/me/wishlist/:tourId", wishlistTourParam, validateRequest, userController.removeFromWishlist);
router.patch("/me", uploadPhoto.single("photo"), userController.updateMe);

router.use(authorize("admin"));

router.get("/", userController.getUsers);
router.get("/:id", userIdParam, validateRequest, userController.getUser);
router.patch("/:id/role", updateRoleRules, validateRequest, userController.updateUserRole);
router.delete("/:id", userIdParam, validateRequest, userController.deleteUser);

module.exports = router;

