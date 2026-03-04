import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export const useDataService = () => {
  const { authAxios } = useAuth();

  // ─── User ──────────────────────────────────────────────────────────────────

  // Returns public profile + isFollowing boolean for the logged-in user
  const getUserProfile = async (username) => {
    try {
      const res = await authAxios.get(`/u/${username}`);
      return res.data.data; // { user, isFollowing }
    } catch (err) {
      toast.error("Error fetching user profile");
      throw err;
    }
  };

  // Batch-fetch minimal user data (used for follower/following lists)
  const getUsersByIds = async (ids = []) => {
    try {
      const res = await authAxios.get(`/u/users/byids?ids=${ids.join(",")}`);
      return res.data.data;
    } catch (err) {
      toast.error("Error fetching users");
      throw err;
    }
  };

  // Update the logged-in user's own profile
  const updateUserProfile = async (formValues) => {
    try {
      const res = await authAxios.put("/update/user", {
        fullName: formValues.fullName,
        profilePicture: formValues.profilePicture,
        designation: formValues.designation,
        aboutMe: formValues.aboutMe,
        interestedIn: formValues.interestedIn,
        contactInformation: formValues.contactInformation,
        notifications: formValues.notifications,
      });
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating profile");
      throw err;
    }
  };

  // Toggle follow/unfollow on a user by their ID
  const followUnfollowUser = async (targetUserId) => {
    try {
      const res = await authAxios.post("/follow-unfollow/user", {
        targetUserId,
      });
      return res.data; // { success, message: "Followed" | "Unfollowed" }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error following user");
      throw err;
    }
  };

  const getUserFollowers = async (userId, page = 1) => {
    const res = await authAxios.get(
      `/u/${userId}/followers?page=${page}&limit=10`,
    );
    return res.data; // { data, total }
  };
  const getUserFollowing = async (userId, page = 1) => {
    const res = await authAxios.get(
      `/u/${userId}/following?page=${page}&limit=10`,
    );
    return res.data; // { data, total }
  };

  // ─── Feed ──────────────────────────────────────────────────────────────────

  // Paginated public articles feed
  const getArticlesFeed = async ({ page = 1, limit = 10 } = {}) => {
    try {
      const res = await authAxios.get(`/articles?page=${page}&limit=${limit}`);
      return res.data; // { success, page, results, data }
    } catch (err) {
      toast.error("Error fetching feed");
      throw err;
    }
  };

  // ─── Posts ─────────────────────────────────────────────────────────────────

  // Get a public post by its full slug (e.g. "my-post-title-64abc123")
  const getPost = async (slug) => {
    try {
      const res = await authAxios.get(`/p/${slug}`);
      return res.data.data;
    } catch (err) {
      toast.error("Error fetching post");
      throw err;
    }
  };

  // Get a private post - only works if logged-in user is the author or mod
  // adding postId also for edit post
  const getPrivatePost = async (slug, postId) => {
    try {
      const res = await authAxios.get(`/private/p/${slug}?postId=${postId}`);
      return res.data.data;
    } catch (err) {
      toast.error("Error fetching post");
      throw err;
    }
  };

  // Batch-fetch post cards by IDs (used on profile page)
  const getPostsByIds = async (ids = []) => {
    try {
      const res = await authAxios.get(`/u/posts/byids?ids=${ids.join(",")}`);
      return res.data.data;
    } catch (err) {
      toast.error("Error fetching posts");
      throw err;
    }
  };

  const getMyPosts = async (page = 1) => {
    const res = await authAxios.get(`/u/posts/mine?page=${page}&limit=20`);
    return res.data; // { data, total }
  };

  const getUserPosts = async (userId, page = 1) => {
    const res = await authAxios.get(`/u/${userId}/posts?page=${page}&limit=20`);
    return res.data; // { data, total }
  };

  const getSavedPosts = async (page = 1) => {
    const res = await authAxios.get(`/saved/posts?page=${page}&limit=20`);
    return res.data; // { data, total }
  };

  const getMyPostInteractions = async (postId) => {
    const res = await authAxios.get(`/post/${postId}/my-interactions`);
    return res.data.data; // { isLiked, isDisliked, isSaved }
  };

  // Get a fresh post ID from the server before opening the editor
  const getNewPostId = async () => {
    try {
      const res = await authAxios.get("/get-new-post-id");
      return res.data.data.postId;
    } catch (err) {
      toast.error("Error getting post ID");
      throw err;
    }
  };

  // Create or update a written post (upsert - same endpoint for both)
  const saveWrittenPost = async (postData) => {
    try {
      const res = await authAxios.post("/save/post/written", postData);
      return res.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving post");
      throw err;
    }
  };

  // Like or dislike a post. vote: "like" | "dislike"
  // Sending the same vote again removes it; opposite vote switches it.
  const voteOnPost = async (postId, vote) => {
    try {
      const res = await authAxios.post("/post/like-dislike", { postId, vote });
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Error voting on post");
      throw err;
    }
  };

  // Toggle save/unsave a post
  const saveUnsavePost = async (postId) => {
    try {
      const res = await authAxios.post("/post/save-unsave", { postId });
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving post");
      throw err;
    }
  };

  // Toggle a post between public and private
  const changePostVisibility = async (postId) => {
    try {
      const res = await authAxios.put("/change-post-visibility-status", {
        postId,
      });
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Error changing post visibility",
      );
      throw err;
    }
  };

  // Toggle a post in/out of the author's featured items on their profile
  const changeFeaturedSettings = async (postId) => {
    try {
      const res = await authAxios.put("/change-post-featured-status", {
        postId,
      });
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Error changing featured status",
      );
      throw err;
    }
  };

  // Permanently delete a post
  const deletePost = async (postId) => {
    try {
      // axios.delete doesn't accept a body directly - must pass it under `data`
      const res = await authAxios.delete("/post/delete", { data: { postId } });
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting post");
      throw err;
    }
  };

  // ─── Comments ──────────────────────────────────────────────────────────────

  // Fetch paginated top-level comments for a post (replies loaded separately on demand)
  const getPostComments = async (postId, page = 1, limit = 10) => {
    try {
      const res = await authAxios.get(
        `/p/${postId}/comments?page=${page}&limit=${limit}`,
      );
      return res.data.data; // Comment[]
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching comments");
      throw err;
    }
  };

  // Fetch a single comment and all its direct replies
  const getComment = async (commentId) => {
    try {
      const res = await authAxios.get(`/p/comments/${commentId}`);
      return res.data.data; // { comment, replies }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching comment");
      throw err;
    }
  };

  // Post a new top-level comment on a post
  const addComment = async (postId, content) => {
    try {
      const res = await authAxios.post("/new-comment", { postId, content });
      return res.data.data; // the new Comment document
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding comment");
      throw err;
    }
  };

  // Reply to an existing comment
  const replyToComment = async (postId, parentId, content) => {
    try {
      const res = await authAxios.post("/reply-to-comment", {
        postId,
        parentId,
        content,
      });
      return res.data.data; // the new reply Comment document
    } catch (err) {
      toast.error(err.response?.data?.message || "Error posting reply");
      throw err;
    }
  };

  // Edit a comment's content (author only)
  const editComment = async (commentId, content) => {
    try {
      const res = await authAxios.put("/edit-comment", { commentId, content });
      return res.data.data; // the updated Comment document
    } catch (err) {
      toast.error(err.response?.data?.message || "Error editing comment");
      throw err;
    }
  };

  // Delete a comment (author or mod/admin)
  const deleteComment = async (commentId) => {
    try {
      const res = await authAxios.delete("/delete-comment", {
        data: { commentId },
      });
      return res.data; // { success, message }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting comment");
      throw err;
    }
  };

  // ─── Collections ───────────────────────────────────────────────────────────

  // Browse all public collections
  const getAllCollections = async ({
    page = 1,
    limit = 10,
    search,
    tags,
  } = {}) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append("search", search);
      if (tags) params.append("tags", tags);
      const res = await authAxios.get(`/collections?${params.toString()}`);
      return res.data; // { success, page, results, data }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching collections");
      throw err;
    }
  };

  // Get a public collection + its posts
  const getCollection = async (collectionId) => {
    try {
      const res = await authAxios.get(`/c/${collectionId}`);
      return res.data.data; // { collection, posts }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching collection");
      throw err;
    }
  };

  // Get a private collection + its posts (author/mod only)
  const getPrivateCollection = async (collectionId) => {
    try {
      const res = await authAxios.get(`/c/private/${collectionId}`);
      return res.data.data; // { collection, posts }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching collection");
      throw err;
    }
  };

  // Get all collections belonging to a user (metadata only, no posts inside)
  const getUserCollections = async (userId) => {
    try {
      const res = await authAxios.get(`/u/${userId}/collections`);
      return res.data.data;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Error fetching user collections",
      );
      throw err;
    }
  };

  // Create a new collection
  const createCollection = async (collectionData) => {
    try {
      const res = await authAxios.post("/create/collection", collectionData);
      return res.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating collection");
      throw err;
    }
  };

  // Update collection metadata (author only)
  const updateCollection = async (collectionId, collectionData) => {
    try {
      const res = await authAxios.put(
        `/update-collection/${collectionId}`,
        collectionData,
      );
      return res.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating collection");
      throw err;
    }
  };

  // Toggle a post into/out of a collection (single endpoint handles both add and remove)
  const togglePostInCollection = async (postId, collectionId) => {
    try {
      const res = await authAxios.put(
        `/add-remove-post/${postId}/collection/${collectionId}`,
      );
      return res.data; // { success, message: "Post added..." | "Post removed..." }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating collection");
      throw err;
    }
  };

  // Like or dislike a collection. vote: "like" | "dislike"
  const voteOnCollection = async (collectionId, vote) => {
    try {
      const res = await authAxios.post(`/collection/${collectionId}/vote`, {
        vote,
      });
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Error voting on collection");
      throw err;
    }
  };

  // Delete a collection (author or mod/admin)
  const deleteCollection = async (collectionId) => {
    try {
      const res = await authAxios.delete(`/delete-collection/${collectionId}`);
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting collection");
      throw err;
    }
  };

  return {
    // User
    getUserProfile,
    getUsersByIds,
    updateUserProfile,
    followUnfollowUser,
    getUserFollowers,
    getUserFollowing,

    // Feed
    getArticlesFeed,

    // Posts
    getPost,
    getPrivatePost,
    getPostsByIds,
    getMyPosts,
    getUserPosts,
    getSavedPosts,
    getMyPostInteractions,
    getNewPostId,
    saveWrittenPost,
    voteOnPost,
    saveUnsavePost,
    changePostVisibility,
    changeFeaturedSettings,
    deletePost,

    // Comments
    getPostComments,
    getComment,
    addComment,
    replyToComment,
    editComment,
    deleteComment,

    // Collections
    getAllCollections,
    getCollection,
    getPrivateCollection,
    getUserCollections,
    createCollection,
    updateCollection,
    togglePostInCollection,
    voteOnCollection,
    deleteCollection,
  };
};
