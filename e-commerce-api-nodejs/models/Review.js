const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "must provide a rating"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, "must provide a rating title"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 chars"],
    },
    comment: {
      type: String,
      required: [true, "must provide product description"],
      maxlength: [1000, "Description cannot be more than 1000 chars"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

// compound indexes - unique, https://www.mongodb.com/community/forums/t/setting-unique-compound-index-in-schema-definition/4393
// onlu one review per prodcut
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

// call it on the schema
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: productId,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: {
          $avg: "$rating",
        },
        numOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: Math.ceil(result[0]?.numOfReviews || 0),
      }
    );
  } catch (e) {
    console.log(e);
  }
};

ReviewSchema.post("save", async function (next) {
  await this.constructor.calculateAverageRating(this.product);
  console.log("post save hook");
});

ReviewSchema.post("deleteOne", async function (next) {
  await this.constructor.calculateAverageRating(this.product);
  console.log("post delete hook");
});

module.exports = mongoose.model("Review", ReviewSchema);
