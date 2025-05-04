import { useRef, useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";
import {
    X,
    Eye,
    Bookmark,
    Share2,
    ThumbsUp,
    ThumbsDown,
    MessageSquareText,
    ChevronLeft,
    MoreHorizontal,
    Check,
    ChevronDown,
    ChevronUp,
    Send,
    Edit,
    Trash2,
    Reply,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Header from "../../components/Header/Header";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "../../contexts/AuthContext";
import { useDataService } from "../../services/dataService";
import { useDarkMode } from "../../components/Hooks/darkMode";
import { postDarkThemes } from "../../services/themes";
import { copyHeaderLink } from "../../services/copyToClipBoard";
import { timeAgo } from "../../services/formatDate";
/**
 *
 */
function sharePost(post) {
    const baseUrl = window.location.origin;
    const postUrl = `${baseUrl}/p/${post._id}`;

    navigator.clipboard
        .writeText(postUrl)
        .then(() => {
            toast.success("Link copied to clipboard");
        })
        .catch((err) => {
            console.error("Failed to copy link:", err);
            toast.error("Faild to copy link");
        });
}

/**
 *
 */
export const PostHelmet = ({ post, author }) => {
    function formatSchemaDate(date) {
        return new Date(date).toISOString();
    }
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        image: [`${window.location.origin}${post.thumbnailUrl}`],
        datePublished: formatSchemaDate(post.createdAt),
        dateModified: formatSchemaDate(post.modifiedAt),
        author: {
            "@type": "Person",
            name: author.fullName,
        },
        publisher: {
            "@type": "Organization",
            name: "Opencanvas",
            logo: {
                "@type": "ImageObject",
                url: "https://opencanvas.blog/logo.png",
            },
        },
        description: post.title,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${window.location.origin}/p/${post._id}`,
        },
        keywords: [...post.tags],
    };

    const stopWords = [
        "a",
        "an",
        "the",
        "and",
        "or",
        "but",
        "is",
        "to",
        "of",
        "in",
        "on",
        "at",
        "with",
        "for",
        "from",
        "by",
    ];

    const keywordList = [
        ...new Set(
            post.title
                .toLowerCase()
                .split(/\s+/)
                .filter((word) => !stopWords.includes(word)),
        ),
        ...post.tags,
        "opencanvas",
    ].join(", ");

    return (
        <Helmet>
            <title>{post.title} | OpenCanvas</title>
            <meta name="description" content={post.title} />
            <meta name="keywords" content={keywordList} />
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
        </Helmet>
    );
};

PostHelmet.propTypes = {
    post: PropTypes.object,
    author: PropTypes.object,
};

/**
 *
 */
export const LoadingPost = () => {
    return (
        <div className="flex justify-center items-center h-screen text-black dark:text-white">
            Loading post...
        </div>
    );
};

/**
 *
 */
export const NotPost = () => {
    const navigate = useNavigate();
    return (
        <div className="">
            <Header />
            <div className="flex text-base flex-col justify-center items-center h-screen text-black dark:text-white gap-3">
                Post not found
                <button
                    className="rounded-md text-sm bg-cream hover:bg-cream-dark box-content px-2 py-1 text-stone-600/80 flex items-center justify-center gap-2"
                    onClick={() => {
                        navigate(-1);
                    }}
                >
                    <ChevronLeft className="size-6" />
                    Go Back
                </button>
            </div>
        </div>
    );
};

/**
 *
 */
export const NotPublicPost = () => {
    return (
        <div className="w-full h-full grid place-items-center bg-white dark:bg-[#111] overflow-x-hidden pt-20">
            <Header noBlur={true} ballClr={"text-gray-300"} />
            <div className="flex justify-center items-center h-screen text-black dark:text-white">
                This Post is Private
            </div>
        </div>
    );
};
/*
It works because of the loading state,
the rendering is starting before the useEffect completion,
thus post.title is undefined. -> not acctually,
i mean many be the return() executes first before postId gets to change and ask for an re-render
But with loading on, the return statement is only a simple html, so it works
*/

/**
 *
 */
export const LeftSidebar = () => {
    // const readOptions = [
    //     { name: "Home" },
    //     { name: "Discover" },
    //     { name: "Bookmarks" },
    //     { name: "Profile" },
    //     { name: "My Feed" },
    // ];

    return (
        <aside className={`relative w-full md:w-64 p-4 hidden md:block`}>
            {/* <div className="sticky top-4">
                <div className="font-bold mb-4">Read Options</div>
                <nav className="space-y-2">
                    {readOptions.map((link, index) => (
                        <div
                            key={index}
                            className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[#222] transition duration-0"
                        >
                            {link.name}
                        </div>
                    ))}
                </nav>
            </div> */}
        </aside>
    );
};

/**
 *
 */
export const TableOfContents = ({ tableOfContents, isArticle }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <aside className="w-full md:w-72 p-4 hidden lg:block relative">
            {isArticle && (
                <div className="fixed top-24 right-0 w-72 px-0">
                    <summary
                        className="flex items-center justify-start gap-1 py-2 cursor-pointer list-none"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <div className="font-serif text-xl px-2 bg-[#F0F1C5] dark:bg-neutral-700 rounded text-black dark:text-[#f8f8f8]">
                            Table of Contents
                        </div>
                        <div className="opencloseindicatorIcon">
                            {isOpen ? (
                                <ChevronUp size={16} />
                            ) : (
                                <ChevronDown size={16} />
                            )}
                        </div>
                    </summary>

                    {isOpen && (
                        <div
                            data-lenis-prevent
                            className="dropdown max-h-[600px] overflow-y-auto pb-4"
                        >
                            <ul className="pl-1 pt-2">
                                {tableOfContents.map((title, titleIndex) => (
                                    <li
                                        key={`title-${titleIndex}`}
                                        className="mb-2"
                                    >
                                        {title.text && (
                                            <a
                                                href={`#${title.id}`}
                                                className="font-bold text-neutral-800 dark:text-neutral-300 hover:text-neutral-600"
                                            >
                                                {title.text}
                                            </a>
                                        )}

                                        {title.headings.length > 0 && (
                                            <details open className="pl-0 mt-1">
                                                <summary className="list-none text-sm text-neutral-500 dark:text-neutral-300 cursor-pointer">
                                                    Expand sections
                                                </summary>
                                                <ul className="pl-4 mt-1">
                                                    {title.headings.map(
                                                        (
                                                            heading,
                                                            headingIndex,
                                                        ) => (
                                                            <li
                                                                key={`heading-${titleIndex}-${headingIndex}`}
                                                                className="mb-1"
                                                            >
                                                                {heading.text && (
                                                                    <a
                                                                        href={`#${heading.id}`}
                                                                        className="font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-500"
                                                                    >
                                                                        {
                                                                            heading.text
                                                                        }
                                                                    </a>
                                                                )}

                                                                {heading
                                                                    .subheadings
                                                                    .length >
                                                                    0 && (
                                                                    <details className="mt-1">
                                                                        <summary className="list-none text-xs text-neutral-500 cursor-pointer ml-2">
                                                                            Subsections
                                                                        </summary>
                                                                        <ul className="pl-4 mt-1">
                                                                            {heading.subheadings.map(
                                                                                (
                                                                                    subheading,
                                                                                    subheadingIndex,
                                                                                ) => (
                                                                                    <li
                                                                                        key={`subheading-${titleIndex}-${headingIndex}-${subheadingIndex}`}
                                                                                        className="mb-1"
                                                                                    >
                                                                                        {subheading.text && (
                                                                                            <a
                                                                                                href={`#${subheading.id}`}
                                                                                                className="text-neutral-600 dark:text-neutral-300 text-sm hover:text-neutral-400"
                                                                                            >
                                                                                                {
                                                                                                    subheading.text
                                                                                                }
                                                                                            </a>
                                                                                        )}

                                                                                        {subheading
                                                                                            .h4s
                                                                                            .length >
                                                                                            0 && (
                                                                                            <details className="mt-1">
                                                                                                <summary className="list-none text-xs text-neutral-400 cursor-pointer ml-2">
                                                                                                    Details
                                                                                                </summary>
                                                                                                <ul className="pl-4 mt-1">
                                                                                                    {subheading.h4s.map(
                                                                                                        (
                                                                                                            h4,
                                                                                                            h4Index,
                                                                                                        ) => (
                                                                                                            <li
                                                                                                                key={`h4-${titleIndex}-${headingIndex}-${subheadingIndex}-${h4Index}`}
                                                                                                            >
                                                                                                                <a
                                                                                                                    href={`#${h4.id}`}
                                                                                                                    className="text-neutral-500 hover:text-neutral-300 text-xs"
                                                                                                                >
                                                                                                                    {
                                                                                                                        h4.text
                                                                                                                    }
                                                                                                                </a>
                                                                                                            </li>
                                                                                                        ),
                                                                                                    )}
                                                                                                </ul>
                                                                                            </details>
                                                                                        )}
                                                                                    </li>
                                                                                ),
                                                                            )}
                                                                        </ul>
                                                                    </details>
                                                                )}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </details>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
};
TableOfContents.propTypes = {
    tableOfContents: PropTypes.array,
    isArticle: PropTypes.bool,
};
export const RightSidebar = ({ content, isArticle = true }) => {
    // Parse content to build the table of contents
    const parseTableOfContents = (content) => {
        if (!content) return [];

        const lines = content.split("\n");
        const tableOfContents = [];
        let currentTitle = null;
        let currentHeading = null;
        let currentSubheading = null;

        for (const line of lines) {
            // Check for title (# heading)
            if (line.startsWith("# ")) {
                const text = line.substring(2).trim();
                const id = createId(text);
                currentTitle = { text, id, headings: [] };
                tableOfContents.push(currentTitle);
                currentHeading = null;
                currentSubheading = null;
            }
            // Check for heading (## heading)
            else if (line.startsWith("## ")) {
                const text = line.substring(3).trim();
                const id = createId(text);
                currentHeading = { text, id, subheadings: [] };

                // If no title yet, create a container for headings
                if (!currentTitle) {
                    currentTitle = { text: "", id: "", headings: [] };
                    tableOfContents.push(currentTitle);
                }

                currentTitle.headings.push(currentHeading);
                currentSubheading = null;
            }
            // Check for subheading (### heading)
            else if (line.startsWith("### ")) {
                const text = line.substring(4).trim();
                const id = createId(text);
                currentSubheading = { text, id, h4s: [] };

                // If no heading yet, create one
                if (!currentHeading && currentTitle) {
                    currentHeading = { text: "", id: "", subheadings: [] };
                    currentTitle.headings.push(currentHeading);
                } else if (!currentHeading && !currentTitle) {
                    currentTitle = { text: "", id: "", headings: [] };
                    currentHeading = { text: "", id: "", subheadings: [] };
                    tableOfContents.push(currentTitle);
                    currentTitle.headings.push(currentHeading);
                }

                currentHeading.subheadings.push(currentSubheading);
            }
            // Check for h4 (#### heading)
            else if (line.startsWith("#### ")) {
                const text = line.substring(5).trim();
                const id = createId(text);
                const h4 = { text, id };

                // Handle case where we don't have proper hierarchy
                if (!currentSubheading && currentHeading) {
                    currentSubheading = { text: "", id: "", h4s: [] };
                    currentHeading.subheadings.push(currentSubheading);
                } else if (
                    !currentSubheading &&
                    !currentHeading &&
                    currentTitle
                ) {
                    currentHeading = { text: "", id: "", subheadings: [] };
                    currentSubheading = { text: "", id: "", h4s: [] };
                    currentTitle.headings.push(currentHeading);
                    currentHeading.subheadings.push(currentSubheading);
                } else if (
                    !currentSubheading &&
                    !currentHeading &&
                    !currentTitle
                ) {
                    currentTitle = { text: "", id: "", headings: [] };
                    currentHeading = { text: "", id: "", subheadings: [] };
                    currentSubheading = { text: "", id: "", h4s: [] };
                    tableOfContents.push(currentTitle);
                    currentTitle.headings.push(currentHeading);
                    currentHeading.subheadings.push(currentSubheading);
                }

                currentSubheading.h4s.push(h4);
            }
        }

        return tableOfContents;
    };

    // Create ID from text using the specified mechanism
    const createId = (text) => {
        return text
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
    };

    const tableOfContents = parseTableOfContents(content);

    return (
        <TableOfContents
            tableOfContents={tableOfContents}
            isArticle={isArticle}
        />
    );
};
RightSidebar.propTypes = {
    content: PropTypes.string,
    isArticle: PropTypes.bool,
};

export const ThemeSelector = ({ darkTheme, setDarkTheme }) => {
    const isDark = useDarkMode();
    const handleThemeChange = (themeKey) => {
        if (!isDark) {
            toast.error("First turn on Dark Mode in profile settings.");
            return;
        }
        if (themeKey === "light" && isDark) {
            toast.error("First turn off Dark Mode in profile settings.");
            return;
        }
        setDarkTheme(postDarkThemes[themeKey]);
    };

    function getPreviewColor(themeKey) {
        switch (themeKey) {
            case "monokai":
                return "bg-[#272822]";
            case "oneDarkPro":
                return "bg-[#282c34]";
            case "ayuDark":
                return "bg-[#0a0e14]";
            default:
                return "bg-gray-100";
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center">
                    <MoreHorizontal
                        className="size-4 cursor-pointer rounded px-2 py-1 box-content
                      hover:bg-gray-100 dark:hover:bg-[#333] text-black dark:text-white"
                    />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {Object.keys(postDarkThemes).map((themeKey) => (
                    <DropdownMenuItem
                        key={themeKey}
                        className="flex items-center justify-between px-3 py-2 cursor-pointer"
                        onClick={() => handleThemeChange(themeKey)}
                    >
                        <div className="flex items-center">
                            <div
                                className={`w-3 h-3 rounded-full mr-2 ${getPreviewColor(themeKey)}`}
                            />
                            <span>{postDarkThemes[themeKey].name}</span>
                        </div>
                        {darkTheme.name === postDarkThemes[themeKey].name && (
                            <Check className="size-4 text-green-500" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
ThemeSelector.propTypes = {
    darkTheme: PropTypes.object,
    setDarkTheme: PropTypes.func,
};
/**
 *
 */
export const ArticleHeader = ({
    post,
    currentUser,
    author,
    handleSave,
    handleFollow,
    following,
    isSaved,
    darkTheme,
    setDarkTheme,
}) => {
    const navigate = useNavigate();

    function formatDate(dt) {
        const date = new Date(dt);
        const formattedDate = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        return formattedDate;
    }

    return (
        <div className="mb-2 md:mb-0">
            <div
                className="flex flex-col md:flex-row items-start md:items-center
                justify-between space-y-2 md:space-y-0 mb-4"
            >
                {/* back btn */}
                <div className="flex justify-center items-center gap-2">
                    <button
                        className="rounded-full text-sm bg-gray-100 hover:bg-gray-200 dark:bg-[#111]
                        border box-content p-1 text-stone-600/80 dark:border-[#333] cursor-pointer"
                        onClick={() => {
                            navigate(-1);
                        }}
                    >
                        <ChevronLeft className="size-6" />
                    </button>

                    {/* author details */}
                    <div
                        className="flex items-center cursor-pointer mr-12"
                        onClick={() => {
                            navigate(`/u/${author.username}`);
                            // navigate(`/u/${author.username}`, {
                            //     state: { author },
                            // });
                        }}
                    >
                        <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage
                                src={
                                    author.profilePicture ||
                                    post.author.profilePicture
                                }
                                alt={author.fullName || "U"}
                            />
                            <AvatarFallback>
                                {author.fullName.charAt(0) || "A"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="">
                            <div
                                className={`font-medium flex items-center justify-start gap-2 ${darkTheme.colors.primaryText}`}
                            >
                                {author.fullName ||
                                    post.author.name ||
                                    "not found"}

                                {currentUser?._id?.toString() !==
                                    post.authorId?.toString() && (
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (!currentUser) {
                                                toast.error(
                                                    "you need to log in first to follow",
                                                );
                                                return;
                                            }
                                            await handleFollow(post.authorId);
                                        }}
                                        className={`px-1 rounded text-xs cursor-pointer dark:invert
                                            ${following ? "bg-white text-black" : "bg-black text-white"}`}
                                    >
                                        {following ? "Following" : "Follow"}
                                    </button>
                                )}
                            </div>
                            <div
                                className={`text-sm text-gray-500 dark:text-gray-300`}
                            >
                                {author.role}
                            </div>
                        </div>
                    </div>
                </div>

                {/* post options */}
                <div
                    className="text-sm text-gray-500 dark:text-gray-300 flex flex-row md:flex-col
                    justify-between md:justify-center gap-2 md:gap-0 w-full md:w-fit mt-2 md:mt-0"
                >
                    <div>
                        {formatDate(post.createdAt)} ·{" "}
                        {post.readTime || "2 min read"}
                    </div>
                    <div className="flex items-center justify-center text-white">
                        <Bookmark
                            className={`size-4 cursor-pointer rounded px-2 py-1 box-content
                                hover:bg-gray-100 dark:hover:bg-[#333]
                                ${isSaved ? "fill-lime-500 text-lime-500" : "dark:text-white text-black"}`}
                            onClick={async () => {
                                if (!currentUser) {
                                    toast.error(
                                        "you need to log in first to save post",
                                    );
                                } else {
                                    await handleSave(post._id);
                                }
                            }}
                        />
                        <span className="w-px h-[15px] dark:bg-[#ccc]/60 bg-[#444]/60" />
                        <Share2
                            className="size-4 cursor-pointer rounded px-2 py-1 box-content
                            hover:bg-gray-100 dark:hover:bg-[#333] text-black dark:text-white"
                            onClick={() => sharePost(post)}
                        />
                        <span className="w-px h-[15px] dark:bg-[#ccc]/60 bg-[#444]/60" />
                        {/* <MoreHorizontal
                            className="size-4 cursor-pointer rounded px-2 py-1 box-content
                        hover:bg-gray-100 dark:hover:bg-[#333] text-black dark:text-white"
                        /> */}
                        <ThemeSelector
                            darkTheme={darkTheme}
                            setDarkTheme={setDarkTheme}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
ArticleHeader.propTypes = {
    post: PropTypes.object,
    darkTheme: PropTypes.object,
    currentUser: PropTypes.object,
    author: PropTypes.object,
    handleSave: PropTypes.func,
    handleFollow: PropTypes.func,
    setDarkTheme: PropTypes.func,
    following: PropTypes.bool,
    isSaved: PropTypes.bool,
};

/**
 *
 */
export const EngagementSection = ({
    post,
    currentUser,
    handleLike,
    handleDislike,
    handleSave,
    isLiked,
    isDisliked,
    isSaved,
    likes,
    commentTrayOpen,
    setCommentTrayOpen,
    darkTheme,
}) => {
    return (
        <div
            className={`flex items-center justify-between border-t border-b py-4 mb-8 dark:border-[#333] border-gray-200 ${darkTheme.colors.primaryText}`}
        >
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 cursor-not-allowed"
                >
                    <Eye className="size-4" />
                    <span>{post.totalViews}</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={async () => {
                        if (!currentUser) {
                            toast.error("you need to log in first to like");
                        } else {
                            await handleLike(post._id);
                        }
                    }}
                >
                    <ThumbsUp
                        className={`size-4 text-blue-600 dark:text-white ${isLiked ? "fill-blue-600 dark:fill-white" : ""}`}
                    />
                    <span>{likes}</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-transparent"
                    onClick={async () => {
                        if (!currentUser) {
                            toast.error("you need to log in first to dislike");
                        } else {
                            await handleDislike(post._id);
                        }
                    }}
                >
                    <ThumbsDown
                        className={`size-4 text-black dark:text-white ${isDisliked ? "fill-black dark:fill-white" : ""}`}
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCommentTrayOpen(!commentTrayOpen)}
                >
                    <MessageSquareText className="size-4" />
                    <span>{post.totalComments}</span>
                </Button>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                        if (!currentUser) {
                            toast.error(
                                "you need to log in first to save post",
                            );
                        } else {
                            await handleSave(post._id);
                        }
                    }}
                >
                    <Bookmark
                        className={`size-4 ${isSaved ? "fill-lime-500 text-lime-500" : ""}`}
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sharePost(post)}
                >
                    <Share2 className="size-4" />
                </Button>
            </div>
        </div>
    );
};
EngagementSection.propTypes = {
    post: PropTypes.object,
    darkTheme: PropTypes.object,
    currentUser: PropTypes.object,
    handleLike: PropTypes.func,
    handleDislike: PropTypes.func,
    handleSave: PropTypes.func,
    setCommentTrayOpen: PropTypes.func,
    commentTrayOpen: PropTypes.bool,
    isLiked: PropTypes.bool,
    isDisliked: PropTypes.bool,
    isSaved: PropTypes.bool,
    likes: PropTypes.number,
};

export const CommentsBox = memo(function CommentsBox({
    post,
    commentTrayOpen,
    setCommentTrayOpen,
}) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const { currentUser } = useAuth();

    const commentsEndRef = useRef(null);
    const inputRef = useRef(null);
    const currentIndexRef = useRef(0);
    const editingCommentIdRef = useRef(null);

    const navigate = useNavigate();

    const {
        addNewComment,
        editComment,
        deleteComment,
        newReply,
        getComment,
        getCommentsByIds,
    } = useDataService();

    // fetch comments
    useEffect(() => {
        async function loadComments() {
            // if (commentTrayOpen) { // autofetch some at first
            setLoading(true);
            try {
                const comments = await getCommentsByIds(post, currentIndexRef);
                setComments(comments);
                // no need to change no of comments using setPost
                currentIndexRef.current += 10;
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        // }
        loadComments();
    }, [post]); //, commentTrayOpen]);

    // Scroll to bottom when new comments are added
    useEffect(() => {
        if (commentTrayOpen && commentsEndRef.current) {
            commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [comments, commentTrayOpen]);

    // Focus input when tray opens
    useEffect(() => {
        if (commentTrayOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [commentTrayOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            toast.error("Login first.");
            return;
        }
        const content = newComment?.trim() || null;
        if (content) {
            setLoading(true);
            try {
                const res = await addNewComment(content, post._id);
                console.log(res);
                setComments([...comments, res.comment]);
                setNewComment("");
                toast.success(res.message);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEdit = async (e, commentId) => {
        if (!currentUser) {
            toast.error("Login first.");
            return;
        }
        e.preventDefault();
        const content = newComment?.trim() || null;
        if (content) {
            setLoading(true);
            try {
                const res = await editComment(content, commentId);
                setComments([
                    ...comments.map((c) =>
                        c._id.toString() === commentId.toString()
                            ? res.comment
                            : c,
                    ),
                ]);
                setNewComment("");
                toast.success(res.message);
            } catch (err) {
                console.error(err);
            } finally {
                setIsEditing(false);
                setLoading(false);
            }
        }
    };

    const handleDelete = async (e, commentId) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await deleteComment(commentId);
            setComments([
                ...comments.filter(
                    (c) => c._id.toString() !== commentId.toString(),
                ),
            ]);
            toast.success(res.message);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e, commentId) => {
        if (!currentUser) {
            toast.error("Login first.");
            return;
        }
        e.preventDefault();
        const content = newComment?.trim() || null;
        if (content) {
            setLoading(true);
            try {
                const res = await editComment(content, commentId);
                setComments([...comments, res.comment]);
                setNewComment("");
                toast.success(res.message);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div
            data-lenis-prevent
            className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white dark:bg-neutral-900 shadow-xl transform transition-transform duration-300 ease-in-out
                ${commentTrayOpen ? "translate-x-0" : "translate-x-full"} flex flex-col h-full z-50`}
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
                <h2 className="text-lg font-medium text-gray-800 dark:text-neutral-100">
                    Comments
                </h2>
                <button
                    onClick={() => setCommentTrayOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                    aria-label="Close comments"
                >
                    <X
                        size={20}
                        className="text-gray-600 dark:text-neutral-400"
                    />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments?.length > 0
                    ? comments.map((comment) => (
                          <div
                              key={comment._id}
                              className="flex space-x-3 group"
                          >
                              <Avatar
                                  onClick={() =>
                                      navigate(`/u/${comment.author.username}`)
                                  }
                                  className="w-8 h-8 rounded-full flex-shrink-0 cursor-pointer"
                              >
                                  <AvatarImage
                                      src={comment.author.profilePicture}
                                      alt={comment.author.fullName}
                                  />
                                  <AvatarFallback>
                                      {comment.author.fullName.slice(0, 2)}
                                  </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                  <div className="flex items-baseline justify-between">
                                      <h3 className="font-medium text-gray-900 dark:text-neutral-100 flex items-center justify-center gap-3">
                                          {comment.author.fullName}
                                          <div className="flex items-center justify-center gap-2">
                                              {comment.authorId.toString() ===
                                                  currentUser?._id.toString() && (
                                                  <>
                                                      <div
                                                          className="cursor-pointer"
                                                          onClick={() => {
                                                              if (isEditing) {
                                                                  setIsEditing(
                                                                      false,
                                                                  );
                                                                  editingCommentIdRef.current =
                                                                      null;
                                                                  setNewComment(
                                                                      "",
                                                                  );
                                                              } else {
                                                                  setIsEditing(
                                                                      true,
                                                                  );
                                                                  editingCommentIdRef.current =
                                                                      comment._id;
                                                                  setNewComment(
                                                                      comment.content,
                                                                  );
                                                              }
                                                          }}
                                                      >
                                                          <Edit className="size-4" />
                                                      </div>
                                                      <div
                                                          className="cursor-pointer"
                                                          onClick={(e) =>
                                                              handleDelete(
                                                                  e,
                                                                  comment._id,
                                                              )
                                                          }
                                                      >
                                                          <Trash2 className="size-4" />
                                                      </div>
                                                  </>
                                              )}
                                              <div
                                                  className="cursor-pointer"
                                                  onClick={handleReply}
                                              >
                                                  <Reply className="size-4" />
                                              </div>
                                          </div>
                                      </h3>
                                      <span className="text-xs text-gray-500 dark:text-neutral-400">
                                          {timeAgo(comment.createdAt)}
                                      </span>
                                  </div>
                                  {comment.authorId.toString() ===
                                      post.authorId.toString() && (
                                      <span className="bg-lime-200 rounded-full px-2 text-xs mr-2">
                                          Author
                                      </span>
                                  )}
                                  {comment.createdAt !== comment.updatedAt && (
                                      <span className="bg-gray-200 rounded-full px-2 text-xs">
                                          edited
                                      </span>
                                  )}
                                  <p className="mt-1 text-gray-800 dark:text-neutral-200">
                                      {comment.content}
                                  </p>
                              </div>
                          </div>
                      ))
                    : "no comments until now"}
                <div ref={commentsEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
                {!isEditing ? (
                    <div className="relative flex items-center">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 px-4 py-2 pr-10 bg-gray-100 dark:bg-neutral-800 border-0 rounded-full text-gray-800 dark:text-neutral-100
                        placeholder-gray-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all duration-200"
                        />
                        <button
                            onClick={(e) => handleSubmit(e)}
                            disabled={!newComment?.trim() || false}
                            className="absolute right-2 p-1.5 rounded-full bg-lime-500 text-white disabled:opacity-50
                        disabled:bg-gray-400 dark:disabled:bg-neutral-700 transition-all duration-200"
                            aria-label="Send comment"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                ) : (
                    // removed using refs in here, although would have been fine,
                    // cuz only one block renders at a time based on editing
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 px-4 py-2 pr-10 bg-gray-100 dark:bg-neutral-800 border-0 rounded-full text-gray-800 dark:text-neutral-100
                        placeholder-gray-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all duration-200"
                        />
                        <button
                            onClick={(e) =>
                                handleEdit(e, editingCommentIdRef.current)
                            }
                            disabled={!newComment.trim()}
                            className="absolute right-2 p-1.5 rounded-full bg-lime-500 text-white disabled:opacity-50
                        disabled:bg-gray-400 dark:disabled:bg-neutral-700 transition-all duration-200"
                            aria-label="Send comment"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});
CommentsBox.propTypes = {
    post: PropTypes.object,
    setCommentTrayOpen: PropTypes.func,
    commentTrayOpen: PropTypes.bool,
};
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// import { useRef, useState, memo } from "react";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Slider } from "@/components/ui/slider";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

export const ThemedMarkdownPreview = memo(function ThemedMarkdownPreview({
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
    darkTheme = null,
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
                ${isDark ? `${darkBg} ${darkTheme.primaryText} border-none` : lightModeBg}
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
                                className={`pt-2 mb-10 leading-tight tracking-tight capitalize  ${
                                    contentOnly
                                        ? "text-xl font-semibold font-sans"
                                        : "text-4xl font-bold font-serif"
                                }
                                ${artType === "poem" ? "!max-w-[600px] !font-boskaBold" : ""}
                                ${darkTheme.primaryText}`}
                            >
                                {title}
                                {!contentOnly && (
                                    <>
                                        <hr
                                            className={`mt-6 mb-px border-t ${isDark ? `dark:border-gray-300` : "border-gray-200"}`}
                                        />
                                        <hr
                                            className={`mb-6 border-t ${isDark ? `dark:border-gray-300` : "border-gray-200"}`}
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {/* thumbnail */}
                        {thumbnailUrl && !contentOnly && (
                            <div
                                className="relative mb-8 w-full md:w-[110%] md:transform md:translate-x-[-5%] __max-h-[370px] bg-gray-200 dark:bg-[#171717]
                                rounded-lg overflow-hidden shadow-none flex items-center justify-center"
                            >
                                <img
                                    src={thumbnailUrl}
                                    alt={title || "Article thumbnail"}
                                    className="aspect-video object-contain w-full"
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
                                            className={`my-6 border-t ${isDark ? `${darkTheme.border}` : "border-gray-200"}`}
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
                                        className={`mt-12 mb-6 leading-tight tracking-tight cursor-pointer ${
                                            contentOnly
                                                ? "text-xl font-semibold font-sans"
                                                : "text-4xl font-bold font-serif"
                                        }`}
                                        onClick={() => {
                                            copyHeaderLink(children);
                                        }}
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
                                        className={`font-serif mt-10 mb-5 leading-tight tracking-tight cursor-pointer ${
                                            contentOnly
                                                ? "text-lg"
                                                : "text-3xl font-bold"
                                        }`}
                                        onClick={() => {
                                            copyHeaderLink(children);
                                        }}
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
                                        className={`font-serif mt-8 mb-4 leading-snug cursor-pointer ${
                                            contentOnly
                                                ? "text-base"
                                                : "text-2xl font-bold"
                                        }`}
                                        onClick={() => {
                                            copyHeaderLink(children);
                                        }}
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
                                        className={`montserrat-regular font-semibold mt-6 mb-3 leading-snug cursor-pointer ${
                                            contentOnly ? "text-sm" : "text-xl"
                                        }`}
                                        onClick={() => {
                                            copyHeaderLink(children);
                                        }}
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
                                            className={`border border-gray-400 ${darkTheme.table.border} bg-white ${darkTheme.table.rowBg} w-full text-gray-900 ${darkTheme.primaryText}`}
                                        >
                                            {children}
                                        </table>
                                    </div>
                                ),
                                thead: ({ children }) => (
                                    <thead
                                        className={`bg-gray-200 ${darkTheme.table.headerBg}`}
                                    >
                                        {children}
                                    </thead>
                                ),
                                tbody: ({ children }) => (
                                    <tbody
                                        className={`${darkTheme.table.rowBg}`}
                                    >
                                        {children}
                                    </tbody>
                                ),
                                tr: ({ children }) => (
                                    <tr
                                        className={`border border-gray-300 ${darkTheme.table.border}`}
                                    >
                                        {children}
                                    </tr>
                                ),
                                th: ({ children }) => (
                                    <th
                                        className={`border ${contentOnly ? "text-xs" : "montserrat-bold"} border-gray-300 ${darkTheme.table.border} px-4 py-2 bg-gray-100 ${darkTheme.table.headerBg}`}
                                    >
                                        {children}
                                    </th>
                                ),
                                td: ({ children }) => (
                                    <td
                                        className={`border border-gray-300 ${darkTheme.table.border} px-4 py-2 ${darkTheme.table.rowBg} ${contentOnly ? "text-xs" : "montserrat-regular"}`}
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

ThemedMarkdownPreview.propTypes = {
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
    darkTheme: PropTypes.object,
};
