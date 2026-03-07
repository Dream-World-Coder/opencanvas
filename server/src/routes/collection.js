const express = require("express");
const router = express.Router();
const Collection = require("../models/Collection");
const Post = require("../models/Post");
const Interaction = require("../models/Interaction");
const {
  authenticateToken,
  checkUserExists,
} = require("../middlewares/authorisation");

// ::::: public :::::

// browse: returns all public collections, paginated
router.get("/collections", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const collections = await Collection.find({ isPrivate: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("title description thumbnailUrl tags stats authorId createdAt");

    res.status(200).json({
      success: true,
      page,
      results: collections.length,
      data: collections,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch collections",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// public collection page: returns the collection + its posts (sm data only)
router.get("/c/:collectionId", async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.collectionId,
      isPrivate: false,
    });

    if (!collection) {
      return res
        .status(404)
        .json({ success: false, message: "Collection not found" });
    }

    const posts = await Post.find({
      _id: { $in: collection.posts },
      isPublic: true,
    }).select(
      "title contentPreview slug type tags readTime thumbnailUrl isPremium authorSnapshot stats createdAt updatedAt",
    );

    res.status(200).json({ success: true, data: { collection, posts } });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch collection",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// ::::: protected :::::

// returns a user's collections (no posts inside, just collection metadata)
// owner/mod sees all, everyone else sees only public collections
router.get(
  "/u/:userId/collections",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const isOwner = req.userId === userId;
      const isMod = ["moderator", "admin"].includes(req.user.role);
      const filter =
        isOwner || isMod
          ? { authorId: userId }
          : { authorId: userId, isPrivate: false };

      const collections = await Collection.find(filter)
        .sort({ createdAt: -1 })
        // posts is included so the frontend can derive the count via posts.length
        // coll stats has no postsCount so the source of truth is the posts array
        .select(
          "title description thumbnailUrl tags isPrivate stats posts createdAt",
        );

      res.status(200).json({
        success: true,
        results: collections.length,
        data: collections,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch user collections",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// private collection viewer: only the author or mod can access
router.get(
  "/c/private/:collectionId",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const collection = await Collection.findById(req.params.collectionId);
      if (!collection) {
        return res
          .status(404)
          .json({ success: false, message: "Collection not found" });
      }

      const isOwner = collection.authorId.toString() === req.userId;
      const isMod = ["moderator", "admin"].includes(req.user.role);
      if (!isOwner && !isMod) {
        return res.status(403).json({
          success: false,
          message: "Not authorised to view this collection",
        });
      }

      // private collns can contain private posts too, so no isPublic filter here
      const posts = await Post.find({ _id: { $in: collection.posts } }).select(
        "title slug type tags readTime thumbnailUrl isPremium authorSnapshot stats createdAt",
      );

      res.status(200).json({ success: true, data: { collection, posts } });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch private collection",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// create a new collection. also registers it in the user's collns arr
router.post(
  "/create/collection",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      if (req.user.collections.length >= 50) {
        return res
          .status(400)
          .json({ success: false, message: "Maximum 50 collections allowed" });
      }

      const { title, description, thumbnailUrl, isPrivate, tags } = req.body;
      if (!title) {
        return res
          .status(400)
          .json({ success: false, message: "Title is required" });
      }

      const collection = await Collection.create({
        title,
        description,
        thumbnailUrl,
        isPrivate: isPrivate ?? false,
        tags: tags ?? [],
        authorId: req.userId,
      });

      // Keep user.collections in sync with the Collection documents
      req.user.collections.push(collection._id);
      await req.user.save();

      res.status(201).json({ success: true, data: collection });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to create collection",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// like or dislike a collection (toggle).
router.post(
  "/collection/:collectionId/vote",
  authenticateToken,
  async (req, res) => {
    try {
      const { collectionId } = req.params;
      const { vote } = req.body; // "like" | "dislike"

      if (!["like", "dislike"].includes(vote)) {
        return res.status(400).json({
          success: false,
          message: "vote must be 'like' or 'dislike'",
        });
      }

      const statField =
        vote === "like" ? "stats.likesCount" : "stats.dislikesCount";
      const oppositeField =
        vote === "like" ? "stats.dislikesCount" : "stats.likesCount";

      const existing = await Interaction.findOne({
        userId: req.userId,
        targetId: collectionId,
        targetModel: "Collection",
      });

      if (existing) {
        if (existing.type === vote) {
          // Same vote → remove (!vote)
          await existing.deleteOne();
          await Collection.findByIdAndUpdate(collectionId, {
            $inc: { [statField]: -1 },
          });
          return res
            .status(200)
            .json({ success: true, message: "Vote removed" });
        } else {
          // oppoiste vote → switch
          existing.type = vote;
          await existing.save();
          await Collection.findByIdAndUpdate(collectionId, {
            $inc: { [statField]: 1, [oppositeField]: -1 },
          });
          return res
            .status(200)
            .json({ success: true, message: "Vote switched" });
        }
      }

      // first vote → add
      await Interaction.create({
        userId: req.userId,
        targetId: collectionId,
        targetModel: "Collection",
        type: vote,
      });
      await Collection.findByIdAndUpdate(collectionId, {
        $inc: { [statField]: 1 },
      });

      res.status(201).json({ success: true, message: "Vote recorded" });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to vote",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// update collection metadata. Author only
router.put(
  "/update-collection/:collectionId",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const collection = await Collection.findById(req.params.collectionId);
      if (!collection) {
        return res
          .status(404)
          .json({ success: false, message: "Collection not found" });
      }

      if (collection.authorId.toString() !== req.userId) {
        return res.status(403).json({
          success: false,
          message: "Not authorised to update this collection",
        });
      }

      const { title, description, thumbnailUrl, isPrivate, tags } = req.body;
      if (title !== undefined) collection.title = title;
      if (description !== undefined) collection.description = description;
      if (thumbnailUrl !== undefined) collection.thumbnailUrl = thumbnailUrl;
      if (isPrivate !== undefined) collection.isPrivate = isPrivate;
      if (tags !== undefined) collection.tags = tags;

      await collection.save();

      res.status(200).json({ success: true, data: collection });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to update collection",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// toggle a post into & out of a collection, enforcing the 50 post lim
router.put(
  "/add-remove-post/:postId/collection/:collectionId",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { postId, collectionId } = req.params;

      const collection = await Collection.findById(collectionId);
      if (!collection) {
        return res
          .status(404)
          .json({ success: false, message: "Collection not found" });
      }

      if (collection.authorId.toString() !== req.userId) {
        return res.status(403).json({
          success: false,
          message: "Not authorised to modify this collection",
        });
      }

      const alreadyIn = collection.posts.some((id) => id.toString() === postId);

      if (alreadyIn) {
        collection.posts = collection.posts.filter(
          (id) => id.toString() !== postId,
        );
      } else {
        if (collection.posts.length >= 50) {
          return res.status(400).json({
            success: false,
            message: "Collection is full (50 post limit)",
          });
        }
        collection.posts.push(postId);
      }

      await collection.save();

      res.status(200).json({
        success: true,
        message: alreadyIn
          ? "Post removed from collection"
          : "Post added to collection",
        data: collection,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to update collection posts",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// del a collection and remove it from the user's collections arr
router.delete(
  "/delete-collection/:collectionId",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const collection = await Collection.findById(req.params.collectionId);
      if (!collection) {
        return res
          .status(404)
          .json({ success: false, message: "Collection not found" });
      }

      const isOwner = collection.authorId.toString() === req.userId;
      const isMod = ["moderator", "admin"].includes(req.user.role);
      if (!isOwner && !isMod) {
        return res.status(403).json({
          success: false,
          message: "Not authorised to delete this collection",
        });
      }

      await collection.deleteOne();

      // removing from user's collns ref arr
      req.user.collections = req.user.collections.filter(
        (id) => id.toString() !== req.params.collectionId,
      );
      await req.user.save();

      res.status(200).json({ success: true, message: "Collection deleted" });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to delete collection",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

module.exports = { router };
