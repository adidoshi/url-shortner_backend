const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");

const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Not a valid email address"],
  },
  password: {
    type: String,
    required: true,
    minlength: [5, "Minimum 5 characters required"],
  },
  emailToken: {
    type: String,
    // required: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // date: {
  //   type: Date,
  //   required: true,
  // },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function () {
  // Create token
  const resetToken = crypto.randomBytes(25).toString("hex");

  // Hashing & add to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 10000;

  return resetToken;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
