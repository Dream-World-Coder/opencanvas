import { useRef, useState, memo } from "react";
import {
    X,
    Bold,
    Code,
    Link,
    List,
    Minus,
    Quote,
    Image,
    Italic,
    Upload,
    Heading,
    FilePlus,
    FileJson,
    Underline,
    LetterText,
    Highlighter,
    Strikethrough,
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
import { toast } from "sonner";
import {
    uploadImage,
    validateFile,
} from "../../../services/imageUploadService";

// ***************************************************
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
    oneLight,
    atomDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";

export const getSchemaData = (title) => {
    return {
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
};

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
export const ImageUploadButton = ({ onImageInsert, sizing, setMedia }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [error, setError] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setError(null);

            // preview URL & preview state
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            setIsUploading(true);

            const { directLink, imgDeleteHash } = await uploadImage(file);
            onImageInsert(`![image](${directLink})`);
            setMedia((prev) => [...prev, imgDeleteHash]);

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
                        " hover:bg-gray-200 md:rounded-lg transition-all duration-0"
                    }
                >
                    <Image className="size-4" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Insert Image</DialogTitle>
                    <DialogDescription>
                        Upload an image (JPG, JPEG or PNG, max 10MB)
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{`${error}`}</AlertDescription>
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
    setMedia: PropTypes.func,
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
                        <AlertDescription>{error.toString()}</AlertDescription>
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
export const MarkdownPreview = memo(function MarkdownPreview({
    title,
    content,
    thumbnailUrl = null,
    isVisible = true,
    isDark = false,
    textAlignment = "left",
    lightModeBg = "bg-white",
    insidePost = false,
    darkBg = "bg-[#222]",
    contentOnly = false,
    artType = "written",
}) {
    //useref to store settings for all images individually
    const imageSettingsRef = useRef({});

    //to track which image's settings are being edited
    const [activeImageId, setActiveImageId] = useState(null);

    // force re-render when settings change
    const [, forceUpdate] = useState({});

    //get the default settings for an image or use existing settings
    const getImageSettings = (imageId) => {
        if (!imageSettingsRef.current[imageId]) {
            imageSettingsRef.current[imageId] = {
                maxWidth: 468,
                maxHeight: 468,
                alignment: "center",
                marginTop: 35,
                marginBottom: 35,
            };
        }
        return imageSettingsRef.current[imageId];
    };

    //update a specific setting for an image
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
                    <div
                        id="export"
                        className="prose prose-slate max-w-none montserrat-regular"
                    >
                        {/* title */}
                        {title && (
                            <div
                                className={`pt-2 mb-10 leading-tight tracking-tight capitalize ${
                                    contentOnly
                                        ? "text-xl font-semibold font-sans"
                                        : "text-4xl font-bold font-serif"
                                }
                                ${artType === "poem" ? "!max-w-[600px] !font-boskaBold" : ""}`}
                            >
                                {title}
                                {!contentOnly && (
                                    <>
                                        <hr
                                            className={`mt-6 mb-px border-t ${isDark ? "border-oneDarkBorder" : "border-gray-200"}`}
                                        />
                                        <hr
                                            className={`mb-6 border-t ${isDark ? "border-oneDarkBorder" : "border-gray-200"}`}
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {/* thumbnail */}
                        {thumbnailUrl && !contentOnly && (
                            <div
                                className="relative mb-8 w-full md:w-[110%] md:transform md:translate-x-[-5%] max-h-[370px] __bg-gray-200 __dark:bg-[#333]
                                rounded-lg overflow-hidden shadow-none border border-gray-200 dark:border-[#333] flex items-center justify-center"
                                // style={{
                                //     background: `url(${thumbnailUrl}) center/cover no-repeat`,
                                // }}
                            >
                                <img
                                    src={thumbnailUrl}
                                    alt={title || "Article thumbnail"}
                                    className="object-cover aspect-video"
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
                                                className={`relative object-contain`}
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
                                            className={`my-6 border-t ${isDark ? "border-oneDarkBorder" : "border-gray-200"}`}
                                            {...props}
                                        />
                                    );
                                },

                                code({
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
                                            className={`relative my-4 overflow-hidden rounded-sm flex flex-col
                                            ${
                                                isDark
                                                    ? "bg-[#171717]"
                                                    : "bg-[#e8eae6]"
                                            }`}
                                        >
                                            {/* codeHeader */}
                                            <div
                                                className={`flex items-center justify-between px-6 pt-2 ${
                                                    isDark
                                                        ? "bg-[#171717]"
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

                                            {/* code card */}
                                            <div className="rounded-sm overflow-hidden border-none">
                                                <SyntaxHighlighter
                                                    style={
                                                        isDark
                                                            ? atomDark
                                                            : oneLight
                                                    }
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
                                            ${isDark ? "text-oneDarkTagClr bg-oneDarkTagClr/10" : "bg-gray-200"}`}
                                        >
                                            {/* ${isDark ? "text-[#ffd085] bg-[#ffd085]/10" : "bg-gray-200"}`} */}
                                            {children}
                                        </code>
                                    );
                                },

                                blockquote({ children }) {
                                    return (
                                        <blockquote
                                            className={`border-l-4 px-4 py-1 my-4 italic
                                                ${isDark ? "border-[#999] bg-[#999]/0 text-[#ddd]" : "border-gray-400 bg-gray-100/0 text-gray-700"}`}
                                        >
                                            {children}
                                        </blockquote>
                                    );
                                },

                                h1: ({ children }) => (
                                    <h1
                                        id={
                                            children
                                                .toString()
                                                .toLowerCase()
                                                .replace(/[^a-z0-9\s-]/g, "") // remove special chars except space and hyphen
                                                .replace(/\s+/g, "-") // replace spaces/tabs with hyphens
                                                .replace(/-+/g, "-") // collapse multiple hyphens
                                                .replace(/^-|-$/g, "") // trim hyphens from start/end
                                        }
                                        className={`mt-12 mb-6 leading-tight tracking-tight ${
                                            contentOnly
                                                ? "text-xl font-semibold font-sans"
                                                : "text-4xl font-bold font-serif"
                                        }`}
                                    >
                                        {children}
                                    </h1>
                                ),
                                h2: ({ children }) => (
                                    <h2
                                        id={children
                                            .toString()
                                            .toLowerCase()
                                            .replace(/[^a-z0-9\s-]/g, "")
                                            .replace(/\s+/g, "-")
                                            .replace(/-+/g, "-")
                                            .replace(/^-|-$/g, "")}
                                        className={`font-serif mt-10 mb-5 leading-tight tracking-tight ${
                                            contentOnly
                                                ? "text-lg"
                                                : "text-3xl font-bold"
                                        }`}
                                    >
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }) => (
                                    <h3
                                        id={children
                                            .toString()
                                            .toLowerCase()
                                            .replace(/[^a-z0-9\s-]/g, "")
                                            .replace(/\s+/g, "-")
                                            .replace(/-+/g, "-")
                                            .replace(/^-|-$/g, "")}
                                        className={`font-serif mt-8 mb-4 leading-snug ${
                                            contentOnly
                                                ? "text-base"
                                                : "text-2xl font-bold"
                                        }`}
                                    >
                                        {children}
                                    </h3>
                                ),
                                h4: ({ children }) => (
                                    <h4
                                        id={children
                                            .toString()
                                            .toLowerCase()
                                            .replace(/[^a-z0-9\s-]/g, "")
                                            .replace(/\s+/g, "-")
                                            .replace(/-+/g, "-")
                                            .replace(/^-|-$/g, "")}
                                        className={`montserrat-regular font-semibold mt-6 mb-3 leading-snug ${
                                            contentOnly ? "text-sm" : "text-xl"
                                        }`}
                                    >
                                        {children}
                                    </h4>
                                ),
                                h5: ({ children }) => (
                                    <h5
                                        className={`montserrat-regular font-semibold mt-5 mb-3 leading-snug ${
                                            contentOnly ? "text-sm" : "text-lg"
                                        }`}
                                    >
                                        {children}
                                    </h5>
                                ),
                                h6: ({ children }) => (
                                    <h6
                                        className={`montserrat-regular font-semibold mt-4 mb-2 uppercase tracking-wider ${
                                            contentOnly
                                                ? "text-sm"
                                                : "text-base"
                                        }`}
                                    >
                                        {children}
                                    </h6>
                                ),

                                p: ({ children }) => (
                                    <p
                                        className={`my-8 max-w-prose
                                            ${contentOnly ? "text-xs leading-relaxed" : "text-base md:text-lg md:leading-[28px]"}
                                            ${artType === "poem" ? "!font-boskaLight !text-xl !leading-[32px] !my-0" : ""}`}
                                    >
                                        {/* initially it was : leading-[40px] */}
                                        {children}
                                    </p>
                                ),

                                strong: ({ children }) => (
                                    <strong
                                        className={`font-semibold montserrat-bold`}
                                    >
                                        {children}
                                    </strong>
                                ),

                                em: ({ children }) => (
                                    <em
                                        className={`italic ${artType === "poem" ? "font-boska" : "font-boska"}`}
                                    >
                                        {children}
                                    </em>
                                ),

                                a: ({ href, children }) => (
                                    <a
                                        href={href}
                                        className={`border-b border-current pb-0.5 font-medium montserrat-regular transition-colors duration-200 ${
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
                                    <ul className="montserrat-regular list-disc pl-6 md:pl-8 my-5 space-y-2">
                                        {children}
                                    </ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="montserrat-regular list-decimal pl-6 md:pl-8 my-5 space-y-2">
                                        {children}
                                    </ol>
                                ),
                                li: ({ children }) => (
                                    <li className="montserrat-regular leading-relaxed text-base md:text-lg">
                                        {children}
                                    </li>
                                ),

                                table: ({ children }) => (
                                    <div className="overflow-x-auto">
                                        <table
                                            className={`border border-gray-400 dark:border-[#3e4451] bg-white dark:bg-[#282c34] w-full text-gray-900 dark:text-[#abb2bf]`}
                                        >
                                            {children}
                                        </table>
                                    </div>
                                ),
                                thead: ({ children }) => (
                                    <thead className="bg-gray-200 dark:bg-[#21252b]">
                                        {children}
                                    </thead>
                                ),
                                tbody: ({ children }) => (
                                    <tbody className="dark:bg-[#282c34]">
                                        {children}
                                    </tbody>
                                ),
                                tr: ({ children }) => (
                                    <tr className="border border-gray-300 dark:border-[#3e4451]">
                                        {children}
                                    </tr>
                                ),
                                th: ({ children }) => (
                                    <th
                                        className={`border ${contentOnly ? "text-xs" : "montserrat-bold"} border-gray-300 dark:border-[#3e4451] px-4 py-2 bg-gray-100 dark:bg-[#21252b]`}
                                    >
                                        {children}
                                    </th>
                                ),
                                td: ({ children }) => (
                                    <td
                                        className={`border border-gray-300 dark:border-[#3e4451] px-4 py-2 dark:bg-[#282c34] ${contentOnly ? "text-xs" : "montserrat-regular"}`}
                                    >
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
});

MarkdownPreview.propTypes = {
    title: PropTypes.any,
    content: PropTypes.any,
    thumbnailUrl: PropTypes.any,
    isVisible: PropTypes.bool,
    contentOnly: PropTypes.bool,
    isDark: PropTypes.bool,
    textAlignment: PropTypes.string,
    lightModeBg: PropTypes.string,
    insidePost: PropTypes.bool,
    darkBg: PropTypes.string,
    artType: PropTypes.string,
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
    MAX_TAGS = 5,
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
                    placeholder="Ex: cs, deeplearning, physics"
                    className="col-span-4"
                    onChange={handleInputChange}
                />
            </div>

            {error && (
                <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{error.toString()}</AlertDescription>
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
TagInputComponent.propTypes = {
    tags: PropTypes.array,
    setTags: PropTypes.func,
    MAX_TAGS: PropTypes.number,
    MAX_TAG_LENGTH: PropTypes.number,
};

export const ThumbnailUploader = ({
    artType = "article",
    setThumbnailUrl,
    setMedia,
}) => {
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];

        try {
            setError("");
            setLoading(true);
            await validateFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            const { directLink, imgDeleteHash } = await uploadImage(file);
            setThumbnailUrl(directLink);
            setMedia((prev) => [...prev, imgDeleteHash]);
        } catch (err) {
            setError(err);
            e.target.value = "";
            setThumbnailUrl("");
            console.error(`Thumbnail image upload error: ${err}`);
            toast.error(`Thumbnail image upload error: ${err}`);
        } finally {
            setLoading(false);
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

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        try {
            setError("");
            setLoading(true);
            await validateFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            const { directLink, imgDeleteHash } = await uploadImage(file);
            setThumbnailUrl(directLink);
            setMedia((prev) => [...prev, imgDeleteHash]);

            // Update the file input for consistency
            if (fileInputRef.current) {
                // This is a workaround as we can't directly set the files property
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInputRef.current.files = dataTransfer.files;
            }
        } catch (err) {
            setError(err);
            console.error(`Thumbnail image upload error: ${err}`);
            toast.error(`Thumbnail image upload error: ${err}`);
        } finally {
            setLoading(false);
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
                        accept=".png,.jpg,.jpeg,"
                        onChange={handleFileChange}
                    />

                    <div
                        className={`relative w-full border-2 border-dashed rounded-md p-6 text-center ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleClickUpload}
                    >
                        {preview ? (
                            <div className="flex flex-col items-center">
                                <img
                                    src={preview}
                                    alt="Thumbnail preview"
                                    className="max-h-40 mb-2 rounded-md"
                                />
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
                                    PNG, JPG or JPEG (max. 10MB)
                                </p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{`${error}`}</AlertDescription>
                        </Alert>
                    )}

                    {loading && (
                        <div className="absolute top-0 left-0 grid place-items-center z-20 size-full bg-gray-200/60 dark:bg-[#222]/60 pointer-events-none">
                            <div className="w-10 h-10 border-4 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
ThumbnailUploader.propTypes = {
    artType: PropTypes.string,
    setThumbnailUrl: PropTypes.func,
    setMedia: PropTypes.func,
};

export const PublicPreferenceInput = ({ isPublic, setIsPublic }) => {
    // rename it to SetPublicVisibility
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
PublicPreferenceInput.propTypes = {
    setIsPublic: PropTypes.func,
    isPublic: PropTypes.bool,
};

export function findAndReplace(content, setContent, toast) {
    try {
        const searchTerm = prompt("Enter text to find:");
        if (!searchTerm) return;

        const replaceTerm = prompt("Enter replacement text:");
        if (replaceTerm === null) return;

        // Escape special regex characters in the search term
        const escapedSearchTerm = searchTerm.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
        );

        // Replace all occurrences in content
        const regex = new RegExp(escapedSearchTerm, "g");
        const newContent = content.replace(regex, replaceTerm);

        // Update content state
        setContent(newContent);

        // Count occurrences for the message
        const occurrences = (content.match(regex) || []).length;
        toast.success(
            `Replaced ${occurrences} occurrence${occurrences !== 1 ? "s" : ""} of "${searchTerm}"`,
        );
    } catch (error) {
        toast.error("Error during find & replace");
        console.error(error);
    }
}

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
