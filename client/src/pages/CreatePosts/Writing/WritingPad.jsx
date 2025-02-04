import { useState, useEffect } from "react";
import {
    ArrowLeft,
    Save,
    FileDown,
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
    Strikethrough,
    Underline,
    Link,
    Minus,
    Heading,
    List,
    Highlighter,
} from "lucide-react";
import PropTypes from "prop-types";
import html2pdf from "html2pdf.js";

// components
import { Alert, AlertDescription } from "@/components/ui/alert";
import MarkdownPreview from "./WritingComponents";

//** data.txt:
// Add table functionality,
// list() & heading --> dropdown needed
// add formatting effects also in the undo redo stack
// image
// map () => mappable things
// responsive
// better pdfs
// format tools position fixed
// move functions and import them to make this file small
// AT CURRENT: list, heading, line, table : markdown knowledge needed
// currently center alignment is useless,cuz both rendered same way, so removing them

const WritingPad = ({ artType = "story", postId = null }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const [isDark, setIsDark] = useState(false);
    const [isSaved, setIsSaved] = useState(true);
    const [isPreview, setIsPreview] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedText, setSelectedText] = useState("");
    const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
    const [textAlignment, setTextAlignment] = useState("left");
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [syncStatus, setSyncStatus] = useState("synced"); // 'synced', 'saving', 'offline'
    const [lastSynced, setLastSynced] = useState(null);

    // Handle text formatting
    const handleFormat = (format) => {
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
            case "highlight":
                newText =
                    content.substring(0, start) +
                    `<mark>${selectedText}</mark>` +
                    content.substring(end);
                break;
            case "list":
                newText =
                    content.substring(0, start) +
                    `- ${selectedText}` +
                    content.substring(end);
                break;
            case "heading":
                newText =
                    content.substring(0, start) +
                    `# ${selectedText}` +
                    content.substring(end);
                break;
            case "line":
                newText =
                    content.substring(0, start) +
                    `---\n${selectedText}` +
                    content.substring(end);
                break;
            case "code":
                newText =
                    content.substring(0, start) +
                    `\`\`\`c\n${selectedText}\n\`\`\`` +
                    content.substring(end);
                break;
            case "link":
                newText =
                    content.substring(0, start) +
                    `[${selectedText}](http://example.com)` +
                    content.substring(end);
                break;
            case "image":
                newText =
                    content.substring(0, start) +
                    `[${selectedText}](http://example.com)` +
                    content.substring(end);
                break;
            case "underline":
                newText =
                    content.substring(0, start) +
                    `<span style="text-decoration: underline;">${selectedText}</span>` +
                    content.substring(end);
                break;
            case "strikethrough":
                newText =
                    content.substring(0, start) +
                    `~~${selectedText}~~` +
                    content.substring(end);
                break;
            case "subscript":
                newText =
                    content.substring(0, start) +
                    `~${selectedText}~` +
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
    const addToUndoStack = (previousContent) => {
        setUndoStack([...undoStack, previousContent]);
        setRedoStack([]);
    };

    const handleContentChange = (e) => {
        const newContent = e.target.value;
        addToUndoStack(content);
        setContent(newContent);
        setWordCount(newContent.trim().split(/\s+/).filter(Boolean).length);
        setIsSaved(false);
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px"; // Set new height based on content
    };

    // Undo/Redo functions
    const handleUndo = () => {
        if (undoStack.length > 0) {
            const previousContent = undoStack[undoStack.length - 1];
            setRedoStack([...redoStack, content]);
            setContent(previousContent);
            setUndoStack(undoStack.slice(0, -1));
        }
    };

    const handleRedo = () => {
        if (redoStack.length > 0) {
            const nextContent = redoStack[redoStack.length - 1];
            setUndoStack([...undoStack, content]);
            setContent(nextContent);
            setRedoStack(redoStack.slice(0, -1));
        }
    };

    // export to pdf functionality
    // this function activates when export to pdf button is clicked
    // find the div#export
    // now copy this node, i am using tailwind css so all its styles are defined in the html itself, so get the css
    // now make the pdf from the html and download it in user's device,
    const handleExport = async () => {
        try {
            const element = document.getElementById("export");

            // Configuration options for html2pdf
            const options = {
                margin: 0.5,
                filename: "myopencanvas-document-export.pdf",
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                },
                jsPDF: {
                    unit: "in",
                    format: "letter",
                    orientation: "portrait",
                },
            };

            // Generate and download PDF
            await html2pdf().set(options).from(element).save();
        } catch (error) {
            console.error("PDF export failed:", error);
            alert("PDF export failed:", error);
            // toast.error();
        }
    };

    // Save draft locally
    const saveDraftLocally = () => {
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
    const syncWithBackend = async () => {
        if (!navigator.onLine) {
            setSyncStatus("offline");
            return;
        }

        setSyncStatus("saving");

        // tmp api handling
        setTimeout(() => {
            setSyncStatus("synced");
            setLastSynced(new Date());
            return;
        }, 500);

        // try {
        //     const response = await fetch(`/api/posts/${postId || ""}`, {
        //         method: postId ? "PUT" : "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //         },
        //         body: JSON.stringify({
        //             title,
        //             content,
        //             type: artType,
        //         }),
        //     });

        //     if (response.ok) {
        //         const savedPost = await response.json();
        //         if (!postId) {
        //             // If this was a new post, update URL with new post ID
        //             window.history.replaceState(
        //                 {},
        //                 "",
        //                 `/edit/${savedPost.id}`,
        //             );
        //         }
        //         setSyncStatus("synced");
        //         setLastSynced(new Date());
        //         return true;
        //     }
        //     return false;
        // } catch (error) {
        //     console.error("Error saving to backend:", error);
        //     setSyncStatus("offline");
        //     return false;
        // }
    };

    // Sync pending changes when coming back online
    const syncPendingChanges = async () => {
        // tmp api handling
        setTimeout(() => {
            setSyncStatus("synced");
            setLastSynced(new Date());
            return;
        }, 500);

        // const draftKeys = Object.keys(localStorage).filter((key) =>
        //     key.startsWith("draft-"),
        // );

        // for (const key of draftKeys) {
        //     const draft = JSON.parse(localStorage.getItem(key));
        //     if (!draft.syncedWithServer) {
        //         try {
        //             const response = await fetch(`/api/posts/${draft.id}`, {
        //                 method: "PUT",
        //                 headers: {
        //                     "Content-Type": "application/json",
        //                 },
        //                 body: JSON.stringify(draft),
        //             });

        //             if (response.ok) {
        //                 localStorage.removeItem(key);
        //             }
        //         } catch (error) {
        //             console.error("Error syncing draft:", error);
        //         }
        //     }
        // }
    };

    // Save functionality
    const handleSave = async () => {
        // not saving it for now, will implement whenbackend is ready
        // saveDraftLocally();
        if (navigator.onLine) {
            await syncWithBackend();
        }
        setShowUnsavedAlert(false);
    };

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
            className={`min-h-screen bg-white transition-all duration-300 relative h-fit ${isDark ? "invert" : ""}`}
        >
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

                    {/* options */}
                    <div className="flex items-center space-x-4">
                        {/* word count */}
                        <span className="text-sm text-gray-400">
                            {wordCount} words
                        </span>

                        {/* save btn */}
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

                        {/* preview */}
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
                            {isPreview ? (
                                <>
                                    <Eye className="w-4 h-4" />
                                    <span>Preview</span>
                                </>
                            ) : (
                                <>
                                    <Edit className="w-4 h-4" />
                                    <span>Editing</span>
                                </>
                            )}
                        </button>

                        {/* sync btn */}
                        <button className="flex items-center space-x-2 text-sm size-auto z-50">
                            {syncStatus === "offline" ? (
                                <>
                                    <WifiOff className="w-4 h-4 text-yellow-500" />
                                    <span className="text-yellow-500">
                                        Offline
                                    </span>
                                </>
                            ) : syncStatus === "saving" ? (
                                <>
                                    <Wifi className="w-4 h-4 text-blue-500" />
                                    <span className="text-blue-500">
                                        Saving...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Wifi className="w-4 h-4 text-green-600" />
                                    <span className="text-green-600">
                                        Synced{" "}
                                        {lastSynced
                                            ? `at ${lastSynced.toLocaleTimeString()}`
                                            : ""}
                                    </span>
                                </>
                            )}
                        </button>

                        {/* export btn */}
                        <button
                            onClick={handleExport}
                            className="hover:opacity-70 transition-opacity"
                        >
                            <FileDown className="w-5 h-5" />
                        </button>

                        {/* dark mode button */}
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

                        {/* addtional more button */}
                        <button className="hover:opacity-70 transition-opacity">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
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
            <div
                className={`pt-20 pb-24 ${isFullscreen ? "px-0" : "px-6"} relative h-fit`}
            >
                <div
                    className={`${isFullscreen ? "max-w-7xl p-6" : "max-w-4xl"} mx-auto relative h-fit`}
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
                                onClick={() => handleFormat("underline")}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Underline className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleFormat("strikethrough")}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Strikethrough className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleFormat("highlight")}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Highlighter className="w-4 h-4" />
                            </button>
                            {/* <button
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
                            </button> */}
                            <button
                                onClick={() => handleFormat("quote")}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Quote className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleFormat("code")}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Code className="w-4 h-4" />
                            </button>
                            {/*
                            <button
                                onClick={() => handleFormat("list")}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <List className="w-4 h-4" />
                            </button>
                                <button
                                onClick={() => handleFormat("heading")}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Heading className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleFormat("line")}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button> */}
                            <button
                                onClick={() => handleFormat("link")}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Link className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleFormat("image")}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
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
                        className="w-full h-auto text-4xl font-bold mb-8 focus:outline-none"
                    />

                    {/* Content Textarea */}
                    <textarea
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Fill your canvas..."
                        className={`w-full min-h-[60vh] resize-none focus:outline-none text-lg
                            ${isPreview ? "opacity-0" : "opacity-100"}
                            ${
                                textAlignment === "center"
                                    ? "text-center"
                                    : "text-left"
                            }`}
                    />
                    {/* preview div */}
                    <div
                        className={`w-[100%] h-2/3 mx-auto prose absolute top-0 left-0
                            rounded text-lg transition-all
                            origin-top duration-400 ${isPreview ? "" : "hidden"}`}
                    >
                        <MarkdownPreview
                            title={title}
                            content={content}
                            isVisible={isPreview}
                        />
                    </div>
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

WritingPad.propTypes = {
    artType: PropTypes.string,
    postId: PropTypes.any,
};
