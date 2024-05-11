const UnauthenticatedError = require("../errors/unauthenticated");

const checkPermissions = (user_loggedin, user_searched) => {
  if (user_loggedin.role === "admin") return; // can access all
  if (user_loggedin._id.toString() === user_searched._id.toString()) return; // can not access != ids
  throw new UnauthenticatedError("You cannot access this user.");
};

module.exports = checkPermissions;
