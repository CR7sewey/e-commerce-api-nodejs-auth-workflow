const mongoose = require("mongoose");
const Review = require("./Review");

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "must provide product name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 chars"],
    },
    price: {
      type: Number,
      required: [true, "must provide product price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "must provide product description"],
      maxlength: [1000, "Description cannot be more than 1000 chars"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    category: {
      type: String,
      required: [true, "must provide product category"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "must provide product company"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      default: ["#222"],
      required: [true, "must provide product color"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User", // reference to User model
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// reviews for the product but not stored in db
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
  //match: { rating: 5 }, // just shows rating 5
});

// middleware in the model before deleteOne action
ProductSchema.pre("deleteOne", async function (next) {
  // this.model referencing the Product
  // Review the model we want to act on
  // delete many is the action and the condition
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", ProductSchema);
