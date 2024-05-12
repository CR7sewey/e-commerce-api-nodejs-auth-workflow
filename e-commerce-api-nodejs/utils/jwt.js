require("dotenv").config();
const jwt = require("jsonwebtoken");
const generateToken = ({ user }) => {
  const token = jwt.sign(user, process.env.TOKEN_SECRET_KEY);
  return token;
};

const verifyToken = ({ token }) =>
  jwt.verify(token, process.env.TOKEN_SECRET_KEY);

const attachCookiesToResponse = ({ res, user, token }) => {
  const accessTokenJWT = generateToken({ user });
  const refreshTokenJWT = generateToken({ user: { user, token } });
  // see doc
  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    //expires: new Date(Date.now() + 5 * 60000), // 5 minutes
    secure: process.env.NODE_ENV === "production", // ture or false
    signed: true,
    maxAge: 10000,
  });
  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    secure: process.env.NODE_ENV === "production", // ture or false
    signed: true,
  });
};

module.exports = { generateToken, verifyToken, attachCookiesToResponse };
