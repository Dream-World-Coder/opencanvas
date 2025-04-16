import { useEffect, useState } from "react";
import axios from "axios";

export const useViewTracker = (postId) => {
    const [viewCounted, setViewCounted] = useState(false);

    useEffect(() => {
        if (!postId) return;

        let timeoutId;
        let mounted = true;

        const trackView = async () => {
            try {
                // Wait for 10 seconds before counting view
                timeoutId = setTimeout(async () => {
                    if (!mounted) return;

                    const response = await axios.put(
                        `http://localhost:3000/update-post-views/${postId}`,
                    );

                    if (response.data.counted) {
                        setViewCounted(true);
                        console.log("View counted successfully");
                    } else {
                        console.log(response.data.message);
                    }
                }, 10000);
            } catch (error) {
                console.error("Failed to track view:", error);
            }
        };

        // Start tracking
        trackView();

        // Cleanup function
        return () => {
            mounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [postId]);

    return viewCounted;
};
