const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const ShortUrlSchema = new mongoose.Schema({
  full: {
    type: String,
    required: true,
  },
  short: {
    type: String,
    required: true,
    default: nanoid(5),
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
});

const ShortUrl = mongoose.model("ShortUrl", ShortUrlSchema);
module.exports = ShortUrl;