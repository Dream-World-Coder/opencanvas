import { useRef, useState, useMemo, useEffect } from "react";
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
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    ChevronLeft,
    ChevronRight,
    Search,
    FileJson,
    LetterText,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

// ***************************************************
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";

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

const sliderOptions = [
    {
        id: "marginTop",
        label: "Margin Top",
        min: 0,
        max: 100,
        step: 1,
    },
    {
        id: "marginBottom",
        label: "Margin Bottom",
        min: 0,
        max: 100,
        step: 1,
    },
    {
        id: "maxHeight",
        label: "Max Height",
        min: 100,
        max: 800,
        step: 10,
    },
    {
        id: "maxWidth",
        label: "Max Width",
        min: 100,
        max: 1000,
        step: 10,
    },
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

// Custom hook to handle image popup functionality
export const useImagePopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [imageSettings, setImageSettings] = useState({
        marginTop: 35,
        marginBottom: 35,
        position: "left", // 'left', 'center', 'right'
        maxHeight: 360,
        maxWidth: 500,
    });

    // Update a specific setting with instant application
    const updateSetting = (key, value, setters) => {
        setImageSettings((prev) => {
            const newSettings = { ...prev, [key]: value };

            // Apply changes instantly
            if (setters) {
                if (key === "maxWidth" && setters.setImgMaxWidth) {
                    setters.setImgMaxWidth(`${value}px`);
                }
                if (key === "maxHeight" && setters.setImgMaxHeight) {
                    setters.setImgMaxHeight(`${value}px`);
                }
                if (key === "position" && setters.setImgAlignment) {
                    setters.setImgAlignment(value);
                }
                if (key === "marginTop" && setters.setMTop) {
                    setters.setMTop(`${value}px`);
                }
                if (key === "marginBottom" && setters.setMBottom) {
                    setters.setMBottom(`${value}px`);
                }
            }

            return newSettings;
        });
    };

    useEffect(() => {
        // Function to handle click on markdown image containers
        const handleImageClick = (e) => {
            const container = e.target.closest(".markdown-image-container-div");
            if (container) {
                const image = container.querySelector("img");
                if (image) {
                    setCurrentImage({
                        src: image.src,
                        alt: image.alt,
                    });
                    setIsOpen(true);
                }
            }
        };

        // Add event listener
        document.addEventListener("click", handleImageClick);

        // Cleanup
        return () => {
            document.removeEventListener("click", handleImageClick);
        };
    }, []);

    return {
        isOpen,
        setIsOpen,
        currentImage,
        imageSettings,
        updateSetting,
    };
};

