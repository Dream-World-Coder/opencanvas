// client/src/pages/Create/Editor/hooks/useWritingPad

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDataService } from "@/services/dataService";

export function useWritingPad({ postId, frontendOnly, artType, editing }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [twoColumn, setTwoColumn] = useState(true);
  const [postLoading, setPostLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  const [tags, setTags] = useState(["regular"]);
  const [isPublic, setIsPublic] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [media, setMedia] = useState([]);

  const { saveWrittenPost, getPrivatePost } = useDataService();
  const navigate = useNavigate();

  // Warn if a backend-connected editor is mounted without a post ID
  useEffect(() => {
    if (!frontendOnly && !postId) {
      console.error("postId not found");
      toast.error("Post ID not found — cannot save to server");
    }
  }, [postId, frontendOnly]);

  // ::::: Local draft :::::

  const saveDraftLocally = () => {
    const draft = {
      id: postId,
      title,
      content,
      media,
      lastSaved: new Date().toISOString(),
      syncedWithServer: false,
    };
    localStorage.setItem("blogPost", JSON.stringify(draft));

    // In frontend-only mode, local save is the only save
    if (frontendOnly) setIsSaved(true);
  };

  // ::::: Backend sync :::::

  const syncWithBackend = async () => {
    if (frontendOnly) return;
    if (!navigator.onLine) return;

    if (!title || title.trim() === "") {
      toast("Title is required before saving");
      return;
    }

    const postData = {
      postId, // server expects "postId", not "id"
      title,
      content,
      tags,
      isPublic,
      type: artType, // server expects "type", not "artType"
      thumbnailUrl,
      readTime: `${Math.ceil((content.split(" ").length * 0.8) / 225)} min read`,
      media,
    };

    try {
      // Use dataService — correct endpoint, auth headers handled centrally
      const data = await saveWrittenPost(postData);
      if (data) {
        setIsSaved(true);
        toast.success("Post saved successfully");
        // Build the canonical slug: {title-slugified}-{id}
        const slug = `${slugify(title)}-${postId}`;
        navigate(isPublic ? `/p/${slug}` : `/private/p/${slug}`);
      }
    } catch (error) {
      // saveWrittenPost already shows a toast; log for debugging
      console.error("Error saving post:", error);
      
      // Handle session expiration - save draft locally before redirect
      if (error.response?.status === 401) {
        saveDraftLocally();
        toast.error("Session expired - draft saved locally. Please login to continue.");
      }
    }
  };

  // ::::: Save handler :::::

  const handleSave = async () => {
    saveDraftLocally();

    if (!frontendOnly) {
      if (navigator.onLine) {
        await syncWithBackend();
      } else {
        toast.error("No connection — draft saved locally");
      }
    }

    setShowUnsavedAlert(false);
  };

  // ::::: Load existing post or local draft on mount :::::

  useEffect(() => {
    if (editing === true) {
      // Editing an existing post — fetch it from the server
      async function fetchPost() {
        setPostLoading(true);
        try {
          const postData = await getPrivatePost("slug", postId);
          setTitle(postData.title);
          setContent(postData.content);
          setTags(postData.tags);
          setIsPublic(postData.isPublic);
          setThumbnailUrl(postData.thumbnailUrl);
          setMedia(postData.media ?? []);

          // Let React flush the state update before adjusting textarea height
          await new Promise((r) => setTimeout(r, 300));
          resizeTextarea();
        } catch (err) {
          console.error("Failed to load post", err);
          toast.error("Failed to load post");
        } finally {
          setPostLoading(false);
        }
      }
      fetchPost();
    } else {
      // New post — restore any local draft
      async function loadLocalDraft() {
        try {
          const saved = localStorage.getItem("blogPost");
          if (saved) {
            const {
              title: t,
              content: c,
              media: m,
              thumbnailUrl: tu,
            } = JSON.parse(saved);
            setTitle(t);
            setContent(c);
            setMedia(m ?? []);
            setThumbnailUrl(tu);
          }

          await new Promise((r) => setTimeout(r, 300));
          resizeTextarea();
        } catch (error) {
          console.error("Error loading local draft:", error);
        }
      }
      loadLocalDraft();
    }
  }, [artType, postId]);

  // ::::: Autosave :::::

  useEffect(() => {
    // Save to localStorage every 5 seconds if there are unsaved changes
    const localInterval = setInterval(() => {
      if (!isSaved) saveDraftLocally();
    }, 5000);

    // Sync to server every 30 minutes if online and not frontend-only
    let serverInterval;
    if (navigator.onLine && !frontendOnly) {
      serverInterval = setInterval(async () => {
        if (!isSaved) await syncWithBackend();
      }, 1_800_000);
    }

    return () => {
      clearInterval(localInterval);
      if (serverInterval) clearInterval(serverInterval);
    };
  }, [isSaved, content, title, frontendOnly]);

  // ::::: Network status :::::

  useEffect(() => {
    // No-op handler kept in case we want to show UI feedback on reconnect
    const handleOnline = () => {};
    const handleOffline = () => {};

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ::::: Warn before leaving with unsaved changes :::::

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSaved]);

  return {
    title,
    setTitle,
    content,
    setContent,
    isSaved,
    setIsSaved,
    showUnsavedAlert,
    setShowUnsavedAlert,
    handleSave,
    saveDraftLocally,
    syncWithBackend,
    twoColumn,
    setTwoColumn,
    tags,
    setTags,
    isPublic,
    setIsPublic,
    setMedia,
    setThumbnailUrl,
    postLoading,
  };
}

// ::::: Helpers :::::

// Auto-resize the markdown textarea to fit its content after a state update
function resizeTextarea() {
  const txtArea = document.getElementById("txtArea");
  if (!txtArea) return;
  txtArea.style.height = "auto";
  txtArea.style.height = txtArea.scrollHeight + "px";
}

// Build the canonical post URL slug: "{title-slugified}-{id}"
// Matches the server's extractPostId which reads the last dash-separated segment.
export function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // strip non-alphanumeric
    .replace(/\s+/g, "-") // spaces to dashes
    .replace(/-+/g, "-"); // collapse multiple dashes
}
