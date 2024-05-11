require("express-async-errors");
require("dotenv").config();

// express
const express = require("express");
const app = express();

// packages
const morgan = require("morgan");
const cookie_parser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimiter = require("express-rate-limit");

// ROUTERS
const routerAuth = require("./routes/authRoutes");
const routerUser = require("./routes/userRoutes");
const routerProduct = require("./routes/productRoutes");
const routerReview = require("./routes/reviewRoutes");
const orderReview = require("./routes/orderRoutes");

// Middlewares
const errorHandlerMiddleware = require("./middlewares/error-handler");
const notFound = require("./middlewares/not-found");
const { tokenExists } = require("./middlewares/authentication");
const dbConnection = require("./db/connect");

// Middlewares
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
      msg: "To many requests from this IP, please try again after 15 minutes",
    },
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());
app.use(morgan("tiny")); // to check routes and http codes
app.use(express.json()); // access to json data in req.body
app.use(cookie_parser(process.env.COOKIE_SECRET_KEY));
app.use(express.static("./public"));
app.use(fileUpload());

//

app.use("/api/v1/auth", routerAuth);
app.use("/api/v1/users", routerUser);
app.use("/api/v1/products", routerProduct);
app.use("/api/v1/reviews", routerReview);
app.use("/api/v1/orders", orderReview);

app.get("/", (req, res) => {
  res.send("E-commerce Project");
});

// Middlewares
app.use(notFound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await dbConnection(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log("Im listening on port ", port);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
