import { useState, useEffect } from "react";
import { toast } from "sonner";
import ObjectId from "bson-objectid";

export function useWritingPad({ postId, frontendOnly }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [twoColumn, setTwoColumn] = useState(false);
    const [isSaved, setIsSaved] = useState(true);
    const [lastSynced, setLastSynced] = useState(null);
    const [syncStatus, setSyncStatus] = useState("synced"); // 'synced', 'saving', 'offline'
    const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
    const [tags, setTags] = useState(["general"]);
    // const [isPublic, setIsPublic] = useState(true);
    const [media, setMedia] = useState([]);

    const id = ObjectId().toString();
    if (!postId) postId = id;
    const saveDraftLocally = () => {
        const draft = {
            id: postId,
            title,
            content,
            lastSaved: new Date().toISOString(),
            syncedWithServer: false,
        };
        localStorage.setItem(`blogPost`, JSON.stringify(draft));

        if (frontendOnly) {
            setIsSaved(true); // st saved only when saved in db
        }
    };

    const syncWithBackend = async () => {
        if (frontendOnly) return;

        // device online check
        if (!navigator.onLine) {
            setSyncStatus("offline");
            return;
        }

        setSyncStatus("saving");

        try {
            // title must not be empty
            if (!title || title.trim() === "") {
                setSyncStatus("offline");
                toast("Title is required");
                return;
            }

            // Prepare post data
            const postData = {
                id: postId,
                title,
                content,
                tags,
                media,
            };

            // Get auth token - assuming you store it in localStorage or similar
            const token = localStorage.getItem("authToken");

            // Make API call to backend
            const response = await fetch(
                "http://127.0.0.1:3000/savepost/written",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(postData),
                },
            );

            const data = await response.json();

            if (data.success) {
                setIsSaved(true);
                setSyncStatus("synced");
                setLastSynced(new Date());
                toast.success("Post saved successfully", {
                    style: {
                        backgroundColor: "#f5f5f5",
                    },
                });
            } else {
                setSyncStatus("offline");
                toast.error(data.message || "Failed to save post in server");
            }
        } catch (error) {
            console.error("Error saving post:", error);
            setSyncStatus("offline");
            toast.error("Failed to connect to server", {
                style: {
                    backgroundColor: "red",
                    color: "white",
                },
            });
        }
    };

    /**
     * Sync pending changes when coming back online
     */
    const syncPendingChanges = async () => {
        if (frontendOnly) return;

        // tmp api handling for backend
        setTimeout(() => {
            setSyncStatus("synced");
            setLastSynced(new Date());
            return;
        }, 200);

        /*
        const draftKeys = Object.keys(localStorage).filter((key) =>
            key.startsWith("draft-"),
        );

        for (const key of draftKeys) {
            const draft = JSON.parse(localStorage.getItem(key));
            if (!draft.syncedWithServer) {
                try {
                    const response = await fetch(`/api/posts/${draft.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(draft),
                    });

                    if (response.ok) {
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    console.error("Error syncing draft:", error);
                }
            }
        }
        */
    };

    const handleSave = async () => {
        saveDraftLocally();

        if (navigator.onLine && !frontendOnly) {
            await syncWithBackend();
        }
        setShowUnsavedAlert(false);
    };

    /**
     * Load existing post or draft : simple version is fine
     */
    /*
    useEffect(() => {
        const loadPost = async () => {
            if (postId) {
                try {
                    // Try loading from backend first
                    const response = await fetch(
                        `localhost:5050/posts/${postId}`,
                    );
                    if (response.ok) {
                        const post = await response.json();
                        setTitle(post.title);
                        setContent(post.content);
                        setLastSynced(new Date());
                    }
                } catch (error) {
                    // If backend fails, try loading from local draft
                    const localDraft = localStorage.getItem(`draft-${postId}`);
                    if (localDraft) {
                        const { title, content, lastSaved } =
                            JSON.parse(localDraft);
                        setTitle(title);
                        setContent(content);
                        setSyncStatus("offline");
                    }
                }
            }
        };
        loadPost();
    }, [postId]);
    */
    // not needed now, backend not ready, so:
    // loadPost();
    // instead there is a simple version:
    useEffect(() => {
        const loadSaved = async () => {
            try {
                const savedPost = localStorage.getItem("blogPost");
                if (savedPost) {
                    const { title: savedTitle, content: savedContent } =
                        JSON.parse(savedPost);
                    setTitle(savedTitle);
                    setContent(savedContent);
                }

                // Wait for React state updates to complete
                await new Promise((resolve) => setTimeout(resolve, 300));

                // Get textarea value
                const txtArea = document.getElementById("txtArea");
                if (!txtArea) return;

                let v1 = txtArea.value;

                // Modify textarea value asynchronously
                await new Promise((resolve) => setTimeout(resolve, 200)); // Ensures line-by-line execution
                txtArea.value = v1;
                txtArea.style.height = "auto";
                txtArea.style.height = txtArea.scrollHeight + "px"; // it was not working if i didn't use async
            } catch (error) {
                console.error("Error loading saved blog post:", error);
                toast.error("Error loading saved blog post:", error);
            }
        };

        loadSaved();
    }, []);

    /**
     * Network status monitoring
     */
    useEffect(() => {
        const handleOnline = () => {
            setSyncStatus("synced");
            syncPendingChanges();
        };

        const handleOffline = () => {
            setSyncStatus("offline");
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    /**
     * Warn before leaving with unsaved changes
     */
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!isSaved) {
                e.preventDefault();
                e.returnValue = "";
                return "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isSaved]);

    /**
     * Autosave
     */
    useEffect(() => {
        let autosaveInterval;

        const performAutosave = async () => {
            if (!isSaved) {
                await handleSave();
            }
        };

        // Local autosave every 5 seconds
        const localAutosaveInterval = setInterval(() => {
            if (!isSaved) {
                saveDraftLocally();
            }
        }, 5000);

        // Backend sync every 5 mins if online && not frontendOnly
        if (navigator.onLine && !frontendOnly) {
            autosaveInterval = setInterval(performAutosave, 300000);
        }

        return () => {
            clearInterval(localAutosaveInterval);
            if (autosaveInterval) {
                clearInterval(autosaveInterval);
            }
        };
    }, [isSaved, content, title, frontendOnly]);

    return {
        title,
        setTitle,
        content,
        setContent,
        isSaved,
        setIsSaved,
        syncStatus,
        lastSynced,
        showUnsavedAlert,
        setShowUnsavedAlert,
        handleSave,
        saveDraftLocally,
        syncWithBackend,
        twoColumn,
        setTwoColumn,
    };
}
