const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const authenticate = catchAsync(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication token is required", 401));
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("The user belonging to this token no longer exists", 401));
  }

  req.user = user;
  return next();
});

const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError("You do not have permission to perform this action", 403));
  }

  return next();
};

module.exports = { authenticate, authorize };

