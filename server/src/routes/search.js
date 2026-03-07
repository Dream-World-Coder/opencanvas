const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");

/*
GET /search?q=...&type=users|posts|all

Searches:
  users → fullName, designation (case-insensitive, partial match)
  posts → title (case-insensitive, partial match, public only)

Query params:
  q {string}  required –> search term (min 1 char)
  type {string}  optional –> "users" | "posts" | "all"  (default: "all")

returns up to 10 results per type
*/

const MAX_RESULTS = 10;

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim();
    const type = req.query.type || "all"; // "users" | "posts" | "all"

    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    // case-insensitive regex from search term
    const regex = new RegExp(query, "i");

    const results = {};

    // ::::: user search :::::
    if (type === "users" || type === "all") {
      results.users = await User.find({
        $or: [{ fullName: regex }, { designation: regex }],
      })
        .select("username fullName profilePicture designation stats")
        .limit(MAX_RESULTS)
        .lean();
    }

    // ::::: post search :::::
    if (type === "posts" || type === "all") {
      results.posts = await Post.find({
        title: regex,
        isPublic: true, // only public posts
      })
        .select(
          "title slug authorSnapshot thumbnailUrl readTime tags stats createdAt",
        )
        .sort({ "stats.viewsCount": -1 }) // surface more popular posts first
        .limit(MAX_RESULTS)
        .lean();
    }

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
