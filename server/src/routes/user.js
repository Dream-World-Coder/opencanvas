const express = require("express");
const router = express.Router();
const User = require("../models/User");

/**
 * update user data
 */
router.put(
    "/update-user",
    authenticateToken,
    checkUserExists,
    async (req, res) => {
        try {
            const user = req.user;
            const {
                username,
                fullName,
                role,
                aboutMe,
                notifications,
                contactInformation,
            } = req.body;

            // Check if username is being changed
            if (username && username !== user.username) {
                // Check for username uniqueness
                const existingUser = await User.findOne({ username });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: "Username already taken",
                    });
                }

                // Validate username length
                if (username.length < 4) {
                    return res.status(400).json({
                        success: false,
                        message: "Username must be at least 4 characters long",
                    });
                }

                if (username.length > 16) {
                    return res.status(400).json({
                        success: false,
                        message: "Username can be 16 characters long at max",
                    });
                }

                user.username = username.toLowerCase();
            }

            // Validate and update fullName if provided
            if (fullName !== undefined) {
                if (fullName && (fullName.length < 4 || fullName.length > 32)) {
                    return res.status(400).json({
                        success: false,
                        message:
                            fullName.length < 4
                                ? "Fullname must be at least 4 characters long"
                                : "Fullname can be 32 characters long at max",
                    });
                }
                user.fullName = fullName;
            }

            if (role !== undefined) {
                if (role.length > 32) {
                    return res.status(400).json({
                        success: false,
                        message: "Role can be 32 characters or less",
                    });
                }
                user.role = role;
            }

            // Update aboutMe if provided
            if (aboutMe !== undefined) {
                if (aboutMe && aboutMe.length > 300) {
                    return res.status(400).json({
                        success: false,
                        message: "Bio must be 300 characters or less",
                    });
                }
                user.aboutMe = aboutMe;
            }

            // Update notifications choices if provided
            if (notifications !== undefined) {
                if (notifications && typeof notifications !== "object") {
                    return res.status(400).json({
                        success: false,
                        message: "error setting notification settings",
                    });
                }
                // console.log(notifications);
                user.notifications.emailNotification = notifications.email;
                user.notifications.pushNotification = notifications.push;

                user.notifications.mentionNotification = notifications.mentions;
                user.notifications.followNotification = notifications.follows;
                user.notifications.commentNotification = notifications.comments;
                user.notifications.messageNotification = notifications.messages;
            }

            if (contactInformation !== undefined) {
                user.contactInformation = contactInformation;
            }

            const savedUser = await user.save();

            return res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                user: savedUser,
            });
        } catch (error) {
            console.error("Update user error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update user data",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : "Server error",
            });
        }
    },
);

// public profile view
// need to set it as id
router.get("/u/:username", async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.params.username,
        }).select({
            passwordHash: 0,
            email: 0,
            provider: 0,
            ipAddress: 0,
            lastFiveLogin: 0,
            savedPosts: 0,
            likedPosts: 0,
        });

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

// get author by id -- limited data like public profile, but getting by id instead username
async function getUserPublicProfileById(req, res) {
    try {
        const author = await User.findOne({
            _id: req.params.id,
        }).select({
            passwordHash: 0,
            email: 0,
            provider: 0,
            ipAddress: 0,
            lastFiveLogin: 0,
            savedPosts: 0,
            likedPosts: 0,
        });

        if (!author) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            author,
        });
    } catch (error) {
        console.error("Get author error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve author data",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Server error",
        });
    }
}
router.get("/author/:id", getUserPublicProfileById);
router.get("/follower/:id", getUserPublicProfileById);
router.get("/following/:id", getUserPublicProfileById);

router.use(handleAuthErrors);

module.exports = { router };
