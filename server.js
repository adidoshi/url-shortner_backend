const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const userRouter = require("./routes/userRoutes");
const urlRouter = require("./routes/urlRoutes");

const app = express();
app.use(express.json());

app.use(logger("tiny"));
app.use(cors());

const PORT = process.env.PORT || 4000;

// Connect to DB -
const connectDB = require("./config/db");
connectDB();

// Routes -
app.use("/api/users", userRouter);
app.use("/", urlRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Server is up",
    title: "Welcome to URL-shortner backend API",
  });
});

app.listen(PORT, () => {
  console.log(`Server is up on http://localhost:${PORT}`);
});
