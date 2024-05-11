const jwt = require("jsonwebtoken");
const UnauthenticatedError = require("../errors/unauthenticated");
const User = require("../models/User");
const { verifyToken, attachCookiesToResponse } = require("../utils/jwt");
require("dotenv").config();

const tokenExists = async (req, res, next) => {
  let token = req.signedCookies.token;
  if (!token) {
    const authorization = req.headers.authorization;
    if (!authorization) {
      res.setHeader("WWW-Authenticate", "Basic");
      throw new UnauthenticatedError("You need to log in to access this page!");
    }
    token = authorization.split(" ")[1];
    if (token === null || !token || token === undefined) {
      res.setHeader("WWW-Authenticate", "Basic");
      throw new UnauthenticatedError("You need to log in to access this page!"); // noy logged in
    }
    attachCookiesToResponse({ res, token });
  }

  try {
    console.log("aqui aqui aqui");
    const dados = verifyToken({ token });
    const user = await User.findOne({
      _id: dados.id,
      name: dados.name,
      role: dados.role,
    }).select("-password");
    if (!user) {
      throw new UnauthenticatedError(
        "User invalid, please generate a new token!"
      );
    }
    //req.user = {id: dados._id, name: dados.name, role: dados.role}
    req.user = user;
    next();
  } catch (e) {
    throw new UnauthenticatedError("Invalid or Expired token");
  }
};

const authorizePermissions = (...roles) => {
  console.log(roles);
  return async (req, res, next) => {
    // needs to be like this (return a function) bc we need to pass a callbackfunction and not the invokation (in the routes)
    if (!roles.includes(req.user.role)) {
      throw new UnauthenticatedError(
        "You are not authorized to access this route."
      );
    }
    next();
  };
};

module.exports = { tokenExists, authorizePermissions };
