import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
    AlignCenter,
    AlignLeft,
    NotebookText,
    ScrollText,
    FileSearch,
    PanelTop,
    Columns2,
} from "lucide-react";
import PropTypes from "prop-types";
import ObjectId from "bson-objectid";

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
    ScrollToBottomButton,
    formattingButtons,
    rawText,
} from "./WritingComponents";

// hooks
import { useWritingPad } from "./hooks/useWritingPad";
import { useEditorFormatting } from "./hooks/useEditorFormatting";
import { useEditorAppearance } from "./hooks/useEditorAppearance";
import { useExport } from "./hooks/useExport";

/**
 • supports latex && easy to use + image upload, easily give gap, cuz supports html
 • ^%SOS# for unTested code
 • post click : edit preview settings
 */
const WritingPad = ({ artType = "article" }) => {
    const navigate = useNavigate();

    const [postId, setPostId] = useState("");
    useEffect(() => {
        const id = ObjectId();
        setPostId(id.toString());
    }, []);

    // Core writing pad functionality
    const {
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
        twoColumn,
        setTwoColumn,
    } = useWritingPad({ postId });

    // Editor formatting functionality
    const {
        selectedText,
        setSelectedText,
        textAlignment,
        setTextAlignment,
        handleContentChange,
        undoStack,
        redoStack,
        handleUndo,
        handleRedo,
        handleFormat,
    } = useEditorFormatting(content, setContent);

    // Editor appearance
    const {
        isSerif,
        setIsSerif,
        documentScroll,
        setDocumentScroll,
        sepia,
        setSepia,
        lightModeBg,
        isDark,
        setIsDark,
        helpOpen,
        setHelpOpen,
        optionsDropdownOpen,
        setOptionsDropdownOpen,
    } = useEditorAppearance();

    // Export functionality
    const {
        isPreview,
        setIsPreview,
        loading,
        copied,
        handlePdfExport,
        handleTxtExport,
        handleCopy,
    } = useExport(title, content);

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: { title },
        // image: ["https://opencanvas.blog/photos/1x1/photo.jpg"],
        datePublished: {},
        dateModified: {},
        author: {
            "@type": "Person",
            name: {},
        },
        publisher: {
            "@type": "Organization",
            name: "Opencanvas",
            logo: {
                "@type": "ImageObject",
                url: "https://opencanvas.blog/logo.png",
            },
        },
        description:
            "A sample article description goes here, summarizing the main content of the article.",
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://opencanvas.blog/sample-article",
        },
        keywords:
            "SEO, keywords, search engine optimization, blog, web development",
    };

    return (
        <>
            <Helmet>
                <title>{title} • OpenCanvas</title>
                <meta name="description" content={title} />
                <meta
                    name="keywords"
                    content="technology, blog, javascript, SEO, web development"
                />
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Helmet>
            <div
                className={`min-h-screen transition-all duration-0 relative h-fit ${isSerif ? `font-serif` : ""}
                ${isDark ? "bg-[#222] text-white" : `${lightModeBg} text-black`}`}
            >
                {/* Top Bar */}
                <div
                    className={`fixed top-0 left-0 right-0 border-b z-50 transition-all duration-0
                    ${isDark ? "bg-[#222] border-[#333]" : "bg-white border-gray-100"}`}
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
                                        navigate("/profile");
                                    }}
                                    className="hover:opacity-70 transition-opacity"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="hidden md:flex items-center space-x-2">
                                    <button
                                        className={`px-3 py-1 rounded-full text-sm ${isDark ? "bg-white text-black hover:text-green-600" : "bg-[#222] text-white hover:text-green-300"}`}
                                    >
                                        {artType}
                                    </button>
                                </div>
                            </div>

                            {/* options */}
                            <div className="flex items-center space-x-3 md:space-x-4">
                                {/* save btn */}
                                <button
                                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                                        isSaved
                                            ? "text-gray-400"
                                            : "bg-[#222] text-white"
                                    }`}
                                    onClick={handleSave}
                                >
                                    <Save className="size-4" />
                                    <span>{isSaved ? "Saved" : "Save"}</span>
                                </button>

                                {/* preview btn */}
                                {!twoColumn && (
                                    <button
                                        className={`flex items-center space-x-1 px-2 md:px-3 py-1 rounded-full text-sm border
                                    ${isDark ? "border-[#555]" : "border-gray-300"}
                                    ${
                                        isPreview
                                            ? `${isDark ? "text-gray-200 bg-[#555]" : "text-gray-700 bg-gray-300"}`
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
                                                <Edit className="size-4" />
                                                <span>Edit</span>
                                            </>
                                        )}
                                    </button>
                                )}

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
                                        <Download className="size-5" />
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
                                                <FileText className="size-5" />{" "}
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
                                        <Sun className="size-5" />
                                    ) : (
                                        <Moon className="size-5" />
                                    )}
                                </button>

                                {/* addtional more button */}
                                <DropdownMenu
                                    open={optionsDropdownOpen}
                                    onOpenChange={setOptionsDropdownOpen}
                                >
                                    <DropdownMenuTrigger>
                                        <MoreHorizontal className="size-5" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {/* font */}
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsSerif(!isSerif);
                                            }}
                                        >
                                            <Type />
                                            {isSerif ? "Sans" : "Serif"}
                                        </DropdownMenuItem>

                                        {/* theme */}
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSepia(!sepia);
                                            }}
                                        >
                                            <div
                                                className={`rounded-full size-4 border border-[#222] ${sepia ? "bg-white" : "bg-[#FCF5E6]"}`}
                                            ></div>
                                            {sepia ? "White" : "Sepia"}
                                        </DropdownMenuItem>

                                        {/* align */}
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                {
                                                    textAlignment === "center"
                                                        ? setTextAlignment(
                                                              "left",
                                                          )
                                                        : setTextAlignment(
                                                              "center",
                                                          );
                                                }
                                            }}
                                        >
                                            {textAlignment === "center" ? (
                                                <>
                                                    <AlignLeft /> Left
                                                </>
                                            ) : (
                                                <>
                                                    <AlignCenter /> Center
                                                </>
                                            )}
                                        </DropdownMenuItem>

                                        {/* page distinct */}
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setDocumentScroll(
                                                    !documentScroll,
                                                );
                                                alert("will be available soon");
                                            }}
                                            className="cursor-pointer"
                                        >
                                            {!documentScroll ? (
                                                <>
                                                    <NotebookText /> Pages
                                                </>
                                            ) : (
                                                <>
                                                    <ScrollText /> Scroll
                                                </>
                                            )}
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.preventDefault();
                                                alert("will be available soon");
                                            }}
                                        >
                                            <FileSearch />
                                            Find &amp; replace
                                        </DropdownMenuItem>

                                        {!isPreview && (
                                            <DropdownMenuItem
                                                className="hidden md:flex"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setTwoColumn(!twoColumn);
                                                }}
                                            >
                                                {!twoColumn ? (
                                                    <>
                                                        <Columns2 />
                                                        side preview
                                                    </>
                                                ) : (
                                                    <>
                                                        <PanelTop />
                                                        single column
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                        )}

                                        {/* help */}
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setHelpOpen(!helpOpen);
                                            }}
                                        >
                                            <Info />
                                            {helpOpen ? "close Help" : "Help"}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Formatting Tools */}
                        <div
                            className={`mb-2 mx-4 md:mx-0 flex items-center justify-between rounded-md transition-all duration-0
                                        ${isDark ? "bg-[#333]" : "bg-gray-50"}
                                        ${isPreview ? "opacity-0 h-0" : ""}`}
                        >
                            <div className="flex items-center md:space-x-2">
                                {formattingButtons.map(
                                    ({ format, icon: Icon }) => (
                                        <button
                                            key={format}
                                            onClick={() => handleFormat(format)}
                                            className={`px-[6px] md:px-2 py-3 md:rounded-lg transition-all duration-0
                                                        border-r md:border-none
                                                        ${isDark ? "hover:bg-gray-500 border-[#222]" : "hover:bg-gray-200 border-gray-200"}
                                                        ${["heading", "quote", "list", "inlineCode", "dropCap"].includes(format) ? "hidden md:block" : ""}`}
                                        >
                                            <Icon className="size-4" />
                                        </button>
                                    ),
                                )}
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
                                    sizing="px-[6px] md:px-2 py-3"
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
                                    sizing="px-[6px] md:px-2 py-3"
                                />
                            </div>

                            {/* undo/redo */}
                            <div className="flex items-center space-x-1 md:space-x-2">
                                <button
                                    onClick={handleUndo}
                                    disabled={undoStack.length === 0}
                                    className={`px-[6px] md:px-2 py-3 rounded-lg transition-all duration-0 ${
                                        undoStack.length === 0
                                            ? "opacity-50"
                                            : `${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`
                                    }`}
                                >
                                    <Undo className="size-4" />
                                </button>
                                <button
                                    onClick={handleRedo}
                                    disabled={redoStack.length === 0}
                                    className={`p-1 md:p-2 rounded-lg transition-all duration-0 ${
                                        redoStack.length === 0
                                            ? "opacity-50"
                                            : `${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`
                                    }`}
                                >
                                    <Redo className="size-4" />
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
                                    <h3 className="font-medium">
                                        Unsaved Changes
                                    </h3>
                                    <AlertDescription>
                                        You have unsaved changes. Would you like
                                        to save them first?
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
                    <div
                        className={`${twoColumn ? "max-w-6xl" : "max-w-4xl"} mx-auto relative h-fit`}
                    >
                        {/* help div */}
                        <div
                            className={`w-[100%] h-auto mx-auto  relative mb-4 z-30
                            rounded text-lg transition-all duration-0 max-w-4xl
                            ${helpOpen ? "" : "hidden"} ${isDark ? "invert" : ""}`}
                        >
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        Formatting tools &amp; keyboard
                                        shortcuts
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
                                {formattingButtons.map(
                                    ({ format, icon: Icon }) => (
                                        <CardContent
                                            key={format}
                                            className="flex items-center justify-start gap-3 h-fit md:h-6 text-sm font-sans"
                                        >
                                            <Icon className="size-5 md:size-4" />{" "}
                                            {`${format}, ${format === "dropCap" ? "select the paragraph where you want to implment drop-cap and then click this icon" : `select the text you want to ${format} and click this button`}`}
                                        </CardContent>
                                    ),
                                )}
                                <CardContent className="mt-4">
                                    <h1 className="text-3xl font-serif font-black">
                                        Paste these in writing area for better
                                        understading.
                                    </h1>
                                    <button
                                        onClick={() => {
                                            handleCopy(rawText);
                                        }}
                                        className="bg-gray-200 hover:bg-gray-400 rounded px-2 py-1"
                                    >
                                        {copied ? "Copied!" : "Copy"}
                                    </button>
                                    <pre
                                        className="text-sm font-sans"
                                        style={{
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {rawText}
                                    </pre>
                                </CardContent>
                            </Card>
                        </div>

                        <div className={twoColumn ? "flex gap-4" : ""}>
                            <div
                                className={
                                    twoColumn
                                        ? `border-r-2 w-1/2 h-full ${isDark ? "border-[#333]" : "border-gray-400"}`
                                        : ""
                                }
                            >
                                {/* Title Input */}
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                        setIsSaved(false);
                                        e.target.style.height =
                                            e.target.scrollHeight + "px";
                                    }}
                                    placeholder="Title"
                                    className={`w-full h-auto text-4xl font-bold mb-8 focus:outline-none transition-all duration-0
                                                ${isDark ? "bg-[#222]" : lightModeBg}
                                                ${isPreview ? "opacity-0" : "opacity-100"}`}
                                />

                                {/* Content Textarea */}
                                <textarea
                                    data-lenis-prevent
                                    id="txtArea"
                                    value={content}
                                    onChange={(e) => {
                                        handleContentChange(e, setIsSaved);
                                    }}
                                    placeholder="Fill your canvas..."
                                    className={`w-full min-h-screen h-auto resize-none focus:outline-none text-lg text-left transition-all duration-0
                                                ${isDark ? "bg-[#222]" : lightModeBg}
                                                ${isPreview ? "opacity-0 max-h-screen" : "opacity-100 max-h-auto"}
                                                ${
                                                    textAlignment === "center"
                                                        ? "text-center"
                                                        : "text-left"
                                                }`}
                                />
                            </div>

                            {/* preview div */}
                            <div
                                data-lenis-prevent
                                className={`prose rounded text-lg transition-all duration-0
                                    ${!twoColumn ? "w-[100%] h-auto mx-auto absolute top-0 left-0" : "w-1/2 h-full"}
                                    ${isPreview || twoColumn ? "" : "hidden"}`}
                            >
                                <MarkdownPreview
                                    title={title}
                                    content={content}
                                    isVisible={twoColumn ? true : isPreview}
                                    isDark={isDark}
                                    textAlignment={textAlignment}
                                    lightModeBg={lightModeBg}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <ScrollToBottomButton isDark={isDark} />
            </div>
        </>
    );
};

export default WritingPad;

WritingPad.propTypes = {
    artType: PropTypes.string,
    postId: PropTypes.any,
};
