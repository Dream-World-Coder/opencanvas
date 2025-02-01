import { useEffect } from "react";
import {
    ArrowLeft,
    Save,
    Share2,
    Image,
    Bold,
    Code,
    Italic,
    AlignLeft,
    AlignCenter,
    Quote,
    Sun,
    Moon,
    Undo,
    Redo,
    MoreHorizontal,
    AlertTriangle,
    Wifi,
    WifiOff,
    Eye,
    Edit,
    X,
} from "lucide-react";
import PropTypes from "prop-types";

// components
import { Alert, AlertDescription } from "@/components/ui/alert";
import MarkdownPreview from "./WritingComponents";

// hooks
import {
    title,
    setTitle,
    content,
    setContent,
    wordCount,
    setWordCount,
    isDark,
    setIsDark,
    isSaved,
    setIsSaved,
    isPreview,
    setIsPreview,
    isFullscreen,
    setIsFullscreen,
    selectedText,
    setSelectedText,
    showUnsavedAlert,
    setShowUnsavedAlert,
    textAlignment,
    setTextAlignment,
    undoStack,
    setUndoStack,
    redoStack,
    setRedoStack,
    syncStatus,
    setSyncStatus,
    lastSynced,
    setLastSynced,

    // functions
    handleFormat,
    addToUndoStack,
    handleContentChange,
    handleUndo,
    handleRedo,
    handleShare,
    saveDraftLocally,
    syncWithBackend,
    syncPendingChanges,
    handleSave,
} from "./writingHooks";

//** data.txt:
// ADD TEXT SIZE CHANGE AND FONT STYLES IN THE 3 DOTS
const WritingPad = ({ artType = "story", postId = null }) => {
    // Autosave functionality
    useEffect(() => {
        const autosaveInterval = setInterval(() => {
            if (!isSaved) {
                handleSave();
            }
        }, 30000);

        return () => clearInterval(autosaveInterval);
    }, [isSaved, content, title]);

    // Load saved content
    useEffect(() => {
        const savedPost = localStorage.getItem("blogPost");
        if (savedPost) {
            const { title: savedTitle, content: savedContent } =
                JSON.parse(savedPost);
            setTitle(savedTitle);
            setContent(savedContent);
            setWordCount(
                savedContent.trim().split(/\s+/).filter(Boolean).length,
            );
        }
    }, []);

    // Warn before leaving with unsaved changes
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

    // Network status monitoring
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

    // Load existing post or draft
    useEffect(() => {
        const loadPost = async () => {
            if (postId) {
                try {
                    // Try loading from backend first
                    const response = await fetch(`/api/posts/${postId}`);
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

    // Autosave functionality
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

    return (
        <div
            className={`min-h-screen bg-white transition-all duration-300 ${isDark ? "invert" : ""}`}
        >
            {/* Add sync status indicator */}
            <div className="fixed top-10 right-10 flex items-center space-x-2 text-sm size-auto z-50">
                {syncStatus === "offline" ? (
                    <>
                        <WifiOff className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-500">Offline</span>
                    </>
                ) : syncStatus === "saving" ? (
                    <>
                        <Wifi className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-500">Saving...</span>
                    </>
                ) : (
                    <>
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">
                            Synced{" "}
                            {lastSynced
                                ? `at ${lastSynced.toLocaleTimeString()}`
                                : ""}
                        </span>
                    </>
                )}
            </div>

            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => {
                                if (!isSaved) {
                                    setShowUnsavedAlert(true);
                                    return;
                                }
                                window.history.back();
                            }}
                            className="hover:opacity-70 transition-opacity"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-2">
                            <button className="px-3 py-1 rounded-full text-sm bg-black text-white hover:text-green-300">
                                {artType}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-400">
                            {wordCount} words
                        </span>
                        <button
                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                                isSaved
                                    ? "text-gray-400"
                                    : "bg-black text-white"
                            }`}
                            onClick={handleSave}
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSaved ? "Saved" : "Save"}</span>
                        </button>
                        <button
                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm border border-gray-300 ${
                                isPreview
                                    ? "text-gray-700 bg-gray-300"
                                    : "text-gray-700"
                            }`}
                            onClick={() => {
                                setIsPreview(!isPreview);
                            }}
                        >
                            {/* <Edit className="w-4 h-4" /> */}
                            <span>{isPreview ? "Preview" : "Editing"}</span>
                        </button>
                        <button
                            onClick={handleShare}
                            className="hover:opacity-70 transition-opacity"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => {
                                setIsDark(!isDark);
                            }}
                            className="hover:opacity-70 transition-opacity"
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>
                        <button className="hover:opacity-70 transition-opacity">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* preview div */}
                <div
                    className={`w-2/3 h-2/3 mx-auto prose
                        rounded text-lg transition-all
                        origin-top duration-400 ${isPreview ? "scaleXX-y-[100%]" : "scaleXX-y-0 hidden"}`}
                >
                    <MarkdownPreview
                        title={title}
                        content={content}
                        isVisible={isPreview}
                    />
                </div>
            </div>

            {/* Custom Unsaved Changes Alert */}
            {showUnsavedAlert && (
                <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-20">
                    <Alert className="w-96 relative">
                        <button
                            onClick={() => setShowUnsavedAlert(false)}
                            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                            <div>
                                <h3 className="font-medium">Unsaved Changes</h3>
                                <AlertDescription>
                                    You have unsaved changes. Would you like to
                                    save them first?
                                </AlertDescription>
                                <div className="mt-4 flex space-x-2">
                                    <button
                                        onClick={handleSave}
                                        className="px-3 py-1.5 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() =>
                                            setShowUnsavedAlert(false)
                                        }
                                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Alert>
                </div>
            )}

            {/* Writing Area */}
            <div className={`pt-20 pb-24 ${isFullscreen ? "px-0" : "px-6"}`}>
                <div
                    className={`${isFullscreen ? "max-w-7xl p-6" : "max-w-4xl"} mx-auto`}
                >
                    {/* Formatting Tools */}
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => handleFormat("bold")}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Bold className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleFormat("italic")}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Italic className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setTextAlignment("left")}
                                className={`p-2 hover:bg-gray-50 rounded-lg transition-colors ${
                                    textAlignment === "left"
                                        ? "bg-gray-100"
                                        : ""
                                }`}
                            >
                                <AlignLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setTextAlignment("center")}
                                className={`p-2 hover:bg-gray-50 rounded-lg transition-colors ${
                                    textAlignment === "center"
                                        ? "bg-gray-100"
                                        : ""
                                }`}
                            >
                                <AlignCenter className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleFormat("quote")}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Quote className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleFormat("quote")}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Code className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Image className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleUndo}
                                disabled={undoStack.length === 0}
                                className={`p-2 rounded-lg transition-colors ${
                                    undoStack.length === 0
                                        ? "opacity-50"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                <Undo className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleRedo}
                                disabled={redoStack.length === 0}
                                className={`p-2 rounded-lg transition-colors ${
                                    redoStack.length === 0
                                        ? "opacity-50"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                <Redo className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Title Input */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setIsSaved(false);
                        }}
                        placeholder="Title"
                        className="w-full text-4xl font-bold mb-8 focus:outline-none"
                    />

                    {/* Content Textarea */}
                    <textarea
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Fill your canvas..."
                        className={`w-full min-h-[60vh] resize-none focus:outline-none text-lg
                            ${
                                textAlignment === "center"
                                    ? "text-center"
                                    : "text-left"
                            }`}
                    />
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                        Last edited {new Date().toLocaleTimeString()}
                    </div>
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                        {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WritingPad;
