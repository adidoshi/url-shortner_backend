const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const generateToken = require("../utils/generateToken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "testdevnoreply8@gmail.com",
    pass: "test@7940",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Register user - post request: (/api/users/register)
const registerUser = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists!",
      });
    }

    const user = await new User({
      firstName,
      lastName,
      email,
      password,
      emailToken: crypto.randomBytes(32).toString("hex"),
      isVerified: false,
    });

    const newUser = await user.save();

    if (newUser) {
      res.status(201).json({
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        token: generateToken(newUser._id),
      });
    } else {
      return res.status(400).send({
        message: `Error occured`,
      });
    }

    let verificationUrl = `http://${req.headers.host}/api/users/verify-email/${user.emailToken}`;
    // verification email template
    var mailOptions = {
      from: '"Verify you email" <testdevnoreply8@gmail.com>',
      to: user.email,
      subject: "Splash URL shortner - verify your email",
      html: `<h2>${user.firstName}! Thanks for registering on our application</h2>
         <h4>Please verify your email to continue...</h4>
         <a href=${verificationUrl}>http://localhost:4000/api/users/verify-email/${user.emailToken}</a>
         `,
    };

    // sending email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(`Some error occured ${error}`);
      } else {
        console.log("Verfication email is sent");
      }
    });
  } catch (error) {
    res.status(500).json({
      message: `Server error- ${error.message}`,
    });
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ emailToken: token });
    // console.log(token);

    if (user) {
      user.emailToken = null;
      user.isVerified = true;
      await user.save();
      res.status(200).json("Email verified");
    } else {
      res.status(400).json("Email Id not verified");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Server error- ${error.message}`,
    });
  }
});

// Login User - post request (/api/users/login)
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({
        message: "Invalid Credentials!",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: `Server error- ${error.message}`,
    });
  }
});

// Forgot Password
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json("User not found!");
  }

  // Get resetPassword Token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `http://localhost:4000/api/users/password/reset/${resetToken}`;
  var mailOptions = {
    from: '"Verify you email" <testdevnoreply8@gmail.com>',
    to: user.email,
    subject: "Splash URL shortner - verify your email",
    html: `<h2>Hey ${user.firstName}! your password reset token is:-</h2>
       <p>If you have not requested this email then, please ignore it.</p>
       <a href=${resetPasswordUrl}>${resetPasswordUrl}</a>
       `,
  };

  try {
    // sending email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(`Some error occured ${error}`);
      } else {
        console.log("Reset password email is sent");
      }
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(500).json(`Error occured ${error}`);
  }
});

// Reset Password -- user (PUT) - /api/v1/users/password/reset/:token
const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(404).json("User not found!");
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json("Password does not match!");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json("Password updated successfully!");
});

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
