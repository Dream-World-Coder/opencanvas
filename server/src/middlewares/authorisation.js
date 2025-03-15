const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
// console.log(`authorisation.js 7`, JWT_SECRET);

// Middleware to handle authentication errors
const handleAuthErrors = (err, req, res, next) => {
    console.error("Authentication error:", err);
    return res.status(500).json({
        success: false,
        message: "Authentication failed",
        error:
            process.env.NODE_ENV === "development"
                ? err.message
                : "Server error",
    });
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access token required",
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        req.userId = decoded.userId;
        next();
    });
};

// user exists check
const checkUserExists = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : "Server error",
        });
    }
};

// Fingerprinting middleware
const fingerprintMiddleware = async (req, res, next) => {
    // Get user ID if authenticated
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id;
            req.visitorIdentifier = `user_${decoded.id}`;
        } catch (err) {
            req.visitorIdentifier = null;
        }
    }

    // If no authenticated user, use fingerprinting
    if (!req.visitorIdentifier) {
        // Get fingerprint from headers or generate one
        const clientIp =
            req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const userAgent = req.headers["user-agent"] || "unknown";

        // Create a unique identifier using available data
        const fingerprintData = `${clientIp}_${userAgent}`;

        // Fixed crypto usage
        const fingerprint = crypto
            .createHash("md5")
            .update(fingerprintData)
            .digest("hex");

        req.visitorIdentifier = `anon_${fingerprint}`;
    }

    next();
};

module.exports = {
    handleAuthErrors,
    authenticateToken,
    checkUserExists,
    fingerprintMiddleware,
};
