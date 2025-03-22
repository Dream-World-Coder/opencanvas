const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const {
    authenticateToken,
    checkUserExists,
} = require("../middlewares/authorisation");

/**
 *******************************************************
 * Route to generate feed for non-logged in users
 */
router.post("/feed/anonymous-user", async (req, res) => {
    try {
        // Extract cursor and limit parameters
        const { cursor, limit = 10, topics } = req.body;

        // Validate limit
        if (limit < 1 || limit > 50) {
            return res.status(400).json({
                success: false,
                message: "Invalid limit parameter. Limit must be between 1-50.",
            });
        }

        // Build query object
        const query = { isPublic: true };

        // If cursor is provided, only fetch posts with lower anonymousEngageMentScore
        // This assumes anonymousEngageMentScore is a numeric value
        if (cursor) {
            try {
                const cursorData = JSON.parse(
                    Buffer.from(cursor, "base64").toString("utf-8"),
                );
                query.anonymousEngageMentScore = { $lt: cursorData.score };

                // If there are posts with the same score, use _id to break the tie
                if (cursorData.lastId) {
                    query.$or = [
                        { anonymousEngageMentScore: { $lt: cursorData.score } },
                        {
                            anonymousEngageMentScore: cursorData.score,
                            _id: {
                                $lt: mongoose.Types.ObjectId(cursorData.lastId),
                            },
                        },
                    ];
                }
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid cursor format",
                });
            }
        }

        // Add topic filtering if provided
        if (topics && Array.isArray(topics) && topics.length > 0) {
            query.topics = { $in: topics };
        }

        // Execute the query with projection to exclude sensitive fields
        const posts = await Post.find(query, {
            totalDislikes: 0,
            viewedBy: 0,
            anonymousEngageMentScore: 0,
            engagementScore: 0,
            totalCompleteReads: 0,
            media: 0,
        })
            .sort({ anonymousEngageMentScore: -1, _id: -1 })
            .limit(limit + 1) // Fetch one extra to determine if there are more posts
            .populate("author", "username displayName profilePicture")
            .lean();

        // Check if there are more posts available
        const hasMore = posts.length > limit;

        // Remove the extra post if there are more
        if (hasMore) {
            posts.pop();
        }

        // Create the next cursor
        let nextCursor = null;
        if (hasMore && posts.length > 0) {
            const lastPost = posts[posts.length - 1];
            const cursorData = {
                score: lastPost.anonymousEngageMentScore,
                lastId: lastPost._id.toString(),
            };
            nextCursor = Buffer.from(JSON.stringify(cursorData)).toString(
                // nextCursor = Buffer.from(cursorData).toString(
                //
                "base64",
            );
        }

        // Return the posts with cursor information
        return res.status(200).json({
            success: true,
            posts,
            hasMore,
            nextCursor,
        });
    } catch (error) {
        console.error("Error generating anonymous feed:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate feed. Please try again later.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
});

/**
 *******************************************************
 * Route to generate feed for logged in users
 */
router.post("/feed/authenticated-user", async (req, res) => {});

module.exports = { router };
