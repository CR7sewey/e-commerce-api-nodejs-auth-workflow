const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getCurrentUserOrders,
  getSingleOrder,
  createOrder,
  updateOrder,
} = require("../controllers/orderController");
const {
  tokenExists,
  authorizePermissions,
} = require("../middlewares/authentication");

router
  .route("/")
  .get(tokenExists, authorizePermissions("admin"), getAllOrders)
  .post(tokenExists, createOrder);
router.route("/showAllMyOrders").get(tokenExists, getCurrentUserOrders);
router
  .route("/:id")
  .get(tokenExists, getSingleOrder)
  .patch(tokenExists, updateOrder);

module.exports = router;
