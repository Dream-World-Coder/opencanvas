// auth.js - Authentication routes
const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Environment variables - in production use dotenv
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || "238238d68905djd5efd689059jK5ef"; // will change later
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Configure Google Strategy for Passport
passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Find if user already exists
                let user = await User.findOne({
                    email: profile.emails[0].value,
                });

                if (user) {
                    // Update login info
                    if (user.lastFiveLogin.length >= 5) {
                        user.lastFiveLogin.pop(); // Remove oldest login
                    }

                    user.lastFiveLogin.unshift({
                        loginTime: new Date(),
                        deviceInfo: profile._json.locale
                            ? `Google Auth (${profile._json.locale})`
                            : "Google Auth",
                    });

                    await user.save();
                } else {
                    // Create new user
                    const newUser = new User({
                        username:
                            profile.emails[0].value.split("@")[0] +
                            Math.floor(Math.random() * 1000), // Generate username
                        fullName: profile.displayName || "Google User",
                        email: profile.emails[0].value,
                        passwordHash:
                            "google-auth-" +
                            bcrypt.hashSync(Math.random().toString(), 10), // Random password
                        profilePicture:
                            profile.photos[0]?.value ||
                            "https://opencanvas.blog/defaults/profile.png",
                        lastFiveLogin: [
                            {
                                loginTime: new Date(),
                                deviceInfo: profile._json.locale
                                    ? `Google Auth (${profile._json.locale})`
                                    : "Google Auth",
                            },
                        ],
                    });

                    user = await newUser.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        },
    ),
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

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

// Regular register route
router.post("/register", async (req, res) => {
    try {
        const { username, fullName, email, password } = req.body;

        // Validate input
        if (!username || !fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    existingUser.email === email
                        ? "Email already in use"
                        : "Username already taken",
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            fullName,
            email,
            passwordHash,
            ipAddress: req.ip,
            lastFiveLogin: [
                {
                    loginTime: new Date(),
                    deviceInfo: req.headers["user-agent"] || "Unknown device",
                },
            ],
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: "7d" },
        );

        // Return success with token
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePicture: newUser.profilePicture,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Registration failed",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Server error",
        });
    }
});

// Regular login route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find user
        const user = await User.findOne({ email });

        // Check if user exists and password is correct
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Update login information
        if (user.lastFiveLogin.length >= 5) {
            user.lastFiveLogin.pop(); // Remove oldest login
        }

        user.lastFiveLogin.unshift({
            loginTime: new Date(),
            deviceInfo: req.headers["user-agent"] || "Unknown device",
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" },
        );

        // Return success with token
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Server error",
        });
    }
});

// Google authentication routes
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    }),
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed`,
        session: false,
    }),
    (req, res) => {
        try {
            // Generate JWT token
            const token = jwt.sign(
                { userId: req.user._id, email: req.user.email },
                JWT_SECRET,
                { expiresIn: "7d" },
            );

            // Redirect to frontend with token
            res.redirect(`${FRONTEND_URL}/auth/success?token=${token}`);
        } catch (error) {
            console.error("Google callback error:", error);
            res.redirect(`${FRONTEND_URL}/login?error=server_error`);
        }
    },
);

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

// Protected route example
router.get("/user", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-passwordHash");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Get user error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user data",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Server error",
        });
    }
});

// Apply error handler
router.use(handleAuthErrors);

module.exports = {
    router,
    authenticateToken,
};
