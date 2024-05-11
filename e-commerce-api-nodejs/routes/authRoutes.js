const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");
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
router.get("/logout", tokenExists, logout); // needs tokenMiddleware!

module.exports = router;
