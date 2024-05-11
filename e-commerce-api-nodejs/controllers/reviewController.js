const Review = require("../models/Review");
const Product = require("../models/Product");
const BadRequest = require("../errors/bad-request");
const { StatusCodes } = require("http-status-codes");
const NotFound = require("../errors/not-found");
const checkPermissions = require("../utils/checkPermissions");

const createReview = async (req, res) => {
  // can do some vals but the review model already does it (namely missing value or repetion)
  const product = await Product.findOne({ _id: req.body.product });
  if (!product) {
    throw new NotFound("You need to do a review on an existing product.");
  }
  let review = await Review.findOne({
    product: req.body.product,
    user: req.user._id,
  });

  if (review) {
    throw new BadRequest("Already submitted review for this product");
  }

  review = await Review.create({ ...req.body, user: req.user._id });

  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    // with product info
    path: "product",
    select: "name company price",
  });
  return res.status(StatusCodes.OK).json({ reviews });
};

const getSingleReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findOne({ _id: id }).populate({
    // with product info
    path: "product",
    select: "name company price",
  });
  if (!review) {
    throw new NotFound("This review doesnt exists.");
  }
  return res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id } = req.params;
  /*const review = await Review.findByIdAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });*/
  const review = await Review.findOne({ _id: id });

  if (!review) {
    throw new NotFound("This review doesnt exists.");
  }
  checkPermissions(req.user, review.user); // just admin and the actual user review can update

  review.rating = req.body.rating || review.rating;
  review.comment = req.body.comment || review.comment;
  review.title = req.body.title || review.title;

  await review.save();

  return res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findOne({ _id: id });
  if (!review) {
    throw new NotFound("This review doesnt exists.");
  }
  checkPermissions(req.user, review.user); // just admin and the actual user review can delete
  await Review.deleteOne({ _id: id });
  return res.status(StatusCodes.OK).json({ msg: "Success. Product removed!" });
};

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  return res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createReview,
  updateReview,
  getAllReviews,
  getSingleReview,
  deleteReview,
  getSingleProductReviews,
};
