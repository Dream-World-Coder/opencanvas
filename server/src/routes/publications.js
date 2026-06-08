const express = require("express");
const mongoose = require("mongoose");
const Publication = require("../models/Publication.js");
const Interaction = require("../models/Interaction.js");

// Updated imports to use the provided services and middlewares
const { cache } = require("../services/cacheService.js");
const {
    authenticateToken,
    fingerprintMiddleware,
} = require("../middlewares/authorisation.js");
const { institutions } = require("../../scraper/config/institutions.js");

const router = express.Router();
const CACHE_TTL = 300; // 5 minutes

// 1. GET Feed - Handles both All Institutions and Filtered queries
router.get("/", async (req, res) => {
    try {
        const { cursor, limit = 20, inst } = req.query;

        // Use inst in cache key if it exists
        const cacheKey = `publications:feed:${inst || "all"}:${cursor || "start"}`;
        const cachedData = cache.get(cacheKey);

        if (cachedData) return res.json({ success: true, data: cachedData });

        const query = {};

        // If 'inst' query param exists, split by space (URLSearchParams uses spaces)
        if (inst) {
            query.institution = { $in: inst.split(" ") };
        }

        if (cursor) {
            query.anonymousEngagementScore = { $lt: Number(cursor) };
        }

        const publications = await Publication.find(query)
            .sort({ anonymousEngagementScore: -1 })
            .limit(Number(limit))
            .lean();

        const nextCursor =
            publications.length > 0
                ? publications[publications.length - 1].anonymousEngagementScore
                : null;

        const result = { publications, nextCursor };

        cache.set(cacheKey, result, CACHE_TTL);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch feed",
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
});

// 2. GET Institutions List
router.get("/institutions", (req, res) => {
    const data = institutions.map((inst) => ({
        slug: inst.slug,
        displayName: inst.displayName,
        shortName: inst.shortName,
        country: inst.country,
        color: inst.color,
        website: inst.website,
    }));
    res.json({ success: true, data });
});

// 3. GET Institution Filtered Feed (OR logic for uniSlug)
router.get("/:uniSlug", async (req, res) => {
    try {
        const { uniSlug } = req.params;
        const { cursor, limit = 20 } = req.query;
        const slugs = uniSlug.split("+");

        const cacheKey = `publications:${uniSlug}:${cursor || "start"}`;

        const cachedData = cache.get(cacheKey);
        if (cachedData) return res.json({ success: true, data: cachedData });

        const query = { institution: { $in: slugs } };
        if (cursor) query.anonymousEngagementScore = { $lt: Number(cursor) };

        const publications = await Publication.find(query)
            .sort({ anonymousEngagementScore: -1 })
            .limit(Number(limit))
            .lean();

        const nextCursor =
            publications.length > 0
                ? publications[publications.length - 1].anonymousEngagementScore
                : null;
        const result = { publications, nextCursor };

        cache.set(cacheKey, result, CACHE_TTL);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({
            success: false,
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
});

// 8. GET User Interactions State
router.get("/:pubId/my-interactions", authenticateToken, async (req, res) => {
    try {
        const interactions = await Interaction.find({
            userId: req.userId,
            targetId: req.params.pubId,
            targetModel: "Publication",
        }).lean();

        const state = { liked: false, disliked: false, saved: false };
        interactions.forEach((int) => {
            if (int.type === "like") state.liked = true;
            if (int.type === "dislike") state.disliked = true;
            if (int.type === "save") state.saved = true;
        });

        res.json({ success: true, data: state });
    } catch (err) {
        res.status(500).json({
            success: false,
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
});

// 4. GET Single Publication
router.get("/:uniSlug/:id", async (req, res) => {
    try {
        const publication = await Publication.findById(req.params.id).lean();
        if (!publication)
            return res
                .status(404)
                .json({ success: false, message: "Publication not found" });

        res.json({ success: true, data: publication });
    } catch (err) {
        res.status(500).json({
            success: false,
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
});

// 5. PATCH Increment Views (Fingerprinted)
router.patch("/view/:id", fingerprintMiddleware, async (req, res) => {
    try {
        // Now utilizing req.visitorIdentifier set by fingerprintMiddleware if needed in future updates
        await Publication.findByIdAndUpdate(req.params.id, {
            $inc: { "stats.viewsCount": 1 },
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({
            success: false,
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
});

// 6. POST Like/Dislike
router.post("/like-dislike", authenticateToken, async (req, res) => {
    try {
        const { targetId, action } = req.body;
        const userId = req.userId;

        const existing = await Interaction.findOne({
            userId,
            targetId,
            targetModel: "Publication",
            type: { $in: ["like", "dislike"] },
        });

        if (existing && existing.type === action) {
            await Interaction.findByIdAndDelete(existing._id);
            await Publication.findByIdAndUpdate(targetId, {
                $inc: { [`stats.${action}sCount`]: -1 },
            });
            return res.json({ success: true, message: `Removed ${action}` });
        }

        if (existing) {
            existing.type = action;
            await existing.save();
            const incObj =
                action === "like"
                    ? { "stats.likesCount": 1, "stats.dislikesCount": -1 }
                    : { "stats.likesCount": -1, "stats.dislikesCount": 1 };
            await Publication.findByIdAndUpdate(targetId, { $inc: incObj });
        } else {
            await new Interaction({
                userId,
                targetId,
                targetModel: "Publication",
                type: action,
            }).save();
            await Publication.findByIdAndUpdate(targetId, {
                $inc: { [`stats.${action}sCount`]: 1 },
            });
        }

        res.json({ success: true, message: `Action ${action} recorded` });
    } catch (err) {
        res.status(500).json({
            success: false,
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
});

// 7. POST Save/Unsave
router.post("/save-unsave", authenticateToken, async (req, res) => {
    try {
        const { targetId } = req.body;
        const userId = req.userId;

        const existing = await Interaction.findOne({
            userId,
            targetId,
            targetModel: "Publication",
            type: "save",
        });

        if (existing) {
            await Interaction.findByIdAndDelete(existing._id);
            await Publication.findByIdAndUpdate(targetId, {
                $inc: { "stats.savesCount": -1 },
            });
            return res.json({ success: true, message: "Unsaved" });
        }

        await new Interaction({
            userId,
            targetId,
            targetModel: "Publication",
            type: "save",
        }).save();
        await Publication.findByIdAndUpdate(targetId, {
            $inc: { "stats.savesCount": 1 },
        });

        res.json({ success: true, message: "Saved" });
    } catch (err) {
        res.status(500).json({
            success: false,
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
});

module.exports = { router };
