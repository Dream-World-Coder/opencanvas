import { useState } from "react";
import {
    ArrowLeft,
    Save,
    Share2,
    Image,
    Bold,
    Italic,
    AlignLeft,
    AlignCenter,
    Quote,
    Undo,
    Redo,
    MoreHorizontal,
} from "lucide-react";

// why  not just const WritingPad = (artType) => {} ?
const WritingPad = ({ artType }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const [isSaved, setIsSaved] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleContentChange = (e) => {
        setContent(e.target.value);
        setWordCount(e.target.value.trim().split(/\s+/).filter(Boolean).length);
        setIsSaved(false);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => window.history.back()}
                            className="hover:opacity-70 transition-opacity"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-2">
                            <button
                                className={
                                    "px-3 py-1 rounded-full text-sm bg-black text-white hover:text-green-300"
                                }
                            >
                                {artType}
                            </button>
                            {/* <button
                                onClick={() => setType("poem")}
                                className={`px-3 py-1 rounded-full text-sm ${
                                    type === "poem"
                                        ? "bg-black text-white"
                                        : "text-gray-400 hover:text-gray-600"
                                }`}
                            >
                                Poem
                            </button> */}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-400">
                            {wordCount} words
                        </span>
                        <button
                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                                isSaved
                                    ? "text-gray-400"
                                    : "bg-black text-white"
                            }`}
                            onClick={() => setIsSaved(true)}
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSaved ? "Saved" : "Save"}</span>
                        </button>
                        <button className="hover:opacity-70 transition-opacity">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="hover:opacity-70 transition-opacity">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Writing Area */}
            <div className={`pt-20 pb-24 ${isFullscreen ? "px-0" : "px-6"}`}>
                <div className="max-w-4xl mx-auto">
                    {/* border-x border-gray-100 */}
                    {/* Formatting Tools */}
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Bold className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Italic className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <AlignLeft className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <AlignCenter className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Quote className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Image className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Undo className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Redo className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Title Input */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                        className="w-full text-4xl font-bold mb-8 focus:outline-none"
                    />

                    {/* Content Textarea */}
                    <textarea
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Fill your canvas..."
                        className={`w-full min-h-[60vh] resize-none focus:outline-none text-lg ${
                            artType === "poem" ? "text-center" : ""
                        }`}
                    />
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
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
        </div>
    );
};

export default WritingPad;
