const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const env = require("./config/env");
const AppError = require("./utils/AppError");
const errorMiddleware = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const tourRoutes = require("./routes/tourRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin.split(",").map((origin) => origin.trim()),
    credentials: true
  })
);

// Rate limiting
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per window (15 mins)
  windowMs: 15 * 60 * 1000,
  message: "Too many requests from this IP, please try again in 15 minutes."
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price"
    ]
  })
);

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "success", message: "Tour Booking API is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);

app.all("*", (req, _res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(errorMiddleware);

module.exports = app;

