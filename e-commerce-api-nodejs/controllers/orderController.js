const Order = require("../models/Order");
const Product = require("../models/Product");
const BadRequest = require("../errors/bad-request");
const { StatusCodes } = require("http-status-codes");
const NotFound = require("../errors/not-found");
const checkPermissions = require("../utils/checkPermissions");
// https://docs.stripe.com/payments/quickstart?client=html
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const StripeAPI = async ({ total, currency }) => {
  /* REAL
  const paymentIntent = await stripe.paymentIntents.create({
    amount: String(total),
    currency: currency,
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });
  */
  // fake
  const client_secret = "RandomValue";
  return { client_secret, total };
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  return res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findOne({ _id: id });
  if (!order) {
    throw new NotFound("There is no order with this ID.");
  }
  checkPermissions(req.user, order.user);
  return res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const order = await Order.findOne({ user: req.user._id });
  if (!order) {
    throw new NotFound("There is no orders for this user.");
  }
  return res.status(StatusCodes.OK).json({ order });
};

const createOrder = async (req, res) => {
  const { shippingFee, tax, items } = req.body;

  if (!items || items.length < 1) {
    throw new BadRequest("No cart items provided");
  }

  if (!tax || !shippingFee) {
    throw new BadRequest("Please provide tax and shipping fee");
  }
  let orderItems = [];
  let subTotal = 0;
  //const [{ product: id, amount }] = items;
  for (const item of items) {
    const { product: id, amount } = item;
    // First val - Prdouct exists?
    const productExists = await Product.findOne({ _id: id });
    if (!productExists) {
      throw new NotFound("Doesn't exists this product - " + item.product);
    }
    // Stock is enough?
    const stockAvailable = await Product.findOne({
      _id: id,
      inventory: { $gte: amount },
    });
    if (!stockAvailable) {
      throw new BadRequest(
        "There's not enough inventory available - " + item.product
      );
    }
    const { name, price, image, _id } = stockAvailable;
    orderItems = [...orderItems, { amount, name, price, image, product: _id }]; // adding orders (items)
    subTotal += price * amount;
  }
  const total = subTotal + tax + shippingFee;
  // get client secret with stripe

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await StripeAPI({ total, currency: "usd" });
  const order = await Order.create({
    tax,
    shippingFee,
    subtotal: subTotal,
    total,
    orderItems,
    user: req.user,
    clientSecret: paymentIntent.client_secret,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: paymentIntent.client_secret });
};

const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { paymentIntentId } = req.body;
  const order = await Order.findOne({ _id: id });
  if (!order) {
    throw new NotFound("There is no order with this ID.");
  }

  checkPermissions(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = req.body.status;

  await order.save();

  return res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getCurrentUserOrders,
  getSingleOrder,
  createOrder,
  updateOrder,
};
