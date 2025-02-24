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
        marginTop: 0,
        marginBottom: 0,
        position: "center", // 'left', 'center', 'right'
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {/* Hide the overlay completely */}
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Image Properties
                    </DialogTitle>
                </DialogHeader>

                <div className="">
                    {/* Image Preview */}
                    <div
                        className={`flex items-center justify-center overflow-hidden border border-gray-200 rounded`}
                        style={{
                            marginTop: `0px`,
                            marginBottom: `0px`,
                        }}
                    >
                        <img
                            src={currentImage.src}
                            alt={currentImage.alt || "Preview"}
                            style={{
                                maxHeight: `135px`,
                                maxWidth: `240px`,
                            }}
                            className="object-cover"
                        />
                    </div>

                    {/* Settings Controls */}
                    <div className="grid grid-cols-1 gap-4 mt-4">
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
            </DialogContent>
        </Dialog>
    );
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
    const [mTop, setMTop] = useState("0px");
    const [mBottom, setMBottom] = useState("0px");

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
                                return !inline && match ? (
                                    <SyntaxHighlighter
                                        style={prism}
                                        language={match[1]}
                                        PreTag="div"
                                        // showLineNumbers
                                        wrapLongLines
                                        className={isDark ? "invert" : ""}
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code
                                        className={`bg-gray-200 px-1 py-0.5 rounded text-sm font-mono ${isDark ? "text-black" : ""}`}
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                );
                            },
                            blockquote({ children }) {
                                return (
                                    <blockquote
                                        // className={`border-l-4 pl-4 py-3 my-4 italic rounded-md shadow
                                        //         ${isDark ? "border-gray-600 bg-gray-800 text-gray-300" : "border-gray-400 bg-gray-100 text-gray-700"}
                                        //       `}
                                        className={`border-l-4 pl-4 italic ${isDark ? "border-[#888] text-[#999]" : "border-gray-500 text-gray-600"}`}
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

export const rawText = `
<p style="font-size: 18px; line-height: 1.5;">
  <span style="float: left; font-size: 3em; font-weight: bold; line-height: 1; margin-right: 8px;">M</span>
  arkdown, often abbreviated as MD, is a lightweight markup language that transforms plain text into richly formatted documents. Developed with readability in mind, its simple syntax allows users to add headers, lists, links, and other elements without heavy reliance on complex code. This ease of use has made Markdown a popular choice for everything from documentation and blogging to collaborative projects on platforms like GitHub. Its enduring appeal lies in the balance it strikes between simplicity and functionality, making it an essential tool in modern digital communication.
</p>

---

<mark>Here are some examples</mark>

# Gradient descent is a method for unconstrained mathematical optimization.
## Gradient descent is a method for unconstrained mathematical optimization.
### Gradient descent is a method for unconstrained mathematical optimization.
#### Gradient descent is a method for unconstrained mathematical optimization.
##### Gradient descent is a method for unconstrained mathematical optimization.
###### Gradient descent is a method for unconstrained mathematical optimization.

**Gradient descent is a method for unconstrained mathematical optimization.**

*Gradient descent is a method for unconstrained mathematical optimization.*

***Gradient descent is a method for unconstrained mathematical optimization.***

Gradient descent is a method for unconstrained mathematical optimization.

---
<br/>

> Gradient descent is a method for unconstrained mathematical optimization. It is a first-order iterative algorithm for minimizing a differentiable multivariate function.

<br/>

---

- This is a bullet list item
- Another item

1. This is a numbered list item
2. Another numbered item

- [ ] This is an unchecked task
- [x] This is a checked task

---
<br/>

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

<br/>

\`This is inline code\`

\`\`\`cpp
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
\`\`\`

[This is a link](https://example.com)

![This is an image](https://picsum.photos/150)

---
# <u>For underlined heading</u>

Wrong:
<u> ## heading</u>

Correct:
## <u>heading</u>
  `;

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
