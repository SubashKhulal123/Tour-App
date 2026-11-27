const Tour = require("../models/Tour");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const buildTourFilter = (query) => {
  const filter = {};

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.location) {
    filter.location = { $regex: query.location, $options: "i" };
  }

  const price = {};
  if (query.priceMin) price.$gte = Number(query.priceMin);
  if (query.priceMax) price.$lte = Number(query.priceMax);
  if (Object.keys(price).length) filter.price = price;

  const duration = {};
  if (query.durationMin) duration.$gte = Number(query.durationMin);
  if (query.durationMax) duration.$lte = Number(query.durationMax);
  if (Object.keys(duration).length) filter.duration = duration;

  return filter;
};

const getTours = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  const filter = buildTourFilter(req.query);
  const sort = req.query.sort || "price";

  const [tours, total] = await Promise.all([
    Tour.find(filter).sort(sort).skip(skip).limit(limit),
    Tour.countDocuments(filter)
  ]);

  res.status(200).json({
    status: "success",
    results: tours.length,
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
    data: { tours }
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate("reviews");

  if (!tour) {
    return next(new AppError("Tour not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { tour }
  });
});

const createTour = catchAsync(async (req, res) => {
  const tour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: { tour }
  });
});

const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tour) {
    return next(new AppError("Tour not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { tour }
  });
});

const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError("Tour not found", 404));
  }

  res.status(204).send();
});

module.exports = {
  getTours,
  getTour,
  createTour,
  updateTour,
  deleteTour
};

