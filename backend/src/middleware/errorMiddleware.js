const AppError = require("../utils/AppError");
const env = require("../config/env");

const handleCastError = () => new AppError("Resource not found", 404);

const handleDuplicateFields = (error) => {
  const field = Object.keys(error.keyValue || {})[0] || "field";
  return new AppError(`${field} already exists`, 409);
};

const handleValidationError = (error) => {
  const message = Object.values(error.errors)
    .map((item) => item.message)
    .join(". ");
  return new AppError(message, 400);
};

const handleJwtError = () => new AppError("Invalid token. Please log in again", 401);

const handleJwtExpiredError = () => new AppError("Your token has expired. Please log in again", 401);

const errorMiddleware = (error, _req, res, _next) => {
  let err = error;

  if (!(err instanceof AppError)) {
    err = Object.create(error);
    err.message = error.message;
  }

  if (error.name === "CastError") err = handleCastError(error);
  if (error.code === 11000) err = handleDuplicateFields(error);
  if (error.name === "ValidationError") err = handleValidationError(error);
  if (error.name === "JsonWebTokenError") err = handleJwtError();
  if (error.name === "TokenExpiredError") err = handleJwtExpiredError();

  const statusCode = err.statusCode || 500;
  const response = {
    status: err.status || "error",
    message: err.isOperational ? err.message : "Something went wrong"
  };

  if (env.nodeEnv === "development") {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;

