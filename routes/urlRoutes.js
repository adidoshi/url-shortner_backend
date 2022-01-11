const express = require("express");
const {
  shortUrl,
  getUrl,
  direct,
  userClicks,
  deleteUrl,
} = require("../controllers/urlController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/shortUrls", protect, shortUrl);
router.get("/urlRes", protect, getUrl);
router.get("/:shortUrl", direct);
router.get("/count/:shortUrl", protect, userClicks);
router.delete("/:id", protect, deleteUrl);

module.exports = router;
