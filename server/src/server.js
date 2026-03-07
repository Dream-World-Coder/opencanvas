/**
 * server.js — Express app
 *
 * This file is loaded by every worker spawned in index.js.
 * It has no cluster logic and no cron — just the Express app.
 * Keep it that way. Cluster management lives in index.js only.
 */

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { router: authRoutes } = require("./routes/auth");
const { router: userRoutes } = require("./routes/user");
const { router: postRoutes } = require("./routes/post");
const { router: commentRoutes } = require("./routes/comment");
const { router: followerRoutes } = require("./routes/follow");
const { router: feedRoutes } = require("./routes/feed");
const { router: collectionRoutes } = require("./routes/collection");
const { router: imageService } = require("./services/imageService");
const { router: searchRoutes } = require("./routes/search");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

// ── Database ──────────────────────────────────────────────────────────────────
// Each worker opens its own MongoDB connection pool.
// Mongoose handles this fine — Atlas supports many concurrent connections.
mongoose
  .connect(process.env.MONGODB_URI_PROD || process.env.MONGODB_URI)
  .then(() => console.log(`[Worker ${process.pid}] Connected to MongoDB`))
  .catch((err) => console.error(`[Worker ${process.pid}] MongoDB error:`, err));

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(helmet());
app.use(morgan("dev"));

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [FRONTEND_URL]
        : ["http://localhost:5173", FRONTEND_URL],
    credentials: true,
  }),
);

// Max request body → 160 KB
app.use(express.json({ limit: "160kb" }));
app.use(express.urlencoded({ limit: "160kb", extended: true }));

app.use(passport.initialize());
app.set("trust proxy", true);

// ── Routes ────────────────────────────────────────────────────────────────────

app.use("/auth", authRoutes);
app.use(userRoutes);
app.use(postRoutes);
app.use(commentRoutes);
app.use(followerRoutes);
app.use(collectionRoutes);
app.use(feedRoutes);
app.use("/api", imageService);
app.use(searchRoutes);

// Root health check
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to OpenCanvas API",
    environment: process.env.NODE_ENV || "development",
    worker: process.pid, // handy to confirm clustering is working
  });
});

// ── Global error handler ──────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong";

  if (err.type === "entity.too.large" || err.name === "PayloadTooLargeError") {
    statusCode = 413;
    message = "Payload too large";
    console.warn("Payload too large");
  } else if (err instanceof SyntaxError && "body" in err) {
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

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Worker ${process.pid}] Listening on port ${PORT}`);
});
