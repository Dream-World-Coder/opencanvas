import React, { useRef } from "react";
import { Image } from "lucide-react";
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
//
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";

// const Gap = ({ size = "10px" }) => (
//     <div style={{ position: "relative", height: size }} />
// );

// Image storage utility
const imageStorage = {
    store: (filename, base64Data) => {
        const images = JSON.parse(
            localStorage.getItem("markdown-images") || "{}",
        );
        images[filename] = base64Data;
        localStorage.setItem("markdown-images", JSON.stringify(images));
    },

    get: (filename) => {
        const images = JSON.parse(
            localStorage.getItem("markdown-images") || "{}",
        );
        return images[filename];
    },
};

// Custom image component for ReactMarkdown
const MarkdownImage = ({ src, alt, ...props }) => {
    // Check if this is a local image
    if (src.startsWith("local:")) {
        const filename = src.replace("local:", "");
        const base64Data = imageStorage.get(filename);
        if (base64Data) {
            return <img src={base64Data} alt={alt} {...props} />;
        }
    }
    // Fallback to regular image
    return <img src={src} alt={alt} {...props} />;
};

export const ImageUploadButton = ({ onImageInsert }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = React.useState(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);

    const handleImageSelect = (event) => {
        /*
        const file = event.target.files[0];
        if (file) {
            // Create object URL for preview
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);

            // Convert to base64 for storage
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Data = e.target.result;
                // Generate a filename based on timestamp
                const filename = `image-${Date.now()}-${file.name}`;

                // Store the image
                imageStorage.store(filename, base64Data);

                // Insert markdown with local reference
                onImageInsert(`![${file.name}](local:${filename})`);

                // Clean up
                URL.revokeObjectURL(objectUrl);
                setPreview(null);
                setDialogOpen(false);
            };
            reader.readAsDataURL(file);
        }
        */
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    <Image className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Insert Image</DialogTitle>
                </DialogHeader>
                <DialogDescription></DialogDescription>
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
                                onClick={handleButtonClick}
                                variant="outline"
                                className="mt-4"
                            >
                                Select Image
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
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            // gap: ({ size }) => <Gap size={size} />,
                            // img: MarkdownImage,
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
