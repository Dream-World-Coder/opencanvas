import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const usePublicationService = () => {
    const { authAxios } = useAuth();

    const getFeed = async ({ cursor, limit = 20, inst }) => {
        try {
            const params = { cursor, limit };
            if (inst) params.inst = inst; // Append filter if it exists

            const res = await authAxios.get("/publications", { params });
            return res.data.data;
        } catch (err) {
            toast.error("Failed to load publications feed");
            throw err;
        }
    };
    const getInstitutions = async () => {
        try {
            const res = await authAxios.get("/publications/institutions");
            return res.data.data;
        } catch (err) {
            toast.error("Failed to load institutions");
            throw err;
        }
    };

    const getInstitutionFeed = async (uniSlug, { cursor, limit = 20 }) => {
        try {
            const res = await authAxios.get(`/publications/${uniSlug}`, {
                params: { cursor, limit },
            });
            return res.data.data;
        } catch (err) {
            toast.error("Failed to load institution publications");
            throw err;
        }
    };

    const getById = async (uniSlug, id) => {
        try {
            const res = await authAxios.get(`/publications/${uniSlug}/${id}`);
            return res.data.data;
        } catch (err) {
            toast.error("Failed to load publication");
            throw err;
        }
    };

    const incrementView = async (id) => {
        try {
            const res = await authAxios.patch(`/publications/view/${id}`);
            return res.data.data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const toggleInteraction = async (targetId, action) => {
        try {
            const res = await authAxios.post("/publications/like-dislike", {
                targetId,
                action,
            });
            return res.data.data;
        } catch (err) {
            toast.error(`Failed to ${action} publication`);
            throw err;
        }
    };

    const toggleSave = async (targetId) => {
        try {
            const res = await authAxios.post("/publications/save-unsave", {
                targetId,
            });
            return res.data.data;
        } catch (err) {
            toast.error("Failed to save publication");
            throw err;
        }
    };

    const getInteractions = async (pubId) => {
        try {
            const res = await authAxios.get(
                `/publications/${pubId}/my-interactions`,
            );
            return res.data.data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return {
        getFeed,
        getInstitutions,
        getInstitutionFeed,
        getById,
        incrementView,
        toggleInteraction,
        toggleSave,
        getInteractions,
    };
};
