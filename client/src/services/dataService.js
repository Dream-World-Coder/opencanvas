import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export const useDataService = () => {
    const { authAxios } = useAuth();

    // User related functions
    const getUserProfile = async (userId) => {
        try {
            const response = await authAxios.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    };

    // Post related functions
    const getNewPostId = async () => {
        try {
            const response = await authAxios.post("/newpost/written/getId");
            console.log(response);
            console.log(response.data.newPostId);
            return response.data.newPostId;
        } catch (error) {
            console.error("Error creating post:", error);
            toast("Error getting post id");
            throw error;
        }
    };

    // createPost

    const getUserPosts = async (userId) => {
        try {
            const response = await authAxios.get(`/posts/user/${userId}`);
            return response.data.posts;
        } catch (error) {
            console.error("Error fetching user posts:", error);
            throw error;
        }
    };

    const getPostById = async (postId) => {
        try {
            const response = await authAxios.get(`/posts/${postId}`);
            return response.data.post;
        } catch (error) {
            console.error("Error fetching post:", error);
            throw error;
        }
    };

    const updatePost = async (postId, postData) => {
        try {
            const response = await authAxios.put(`/posts/${postId}`, postData);
            return response.data;
        } catch (error) {
            console.error("Error updating post:", error);
            throw error;
        }
    };

    const deletePost = async (postId) => {
        try {
            const response = await authAxios.delete(`/posts/${postId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    };

    const likePost = async (postId) => {
        try {
            const response = await authAxios.post(`/posts/${postId}/love`);
            return response.data;
        } catch (error) {
            console.error("Error loving post:", error);
            throw error;
        }
    };

    const savePost = async (postId) => {
        try {
            const response = await authAxios.post(`/posts/${postId}/save`);
            return response.data;
        } catch (error) {
            console.error("Error saving post:", error);
            throw error;
        }
    };

    // Collection related functions
    const createCollection = async (collectionData) => {
        try {
            const response = await authAxios.post(
                "/collections",
                collectionData,
            );
            return response.data;
        } catch (error) {
            console.error("Error creating collection:", error);
            throw error;
        }
    };

    const getUserCollections = async (userId) => {
        try {
            const response = await authAxios.get(`/collections/user/${userId}`);
            return response.data.collections;
        } catch (error) {
            console.error("Error fetching user collections:", error);
            throw error;
        }
    };

    const getCollectionById = async (collectionId) => {
        try {
            const response = await authAxios.get(
                `/collections/${collectionId}`,
            );
            return response.data.collection;
        } catch (error) {
            console.error("Error fetching collection:", error);
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
            throw error;
        }
    };

    const deleteCollection = async (collectionId) => {
        try {
            const response = await authAxios.delete(
                `/collections/${collectionId}`,
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting collection:", error);
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
            throw error;
        }
    };

    return {
        // User
        getUserProfile,

        // Posts
        getNewPostId,
        getUserPosts,
        getPostById,
        updatePost,
        deletePost,
        likePost,
        savePost,

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
