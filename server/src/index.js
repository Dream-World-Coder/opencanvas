const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { router: authRoutes } = require("./routes/auth");
const { router: postRoutes } = require("./routes/post");
const { router: errorHandler } = require("./middlewares/errorHandler.js");
const { authenticateToken } = require("./middlewares/authorisation.js");

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
        origin: [
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5500",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:5500",
        ],
        credentials: true,
    }),
);

app.use(helmet()); // Security headers
app.use(morgan("dev")); // logger

// Session configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET || "nhed9rbv749j3Snek",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    }),
);

// init passport
app.use(passport.initialize());
app.use(passport.session());

// middlewares
// app.use(authenticateToken); // only use for specific routes
app.use(errorHandler);

// routes
app.use("/auth", authRoutes);
app.use(postRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Welcome to OpenCanvas API" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// module.exports = app;
