import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PropTypes from "prop-types";

const MarkdownPreview = ({ title, content, isVisible = true }) => {
    if (!isVisible) return null;

    return (
        <Card className="w-full max-w-2xl mx-auto bg-white shadow-lg">
            <CardContent className="p-6">
                <div className="prose prose-slate max-w-none">
                    {title && (
                        <div className="mb-6 border-b pb-4">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                className="prose-h1:mb-0 prose-h1:text-3xl prose-h1:font-bold"
                            >
                                {title}
                            </ReactMarkdown>
                        </div>
                    )}

                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="prose-base prose-p:my-4 prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:text-blue-800"
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </CardContent>
        </Card>
    );
};

// MarkdownPreview.

export default MarkdownPreview;
