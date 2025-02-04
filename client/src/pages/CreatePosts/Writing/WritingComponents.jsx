import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import PropTypes from "prop-types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";

// const Gap = ({ size = "10px" }) => (
//     <div style={{ position: "relative", height: size }} />
// );

const MarkdownPreview = ({ title, content, isVisible = true }) => {
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

export default MarkdownPreview;

MarkdownPreview.propTypes = {
    title: PropTypes.any,
    content: PropTypes.any,
    isVisible: PropTypes.bool,
};
