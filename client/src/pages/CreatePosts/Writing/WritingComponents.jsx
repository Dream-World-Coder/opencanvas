import { useRef, useState } from "react";
import {
    Image,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Highlighter,
    FilePlus,
    Quote,
    Code,
    Link,
    List,
    Heading,
    Minus,
    FileJson,
    LetterText,
    X,
    Upload,
} from "lucide-react";
import PropTypes from "prop-types";
// ***************************************************
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// ***************************************************
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

/**
 *
 *
 *
 *
 *
 *
 */
export const formattingButtons = [
    { format: "bold", icon: Bold },
    { format: "italic", icon: Italic },
    { format: "underline", icon: Underline },
    { format: "strikethrough", icon: Strikethrough },
    { format: "heading", icon: Heading },
    { format: "highlight", icon: Highlighter },
    { format: "quote", icon: Quote },
    { format: "inlineCode", icon: Code },
    { format: "code", icon: FileJson },
    { format: "list", icon: List },
    { format: "dropCap", icon: LetterText },
    { format: "line", icon: Minus },
    { format: "pageBreak", icon: FilePlus },
];

/**
 *
 *
 *
 *
 *
 *
 */
export const ImageUploadButton = ({ onImageInsert, sizing }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [error, setError] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const validateFile = (file) => {
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];

        if (!ALLOWED_TYPES.includes(file.type)) {
            throw new Error(
                "Invalid file type. Please upload a JPG, PNG, or GIF.",
            );
        }

        if (file.size > MAX_SIZE) {
            throw new Error("File size exceeds 10MB limit.");
        }
    };

    const handleImageSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            validateFile(file);
            setError(null);

            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            setIsUploading(true);

            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch(
                "https://encryptease.pythonanywhere.com/api/uploadImage",
                {
                    method: "POST",
                    body: formData,
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Upload failed");
            }

            onImageInsert(data.markdown_link);
            setDialogOpen(false);
        } catch (error) {
            setError(error.message);
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
            if (preview) {
                URL.revokeObjectURL(preview);
            }
            setPreview(null);
        }
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <button
                    className={
                        sizing +
                        "hover:bg-gray-200 md:rounded-lg transition-all duration-0"
                    }
                >
                    <Image className="size-4" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Insert Image</DialogTitle>
                    <DialogDescription>
                        Upload an image (JPG, PNG, or GIF, max 10MB)
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <Card className="border-2 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-w-full max-h-48 object-contain mb-4"
                                />
                            ) : (
                                <div className="text-center">
                                    <Image className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                                    <p className="text-sm text-gray-600">
                                        Click to upload or drag and drop
                                    </p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline"
                                className="mt-4"
                                disabled={isUploading}
                            >
                                {isUploading ? "Uploading..." : "Select Image"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};

ImageUploadButton.propTypes = {
    onImageInsert: PropTypes.func,
    sizing: PropTypes.string,
};

/**
 *
 *
 *
 *
 */
export const LinkInsertButton = ({ onLinkInsert, sizing }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [linkText, setLinkText] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [error, setError] = useState("");

    const handleInsert = () => {
        // Basic validation
        if (!linkText.trim() || !linkUrl.trim()) {
            setError("Both link text and URL are required");
            return;
        }

        // Basic URL validation
        try {
            new URL(linkUrl);
        } catch {
            setError("Please enter a valid URL");
            return;
        }

        // Insert markdown link
        onLinkInsert(`[${linkText}](${linkUrl})`);

        // Reset and close
        setLinkText("");
        setLinkUrl("");
        setError("");
        setDialogOpen(false);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <button
                    className={
                        sizing +
                        "hover:bg-gray-200 md:rounded-lg transition-all duration-0"
                    }
                >
                    <Link className="size-4" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Insert Link</DialogTitle>
                </DialogHeader>
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="linkText">Link Text</Label>
                        <Input
                            id="linkText"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            placeholder="Display text for the link"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="linkUrl">URL</Label>
                        <Input
                            id="linkUrl"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDialogOpen(false);
                                setError("");
                                setLinkText("");
                                setLinkUrl("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleInsert}>Insert Link</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
LinkInsertButton.propTypes = {
    onLinkInsert: PropTypes.func,
    sizing: PropTypes.string,
};
/**
 *
 *
 *
 *
 */
// need to implement unique classNames for every image
// imaplement the changes directly in the image, also add zoom in/out features,
// no need to preview on dialog

/**
 *
 *
 *
 *
 *
 *
 */
export const MarkdownPreview = ({
    title,
    content,
    thumbnailUrl = null,
    isVisible = true,
    isDark = false,
    textAlignment = "left",
    lightModeBg = "bg-white",
    insidePost = false,
    darkBg = "bg-[#222]",
}) => {
    // Use ref to store settings for all images
    const imageSettingsRef = useRef({});

    // Track which image's settings are being edited
    const [activeImageId, setActiveImageId] = useState(null);

    // Force re-render when settings change
    const [, forceUpdate] = useState({});

    // Get default settings for an image or use existing settings
    const getImageSettings = (imageId) => {
        if (!imageSettingsRef.current[imageId]) {
            imageSettingsRef.current[imageId] = {
                maxWidth: 500,
                maxHeight: 360,
                alignment: "center",
                marginTop: 35,
                marginBottom: 35,
            };
        }
        return imageSettingsRef.current[imageId];
    };

    // Update a specific setting for an image
    const updateImageSetting = (imageId, setting, value) => {
        const settings = getImageSettings(imageId);
        settings[setting] = value;
        imageSettingsRef.current[imageId] = settings;
        forceUpdate({});
    };

    function convertFlexAlignment(alignment) {
        switch (alignment) {
            case "flex-start":
                return "left";
            case "center":
                return "center";
            case "flex-end":
                return "right";
            default:
                return alignment;
        }
    }

    if (!isVisible) return null;

    return (
        <>
            <Card
                className={`w-full max-w-4xl mx-auto bg-white border-none shadow-none
                ${isDark ? `${darkBg} text-white border-none` : lightModeBg}
                ${textAlignment === "center" ? "text-center" : "text-left"}`}
            >
                <CardContent className="p-0">
                    <div id="export" className="prose prose-slate max-w-none">
                        {/* title */}
                        {title && (
                            <div className="font-serif text-4xl font-bold mb-6 leading-tight tracking-tight">
                                {title}
                            </div>
                        )}

                        {/* thumbnail */}
                        {thumbnailUrl && (
                            <div className="relative mb-8 rounded-lg overflow-hidden shadow-md">
                                <img
                                    src={thumbnailUrl}
                                    alt={title || "Article thumbnail"}
                                    className="w-full h-auto object-cover"
                                    loading="lazy"
                                />
                            </div>
                        )}
                        {/* markdown content */}
                        <ReactMarkdown
                            remarkPlugins={[
                                remarkGfm,
                                remarkBreaks,
                                remarkMath,
                            ]}
                            rehypePlugins={[rehypeRaw, rehypeKatex]}
                            components={{
                                img(props) {
                                    const { node, src, alt, ...rest } = props;
                                    // unique ID for each image based on src and alt
                                    const imageId =
                                        `img-${src || ""}${alt || ""}`.replace(
                                            /[^a-zA-Z0-9]/g,
                                            "-",
                                        );
                                    const settings = getImageSettings(imageId);

                                    return (
                                        <div
                                            className={`markdown-image-container-div relative cursor-pointer z-15 overflow-hidden
                                                                                flex items-center`}
                                            style={{
                                                justifyContent: `${settings.alignment}`,
                                                marginTop: `${settings.marginTop}px`,
                                                marginBottom: `${settings.marginBottom}px`,
                                            }}
                                            onClick={() =>
                                                setActiveImageId(imageId)
                                            }
                                        >
                                            <img
                                                className={`relative object-cover`}
                                                style={{
                                                    maxHeight: `${settings.maxHeight}px`,
                                                    maxWidth: `${settings.maxWidth}px`,
                                                }}
                                                src={src}
                                                alt={alt}
                                                {...rest}
                                            />
                                        </div>
                                    );
                                },
                                hr(props) {
                                    return (
                                        <hr
                                            className={`my-6 border-t ${isDark ? "border-[#333]" : "border-gray-200"}`}
                                            {...props}
                                        />
                                    );
                                },
                                code({
                                    node,
                                    inline,
                                    className,
                                    children,
                                    ...props
                                }) {
                                    const match = /language-(\w+)/.exec(
                                        className || "",
                                    );
                                    const codeString = String(children).replace(
                                        /\n$/,
                                        "",
                                    );

                                    return !inline && match ? (
                                        // block code
                                        <div
                                            className={`relative my-4 overflow-hidden rounded-xl flex flex-col
                                            ${
                                                isDark
                                                    ? "bg-[#333]"
                                                    : "bg-[#e8eae6]"
                                            }`}
                                        >
                                            {/* codeHeader */}
                                            <div
                                                className={`flex items-center justify-between px-6 pt-2 ${
                                                    isDark
                                                        ? "bg-[#333]"
                                                        : "bg-[#e8eae6]"
                                                }`}
                                            >
                                                {/* lagguage */}
                                                <span className="text-sm font-sans">
                                                    {match[1]}
                                                </span>
                                                {/* Copy button */}
                                                <button
                                                    onClick={(e) => {
                                                        navigator.clipboard.writeText(
                                                            codeString,
                                                        );
                                                        e.target.textContent =
                                                            "Copied!";
                                                        setTimeout(() => {
                                                            e.target.textContent =
                                                                "Copy";
                                                        }, 1000);
                                                    }}
                                                    className="bg-[#222] text-white px-3 py-1 text-xs rounded hover:bg-[#444] focus:outline-none z-10"
                                                >
                                                    Copy
                                                </button>
                                            </div>

                                            {/* Rounded code card */}
                                            <div className="rounded-xl overflow-hidden border-none">
                                                <SyntaxHighlighter
                                                    style={oneLight}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    wrapLongLines
                                                    codeTagProps={{
                                                        style: {
                                                            fontSize:
                                                                "0.875rem",
                                                            lineHeight: "1.2",
                                                        },
                                                    }}
                                                    className={
                                                        isDark ? "invert" : ""
                                                    }
                                                    {...props}
                                                >
                                                    {codeString}
                                                </SyntaxHighlighter>
                                            </div>
                                        </div>
                                    ) : (
                                        // inline code
                                        <code
                                            className={`px-1 py-0.5 rounded text-sm font-mono
                                            ${isDark ? "text-[#ffd085] bg-[#ffd085]/10" : "bg-gray-200"}`}
                                        >
                                            {children}
                                        </code>
                                    );
                                },
                                blockquote({ children }) {
                                    return (
                                        <blockquote
                                            className={`border-l-4 px-4 py-1 my-4 italic rounded-md shadow
                                                ${isDark ? "border-[#999] bg-[#999]/10 text-[#ddd]" : "border-gray-400 bg-gray-100 text-gray-700"}
                                              `}
                                            // className={`border-l-4 pl-4 italic ${isDark ? "border-[#888] text-[#999]" : "border-gray-500 text-gray-600"}`}
                                        >
                                            {children}
                                        </blockquote>
                                    );
                                },

                                h1: ({ children }) => (
                                    <h1 className="font-serif text-4xl font-bold mt-12 mb-6 leading-tight tracking-tight">
                                        {children}
                                    </h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="font-serif text-3xl font-bold mt-10 mb-5 leading-tight tracking-tight">
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="font-serif text-2xl font-bold mt-8 mb-4 leading-tight">
                                        {children}
                                    </h3>
                                ),
                                h4: ({ children }) => (
                                    <h4 className="font-sans text-xl font-semibold mt-6 mb-3 leading-snug">
                                        {children}
                                    </h4>
                                ),
                                h5: ({ children }) => (
                                    <h5 className="font-sans text-lg font-semibold mt-5 mb-3 leading-snug">
                                        {children}
                                    </h5>
                                ),
                                h6: ({ children }) => (
                                    <h6 className="font-sans text-base font-semibold mt-4 mb-2 uppercase tracking-wider">
                                        {children}
                                    </h6>
                                ),
                                p: ({ children }) => (
                                    <p className="font-sans text-base leading-relaxed my-5 max-w-prose">
                                        {children}
                                    </p>
                                ),
                                strong: ({ children }) => (
                                    <strong className="font-semibold">
                                        {children}
                                    </strong>
                                ),
                                em: ({ children }) => (
                                    <em className="italic">{children}</em>
                                ),
                                a: ({ href, children }) => (
                                    <a
                                        href={href}
                                        className={`border-b border-current pb-0.5 font-medium transition-colors duration-200 ${
                                            isDark
                                                ? "text-blue-300 hover:text-blue-400"
                                                : "text-blue-600 hover:text-blue-800"
                                        }`}
                                        target={
                                            href.startsWith("http")
                                                ? "_blank"
                                                : "_self"
                                        }
                                        rel={
                                            href.startsWith("http")
                                                ? "noopener noreferrer"
                                                : ""
                                        }
                                    >
                                        {children}
                                    </a>
                                ),
                                ul: ({ children }) => (
                                    <ul className="list-disc pl-8 my-5 space-y-2">
                                        {children}
                                    </ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="list-decimal pl-8 my-5 space-y-2">
                                        {children}
                                    </ol>
                                ),
                                li: ({ children }) => (
                                    <li className="leading-relaxed text-base">
                                        {children}
                                    </li>
                                ),

                                table: ({ children }) => (
                                    <div className="overflow-x-auto">
                                        <table
                                            className={`border border-gray-400 bg-white w-full ${isDark ? "invert-[95%] text-black" : ""}`}
                                        >
                                            {children}
                                        </table>
                                    </div>
                                ),
                                thead: ({ children }) => (
                                    <thead className="bg-gray-200">
                                        {children}
                                    </thead>
                                ),
                                tbody: ({ children }) => (
                                    <tbody>{children}</tbody>
                                ),
                                tr: ({ children }) => (
                                    <tr className="border border-gray-300">
                                        {children}
                                    </tr>
                                ),
                                th: ({ children }) => (
                                    <th
                                        className={`border ${isDark ? "border-[#ddd]" : "border-gray-300"} px-4 py-2 bg-gray-100`}
                                    >
                                        {children}
                                    </th>
                                ),
                                td: ({ children }) => (
                                    <td className="border border-gray-300 px-4 py-2">
                                        {children}
                                    </td>
                                ),
                            }}
                            className="prose-base prose-p:my-4 prose-headings:font-semibold prose-a:text-blue-600
                        hover:prose-a:text-blue-800 prose-blockquote:border-l-4 prose-blockquote:pl-4
                        prose-blockquote:italic prose-blockquote:text-gray-600 prose-code:bg-gray-100
                        prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                </CardContent>
                <CardFooter className="bg-transparent h-[15vh]" />
            </Card>

            {/* create a seperate comp */}
            {!insidePost && activeImageId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        className={`relative bg-white text-black rounded-lg p-6 w-80`}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2"
                            onClick={() => setActiveImageId(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>

                        <h3 className="text-lg font-semibold mb-4">
                            Image Settings
                        </h3>

                        <div className="grid grid-cols-1 gap-6">
                            {/* Margin Top */}
                            <div className="space-y-2">
                                <Label>
                                    Margin Top:{" "}
                                    {
                                        imageSettingsRef.current[activeImageId]
                                            ?.marginTop
                                    }
                                    px
                                </Label>
                                <Slider
                                    value={[
                                        imageSettingsRef.current[activeImageId]
                                            ?.marginTop,
                                    ]}
                                    min={35}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) =>
                                        updateImageSetting(
                                            activeImageId,
                                            "marginTop",
                                            value[0],
                                        )
                                    }
                                />
                            </div>

                            {/* Margin Bottom */}
                            <div className="space-y-2">
                                <Label>
                                    Margin Bottom:{" "}
                                    {
                                        imageSettingsRef.current[activeImageId]
                                            ?.marginBottom
                                    }
                                    px
                                </Label>
                                <Slider
                                    value={[
                                        imageSettingsRef.current[activeImageId]
                                            ?.marginBottom,
                                    ]}
                                    min={35}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) =>
                                        updateImageSetting(
                                            activeImageId,
                                            "marginBottom",
                                            value[0],
                                        )
                                    }
                                />
                            </div>

                            {/* Max Height */}
                            <div className="space-y-2">
                                <Label>
                                    Max Height:{" "}
                                    {
                                        imageSettingsRef.current[activeImageId]
                                            ?.maxHeight
                                    }
                                    px
                                </Label>
                                <Slider
                                    value={[
                                        imageSettingsRef.current[activeImageId]
                                            ?.maxHeight,
                                    ]}
                                    min={360}
                                    max={800}
                                    step={10}
                                    onValueChange={(value) =>
                                        updateImageSetting(
                                            activeImageId,
                                            "maxHeight",
                                            value[0],
                                        )
                                    }
                                />
                            </div>

                            {/* Max Width */}
                            <div className="space-y-2">
                                <Label>
                                    Max Width:{" "}
                                    {
                                        imageSettingsRef.current[activeImageId]
                                            ?.maxWidth
                                    }
                                    px
                                </Label>
                                <Slider
                                    value={[
                                        imageSettingsRef.current[activeImageId]
                                            ?.maxWidth,
                                    ]}
                                    min={500}
                                    max={1000}
                                    step={10}
                                    onValueChange={(value) =>
                                        updateImageSetting(
                                            activeImageId,
                                            "maxWidth",
                                            value[0],
                                        )
                                    }
                                />
                            </div>

                            {/* Position */}
                            <div className="space-y-2">
                                <Label>Position</Label>
                                <RadioGroup
                                    value={
                                        imageSettingsRef.current[activeImageId]
                                            ?.alignment
                                    }
                                    onValueChange={(value) =>
                                        updateImageSetting(
                                            activeImageId,
                                            "alignment",
                                            value,
                                        )
                                    }
                                    className="flex space-x-4"
                                >
                                    {["flex-start", "center", "flex-end"].map(
                                        (position) => (
                                            <div
                                                className="flex items-center space-x-2"
                                                key={position}
                                            >
                                                <RadioGroupItem
                                                    value={position}
                                                    id={`${activeImageId}-${position}`}
                                                />
                                                <Label
                                                    htmlFor={`${activeImageId}-${position}`}
                                                >
                                                    {convertFlexAlignment(
                                                        position,
                                                    )}
                                                </Label>
                                            </div>
                                        ),
                                    )}
                                </RadioGroup>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

MarkdownPreview.propTypes = {
    title: PropTypes.any,
    content: PropTypes.any,
    isVisible: PropTypes.bool,
    isDark: PropTypes.bool,
    textAlignment: PropTypes.string,
    lightModeBg: PropTypes.string,
    insidePost: PropTypes.bool,
    darkBg: PropTypes.string,
};

/*
 *
 *
 *
 *
 */
export const ScrollToBottomButton = ({
    position = "fixed",
    bottom = "bottom-8",
    right = "right-4 md:right-8 lg:right-32",
    theme = "bg-white text-black border border-[#333]/30",
    rounded = "rounded-full",
    size = "p-4",
    isDark = false,
}) => {
    const scrollToBottom = () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
        });
    };

    return (
        <button
            onClick={scrollToBottom}
            className={`${position} ${bottom} ${right} ${theme} ${rounded} ${size} ${isDark ? "invert" : ""} shadow-lg cursor-pointer z-20`}
            aria-label="Scroll to bottom"
        >
            ↓
        </button>
    );
};
ScrollToBottomButton.propTypes = {
    position: PropTypes.string,
    bottom: PropTypes.string,
    right: PropTypes.string,
    theme: PropTypes.string,
    rounded: PropTypes.string,
    size: PropTypes.string,
    isDark: PropTypes.bool,
};

export const TagInputComponent = ({
    tags,
    setTags,
    MAX_TAGS = 4,
    MAX_TAG_LENGTH = 30,
}) => {
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");

    const validateTags = (tagArray) => {
        // Remove empty tags and trim whitespace
        const processedTags = tagArray
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);

        // Check for maximum number of tags
        if (processedTags.length > MAX_TAGS) {
            setError(`Maximum ${MAX_TAGS} tags allowed`);
            return false;
        }

        // Check for tag length
        for (const tag of processedTags) {
            if (tag.length > MAX_TAG_LENGTH) {
                setError(
                    `Tag "${tag}" exceeds maximum length of ${MAX_TAG_LENGTH} characters`,
                );
                return false;
            }

            // Check for spaces within tags
            if (tag.includes(" ")) {
                setError(`Tag "${tag}" contains spaces, which are not allowed`);
                return false;
            }
        }

        // Check for duplicates
        const uniqueTags = new Set(processedTags);
        if (uniqueTags.size !== processedTags.length) {
            // Find which tag is duplicated
            const seen = new Set();
            for (const tag of processedTags) {
                if (seen.has(tag)) {
                    setError(`Duplicate tag "${tag}" is not allowed`);
                    return false;
                }
                seen.add(tag);
            }
        }

        setError("");
        return processedTags;
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        const newTags = e.target.value.split(",");
        const validTags = validateTags(newTags);

        if (validTags) {
            setTags(validTags);
        }
    };

    return (
        <div className="p-2">
            <h2 className="mb-3">
                Add relevant tags for your article separated by comma. [up to{" "}
                {MAX_TAGS} tags]
            </h2>

            <div className="grid grid-cols-4 items-center gap-4">
                {/* <Label htmlFor="tags" className="text-left">
                    Tags:
                </Label> */}
                <Input
                    id="tags"
                    value={inputValue}
                    placeholder="Ex: history, physics, deeplearning"
                    className="col-span-4"
                    onChange={handleInputChange}
                />
            </div>

            {error && (
                <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="mb-6 mt-4 flex items-start justify-start flex-wrap gap-2">
                {tags.map((tag) => {
                    {
                        return (
                            tag !== "regular" && (
                                <span
                                    key={tag}
                                    className="px-2 py-1 rounded-full bg-black text-white text-sm"
                                >
                                    {tag}
                                </span>
                            )
                        );
                    }
                })}
            </div>
        </div>
    );
};

export const ThumbnailUploader = ({ artType = "article", maxSize = 5 }) => {
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailURL, setThumbnailURL] = useState("");
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const MAX_FILE_SIZE = maxSize * 1024 * 1024; // 5MB in bytes
    const ALLOWED_EXTENSIONS = ["png", "jpeg", "jpg", "webp"];

    const validateFile = (file) => {
        // Check if file exists
        if (!file) {
            setError("Please select a file");
            return false;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            setError(
                `File size exceeds maximum limit of 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
            );
            return false;
        }

        // Check file extension
        const extension = file.name.split(".").pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            setError(
                `Unsupported file format. Please upload ${ALLOWED_EXTENSIONS.join(", ")} files only`,
            );
            return false;
        }

        setError("");
        return true;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (validateFile(file)) {
            setThumbnail(file);
            const objectUrl = URL.createObjectURL(file);
            setThumbnailURL(objectUrl);
        } else {
            // Reset the input if validation fails
            e.target.value = "";
            setThumbnail(null);
            setThumbnailURL("");
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (validateFile(file)) {
            setThumbnail(file);
            const objectUrl = URL.createObjectURL(file);
            setThumbnailURL(objectUrl);

            // Update the file input for consistency
            if (fileInputRef.current) {
                // This is a workaround as we can't directly set the files property
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInputRef.current.files = dataTransfer.files;
            }
        }
    };

    const handleClickUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="p-2">
            <h2 className="mb-3">
                Add a suitable thumbnail for your {artType} to engage more
                readers.
            </h2>

            <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-4">
                    <Input
                        id="thumbnail"
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.webp"
                        onChange={handleFileChange}
                    />

                    <div
                        className={`w-full border-2 border-dashed rounded-md p-6 text-center ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleClickUpload}
                    >
                        {thumbnailURL ? (
                            <div className="flex flex-col items-center">
                                <img
                                    src={thumbnailURL}
                                    alt="Thumbnail preview"
                                    className="max-h-40 mb-2 rounded-md"
                                />
                                <p className="text-sm text-gray-500">
                                    {thumbnail?.name} (
                                    {(thumbnail?.size / (1024 * 1024)).toFixed(
                                        2,
                                    )}
                                    MB)
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Click or drag to replace
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center w-full">
                                <Upload className="h-12 w-12 text-gray-400 mb-2" />
                                <p className="text-sm font-medium">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG, JPEG or WebP (max. 5MB)
                                </p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </div>
    );
};

export const PublicPreferenceInput = ({ isPublic, setIsPublic }) => {
    return (
        <div className="p-2">
            <h2 className="mb-1">Publish publicly or keep private?</h2>
            <RadioGroup
                value={isPublic}
                onValueChange={setIsPublic}
                className="flex items-center gap-4"
            >
                <div className="flex items-center gap-2">
                    <RadioGroupItem value={true} id="public" />
                    <Label htmlFor="public">Public</Label>
                </div>
                <div className="flex items-center gap-2">
                    <RadioGroupItem value={false} id="private" />
                    <Label htmlFor="private">Private</Label>
                </div>
            </RadioGroup>
        </div>
    );
};

/*
    // Bottom Bar
    <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-sm text-gray-400">
                Last edited {new Date().toLocaleTimeString()}
            </div>
            <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-sm text-gray-600 hover:text-black transition-all duration-0"
            >
                {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            </button>
        </div>
    </div>
*/

export const rawText = `
<p style="font-size: 18px; line-height: 1.5;"><span style="float: left; font-size: 3em; font-weight: bold; line-height: 1; margin-right: 8px;">M</span>arkdown is a lightweight markup language with plain text formatting syntax. This tutorial covers both the basics and some advanced features of Markdown.</p>

<br /><br />

## Table of Contents

- [Introduction](#introduction)
- [Headers](#headers)
- [Text Formatting](#text-formatting)
- [Lists](#lists)
    - [Unordered Lists](#unordered-lists)
    - [Ordered Lists](#ordered-lists)
- [Links and Images](#links-and-images)
- [Code Blocks and Inline Code](#code-blocks-and-inline-code)
- [Blockquotes](#blockquotes)
- [Tables](#tables)
- [Footnotes](#footnotes)
- [Task Lists](#task-lists)
- [Conclusion](#conclusion)

<br /><br />

## Introduction

Markdown allows you to write using an easy-to-read, easy-to-write plain text format that can be converted into HTML and other formats. It’s perfect for writing documentation, notes, and even web content.

<br /><br />

## Headers

Headers are created using the \`#\` symbol. The number of \`#\` symbols indicates the header level.

### Example:

\`\`\`markdown
# heading 1.

## heading 2.

### heading 3.

#### heading 4.

##### heading 5.

###### heading 6.
\`\`\`

# heading 1.

## heading 2.

### heading 3.

#### heading 4.

##### heading 5.

###### heading 6.

<br /><br />

## Text Formatting

You can add emphasis to text using asterisks \`*\` or underscores \`_\`.

- **Bold**: Use \`**Bold Text**\` or \`__Bold Text__\`
- _Italic_: Use \`*Italic Text*\` or \`_Italic Text_\`
- **_Bold and Italic_**: Use \`***Bold and Italic***\` or \`___Bold and Italic___\`
- ~~Strikethrough~~: Use \`~~Strikethrough~~\`

### Example:

\`\`\`markdown
**This text is bold**

_This text is italic_

**_This text is both bold and italic_**

~~This text has a strikethrough~~
\`\`\`

<br /><br />

## Lists

### Unordered Lists

Create unordered lists using dashes \`-\`, asterisks \`*\`, or plus signs \`+\`.

\`\`\`markdown
- Item 1
- Item 2
    - Subitem 2.1
    - Subitem 2.2
- Item 3
\`\`\`

### Ordered Lists

Create ordered lists by starting lines with numbers followed by a period.

\`\`\`markdown
1. First item
2. Second item
    1. Subitem 2.1
    2. Subitem 2.2
3. Third item
\`\`\`

<br /><br />

## Links and Images

### Links

To create a link, wrap the link text in square brackets and the URL in parentheses.

\`\`\`markdown
[Visit](https://www.example.com)
\`\`\`

### Images

Images are inserted similarly to links but start with an exclamation mark \`!\`.

\`\`\`markdown
![A descriptive alt text](https://www.example.com/image.jpg)
\`\`\`

<br /><br />

## Code Blocks and Inline Code

### Inline Code

Wrap inline code in single backticks \`\` \` \`\`.

\`\`\`markdown
Here is some inline code: \`print("Hello, World!")\`
\`\`\`

### Code Blocks

For longer sections of code, use triple backticks or indent with four spaces. You can also specify the language for syntax highlighting.

\`\`\`python
def hello_world():
    print("Hello, World!")

hello_world()
\`\`\`

<br /><br />

## Blockquotes

Blockquotes are created by starting a line with the \`>\` symbol.

\`\`\`markdown
> This is a blockquote.
>
> It can span multiple lines.
\`\`\`

> This is a blockquote.
>
> It can span multiple lines.

<br /><br />

## Tables

Tables can be created using pipes \`|\` to separate columns and hyphens \`-\` to create the header row.

| Column 1 | Column 2 | Column 3 |
| -------- | -------- | -------- |
| Row 1    | Data 1   | Data 2   |
| Row 2    | Data 3   | Data 4   |

<br /><br />

## Footnotes

Some Markdown processors support footnotes for adding extra context.

\`\`\`markdown
Here is a statement that needs a footnote.[^1]

[^1]: This is the footnote providing extra information.
\`\`\`

Here is a statement that needs a footnote.[^1]

[^1]: This is the footnote providing extra information.

<br /><br />

## Task Lists

Task lists are useful for to-do lists or tracking progress. Use \`- [ ]\` for unchecked items and \`- [x]\` for checked items.

\`\`\`markdown
- [ ] Task 1
- [x] Task 2 (completed)
- [ ] Task 3
\`\`\`

- [ ] Task 1
- [x] Task 2 (completed)
- [ ] Task 3

<br /><br />

## Additionals

use \`<br />\` or if you want to add space between paragraphs, use can use many of them for more space

use \`---\` to add a line

<br /><br />

## Conclusion

This tutorial has covered a variety of Markdown features from headers to tables, code blocks, and more. Experiment with these elements to get comfortable with Markdown and enhance your documents.

Happy writing!
`;
