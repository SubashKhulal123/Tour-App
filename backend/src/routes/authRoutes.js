const express = require("express");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { registerRules, loginRules } = require("../validators/authValidators");

const router = express.Router();

router.post("/register", registerRules, validateRequest, authController.register);
router.post("/login", loginRules, validateRequest, authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.get("/me", authenticate, authController.getMe);

module.exports = router;

