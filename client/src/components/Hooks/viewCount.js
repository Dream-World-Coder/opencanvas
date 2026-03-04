import { useEffect, useState } from "react";
import axios from "axios";

// Waits 10 seconds after mount, then sends a PATCH to increment the post's view count.
// Returns true once the view has been counted so the caller can update local state.
export const useViewTracker = (slug) => {
  const [viewCounted, setViewCounted] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let timeoutId;
    let mounted = true;

    // Delay the request so drive-by visits don't count
    timeoutId = setTimeout(async () => {
      if (!mounted) return;
      try {
        await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/update-post-views/${slug}`,
        );
        setViewCounted(true);
      } catch (err) {
        console.error("Failed to track view:", err);
      }
    }, 10000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [slug]);

  return viewCounted;
};
