const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  verifyEmail,
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

module.exports = router;
