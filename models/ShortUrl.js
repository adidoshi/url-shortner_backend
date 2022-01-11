const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const ShortUrlSchema = new mongoose.Schema(
  {
    fullUrl: {
      type: String,
      required: true,
    },
    urlName: {
      type: String,
      required: true,
    },
    full: {
      type: String,
      // required: true,
    },
    short: {
      type: String,
      // required: true,
      default: nanoid(5),
    },
    clicks: {
      type: Number,
      // required: true,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const ShortUrl = mongoose.model("ShortUrl", ShortUrlSchema);
module.exports = ShortUrl;
