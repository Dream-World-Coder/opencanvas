// server/src/routes/collection.js
// needs review

const express = require("express");
const router = express.Router();
const Collection = require("../models/Collection");
const Post = require("../models/Post");
const {
  authenticateToken,
  checkUserExists,
} = require("../middlewares/authorisation");

/**
 *
 * create
 *
 */
// create a new collection
router.post(
  "/create/collection",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      let { title, description, thumbnailUrl, tags, isPrivate } = req.body;

      title = title.trim();

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Title is required",
        });
      }

      // only alphanumeric, spaces allowed
      const titleRegex = /^[a-zA-Z0-9 ]+$/;

      if (!titleRegex.test(title)) {
        return res.status(400).json({
          success: false,
          message: "Title can only contain letters, numbers, and spaces",
        });
      }

      if (tags && tags.length > 5) {
        return res.status(400).json({
          success: false,
          message: "Maximum 5 tags are allowed",
        });
      }

      const collection = new Collection({
        title: title.trim(),
        description: description?.trim() || "",
        thumbnailUrl: thumbnailUrl?.trim() || "",
        tags: tags
          ? tags.map((tag) => tag.trim()).filter((tag) => tag !== "")
          : [],
        isPrivate: isPrivate || false,
        authorId: req.userId,
      });

      const savedCollection = await collection.save();
      await savedCollection.populate("authorId", "username profilePicture");

      res.status(201).json({
        success: true,
        message: "Collection created successfully",
        collection: savedCollection,
      });
    } catch (error) {
      console.error("Error creating collection:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create collection",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Server error",
      });
    }
  },
);

/**
 *
 * read
 *
 */
// get user's collections, only collections data, not articles inside it
router.get(
  "/u/:userId/collections",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.userId;

      // Build query - if requesting own collections, show all; if requesting others', show only public
      let query = { authorId: userId };
      if (userId !== requestingUserId) {
        query.isPrivate = false;
      }

      const collections = await Collection.find(query)
        .populate("authorId", "username profilePicture")
        .populate("posts", "title thumbnailUrl createdAt")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        collections,
      });
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch collections",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Server error",
      });
    }
  },
);

// collection by ID, public route, collection + articles inside it, smaller url cuz its shareable
router.get("/c/:collectionId", async (req, res) => {
  try {
    const { collectionId } = req.params;

    const collection = await Collection.findById(collectionId)
      .populate("authorId", "username profilePicture")
      .populate("posts", "title content thumbnailUrl createdAt authorId tags");

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Collection not found",
      });
    }

    if (collection.isPrivate) {
      return res.status(403).json({
        success: false,
        message: "Access denied to private collection",
      });
    }

    res.json({
      success: true,
      collection,
    });
  } catch (error) {
    console.error("Error fetching collection:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch collection",
      error:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
});

// collection by ID, private route, collection + articles inside it, smaller url cuz its shareable
router.get(
  "/c/private/:collectionId",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { collectionId } = req.params;
      const requestingUserId = req.userId;

      const collection = await Collection.findById(collectionId)
        .populate("authorId", "username profilePicture")
        .populate(
          "posts",
          "title content thumbnailUrl createdAt authorId tags",
        );

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found",
        });
      }

      if (collection.authorId.toString() !== requestingUserId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied to private collection",
        });
      }

      res.json({
        success: true,
        collection,
      });
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch collection",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Server error",
      });
    }
  },
);

