const express = require("express");
const router = express.Router();
const {
  createReview,
  updateReview,
  getAllReviews,
  getSingleReview,
  deleteReview,
} = require("../controllers/reviewController");
const {
  tokenExists,
  authorizePermissions,
} = require("../middlewares/authentication");

router.route("/").post(tokenExists, createReview).get(getAllReviews);
router
  .route("/:id")
  .get(getSingleReview)
  .patch(tokenExists, updateReview)
  .delete(tokenExists, deleteReview);

module.exports = router;
