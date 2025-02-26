// app.js - Main Express application setup

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { router: authRoutes } = require("./routes/auth");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
    .connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/opencanvas",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    )
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    }),
);
app.use(helmet()); // Security headers
app.use(morgan("dev")); // Logging

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

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to OpenCanvas API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong",
        error:
            process.env.NODE_ENV === "development"
                ? err.message
                : "Server error",
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
