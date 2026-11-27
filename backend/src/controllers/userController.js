const User = require("../models/User");
const Tour = require("../models/Tour");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const getUsers = catchAsync(async (_req, res) => {
  const users = await User.find().sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users }
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate("wishlist");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user }
  });
});

const updateUserRole = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user }
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    return next(new AppError("Admins cannot delete their own account", 400));
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(204).send();
});

const getWishlist = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");

  res.status(200).json({
    status: "success",
    results: user.wishlist.length,
    data: { tours: user.wishlist }
  });
});

const addToWishlist = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError("Tour not found", 404));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: tour._id } },
    { new: true }
  ).populate("wishlist");

  res.status(200).json({
    status: "success",
    data: { tours: user.wishlist }
  });
});

const removeFromWishlist = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: req.params.tourId } },
    { new: true }
  ).populate("wishlist");

  res.status(200).json({
    status: "success",
    data: { tours: user.wishlist }
  });
});

const updateMe = catchAsync(async (req, res, next) => {
  // Do not allow password updates here
  if (req.body.password) {
    return next(new AppError("This route is not for password updates. Please use /forgotPassword", 400));
  }

  const filteredBody = {};
  if (req.body.name) filteredBody.name = req.body.name;
  if (req.file) filteredBody.photo = req.file.path; // Cloudinary URL

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: "success",
    data: { user: updatedUser }
  });
});

module.exports = {
  getUsers,
  getUser,
  updateUserRole,
  deleteUser,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateMe
};

