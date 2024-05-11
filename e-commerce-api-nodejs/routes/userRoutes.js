const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");
const {
  tokenExists,
  authorizePermissions,
} = require("../middlewares/authentication");

router.get("/", tokenExists, authorizePermissions("admin"), getAllUsers);
router.get("/showMe", tokenExists, showCurrentUser);
router.post("/updateUser", tokenExists, updateUser);
router.post("/updateUserPassword", tokenExists, updateUserPassword);
router.get("/:id", tokenExists, getSingleUser);

module.exports = router;
