const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");

/*
GET /search?q=...&type=users|posts|all&page=1&limit=100

Searches:
  users → fullName, designation (case-insensitive, partial match)
  posts → title (case-insensitive, partial match, public only)

Query params:
  q {string}  required –> search term (min 1 char)
  type {string}  optional –> "users" | "posts" | "all"  (default: "all")
  page {number} optional –> page number (default: 1)
  limit {number} optional –> results per page, max 1000 (default: 100)

returns paginated results (max 1000 total)
*/

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim();
    const type = req.query.type || "all"; // "users" | "posts" | "all"
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const skip = (page - 1) * limit;

    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    // case-insensitive regex from search term
    const regex = new RegExp(query, "i");

    const results = { page, limit, total: 0 };

    // ::::: user search :::::
    if (type === "users" || type === "all") {
      const [users, userTotal] = await Promise.all([
        User.find({
          $or: [{ fullName: regex }, { designation: regex }],
        })
          .select("username fullName profilePicture designation stats")
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments({
          $or: [{ fullName: regex }, { designation: regex }],
        }),
      ]);
      results.users = users;
      results.usersTotal = userTotal;
    }

    // ::::: post search :::::
    if (type === "posts" || type === "all") {
      const [posts, postTotal] = await Promise.all([
        Post.find({
          title: regex,
          isPublic: true, // public only
        })
          .select(
            "title slug authorSnapshot thumbnailUrl readTime tags stats createdAt",
          )
          .sort({ "stats.viewsCount": -1 }) // surface more popular posts first
          .skip(skip)
          .limit(limit)
          .lean(),
        Post.countDocuments({
          title: regex,
          isPublic: true,
        }),
      ]);
      results.posts = posts;
      results.postsTotal = postTotal;
    }

    results.total = (results.usersTotal || 0) + (results.postsTotal || 0);

    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = { router };
