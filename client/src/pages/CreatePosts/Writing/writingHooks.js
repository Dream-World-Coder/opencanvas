import { useState, useCallback } from "react";

export const [title, setTitle] = useState("");
export const [content, setContent] = useState("");
export const [wordCount, setWordCount] = useState(0);
export const [isDark, setIsDark] = useState(false);
export const [isSaved, setIsSaved] = useState(true);
export const [isPreview, setIsPreview] = useState(false);
export const [isFullscreen, setIsFullscreen] = useState(false);
export const [selectedText, setSelectedText] = useState("");
export const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
export const [textAlignment, setTextAlignment] = useState("left");
export const [undoStack, setUndoStack] = useState([]);
export const [redoStack, setRedoStack] = useState([]);
export const [syncStatus, setSyncStatus] = useState("synced"); // 'synced', 'saving', 'offline'
export const [lastSynced, setLastSynced] = useState(null);

// Handle text formatting
export const handleFormat = (format) => {
    const textarea = document.querySelector("textarea");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newText = content;
    switch (format) {
        case "bold":
            newText =
                content.substring(0, start) +
                `**${selectedText}**` +
                content.substring(end);
            break;
        case "italic":
            newText =
                content.substring(0, start) +
                `*${selectedText}*` +
                content.substring(end);
            break;
        case "quote":
            newText =
                content.substring(0, start) +
                `> ${selectedText}` +
                content.substring(end);
            break;
    }

    addToUndoStack(content);
    setContent(newText);
};

// Handle content changes with undo/redo functionality
export const addToUndoStack = (previousContent) => {
    setUndoStack([...undoStack, previousContent]);
    setRedoStack([]);
};

export const handleContentChange = (e) => {
    const newContent = e.target.value;
    addToUndoStack(content);
    setContent(newContent);
    setWordCount(newContent.trim().split(/\s+/).filter(Boolean).length);
    setIsSaved(false);
};

// Undo/Redo functions
export const handleUndo = () => {
    if (undoStack.length > 0) {
        const previousContent = undoStack[undoStack.length - 1];
        setRedoStack([...redoStack, content]);
        setContent(previousContent);
        setUndoStack(undoStack.slice(0, -1));
    }
};

export const handleRedo = () => {
    if (redoStack.length > 0) {
        const nextContent = redoStack[redoStack.length - 1];
        setUndoStack([...undoStack, content]);
        setContent(nextContent);
        setRedoStack(redoStack.slice(0, -1));
    }
};

// Share functionality
export const handleShare = async () => {
    if (!isSaved) {
        setShowUnsavedAlert(true);
        return;
    }

    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
                text: content,
            });
        } catch (error) {
            console.log("Error sharing:", error);
        }
    }
};

// Save draft locally
export const saveDraftLocally = () => {
    const draft = {
        id: postId || crypto.randomUUID(),
        title,
        content,
        lastSaved: new Date().toISOString(),
        syncedWithServer: false,
    };

    localStorage.setItem(`draft-${draft.id}`, JSON.stringify(draft));
    setIsSaved(true);
};

// Sync with backend
export const syncWithBackend = async () => {
    if (!navigator.onLine) {
        setSyncStatus("offline");
        return;
    }

    setSyncStatus("saving");

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
                window.history.replaceState({}, "", `/edit/${savedPost.id}`);
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
};

// Sync pending changes when coming back online
export const syncPendingChanges = async () => {
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
};

// Save functionality
export const handleSave = async () => {
    saveDraftLocally();
    if (navigator.onLine) {
        await syncWithBackend();
    }
    setShowUnsavedAlert(false);
};
