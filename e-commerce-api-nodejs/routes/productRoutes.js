const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controllers/productController");
const { getSingleProductReviews } = require("../controllers/reviewController");

const {
  tokenExists,
  authorizePermissions,
} = require("../middlewares/authentication");

router.get("/", tokenExists, getAllProducts);
router.post("/", tokenExists, authorizePermissions("admin"), createProduct);
router.post(
  "/uploadImage",
  tokenExists,
  authorizePermissions("admin"),
  uploadImage
);
router
  .route("/:id")
  .get(tokenExists, getSingleProduct)
  .patch(tokenExists, authorizePermissions("admin"), updateProduct)
  .delete(tokenExists, authorizePermissions("admin"), deleteProduct);

router.get("/:id/reviews", getSingleProductReviews); // reviews per product!

module.exports = router;
