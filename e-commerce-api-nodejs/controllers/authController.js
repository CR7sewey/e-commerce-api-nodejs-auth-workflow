const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const BadRequest = require("../errors/bad-request");
const UnauthenticatedError = require("../errors/unauthenticated");
const { generateToken, attachCookiesToResponse } = require("../utils/jwt");
const createTokenUser = require("../utils/createTokenUser");

const fakeVerificationToken = ({ info }) => {
  return info;
};

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
  // Token that is going to be used later to verify later once the user is signing in through the frontend
  // TODO!!
  const verificationToken = fakeVerificationToken({ info: "fake token" });

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  }); // not ...req.body to not pass directly the role if inserted in postman!

  // WE will send a verification email then!! send verification token only while testing in postman
  // TODO
  return res
    .status(StatusCodes.CREATED)
    .json({
      msg: "Success. Check your email to verify your account!",
      verificationToken,
    });
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
