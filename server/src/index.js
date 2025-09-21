const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cron = require("node-cron");

const { router: authRoutes } = require("./routes/auth");
const { router: userRoutes } = require("./routes/user");
const { router: postRoutes } = require("./routes/post");
const { router: commentRoutes } = require("./routes/comments");
const { router: followerRoutes } = require("./routes/follower");
const { router: feedRoutes } = require("./routes/feed");
const { router: collectionRoutes } = require("./routes/collection");
const { router: imageService } = require("./services/imageService");

const updateDefaultEngagementScore = require("./migrations/Post/updateDefaultEngagementScore");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/opencanvas")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(helmet()); // Security headers
app.use(morgan("dev")); // logger

// cors first
app.use(
  cors({
    origin:
      FRONTEND_URL === "http://localhost:5173"
        ? [FRONTEND_URL]
        : ["http://localhost:5173", FRONTEND_URL],
    credentials: true,
  }),
);

// max request body -> 160 KB
app.use(express.json({ limit: "160kb" }));
app.use(express.urlencoded({ limit: "160kb", extended: true }));

// init passport
app.use(passport.initialize());

app.set("trust proxy", true);

// routes
app.use("/auth", authRoutes);
app.use(userRoutes);
app.use(postRoutes);
app.use(commentRoutes);
app.use(followerRoutes);
app.use(collectionRoutes);
app.use("/feed", feedRoutes);
app.use("/api", imageService);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to OpenCanvas API",
    environment: process.env.NODE_ENV.toString(),
  });
});

// error handler
app.use((err, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong";

  // Handle payload too large (from body-parser / raw-body)
  if (err.type === "entity.too.large" || err.name === "PayloadTooLargeError") {
    statusCode = 413;
    message = "Payload too large";
    console.warn("Payload too large");
  }
  // Handle malformed JSON (body-parser throws SyntaxError)
  else if (err instanceof SyntaxError && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON payload";
    console.warn("Invalid JSON payload");
  } else {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// crons
cron.schedule("*/15 * * * *", () => {
  console.log("Running scheduled update...");
  updateDefaultEngagementScore().catch((err) => {
    console.error("Scheduled task failed:", err);
  });
});

// app start
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Opencanvas server is running on port ${PORT}, visit: http://localhost:${PORT}`,
  );
});
