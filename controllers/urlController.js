const asyncHandler = require("express-async-handler");
const ShortUrl = require("../models/ShortUrl");

const shortUrl = asyncHandler(async (req, res) => {
  const { urlName, fullUrl, short } = req.body;

  if (!urlName || !fullUrl) {
    return res.status(400).json("Please fill all the fields ");
  } else {
    const url = await ShortUrl.create({
      user: req.user._id,
      urlName,
      short,
      fullUrl,
    });
    res.status(201).json(url);
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
  await shortUrl.save();

  res.status(200).json(clickCount);
});

const deleteUrl = async (req, res) => {
  const url = await ShortUrl.findById(req.params.id);

  if (url.user.toString() !== req.user._id.toString()) {
    return res.status(401).json("You can't perform this action");
  }

  if (url) {
    await url.remove();
    res.json({ message: "url Removed" });
  } else {
    res.status(404).json("url not Found");
  }
};

module.exports = { shortUrl, getUrl, direct, userClicks, deleteUrl };
