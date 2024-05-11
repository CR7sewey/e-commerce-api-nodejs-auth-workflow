const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const BadRequest = require("../errors/bad-request");
const UnauthenticatedError = require("../errors/unauthenticated");
const { generateToken, attachCookiesToResponse } = require("../utils/jwt");
const createTokenUser = require("../utils/createTokenUser");
const crypto = require("crypto");

const fakeVerificationToken = ({ info }) => {
  return crypto.randomBytes(40).toString("hex"); // hexadecimal
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
  return res.status(StatusCodes.CREATED).json({
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
  console.log(user);
  if (!user.isVerified) {
    // when user hav not verified is account on the email!
    throw new UnauthenticatedError("Please verify your account");
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

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body; // from postman, then will be sent from the frontend
  if (!verificationToken || !email) {
    throw new BadRequest("Please introduce an email and token.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Wrong email, no user.");
  }
  const userToken = await User.findOne({ email, verificationToken });
  if (!userToken) {
    throw new UnauthenticatedError("Token doesnt match the user!");
  }
  userToken.isVerified = true;
  userToken.verified = Date.now();
  userToken.verificationToken = ""; // bcs already verified
  await userToken.save();
  res.status(StatusCodes.OK).json({
    msg: "Success. Email Verified",
  });
};

module.exports = { register, login, logout, verifyEmail };