// get all public collections (for discovery/browse)
router.get("/collections", async (req, res) => {
  try {
    const { page = 1, limit = 20, tags, search } = req.query;

    let query = { isPrivate: false };

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      query.tags = { $in: tagArray };
    }

    const collections = await Collection.find(query)
      .populate("authorId", "username profilePicture")
      .populate("posts", "title thumbnailUrl")
      .sort({ totalUpvotes: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Collection.countDocuments(query);

    res.json({
      success: true,
      collections,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch collections",
      error:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
});

/**
 *
 * update
 *
 */
// edit/update colln
router.put(
  "/update-collection/:collectionId",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { collectionId } = req.params;
      const { title, description, thumbnailUrl, tags, isPrivate } = req.body;
      const userId = req.userId;

      const collection = await Collection.findById(collectionId);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found",
        });
      }

      // Check if user owns the collection
      if (collection.authorId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this collection",
        });
      }

      // Validation
      if (title && title.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      if (tags && tags.length > 5) {
        return res.status(400).json({
          success: false,
          message: "Maximum 5 tags are allowed",
        });
      }

      // Update fields
      if (title !== undefined) collection.title = title.trim();
      if (description !== undefined)
        collection.description = description.trim();
      if (thumbnailUrl !== undefined)
        collection.thumbnailUrl = thumbnailUrl.trim();
      if (tags !== undefined)
        collection.tags = tags
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "");
      if (isPrivate !== undefined) collection.isPrivate = isPrivate;

      const updatedCollection = await collection.save();
      await updatedCollection.populate("authorId", "username profilePicture");

      res.json({
        success: true,
        message: "Collection updated successfully",
        collection: updatedCollection,
      });
    } catch (error) {
      console.error("Error updating collection:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update collection",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Server error",
      });
    }
  },
);

// add a post to colln
router.post(
  "/add-post/:postId/collection/:collectionId",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { postId, collectionId } = req.params;
      const userId = req.userId;

      const collection = await Collection.findById(collectionId);
      const post = await Post.findById(postId);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found",
        });
      }

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      // Check if user owns the collection
      if (collection.authorId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to modify this collection",
        });
      }

      // Check if post is already in collection
      if (collection.posts.includes(postId)) {
        return res.status(400).json({
          success: false,
          message: "Post already exists in this collection",
        });
      }

      collection.posts.push(postId);
      await collection.save();

      res.json({
        success: true,
        message: "Post added to collection successfully",
      });
    } catch (error) {
      console.error("Error adding post to collection:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add post to collection",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Server error",
      });
    }
  },
);

// remove post from colln
router.delete(
  "/remove-post/:postId/collection/:collectionId",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { postId, collectionId } = req.params;
      const userId = req.userId;

      const collection = await Collection.findById(collectionId);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found",
        });
      }

      // Check if user owns the collection
      if (collection.authorId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to modify this collection",
        });
      }

      // Check if post exists in collection
      if (!collection.posts.includes(postId)) {
        return res.status(400).json({
          success: false,
          message: "Post not found in this collection",
        });
      }

      collection.posts = collection.posts.filter(
        (id) => id.toString() !== postId,
      );
      await collection.save();

      res.json({
        success: true,
        message: "Post removed from collection successfully",
      });
    } catch (error) {
      console.error("Error removing post from collection:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove post from collection",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Server error",
      });
    }
  },
);

// upvote/downvote colln
router.post(
  "/collection/:collectionId/vote",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { collectionId } = req.params;
      const { voteType } = req.body; // 'upvote' or 'downvote'

      if (!["upvote", "downvote"].includes(voteType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid vote type. Use 'upvote' or 'downvote'",
        });
      }

      const collection = await Collection.findById(collectionId);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found",
        });
      }

      if (voteType === "upvote") {
        collection.totalUpvotes += 1;
      } else {
        collection.totalDownvotes += 1;
      }

      await collection.save();

      res.json({
        success: true,
        message: `Collection ${voteType}d successfully`,
        totalUpvotes: collection.totalUpvotes,
        totalDownvotes: collection.totalDownvotes,
      });
    } catch (error) {
      console.error("Error voting on collection:", error);
      res.status(500).json({
        success: false,
        message: "Failed to vote on collection",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Server error",
      });
    }
  },
);

/**
 *
 * delete
 *
 */
router.delete(
  "/delete-collection/:collectionId",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { collectionId } = req.params;
      const userId = req.userId;

      const collection = await Collection.findById(collectionId);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found",
        });
      }

      // Check if user owns the collection
      if (collection.authorId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this collection",
        });
      }

      await Collection.findByIdAndDelete(collectionId);

      res.json({
        success: true,
        message: "Collection deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting collection:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete collection",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Server error",
      });
    }
  },
);

module.exports = { router };
