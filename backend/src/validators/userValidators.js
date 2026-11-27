const { body, param } = require("express-validator");

const userIdParam = [param("id").isMongoId().withMessage("Invalid user id")];

const wishlistTourParam = [param("tourId").isMongoId().withMessage("Invalid tour id")];

const updateRoleRules = [
  ...userIdParam,
  body("role").isIn(["user", "admin"]).withMessage("Role must be user or admin")
];

module.exports = {
  userIdParam,
  wishlistTourParam,
  updateRoleRules
};

