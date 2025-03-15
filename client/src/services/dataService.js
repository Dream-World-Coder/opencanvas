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

    const updateUserProfile = async (formValues) => {
        try {
            const response = await authAxios.put(`/auth/update-user`, {
                username: formValues.username,
                fullName: formValues.fullName,
                role: formValues.role,
                aboutMe: formValues.aboutMe,
                notifications: formValues.notifications,
                contactInformation: formValues.contactInformation,
            });
            return response.data;
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    };

    // Post related functions
    // -------------------------------------------------------------------------------------------
    const getNewPostId = async () => {
        try {
            const response = await authAxios.post("/newpost/written/getId");
            return response.data.newPostId;
        } catch (error) {
            console.error("Error creating post:", error);
            toast("Error getting post id");
            throw error;
        }
    };

    // handle errors if post not found
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

    // would have been betten if could do these in bulk
    const deletePost = async (postId) => {
        try {
            const response = await authAxios.delete(
                `/delete-post?postId=${postId}`,
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting post:", error);
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
            throw error;
        }
    };

    const likePost = async (postId) => {
        try {
            const response = await authAxios.put(`/like-post?postId=${postId}`);
            return response.data;
        } catch (error) {
            console.error("Error liking post:", error);
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
        updateUserProfile,

        // Posts
        getNewPostId,
        getPostById,
        deletePost,
        likePost,
        savePost,
        changePostVisibility,

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
