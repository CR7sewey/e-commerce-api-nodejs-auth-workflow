const mongoose = require("mongoose");

const dbConnection = (url) => {
  return mongoose.connect(url);
};

module.exports = dbConnection;
