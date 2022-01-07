const express = require("express");
const {
  shortUrl,
  getUrl,
  direct,
  userClicks,
} = require("../controllers/urlController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/shortUrls", protect, shortUrl);
router.get("/urlRes", protect, getUrl);
router.get("/:shortUrl", protect, direct);
router.get("/count/:shortUrl", protect, userClicks);

module.exports = router;
