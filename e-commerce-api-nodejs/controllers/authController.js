const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const BadRequest = require("../errors/bad-request");
const UnauthenticatedError = require("../errors/unauthenticated");
const { generateToken, attachCookiesToResponse } = require("../utils/jwt");
const createTokenUser = require("../utils/createTokenUser");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const userWithEmail = await User.findOne({ email });
  if (email && userWithEmail) {
    // double check!
    throw new BadRequest("Email already exists!");
  }

  // first register user is a admin
  const isFirstAcc = (await User.countDocuments({})) === 0;
  const role = isFirstAcc ? "admin" : "user";

  const user = await User.create({ name, email, password, role }); // not ...req.body to not pass directly the role if inserted in postman!
  const userToken = createTokenUser(user);

  const token = generateToken({ user: userToken });
  attachCookiesToResponse({ res, token });

  return res.status(StatusCodes.CREATED).json({ user: userToken });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new BadRequest("You need to provide an email.");
  }
  if (!password) {
    throw new BadRequest("You need to provide a password.");
  }
  const user = await User.findOne({ email });
  if (!user) {
    // double check!
    throw new UnauthenticatedError("Invalid Credentials!");
  }
  const validPassword = await user.validatePassword(password);
  if (!validPassword) {
    throw new UnauthenticatedError("Invalid Credentials!");
  }

  const userToken = createTokenUser(user);

  const token = generateToken({ user: userToken });
  attachCookiesToResponse({ res, token });

  return res.status(StatusCodes.OK).json({ user: userToken });
};

const logout = async (req, res) => {
  req.user = {};
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()), // dont generate a cookie; could put Date.now() + 1000 (1 second) - generates a cookie
  });
  return res.status(StatusCodes.OK).json({ msg: "Logout with success!" });
};

module.exports = { register, login, logout };
