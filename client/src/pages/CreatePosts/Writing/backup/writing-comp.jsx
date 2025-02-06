/**
 *
 *
 *
 *
 *
 *
 */
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
