const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { tokenExists } = require("../middlewares/authentication");
router.post(
  "/register",
  (req, res, next) => {
    console.log("aqui");
    return next();
  },
  register
);
router.post("/login", login);
router.delete("/logout", tokenExists, logout); // chenged to delete bcs of the frontwned
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
