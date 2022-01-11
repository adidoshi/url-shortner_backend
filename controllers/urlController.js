const asyncHandler = require("express-async-handler");
const ShortUrl = require("../models/ShortUrl");

const shortUrl = asyncHandler(async (req, res) => {
  const { urlName, fullUrl } = req.body;

  if (!urlName || !fullUrl) {
    return res.status(400).json("Please fill all the fields ");
  } else {
    const url = new ShortUrl({
      user: req.user._id,
      urlName,
      fullUrl,
    });

    const generatedUrl = await url.save();
    res.status(201).json(generatedUrl);
  }
});

const getUrl = asyncHandler(async (req, res) => {
  const shortUrls = await ShortUrl.find({ user: req.user._id });
  res.status(200).json(shortUrls);
});

const direct = asyncHandler(async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });

  if (shortUrl == null) return res.status(404).json(`Invalid url entered`);

  res.redirect(shortUrl.fullUrl);
});

const userClicks = asyncHandler(async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  const clickCount = shortUrl.clicks++;
  shortUrl.save();

  res.status(200).json(clickCount);
});

module.exports = { shortUrl, getUrl, direct, userClicks };
