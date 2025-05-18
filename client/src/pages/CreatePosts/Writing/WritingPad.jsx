import { useState, useEffect, useRef, memo } from "react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import {
    X,
    // Sun,
    Eye,
    // Moon,
    Undo,
    Redo,
    Edit,
    Type,
    Info,
    Download,
    FileText,
    Columns2,
    FileType,
    PanelTop,
    ArrowLeft,
    AlignLeft,
    FileSearch,
    ScrollText,
    AlignCenter,
    NotebookText,
    AlertTriangle,
    MoreHorizontal,
} from "lucide-react";
import PropTypes from "prop-types";

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
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    MarkdownPreview,
    LinkInsertButton,
    ImageUploadButton,
    ScrollToBottomButton,
    TagInputComponent,
    ThumbnailUploader,
    PublicPreferenceInput,
    formattingButtons,
    rawText,
    findAndReplace,
    getSchemaData,
} from "./WritingComponents";

// hooks
import { useWritingPad } from "./hooks/useWritingPad";
import { useEditorFormatting } from "./hooks/useEditorFormatting";
import { useEditorAppearance } from "./hooks/useEditorAppearance";
import { useExport } from "./hooks/useExport";
// import useSingleTab from "./hooks/useSingleTab";
import { useAuth } from "../../../contexts/AuthContext";

