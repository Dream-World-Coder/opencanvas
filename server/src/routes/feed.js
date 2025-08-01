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
 *
 * Route to generate articles feed for non-logged in users
 */
router.post("/articles/anonymous-user", async (req, res) => {
    try {
        // Extract cursor and limit parameters
        const { cursor, limit = 16 } = req.body; // { ..., topics} = ...

        // Validate limit
        if (limit < 1 || limit > 50) {
            return res.status(400).json({
                success: false,
                message: "Invalid limit parameter. Limit must be between 1-50.",
            });
        }

        // Build query object
        const query = { isPublic: true };

        if (cursor) {
            try {
                // console.log("Raw cursor:", cursor);
                const decodedString = Buffer.from(cursor, "base64").toString(
                    "utf-8",
                );
                // console.log("Decoded string:", decodedString);
                const cursorData = JSON.parse(decodedString);
                // console.log("Parsed cursor data:", cursorData);

                query.anonymousEngageMentScore = { $lt: cursorData.score };

                // If there are posts with the same score, use _id to break the tie
                if (cursorData.lastId) {
                    query.$or = [
                        { anonymousEngageMentScore: { $lt: cursorData.score } },
                        {
                            anonymousEngageMentScore: cursorData.score,
                            _id: {
                                $lt: new mongoose.Types.ObjectId(
                                    cursorData.lastId,
                                ),
                            },
                        },
                    ];
                }
            } catch (error) {
                console.error("Cursor parsing error:", error);
                return res.status(400).json({
                    success: false,
                    message: "Invalid cursor format",
                });
            }
        }

        // Add topic filtering if provided
        // if (topics && Array.isArray(topics) && topics.length > 0) {
        //     query.topics = { $in: topics };
        // }

        // Execute the query with projection to exclude sensitive fields
        const posts = await Post.find(query, {
            totalDislikes: 0,
            viewedBy: 0,
            // anonymousEngageMentScore: 0,
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

            // Add these debug logs
            // console.log("Creating cursor with data:", cursorData);
            const jsonString = JSON.stringify(cursorData);
            // console.log("JSON string:", jsonString);
            nextCursor = Buffer.from(jsonString).toString("base64");
            // console.log("Final nextCursor:", nextCursor);
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
 *
 * Route to generate feed for logged in users
 */
router.post("/articles/authenticated-user", async (req, res) => {});

/**
 *
 * Route to generate social feed for non-logged in users
 */
router.post("/social/anonymous-user", async (req, res) => {
    try {
        // Extract cursor and limit parameters
        const { cursor, limit = 16 } = req.body; // { ..., topics} = ...

        // Validate limit
        if (limit < 1 || limit > 50) {
            return res.status(400).json({
                success: false,
                message: "Invalid limit parameter. Limit must be between 1-50.",
            });
        }

        // Build query object
        const query = { isPublic: true, type: "social" };

        if (cursor) {
            try {
                // console.log("Raw cursor:", cursor);
                const decodedString = Buffer.from(cursor, "base64").toString(
                    "utf-8",
                );
                // console.log("Decoded string:", decodedString);
                const cursorData = JSON.parse(decodedString);
                // console.log("Parsed cursor data:", cursorData);

                query.anonymousEngageMentScore = { $lt: cursorData.score };

                // If there are posts with the same score, use _id to break the tie
                if (cursorData.lastId) {
                    query.$or = [
                        { anonymousEngageMentScore: { $lt: cursorData.score } },
                        {
                            anonymousEngageMentScore: cursorData.score,
                            _id: {
                                $lt: new mongoose.Types.ObjectId(
                                    cursorData.lastId,
                                ),
                            },
                        },
                    ];
                }
            } catch (error) {
                console.error("Cursor parsing error:", error);
                return res.status(400).json({
                    success: false,
                    message: "Invalid cursor format",
                });
            }
        }

        // Add topic filtering if provided
        // if (topics && Array.isArray(topics) && topics.length > 0) {
        //     query.topics = { $in: topics };
        // }

        // Execute the query with projection to exclude sensitive fields
        const posts = await Post.find(query, {
            totalDislikes: 0,
            viewedBy: 0,
            // anonymousEngageMentScore: 0,
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

            // Add these debug logs
            // console.log("Creating cursor with data:", cursorData);
            const jsonString = JSON.stringify(cursorData);
            // console.log("JSON string:", jsonString);
            nextCursor = Buffer.from(jsonString).toString("base64");
            // console.log("Final nextCursor:", nextCursor);
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

module.exports = { router };
