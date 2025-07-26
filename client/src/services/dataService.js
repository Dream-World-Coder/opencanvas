import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export const useDataService = () => {
  const { authAxios } = useAuth();

  // user related
  // ---------------------------------
  const getAuthorProfile = async (authorId) => {
    try {
      const response = await authAxios.get(`/author/${authorId}`);
      return response.data.author;
    } catch (error) {
      console.error("Error fetching author profile:", error);
      toast.error("Error fetching author profile:", error);
      throw error;
    }
  };

  const followUser = async (followId) => {
    try {
      const response = await authAxios.put(`/follow-user?followId=${followId}`);
      return response.data;
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Error following user:", error);
      throw error;
    }
  };

  const updateUserProfile = async (formValues) => {
    try {
      const response = await authAxios.put(`/update-user`, {
        username: formValues.username.toLowerCase(),
        fullName: formValues.fullName,
        role: formValues.role,
        aboutMe: formValues.aboutMe,
        notifications: formValues.notifications,
        contactInformation: formValues.contactInformation,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error("Error updating user profile:", error);
      throw error;
    }
  };

  const changeFeaturedSettings = async (itemId, itemType) => {
    try {
      const response = await authAxios.put(`/change-post-featured`, {
        itemId,
        itemType,
      });
      return response.data;
    } catch (error) {
      console.error("Error changing featured settings:", error);
      return error;
    }
  };

  // Post related
  // ---------------------------------
  const getNewPostId = async () => {
    try {
      const response = await authAxios.post("/get-new-postId");
      return response.data.newPostId;
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Error getting post id");
      throw error;
    }
  };

  const getPostById = async (postId) => {
    try {
      const response = await authAxios.get(`/p/${postId}`);
      return response.data.post;
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Error getting post");
      throw error;
    }
  };
  // here post media also has to be reveled,
  // so auth needed, else anyone can delete the
  // images inside the post using imgur api
  const getPostByIdSecured = async (postId) => {
    try {
      const response = await authAxios.get(`/secure/p/${postId}`);
      return response.data.post;
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Error getting post");
      throw error;
    }
  };

  // would have been betten if could do these in bulk
  const deletePost = async (postId) => {
    try {
      const response = await authAxios.delete(`/delete-post?postId=${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Error deleting post:", error);
      throw error;
    }
  };

  const changePostVisibility = async (postId, isPublic) => {
    try {
      const response = await authAxios.put(
        `/post-visibility-change?postId=${postId}`,
        { isPublic },
      );
      return response.data;
    } catch (error) {
      console.error("Error changing visibility of the post:", error);
      toast.error("Error changing visibility of the post:", error);
      throw error;
    }
  };

  const likePost = async (postId) => {
    try {
      const response = await authAxios.put(`/like-post?postId=${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Error liking post:", error);
      throw error;
    }
  };

  const dislikePost = async (postId) => {
    try {
      const response = await authAxios.put(`/dislike-post?postId=${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error disliking post:", error);
      toast.error("Error disliking post:", error);
      throw error;
    }
  };

  const savePost = async (postId) => {
    try {
      const response = await authAxios.put(
        `/save-post-for-user?postId=${postId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Error saving post:", error);
      throw error;
    }
  };

  // Comments related
  // ---------------------------------
  const addNewComment = async (content, postId) => {
    try {
      const data = { content, postId };
      const response = await authAxios.post(`/new-comment`, data);
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  const editComment = async (content, commentId) => {
    try {
      const data = { content, commentId };
      const response = await authAxios.put(`/edit-comment`, data);
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error editing comment:", error);
      throw error;
    }
  };

  const deleteComment = async (commentId) => {
    try {
      // for axios.delete has to be get, cuz it does not send any data
      const response = await authAxios.delete(
        `/delete-comment?commentId=${commentId}`,
      );
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error deleting comment:", error);
      throw error;
    }
  };

  const newReply = async (content, postId, parentId) => {
    try {
      const data = { content, postId, parentId };
      const response = await authAxios.post(`/reply-to-a-comment`, data);
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  const getComment = async (commentId) => {
    // loads a comment family
    try {
      const response = await authAxios.get(`/p/comments/${commentId}`);
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error fetching comment:", error);
      throw error;
    }
  };

  const getCommentsByIds = async (post, currentIndex) => {
    if (post.comments.length === 0) return [];
    const commentIds = post.comments
      // .slice(currentIndex + 0, currentIndex + 10)
      .join(",");
    const data = { commentIds };
    try {
      const response = await authAxios.post(`/get-comments-byids`, data);
      return response.data.comments;
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error fetching comments:", error);
      throw error;
    }
  };

  // Collection related
  // ---------------------------------
  const createCollection = async (collectionData) => {
    try {
      const response = await authAxios.post("/collections", collectionData);
      return response.data;
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Error creating collection:", error);
      throw error;
    }
  };

  const getUserCollections = async (userId) => {
    try {
      const response = await authAxios.get(`/collections/user/${userId}`);
      return response.data.collections;
    } catch (error) {
      console.error("Error fetching user collections:", error);
      toast.error("Error fetching user collections:", error);
      throw error;
    }
  };

  const getCollectionById = async (collectionId) => {
    try {
      const response = await authAxios.get(`/collections/${collectionId}`);
      return response.data.collection;
    } catch (error) {
      console.error("Error fetching collection:", error);
      toast.error("Error fetching collection:", error);
      throw error;
    }
  };

  const updateCollection = async (collectionId, collectionData) => {
    try {
      const response = await authAxios.put(
        `/collections/${collectionId}`,
        collectionData,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating collection:", error);
      toast.error("Error updating collection:", error);
      throw error;
    }
  };

  const deleteCollection = async (collectionId) => {
    try {
      const response = await authAxios.delete(`/collections/${collectionId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Error deleting collection:", error);
      throw error;
    }
  };

  const addPostToCollection = async (collectionId, postId) => {
    try {
      const response = await authAxios.post(
        `/collections/${collectionId}/posts/${postId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error adding post to collection:", error);
      toast.error("Error adding post to collection:", error);
      throw error;
    }
  };

  const removePostFromCollection = async (collectionId, postId) => {
    try {
      const response = await authAxios.delete(
        `/collections/${collectionId}/posts/${postId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error removing post from collection:", error);
      toast.error("Error removing post from collection:", error);
      throw error;
    }
  };

  return {
    // User
    getAuthorProfile,
    updateUserProfile,
    followUser,
    changeFeaturedSettings,

    // Posts
    getNewPostId,
    getPostById,
    getPostByIdSecured,
    deletePost,
    likePost,
    dislikePost,
    savePost,
    changePostVisibility,

    // Comments
    addNewComment,
    editComment,
    deleteComment,
    newReply,
    getComment,
    getCommentsByIds,

    // Collections
    createCollection,
    getUserCollections,
    getCollectionById,
    updateCollection,
    deleteCollection,
    addPostToCollection,
    removePostFromCollection,
  };
};
