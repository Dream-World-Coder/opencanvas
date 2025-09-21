const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const apicache = require("apicache");
const cache = apicache.middleware;

const User = require("../models/User");
const {
  generateUniqueUsername,
  generateRandomThumbnail,
} = require("../utils/helper");

const {
  handleAuthErrors,
  authenticateToken,
} = require("../middlewares/authorisation");

require("dotenv").config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

const config = {
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.CURRENT_URL}/auth/google/callback`,
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  passReqToCallback: true,
};

const verifyCallback = async (
  req,
  accessToken,
  refreshToken,
  profile,
  done,
) => {
  const userAgent = req.get("User-Agent");
  const ipAddr = req.ip;
  const loginInfo = {
    loginTime: new Date(),
    deviceInfo: userAgent || "Unknown",
    ipAddress: ipAddr || "Unknown",
  };

  try {
    // checking if user already exists
    let user = await User.findOne({
      email: profile.emails[0].value,
    });

    if (user) {
      // login info update
      if (user.lastFiveLogin.length >= 5) {
        user.lastFiveLogin.pop(); // oldest popped
      }
      user.lastFiveLogin.unshift(loginInfo);

      await user.save();
    } else {
      // new user creating
      const newUser = new User({
        username: await generateUniqueUsername(),
        fullName: profile.displayName.slice(0, 32) || "User",
        email: profile.emails[0].value,
        provider: "google",
        profilePicture:
          profile.photos[0]?.value || generateRandomThumbnail("profile"),
        lastFiveLogin: [loginInfo],
      });

      user = await newUser.save();
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
};

// google strategy for passport
passport.use(new GoogleStrategy(config, verifyCallback));

/* using jwt so no need
// serialize and deserialize user
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
*/

// Google auth routes
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
      // handle proper error display in frontend
    }
  },
);

/**
 *******************************************************
 * Get user Data for Auth, frontend's {@currentUser} gets data through this
 */
router.get(
  "/user",
  authenticateToken,
  cache("60 seconds"),
  async (req, res) => {
    try {
      const user = await User.findById(req.userId).select(
        "-provider -ipAddress",
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.posts = [...user.posts].reverse();

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
  },
);

router.use(handleAuthErrors);

module.exports = { router };
