const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "must provide name"],
      trim: true,
      minlength: 3,
      maxlength: [20, "name can not be more than 20 characters"],
    },
    email: {
      type: String,
      validate: {
        validator: function (m) {
          return validator.isEmail(m);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
      required: [true, "must provide an email"],
      trim: true,
      unique: true, // NOT A VALIDATOR!!!
    },
    password: {
      type: String,
      required: [true, "must provide a password"],
      min: 6,
      max: 20,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function save(next) {
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

/*const validatorFunction = function (value) {
  return validator.isEmail(value);
};
UserSchema.path("email").validate(
  validatorFunction,
  `Email ${value} is not valid`,
  "Invalid email"
);*/

UserSchema.methods.validatePassword = async function validatePassword(pass) {
  return await bcrypt.compare(pass, this.password);
};

UserSchema.methods.generateToken = function generateToken() {
  const token = jwt.sign(
    { id: this._id, role: this.role, name: this.name },
    process.env.TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
  return token;
};

module.exports = mongoose.model("User", UserSchema);
