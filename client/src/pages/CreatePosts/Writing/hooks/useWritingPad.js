import { useState, useEffect } from "react";

export function useWritingPad({ postId = null }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    // const [content, setContent] = useState(rawText);
    // const [wordCount, setWordCount] = useState(0);

    const [isSaved, setIsSaved] = useState(true);
    const [lastSynced, setLastSynced] = useState(null);
    const [syncStatus, setSyncStatus] = useState("synced"); // 'synced', 'saving', 'offline'
    const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);

    const saveDraftLocally = () => {
        const draft = {
            id: postId || crypto.randomUUID(),
            title,
            content,
            lastSaved: new Date().toISOString(),
            syncedWithServer: false,
        };
        // localStorage.setItem(`draft-${draft.id}`, JSON.stringify(draft));
        localStorage.setItem(`blogPost`, JSON.stringify(draft));
        setIsSaved(true);
    };

    const syncWithBackend = async () => {
        if (!navigator.onLine) {
            setSyncStatus("offline");
            return; // +++
        }

        setSyncStatus("saving");

        // tmp api handling
        setTimeout(() => {
            setSyncStatus("synced");
            setLastSynced(new Date());
            return;
        }, 200);

        /*
        try {
            const response = await fetch(`/api/posts/${postId || ""}`, {
                method: postId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    content,
                    type: artType,
                }),
            });

            if (response.ok) {
                const savedPost = await response.json();
                if (!postId) {
                    // If this was a new post, update URL with new post ID
                    window.history.replaceState(
                        {},
                        "",
                        `/edit/${savedPost.id}`,
                    );
                }
                setSyncStatus("synced");
                setLastSynced(new Date());
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error saving to backend:", error);
            setSyncStatus("offline");
            return false;
        }
        */
    };

    /**
     * Sync pending changes when coming back online
     */
    const syncPendingChanges = async () => {
        // tmp api handling
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
        if (navigator.onLine) {
            await syncWithBackend();
        }
        setShowUnsavedAlert(false);
    };

    /**
     * Load existing post or draft
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
                    // setWordCount(
                    //     savedContent.trim().split(/\s+/).filter(Boolean).length,
                    // );
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

        // Backend sync every 30 seconds if online
        if (navigator.onLine) {
            autosaveInterval = setInterval(performAutosave, 30000);
        }

        return () => {
            clearInterval(localAutosaveInterval);
            if (autosaveInterval) {
                clearInterval(autosaveInterval);
            }
        };
    }, [isSaved, content, title]);

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
    };
}
