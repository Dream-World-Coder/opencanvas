const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { router: authRoutes } = require("./routes/auth");
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
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
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

// routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Welcome to OpenCanvas API" });
});

// middlewares
app.use(authenticateToken);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// module.exports = app;
