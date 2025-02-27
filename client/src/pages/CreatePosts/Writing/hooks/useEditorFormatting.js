import { useState } from "react";

export function useEditorFormatting(content, setContent) {
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [selectedText, setSelectedText] = useState("");
    const [textAlignment, setTextAlignment] = useState("left");

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
    // ----------------- ^%SOS#
    const handleContentChange = (e, setIsSaved) => {
        const newContent = e.target.value;
        addToUndoStack(content);
        setContent(newContent);
        setIsSaved(false);
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
    };
    /*
    const handleContentChange = (e) => {
        const newContent = e.target.value;
        addToUndoStack(content);
        setContent(newContent);
        // setWordCount(newContent.trim().split(/\s+/).filter(Boolean).length);
        setIsSaved(false);
        e.target.style.height = "auto"; // reset the height for proper increase
        e.target.style.height = e.target.scrollHeight + "px"; // Set new height based on content
    };
    */

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

    /**
     * Handle text formatting
     */
    const handleFormat = (format) => {
        const textarea = document.querySelector("textarea");
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        if (!selectedText) return;

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
                    `<p style="font-size: 18px; line-height: 1.5;"><span style="float: left; font-size: 3em; font-weight: bold; line-height: 1; margin-right: 8px;">${selectedText[0]}</span>${selectedText.slice(1)}</p>\n` +
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
                    `<u>${selectedText}</u>` +
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
                    `\n---\n${selectedText}` +
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
                    `${selectedText}\n<span className=html2pdf__page-break></span>` +
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
                    `## ${selectedText}` +
                    content.substring(end);
                break;
        }

        addToUndoStack(content);
        setContent(newText);
    };

    return {
        selectedText,
        setSelectedText,
        textAlignment,
        setTextAlignment,
        undoStack,
        redoStack,
        handleContentChange,
        handleUndo,
        handleRedo,
        handleFormat,
    };
}