// Image Popup Component
export const ImagePopup = ({
    setImgMaxWidth,
    setImgMaxHeight,
    setImgAlignment,
    setMTop,
    setMBottom,
}) => {
    const { isOpen, setIsOpen, currentImage, imageSettings, updateSetting } =
        useImagePopup();

    // Group all setters in one object for easy access
    const setters = {
        setImgMaxWidth,
        setImgMaxHeight,
        setImgAlignment,
        setMTop,
        setMBottom,
    };

    if (!currentImage) return null;

    // Get position class based on setting
    const getPositionClass = () => {
        switch (imageSettings.position) {
            case "left":
                return "justify-start";
            case "right":
                return "justify-end";
            default:
                return "justify-center";
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="right" className="max-w-sm">
                <SheetHeader>
                    <SheetTitle className="text-lg font-semibold mb-6">
                        Image Properties
                    </SheetTitle>
                </SheetHeader>
                <div className="">
                    {/* Image Preview */}
                    <div
                        className="flex items-center justify-center overflow-hidden border border-gray-200 rounded"
                        style={{
                            marginTop: "35px",
                            marginBottom: "35px",
                        }}
                    >
                        <img
                            src={currentImage.src}
                            alt={currentImage.alt || "Preview"}
                            style={{
                                maxHeight: "135px",
                                maxWidth: "240px",
                            }}
                            className="object-cover"
                        />
                    </div>
                    {/* Settings Controls */}
                    <div className="grid grid-cols-1 gap-6 mt-6">
                        {/* Sliders */}
                        {sliderOptions.map((setting) => (
                            <div className="space-y-2" key={setting.id}>
                                <Label>
                                    {setting.label}: {imageSettings[setting.id]}
                                    px
                                </Label>
                                <Slider
                                    value={[imageSettings[setting.id]]}
                                    min={setting.min}
                                    max={setting.max}
                                    step={setting.step}
                                    onValueChange={(value) =>
                                        updateSetting(
                                            setting.id,
                                            value[0],
                                            setters,
                                        )
                                    }
                                />
                            </div>
                        ))}
                        {/* Position */}
                        <div className="space-y-2">
                            <Label>Position</Label>
                            <RadioGroup
                                value={imageSettings.position}
                                onValueChange={(value) =>
                                    updateSetting("position", value, setters)
                                }
                                className="flex space-x-4"
                            >
                                {["left", "center", "right"].map((position) => (
                                    <div
                                        className="flex items-center space-x-2"
                                        key={position}
                                    >
                                        <RadioGroupItem
                                            value={position}
                                            id={position}
                                        />
                                        <Label htmlFor={position}>
                                            {position.charAt(0).toUpperCase() +
                                                position.slice(1)}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

ImagePopup.propTypes = {
    setImgMaxWidth: PropTypes.func.isRequired,
    setImgMaxHeight: PropTypes.func.isRequired,
    setImgAlignment: PropTypes.func.isRequired,
    setMTop: PropTypes.func.isRequired,
    setMBottom: PropTypes.func.isRequired,
};

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
    isVisible = true,
    isDark = false,
    textAlignment = "left",
    lightModeBg = "bg-white",
}) => {
    const [imgMaxWidth, setImgMaxWidth] = useState("500px");
    const [imgMaxHeight, setImgMaxHeight] = useState("360px");
    const [imgAlignment, setImgAlignment] = useState("justify-center");
    const [mTop, setMTop] = useState("35px");
    const [mBottom, setMBottom] = useState("35px");

    if (!isVisible) return null;

    return (
        <Card
            className={`w-full max-w-4xl mx-auto bg-white border-none shadow-none
                ${isDark ? "bg-[#222] text-white border-none" : lightModeBg}
                ${textAlignment === "center" ? "text-center" : "text-left"}`}
        >
            <CardContent className="p-0">
                <div id="export" className="prose prose-slate max-w-none">
                    {/* Title Rendering */}
                    {title && (
                        <div
                            className={`mb-6 border-b pb-4 text-4xl font-bold ${isDark ? "border-[#444]" : "border-gray-300"}`}
                        >
                            {title}
                        </div>
                    )}

                    {/* Markdown Content */}
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                        rehypePlugins={[rehypeRaw, rehypeKatex]}
                        components={{
                            img(props) {
                                const { node, ...rest } = props;
                                return (
                                    <div
                                        className={`markdown-image-container-div relative cursor-pointer z-15 overflow-hidden
                                        flex items-center`}
                                        style={{
                                            justifyContent: imgAlignment,
                                            marginTop: mTop,
                                            marginBottom: mBottom,
                                        }}
                                    >
                                        <img
                                            className={`relative object-cover`}
                                            style={{
                                                maxHeight: imgMaxHeight,
                                                maxWidth: imgMaxWidth,
                                            }}
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
                                                style={prism}
                                                language={match[1]}
                                                PreTag="div"
                                                wrapLongLines
                                                codeTagProps={{
                                                    style: {
                                                        fontSize: "0.875rem",
                                                        lineHeight: "1.25rem",
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
                                        className={`border-l-4 px-4 py-3 my-4 italic rounded-md shadow
                                                ${isDark ? "border-[#999] bg-[#999]/10 text-[#ddd]" : "border-gray-400 bg-gray-100 text-gray-700"}
                                              `}
                                        // className={`border-l-4 pl-4 italic ${isDark ? "border-[#888] text-[#999]" : "border-gray-500 text-gray-600"}`}
                                    >
                                        {children}
                                    </blockquote>
                                );
                            },
                            h1: ({ children }) => (
                                <h1 className="text-4xl font-bold mt-6">
                                    {children}
                                </h1>
                            ),
                            h2: ({ children }) => (
                                <h2 className="text-3xl font-semibold mt-5">
                                    {children}
                                </h2>
                            ),
                            h3: ({ children }) => (
                                <h3 className="text-2xl font-semibold mt-4">
                                    {children}
                                </h3>
                            ),
                            h4: ({ children }) => (
                                <h4 className="text-xl font-semibold mt-3">
                                    {children}
                                </h4>
                            ),
                            h5: ({ children }) => (
                                <h5 className="text-lg font-semibold mt-2">
                                    {children}
                                </h5>
                            ),
                            h6: ({ children }) => (
                                <h6 className="text-base font-semibold mt-2">
                                    {children}
                                </h6>
                            ),
                            p: ({ children }) => (
                                <p className="text-base my-2">{children}</p>
                            ),
                            a: ({ href, children }) => (
                                <a
                                    href={href}
                                    className={`underline ${isDark ? "text-blue-300 hover:text-blue-500" : "text-blue-600 hover:text-blue-800"}`}
                                >
                                    {children}
                                </a>
                            ),
                            ul: ({ children }) => (
                                <ul className="list-disc list-inside my-2">
                                    {children}
                                </ul>
                            ),
                            ol: ({ children }) => (
                                <ol className="list-decimal list-inside my-2">
                                    {children}
                                </ol>
                            ),
                            li: ({ children }) => (
                                <li className="ml-5">{children}</li>
                            ),
                            table: ({ children }) => (
                                <div className="overflow-x-auto">
                                    <table
                                        className={`border border-gray-400 bg-white dark:bg-gray-800 w-full ${isDark ? "invert-[95%] text-black" : ""}`}
                                    >
                                        {children}
                                    </table>
                                </div>
                            ),
                            thead: ({ children }) => (
                                <thead className="bg-gray-200 dark:bg-gray-700">
                                    {children}
                                </thead>
                            ),
                            tbody: ({ children }) => <tbody>{children}</tbody>,
                            tr: ({ children }) => (
                                <tr className="border border-gray-300 dark:border-gray-600">
                                    {children}
                                </tr>
                            ),
                            th: ({ children }) => (
                                <th className="border border-gray-400 px-4 py-2 bg-gray-100 dark:bg-gray-600">
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

            <ImagePopup
                setImgMaxWidth={setImgMaxWidth}
                setImgMaxHeight={setImgMaxHeight}
                setImgAlignment={setImgAlignment}
                setMTop={setMTop}
                setMBottom={setMBottom}
            />
        </Card>
    );
};

MarkdownPreview.propTypes = {
    title: PropTypes.any,
    content: PropTypes.any,
    isVisible: PropTypes.bool,
    isDark: PropTypes.bool,
    textAlignment: PropTypes.string,
    lightModeBg: PropTypes.string,
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

export const TableComp = ({
    data,
    columns,
    pageSize = 10,
    searchable = true,
    sortable = true,
}) => {
    /*
    const columns = [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        {
            key: "status",
            label: "Status",
            // Custom renderer example
            render: (value, row) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${
                        value === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }`}
                >
                    {value}
                </span>
            ),
        },
    ];

    const data = [
        { name: "John Doe", email: "john@example.com", status: "active" },
        { name: "Jane Smith", email: "jane@example.com", status: "inactive" },
        // ... more data
    ];
    */
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: null,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPageSize, setCurrentPageSize] = useState(pageSize);

    // Sort function
    const sortData = (data, sortConfig) => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            return sortConfig.direction === "asc" ? comparison : -comparison;
        });
    };

    // Filter function
    const filterData = (data, searchTerm) => {
        if (!searchTerm) return data;

        return data.filter((item) =>
            Object.values(item).some((value) =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        );
    };

    // Memoized data processing
    const processedData = useMemo(() => {
        let result = [...data];
        result = filterData(result, searchTerm);
        result = sortData(result, sortConfig);
        return result;
    }, [data, searchTerm, sortConfig]);

    // Pagination calculations
    const totalPages = Math.ceil(processedData.length / currentPageSize);
    const startIndex = (currentPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    const currentData = processedData.slice(startIndex, endIndex);

    // Sort handler
    const handleSort = (key) => {
        setSortConfig((prevConfig) => ({
            key,
            direction:
                prevConfig.key === key && prevConfig.direction === "asc"
                    ? "desc"
                    : "asc",
        }));
    };

    // Render sort icon
    const renderSortIcon = (columnKey) => {
        if (!sortable) return null;
        if (sortConfig.key !== columnKey)
            return <ChevronsUpDown className="size-4" />;
        return sortConfig.direction === "asc" ? (
            <ChevronUp className="size-4" />
        ) : (
            <ChevronDown className="size-4" />
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                {searchable && (
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 size-4 text-gray-500" />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                )}
                <Select
                    value={String(currentPageSize)}
                    onValueChange={(value) => {
                        setCurrentPageSize(Number(value));
                        setCurrentPage(1);
                    }}
                >
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {[5, 10, 20, 50].map((size) => (
                            <SelectItem key={size} value={String(size)}>
                                {size} per page
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-4 py-3 text-left font-medium text-gray-500"
                                >
                                    <div
                                        className={`flex items-center space-x-1 ${
                                            sortable ? "cursor-pointer" : ""
                                        }`}
                                        onClick={() =>
                                            sortable && handleSort(column.key)
                                        }
                                    >
                                        <span>{column.label}</span>
                                        {renderSortIcon(column.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {currentData.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className="px-4 py-3 text-gray-900"
                                    >
                                        {column.render
                                            ? column.render(
                                                  row[column.key],
                                                  row,
                                              )
                                            : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, processedData.length)} of{" "}
                    {processedData.length} results
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <div className="text-sm">
                        Page {currentPage} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages),
                            )
                        }
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

TableComp.propTypes = {
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    pageSize: PropTypes.number,
    searchable: PropTypes.bool,
    sortable: PropTypes.bool,
};

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