const WritingPad = memo(function WritingPad({ artType = "article" }) {
    const { currentUser } = useAuth();
    const publishBtnRef = useRef(null);
    // const navigate = useNavigate();

    const [postId, setPostId] = useState("");
    useEffect(() => {
        setPostId(localStorage.getItem("newPostId", ""));
    }, [postId]);

    const frontendOnly = false;

    // const isActiveTab = useSingleTab();
    // customized  redirect path:
    // const isActiveTab = useSingleTab({
    //   redirectPath: "/profile",
    //   messageText: "Editor is already open. Redirecting to profile..."
    // });

    // main writing pad functionality
    const {
        title,
        setTitle,
        content,
        setContent,
        isSaved,
        setIsSaved,
        showUnsavedAlert,
        setShowUnsavedAlert,
        handleSave,
        twoColumn,
        setTwoColumn,
        tags,
        setTags,
        isPublic,
        setIsPublic,
        setMedia,
        setThumbnailUrl,
    } = useWritingPad({ postId, frontendOnly, artType });

    // Editor formatting functionality
    const {
        // selectedText,
        // setSelectedText,
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
        // setIsDark,
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

    // if (!isActiveTab) {
    //     return <div>Redirecting...</div>;
    // }

    const lastButton = formattingButtons[formattingButtons.length - 1];
    const LastIcon = lastButton.icon;

    // listen for keystrokes and apply formatting
    // cmd+b:handleFormat(bold), cmd+i:handleFormat(italics), cmd+u:handleFormat(underline), cmd+h:handleFormat(highlight)
    // use control instead cmd for windows
    // and for cmd+s, click the publish button, publishBtnRef.current.click()
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check if cmd key (Mac) or ctrl key (Windows/Linux) is pressed
            const isCmdOrCtrlPressed = e.metaKey || e.ctrlKey;

            if (!isCmdOrCtrlPressed) return;

            // console.log(
            //     "Key pressed:",
            //     e.key,
            //     "Cmd/Ctrl pressed:",
            //     isCmdOrCtrlPressed,
            // );

            // Prevent default behavior for our shortcut keys
            if (isCmdOrCtrlPressed) {
                if (e.key === "b" || e.key === "B") {
                    e.preventDefault();
                    handleFormat("bold");
                } else if (e.key === "i" || e.key === "I") {
                    e.preventDefault();
                    handleFormat("italic");
                } else if (e.key === "u" || e.key === "U") {
                    e.preventDefault();
                    handleFormat("underline");
                } else if (e.key === "h" || e.key === "H") {
                    // For ⌘+H, browsers often have default behaviors
                    e.preventDefault();
                    e.stopPropagation(); // Add this to ensure it doesn't bubble up
                    handleFormat("highlight");
                } else if (e.key === "s" || e.key === "S") {
                    // For ⌘+S, browsers always try to save the page
                    e.preventDefault();
                    e.stopPropagation(); // Add this to ensure it doesn't bubble up
                    if (publishBtnRef.current) {
                        publishBtnRef.current.click();
                    }
                }
            }
        };

        // Add event listener
        document.addEventListener("keydown", handleKeyDown);

        // Clean up event listener on component unmount
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleFormat]); // Add handleFormat to dependency array since we're using it in the effect

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
                    {JSON.stringify(getSchemaData(title))}
                </script>
            </Helmet>

            <div
                className={`min-h-screen transition-all duration-0 relative h-fit ${isSerif ? `font-serif` : ""}
                ${isDark ? "bg-[#222] text-[#f0f0f0]" : `${lightModeBg} text-black`}`}
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
                                        localStorage.removeItem("newPostId");
                                        window.location.href = "/profile";
                                    }}
                                    className="hover:opacity-70 transition-opacity p-1 border rounded-full"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="hidden md:flex items-center space-x-2">
                                    <button
                                        className={`text-base mr-4 hover:text-green-600 underline underline-offset-2 decoration-lime-300/60 decoration-4 ${isDark ? "text-white" : "text-black"}`}
                                    >
                                        {artType}
                                    </button>
                                    <span
                                        className={
                                            isDark
                                                ? "text-[#555]"
                                                : "text-gray-400"
                                        }
                                    >
                                        {isSaved ? "saved" : "unsaved"}
                                    </span>
                                </div>
                            </div>

                            {/* options */}
                            <div className="flex items-center space-x-3 md:space-x-4">
                                {/* publish btn */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button
                                            ref={publishBtnRef}
                                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-lime-500 text-white`}
                                        >
                                            publish
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-6xl h-screen md:h-auto">
                                        <DialogHeader>
                                            <DialogTitle>
                                                Publish {artType}
                                            </DialogTitle>
                                            <DialogDescription>
                                                account: {currentUser.email}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex  flex-col md:flex-row items-start justify-center gap-4 md:gap-16 p-4">
                                            <div>
                                                <TagInputComponent
                                                    tags={tags}
                                                    setTags={setTags}
                                                />
                                                <PublicPreferenceInput
                                                    isPublic={isPublic}
                                                    setIsPublic={setIsPublic}
                                                />
                                            </div>
                                            <ThumbnailUploader
                                                artType={artType}
                                                setThumbnailUrl={
                                                    setThumbnailUrl
                                                }
                                                setMedia={setMedia}
                                            />
                                        </div>

                                        <DialogFooter>
                                            <Button
                                                type="submit"
                                                onClick={handleSave}
                                                className="bg-lime-500 rounded-full hover:bg-lime-500"
                                            >
                                                Publish
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

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
                                {/* <button
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
                                </button> */}

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
                                                findAndReplace(
                                                    content,
                                                    setContent,
                                                    toast,
                                                );
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
                                {formattingButtons
                                    .slice(0, -1)
                                    .map(({ format, icon: Icon }) => (
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
                                    ))}
                                {frontendOnly && (
                                    <button
                                        onClick={() =>
                                            handleFormat(lastButton.format)
                                        }
                                        className={`px-[6px] md:px-2 py-3 md:rounded-lg transition-all duration-0
                                                border-r md:border-none
                                                ${isDark ? "hover:bg-gray-500 border-[#222]" : "hover:bg-gray-200 border-gray-200"}
                                                ${
                                                    [
                                                        "heading",
                                                        "quote",
                                                        "list",
                                                        "inlineCode",
                                                        "dropCap",
                                                    ].includes(
                                                        lastButton.format,
                                                    )
                                                        ? "hidden md:block"
                                                        : ""
                                                }`}
                                    >
                                        <LastIcon className="size-4" />
                                    </button>
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
                                    setMedia={setMedia}
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

                {/* unsaved changes alert */}
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
                                            onClick={() => {
                                                setShowUnsavedAlert(false);
                                                localStorage.removeItem(
                                                    "newPostId",
                                                );
                                                window.history.back();
                                            }}
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
                <div className={`pt-[8.25rem] pb-[600px] px-6 relative h-fit`}>
                    <div
                        className={`${twoColumn ? "max-w-6xl" : "max-w-3xl"} mx-auto relative h-fit`}
                    >
                        {/* help div */}
                        <div
                            className={`w-[100%] h-auto mx-auto  relative mb-4 z-30
                            rounded text-lg transition-all duration-0 max-w-3xl
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
                                    className={`w-full font-[montserrat] min-h-screen h-auto resize-none focus:outline-none text-lg text-left transition-all duration-0
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
                                    // no need to add thumbnail here
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <ScrollToBottomButton isDark={isDark} />
            </div>
        </>
    );
});

export default WritingPad;

WritingPad.propTypes = {
    artType: PropTypes.string,
    postId: PropTypes.any,
};
