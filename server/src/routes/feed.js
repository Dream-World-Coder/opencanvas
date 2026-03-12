const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = require("../models/Post");
const { cache, TTL } = require("../services/cacheService");

/**
 * LEGACY
 */
router.post("/articles/anonymous-user", async (req, res) => {
  try {
    const { cursor, limit = 16 } = req.body;

    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: "Invalid limit. Must be between 1 and 50.",
      });
    }

    const query = { isPublic: true };

    if (cursor) {
      try {
        const cursorData = JSON.parse(
          Buffer.from(cursor, "base64").toString("utf-8"),
        );

        if (cursorData.lastId) {
          query.$or = [
            { anonymousEngagementScore: { $lt: cursorData.score } },
            {
              anonymousEngagementScore: cursorData.score,
              _id: { $lt: new mongoose.Types.ObjectId(cursorData.lastId) },
            },
          ];
        } else {
          query.anonymousEngagementScore = { $lt: cursorData.score };
        }
      } catch {
        return res
          .status(400)
          .json({ success: false, message: "Invalid cursor format" });
      }
    }

    const posts = await Post.find(query)
      .select(
        "title contentPreview slug type tags readTime thumbnailUrl isPremium authorSnapshot stats anonymousEngagementScore createdAt",
      )
      .sort({ anonymousEngagementScore: -1, _id: -1 })
      .limit(limit + 1) // +1 to check if next page exists
      .lean();

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    let nextCursor = null;
    if (hasMore && posts.length > 0) {
      const last = posts[posts.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          score: last.anonymousEngagementScore,
          lastId: last._id.toString(),
        }),
      ).toString("base64");
    }

    return res.status(200).json({ success: true, posts, hasMore, nextCursor });
  } catch (err) {
    console.error("Anonymous feed error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate feed.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

/**
 * curr
 */
router.get("/articles", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const rawCursor = req.query.cursor || "";
    const cacheKey = `articles:c${rawCursor}:l${limit}`;

    const cached = cache.get(cacheKey);
    if (cached) {
      return res
        .status(200)
        .json({ success: true, ...cached, fromCache: true });
    }

    const query = { isPublic: true };

    if (rawCursor) {
      let cursorData;
      try {
        cursorData = JSON.parse(
          Buffer.from(rawCursor, "base64").toString("utf-8"),
        );
      } catch {
        return res
          .status(400)
          .json({ success: false, message: "Invalid cursor format" });
      }

      const cursorId = new mongoose.Types.ObjectId(cursorData.lastId);
      query.$or = [
        { anonymousEngagementScore: { $lt: cursorData.score } },
        { anonymousEngagementScore: cursorData.score, _id: { $lt: cursorId } },
      ];
    }

    const posts = await Post.find(query)
      .sort({ anonymousEngagementScore: -1, _id: -1 })
      .limit(limit + 1)
      .select(
        "title contentPreview slug type tags readTime thumbnailUrl isPremium isPublic authorSnapshot stats anonymousEngagementScore createdAt updatedAt",
      )
      .lean();

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    let nextCursor = null;
    if (hasMore && posts.length > 0) {
      const last = posts[posts.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          score: last.anonymousEngagementScore,
          lastId: last._id.toString(),
        }),
      ).toString("base64");
    }

    const payload = { results: posts.length, data: posts, nextCursor, hasMore };
    cache.set(cacheKey, payload, TTL.ARTICLES_FEED);
    return res.status(200).json({ success: true, ...payload });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch articles",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = { router };
