const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const BadRequest = require("../errors/bad-request");
const UnauthenticatedError = require("../errors/unauthenticated");
const { generateToken, attachCookiesToResponse } = require("../utils/jwt");
const createTokenUser = require("../utils/createTokenUser");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const sendResetPasswordEmail = require("../utils/sendResetPasswordEmail");
const Token = require("../models/Token");
const createHash = require("../utils/createHash");

const fakeVerificationToken = () => {
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
  const verificationToken = fakeVerificationToken();

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  }); // not ...req.body to not pass directly the role if inserted in postman!

  const origin = "http://localhost:3000"; // where the frontend is running (development or prod)
  // when we dont really know the url from front, or several urls
  // where the server is located and from where comes de request (in headres)
  // if we look for req.get(origin), it gives us the server location (bcs of the proxy I set up on the frontend)
  // const protocol = req.protocol
  //  const host = req.get('host');
  // const forwardedHost = req.get('x-forwarded-host');
  // const forwardedProtocol = req.get('x-forwarded-proto');
  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });

  // WE will send a verification email then!! send verification token only while testing in postman
  // TODO
  return res.status(StatusCodes.CREATED).json({
    msg: "Success. Check your email to verify your account!",
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

  // changed, created in attachCookiesResponse
  //const token = generateToken({ user: userToken });

  // create refreshToken
  let refreshToken = "";
  // check for existing token: TODO
  const tokenAlreadyExists = await Token.findOne({ user: user._id });
  if (tokenAlreadyExists) {
    const { isValid } = tokenAlreadyExists;
    if (!isValid) {
      throw new UnauthenticatedError("You need to log in again.");
    }
    refreshToken = tokenAlreadyExists.refreshToken;
  } else {
    // only creates when does not exists on the db
    refreshToken = fakeVerificationToken();
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;
    const userRefreshToken = { refreshToken, userAgent, ip, user: user._id };
    const tokenRefresh = await Token.create(userRefreshToken);
  }

  // changed to create the access and refresh token
  attachCookiesToResponse({ res, user: userToken, token: refreshToken });

  return res.status(StatusCodes.OK).json({ user: userToken });
};

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user._id });
  req.user = {};
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()), // dont generate a cookie; could put Date.now() + 1000 (1 second) - generates a cookie
  });
  res.cookie("refreshToken", "logout", {
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
    throw new UnauthenticatedError("Verification failed");
  }
  //const userToken = await User.findOne({ email, verificationToken });
  // if (!userToken)
  if (user.verificationToken !== verificationToken) {
    throw new UnauthenticatedError("Verification failed");
  }
  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = ""; // bcs already verified
  await user.save();
  res.status(StatusCodes.OK).json({
    msg: "Success. Email Verified",
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequest("Please introduce an email.");
  }
  const user = await User.findOne({ email });
  if (!user) {
    // double check!
    throw new UnauthenticatedError("Email doesnt exists.");
  }
  const passwordToken = fakeVerificationToken();
  const origin = "http://localhost:3000"; // where the frontend is running (development or prod)
  await sendResetPasswordEmail({
    name: user.name,
    email: user.email,
    passwordToken: passwordToken,
    origin,
  });

  user.passwordTokenExpirationDate = new Date(Date.now() + 5 * 60 * 1000); // 5 min
  user.passwordToken = createHash(passwordToken);
  await user.save();

  return res.status(StatusCodes.OK).json({
    msg: "Success. Check your email to reset your password!",
  });
};

const resetPassword = async (req, res) => {
  const { email, passwordToken, password } = req.body;
  if (!passwordToken || !email || !password) {
    throw new BadRequest("Please introduce an email and token and password.");
  }
  const user = await User.findOne({ email });
  console.log(new Date(Date.now()));
  if (user) {
    if (
      user.passwordTokenExpirationDate > new Date(Date.now()) &&
      user.passwordToken === createHash(passwordToken)
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }
  res.status(StatusCodes.OK).json({
    msg: "Success. Password reseted. Please Log in.",
  }); // bcs of hackers dont know if the reset was or not successfull
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
