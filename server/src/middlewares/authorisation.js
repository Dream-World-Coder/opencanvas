const jwt = require("jsonwebtoken");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "238238d68905djd5efd689059jK5ef";

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

// Authentication middleware for protected routes
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

module.exports = {
    handleAuthErrors,
    authenticateToken,
};
