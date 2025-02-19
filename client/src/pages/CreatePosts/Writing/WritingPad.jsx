import { useState, useEffect } from "react";
import {
    ArrowLeft,
    Save,
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
    Download,
    FileText,
    FileType,
    Type,
    Info,
} from "lucide-react";
import PropTypes from "prop-types";
import html2pdf from "html2pdf.js";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    MarkdownPreview,
    LinkInsertButton,
    ImageUploadButton,
    formattingButtons,
} from "./WritingComponents";

/**
 * -------- This file lacks some experimental features, check out this file instead: ./backup/WritingPad-recent.jsx
 * ----------------------------------------------------------------------------------------------------------------
 * supports latex && easy to use + image upload, easily give gap, cuz supports html
 */

const WritingPad = ({ artType = "markdown2pdf", postId = null }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const [isSerif, setIsSerif] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [isSaved, setIsSaved] = useState(true);
    const [isPreview, setIsPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedText, setSelectedText] = useState("");
    const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [syncStatus, setSyncStatus] = useState("synced"); // 'synced', 'saving', 'offline'
    const [lastSynced, setLastSynced] = useState(null);

    useEffect(() => {
        if (isDark) {
            document.body.style.backgroundColor = "#222";
        } else {
            document.body.style.backgroundColor = "#fff";
        }
    }, [isDark]);

    /**
     * Handle text formatting
     */
    const handleFormat = (format) => {
        const textarea = document.querySelector("textarea");
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        let newText = content;
        switch (format) {
            case "handleImageInset":
                break;

            case "inlineCode":
                newText =
                    content.substring(0, start) +
                    `\`${selectedText}\`` +
                    content.substring(end);
                break;

            // select the paragraph where you want to implement this
            case "dropCap":
                newText =
                    content.substring(0, start) +
                    `<p style="font-size: 18px; line-height: 1.5;">
                    <span style="float: left; font-size: 3em; font-weight: bold; line-height: 1; margin-right: 8px;">${selectedText[0]}</span>
                    ${selectedText.slice(1)}
                    </p>` +
                    content.substring(end);
                break;

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

            case "highlight":
                newText =
                    content.substring(0, start) +
                    `<mark>${selectedText}</mark>` +
                    content.substring(end);
                break;

            case "quote":
                newText =
                    content.substring(0, start) +
                    `> ${selectedText}` +
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

            case "subscript":
                newText =
                    content.substring(0, start) +
                    `~${selectedText}~` +
                    content.substring(end);
                break;

            case "pageBreak":
                newText =
                    content.substring(0, start) +
                    `<span className=html2pdf__page-break></span>\n${selectedText}` +
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
        }

        addToUndoStack(content);
        setContent(newText);
    };

    /**
     * Handle content changes with undo/redo functionality
     */
    const addToUndoStack = (previousContent) => {
        setUndoStack([...undoStack, previousContent]);
        setRedoStack([]);
    };

    /**
     * Handle Text area's content change
     */
    const handleContentChange = (e) => {
        const newContent = e.target.value;
        addToUndoStack(content);
        setContent(newContent);
        setWordCount(newContent.trim().split(/\s+/).filter(Boolean).length);
        setIsSaved(false);
        e.target.style.height = e.target.scrollHeight + "px"; // Set new height based on content
    };

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

    const handlePdfExport = async () => {
        try {
            setLoading(true);
            await setIsPreview(true);
            await setTimeout(() => {}, 300);
            // waiting a bit for the html to be compiled, no need ig, cuz i have used await
            const element = document.getElementById("export");
            const safeTitle = title
                // Replace one or more non-alphanumeric characters with a hyphen
                .replace(/[^a-zA-Z0-9]+/g, "-")
                // Remove any leading or trailing hyphens
                .replace(/^-|-$/g, "");

            // Configuration options for html2pdf
            const options = {
                margin: 0.5,
                filename: `${safeTitle}-myOpenCanvas.pdf`,
                // window.crypto.randomUUID()
                image: { type: "jpeg", quality: 1.0 },
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
            alert(
                "PDF export failed, Set Preview Mode on when exporting.",
                error,
            );
            // toast.error();
        } finally {
            setLoading(false);
        }
    };

    const handleTxtExport = async (extension) => {
        if (!extension) {
            extension = "txt";
        }
        try {
            setLoading(true);
            const safeTitle = title
                .replace(/[^a-zA-Z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            const filename = `${safeTitle}-myOpenCanvas.${extension}`;
            const txtFileContent = `# ${title}\n\n\n${content}\n`;

            const blob = new Blob([txtFileContent], {
                type: "text/plain;charset=utf-8",
            });
            // temporary URL for the Blob
            const url = URL.createObjectURL(blob);

            // temporary anchor element to trigger the download
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Clean up: remove the anchor element and revoke the Blob URL
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("txt export failed:", error);
            alert("txt export failed", error);
        } finally {
            setLoading(false);
        }
    };

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
            return;
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
                    setWordCount(
                        savedContent.trim().split(/\s+/).filter(Boolean).length,
                    );
                }

                // Wait for React state updates to complete
                await new Promise((resolve) => setTimeout(resolve, 300));

                // Get textarea value
                const txtArea = document.getElementById("txtArea");
                if (!txtArea) return;

                let v1 = txtArea.value;
                // console.log(v1);

                // Modify textarea value asynchronously
                await new Promise((resolve) => setTimeout(resolve, 200)); // Ensures line-by-line execution
                txtArea.value = v1; // Repeats value 5 times
                txtArea.style.height = txtArea.scrollHeight + "px"; // it was not working if i didn't use async
            } catch (error) {
                console.error("Error loading saved blog post:", error);
            }
        };

        loadSaved();
    }, []);

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

    return (
        <div
            className={`min-h-screen transition-all duration-0 relative h-fit ${isSerif ? `font-serif` : ""}
                ${isDark ? "bg-[#222] text-white" : "bg-white text-black"}`}
        >
            {/* Top Bar */}
            <div
                className={`fixed top-0 left-0 right-0 border-b z-10 transition-all duration-0
                    ${isDark ? "bg-[#222] border-gray-800" : "bg-white border-gray-100"}`}
            >
                <div className="max-w-4xl mx-auto">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-1 md:space-x-4">
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
                            <div className="hidden md:flex items-center space-x-2">
                                <button
                                    className={`px-3 py-1 rounded-full text-sm ${isDark ? "bg-white text-black" : "bg-[#222] text-white"} hover:text-green-300`}
                                >
                                    {artType}
                                </button>
                            </div>
                        </div>

                        {/* options */}
                        <div className="flex items-center space-x-3 md:space-x-4">
                            {/* word count */}
                            <span className="hidden md:inline text-sm text-gray-400">
                                {wordCount} words
                            </span>

                            {/* save btn */}
                            <button
                                className={`flex items-center space-x-1 px-1 md:px-3 py-1 rounded-full text-sm ${
                                    isSaved
                                        ? "text-gray-400"
                                        : "bg-[#222] text-white"
                                }`}
                                onClick={handleSave}
                            >
                                <Save className="size-3 md:size-4" />
                                <span>{isSaved ? "Saved" : "Save"}</span>
                            </button>

                            {/* preview */}
                            <button
                                className={`flex items-center space-x-1 px-1 md:px-3 py-1 rounded-full text-sm border
                                    ${isDark ? "border-gray-700" : "border-gray-300"}
                                    ${
                                        isPreview
                                            ? `${isDark ? "text-gray-200 bg-gray-700" : "text-gray-700 bg-gray-300"}`
                                            : `${isDark ? "text-gray-200" : "text-gray-700"}`
                                    }`}
                                onClick={() => {
                                    setIsPreview(!isPreview);
                                }}
                            >
                                {isPreview ? (
                                    <>
                                        <Eye className="size-3 md:size-4" />
                                        <span>Preview</span>
                                    </>
                                ) : (
                                    <>
                                        <Edit className="size-3 md:size-4" />
                                        <span>Editing</span>
                                    </>
                                )}
                            </button>

                            {/* sync btn */}
                            <button className="hidden md:flex items-center space-x-2 text-sm size-auto z-50">
                                {syncStatus === "offline" ? (
                                    <>
                                        <WifiOff className="size-3 md:size-4 text-yellow-500" />
                                        <span className="text-yellow-500">
                                            Offline
                                        </span>
                                    </>
                                ) : syncStatus === "saving" ? (
                                    <>
                                        <Wifi className="size-3 md:size-4 text-blue-500" />
                                        <span className="text-blue-500">
                                            Saving...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Wifi className="size-3 md:size-4 text-green-600" />
                                        <span className="text-green-600">
                                            Synced{" "}
                                            {lastSynced
                                                ? `at ${lastSynced.toLocaleTimeString()}`
                                                : ""}
                                        </span>
                                    </>
                                )}
                            </button>

                            {/* export dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Download className="size-4 md:size-5" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>
                                        Export document
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <button
                                            onClick={handlePdfExport}
                                            className={`hover:opacity-70 transition-opacity flex items-center justify-start gap-2 size-full ${loading ? "opacity-20" : ""}`}
                                        >
                                            <FileText className="size-4 md:size-5" />{" "}
                                            pdf
                                        </button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <button
                                            onClick={() => {
                                                handleTxtExport("txt");
                                            }}
                                            className={`hover:opacity-70 transition-opacity flex items-center justify-start gap-2 size-full ${loading ? "opacity-20" : ""}`}
                                        >
                                            <FileType className="size-4 md:size-5" />{" "}
                                            txt
                                        </button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <button
                                            onClick={() => {
                                                handleTxtExport("md");
                                            }}
                                            className={`hover:opacity-70 transition-opacity flex items-center justify-start gap-2 size-full ${loading ? "opacity-20" : ""}`}
                                        >
                                            <FileType className="size-4 md:size-5" />{" "}
                                            md
                                        </button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* dark mode button */}
                            <button
                                onClick={() => {
                                    setIsDark(!isDark);
                                }}
                                className="hover:opacity-70 transition-opacity"
                            >
                                {isDark ? (
                                    <Sun className="size-4 md:size-5" />
                                ) : (
                                    <Moon className="size-4 md:size-5" />
                                )}
                            </button>

                            {/* addtional more button */}
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <MoreHorizontal className="size-3 md:size-5" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setIsSerif(!isSerif);
                                        }}
                                    >
                                        <Type /> Serif
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setHelpOpen(true);
                                        }}
                                    >
                                        <Info /> Help
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Formatting Tools */}
                    <div
                        className={`mb-2 flex items-center justify-between rounded-md ${isDark ? "bg-[#333]" : "bg-gray-50"} transition-all duration-0`}
                    >
                        <div className="flex items-center space-x-1 md:space-x-4">
                            {formattingButtons.map(({ format, icon: Icon }) => (
                                <button
                                    key={format}
                                    onClick={() => handleFormat(format)}
                                    className={`p-1 md:p-2 ${isDark ? "hover:bg-gray-500" : "hover:bg-gray-200"} rounded-lg transition-all duration-0`}
                                >
                                    <Icon className="size-3 md:size-4" />
                                </button>
                            ))}
                            <LinkInsertButton
                                onLinkInsert={(markdownImageText) => {
                                    const textarea =
                                        document.querySelector("textarea");
                                    const start = textarea.selectionStart;
                                    const newContent =
                                        content.substring(0, start) +
                                        markdownImageText +
                                        content.substring(start);
                                    setContent(newContent);
                                }}
                            />
                            <ImageUploadButton
                                onImageInsert={(markdownImageText) => {
                                    const textarea =
                                        document.querySelector("textarea");
                                    const start = textarea.selectionStart;
                                    const newContent =
                                        content.substring(0, start) +
                                        markdownImageText +
                                        content.substring(start);
                                    setContent(newContent);
                                }}
                            />
                        </div>

                        {/* undo/redo */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleUndo}
                                disabled={undoStack.length === 0}
                                className={`p-2 rounded-lg transition-all duration-0 ${
                                    undoStack.length === 0
                                        ? "opacity-50"
                                        : `${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`
                                }`}
                            >
                                <Undo className="size-3 md:size-4" />
                            </button>
                            <button
                                onClick={handleRedo}
                                disabled={redoStack.length === 0}
                                className={`p-2 rounded-lg transition-all duration-0 ${
                                    redoStack.length === 0
                                        ? "opacity-50"
                                        : `${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`
                                }`}
                            >
                                <Redo className="size-3 md:size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Unsaved Changes Alert */}
            {showUnsavedAlert && (
                <div className="fixed inset-0 bg-[#222] bg-opacity-20 flex items-center justify-center z-20">
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
                                        className="px-3 py-1.5 bg-[#222] text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
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
            <div className={`pt-[8.25rem] pb-[200px] px-6 relative h-fit`}>
                <div className={`max-w-4xl mx-auto relative h-fit`}>
                    {/* help div */}
                    <div
                        className={`w-[100%] h-auto mx-auto  relative mb-4
                            rounded text-lg transition-all duration-0 max-w-4xl
                            ${helpOpen ? "" : "hidden"} ${isDark ? "invert" : ""}`}
                    >
                        <Card className="bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    Formatting tools &amp; keyboard shortcuts
                                    <X
                                        onClick={() => {
                                            setHelpOpen(false);
                                        }}
                                    />
                                </CardTitle>
                                <CardDescription>
                                    grasp in minutes
                                </CardDescription>
                            </CardHeader>
                            {formattingButtons.map(({ format, icon: Icon }) => (
                                <CardContent
                                    key={format}
                                    className="flex items-center justify-start gap-3"
                                >
                                    <Icon className="size-3 md:size-4" />{" "}
                                    {`${format}, ${format === "dropCap" ? "select the paragraph where you want to implment drop-cap and then click this icon" : `select the text you want to ${format} and click this button`}`}
                                </CardContent>
                            ))}
                        </Card>
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
                        className={`w-full h-auto text-4xl font-bold mb-8 focus:outline-none transition-all duration-0
                            ${isDark ? "bg-[#222]" : "bg-white"}`}
                    />

                    {/* Content Textarea */}
                    <textarea
                        id="txtArea"
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Fill your canvas..."
                        className={`w-full min-h-screen h-auto resize-none focus:outline-none text-lg text-left transition-all duration-0
                            ${isDark ? "bg-[#222]" : "bg-white"}
                            ${isPreview ? "opacity-0 max-h-screen" : "opacity-100 max-h-auto"}`}
                    />

                    {/* preview div */}
                    <div
                        className={`w-[100%] h-auto mx-auto prose absolute top-0 left-0
                            rounded text-lg transition-all duration-0
                            ${isPreview ? "" : "hidden"} ${isDark ? "invert" : ""}`}
                    >
                        <MarkdownPreview
                            title={title}
                            content={content}
                            isVisible={isPreview}
                        />
                    </div>
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
