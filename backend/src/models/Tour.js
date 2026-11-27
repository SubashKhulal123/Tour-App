const mongoose = require("mongoose");

const itineraryDaySchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    }
  },
  { _id: false }
);

const tourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tour title is required"],
      trim: true,
      minlength: 3,
      maxlength: 140
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      index: true
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 day"]
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 5000
    },
    images: {
      type: [String],
      validate: {
        validator: (images) => Array.isArray(images) && images.length > 0,
        message: "At least one image is required"
      }
    },
    itinerary: {
      type: [itineraryDaySchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "At least one itinerary day is required"
      }
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Maximum group size is required"],
      min: [1, "Maximum group size must be at least 1"]
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: val => Math.round(val * 10) / 10 
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id"
});

tourSchema.index({ title: "text", location: "text", description: "text" });

module.exports = mongoose.model("Tour", tourSchema);

