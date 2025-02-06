import React, { useRef, useState } from "react";
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
} from "lucide-react";
import PropTypes from "prop-types";
//
import { Card, CardContent } from "@/components/ui/card";
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
//
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
    { format: "highlight", icon: Highlighter },
    { format: "pageBreak", icon: FilePlus },
    { format: "quote", icon: Quote },
    { format: "code", icon: Code },
    // { format: "link", icon: Link },
    // { format: "list", icon: List },
    // { format: "heading", icon: Heading },
    // { format: "line", icon: Minus },
    // { format: "handleImageInset", icon: Image },
];

/**
 *
 *
 *
 *
 *
 *
 */
export const ImageUploadButton = ({ onImageInsert }) => {
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
                <Button
                    variant="ghost"
                    size="icon"
                    className="p-1 md:p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    <Image className="size-3 md:size-4" />
                </Button>
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
};

/**
 *
 *
 *
 *
 */
export const LinkInsertButton = ({ onLinkInsert }) => {
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
                <Button
                    variant="ghost"
                    size="icon"
                    className="p-1 md:p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    <Link className="size-3 md:size-4" />
                </Button>
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
};
/**
 *
 *
 *
 *
 *
 *
 */
export const MarkdownPreview = ({ title, content, isVisible = true }) => {
    if (!isVisible) return null;

    return (
        <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg">
            <CardContent className="p-6">
                <div id="export" className="prose prose-slate max-w-none">
                    {/* Title Rendering */}
                    {title && (
                        <div className="mb-6 border-b pb-4 text-4xl font-bold">
                            {title}
                        </div>
                    )}

                    {/* Markdown Content */}
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                        rehypePlugins={[rehypeRaw, rehypeKatex]}
                        components={{
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
                                return !inline && match ? (
                                    <SyntaxHighlighter
                                        style={prism}
                                        language={match[1]}
                                        PreTag="div"
                                        // showLineNumbers
                                        wrapLongLines
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code
                                        className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono"
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                );
                            },
                            blockquote({ children }) {
                                return (
                                    <blockquote className="border-l-4 border-gray-500 pl-4 italic text-gray-600">
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
                                    className="text-blue-600 hover:text-blue-800 underline"
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
                                    <table className="border border-gray-400 bg-white dark:bg-gray-800 w-full">
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
        </Card>
    );
};

MarkdownPreview.propTypes = {
    title: PropTypes.any,
    content: PropTypes.any,
    isVisible: PropTypes.bool,
};

/*
 *
 *
 *
 *
 */
/*
// Bottom Bar
<div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm border-t border-gray-100">
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
*/
