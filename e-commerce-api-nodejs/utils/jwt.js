require("dotenv").config();
const jwt = require("jsonwebtoken");
const generateToken = ({ user }) => {
  const token = jwt.sign(user, process.env.TOKEN_SECRET_KEY, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const verifyToken = ({ token }) =>
  jwt.verify(token, process.env.TOKEN_SECRET_KEY);

const attachCookiesToResponse = ({ res, token }) => {
  // see doc
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 3600000), // 24 hours = 24 x 60 minutes x 60 seconds x 1000 (bcs in milis)
    secure: process.env.NODE_ENV === "production", // ture or false
    signed: true,
  });
};

module.exports = { generateToken, verifyToken, attachCookiesToResponse };
