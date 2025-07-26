const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
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
const { router: errorHandler } = require("./middlewares/errorHandler");
const { router: imageService } = require("./services/imageService");
const updateDefaultEngagementScore = require("./migrations/Post/updateDefaultEngagementScore");

// const { authenticateToken } = require("./middlewares/authorisation.js");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/opencanvas")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// necessary middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: ["http://localhost:5173"],
        credentials: true,
    }),
);

app.use(helmet()); // Security headers
app.use(morgan("dev")); // logger

// Session configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl:
                process.env.MONGODB_URI ||
                "mongodb://localhost:27017/opencanvas",
            ttl: 14 * 24 * 60 * 60, // sessions expire in 14 days
            autoRemove: "native",
        }),
        cookie: {
            secure: process.env.NODE_ENV === "production", // secure cookies in production
            httpOnly: true, // Prevents client-side access to cookies
            sameSite: "strict", // csrf
            maxAge: 24 * 60 * 60 * 1000, // 1 day session duration
        },
    }),
);

// init passport
app.use(passport.initialize());
app.use(passport.session());

app.set("trust proxy", true); // not needed now

// middlewares
// app.use(authenticateToken); // only use for specific routes
app.use(errorHandler);

// routes
app.use("/auth", authRoutes);
app.use(userRoutes);
app.use(postRoutes);
app.use(commentRoutes);
app.use(followerRoutes);
app.use("/feed", feedRoutes);
app.use("/api", imageService);

cron.schedule("*/15 * * * *", () => {
    console.log("Running scheduled update...");
    updateDefaultEngagementScore().catch((err) => {
        console.error("Scheduled task failed:", err);
    });
});

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to OpenCanvas API",
        environment: process.env.NODE_ENV.toString(),
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
