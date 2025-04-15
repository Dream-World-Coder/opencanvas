import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";
import {
    Eye,
    Bookmark,
    Share2,
    ThumbsUp,
    ThumbsDown,
    MessageSquareText,
    ChevronLeft,
    MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Header from "../../components/Header/Header";

/**
 *
 * @param {*} post
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
 * @param {*} param0
 * @returns
 */
export const PostHelmet = ({ post }) => {
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
            name: post.author.name,
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
};

/**
 *
 * @returns
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
 * @returns
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
 * @returns
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
 * @param {*} param0
 * @returns
 */
export const LeftSidebar = ({ focusMode, isArticle }) => {
    const readOptions = [
        { name: "Home" },
        { name: "Discover" },
        { name: "Bookmarks" },
        { name: "Profile" },
        { name: "My Feed" },
    ];
    const navigate = useNavigate();

    return (
        <aside
            className={`relative w-full md:w-64 p-4 ${!focusMode ? "border-r border-gray-200 dark:border-[#333]" : ""} hidden md:block`}
        >
            {/* back button */}
            {isArticle && (
                <button
                    className="absolute top-[37px] right-0 rounded-full text-sm bg-gray-100 hover:bg-gray-200 dark:bg-[#111] border box-content p-1 text-stone-600/80 dark:border-[#333]"
                    onClick={() => {
                        navigate(-1);
                    }}
                >
                    <ChevronLeft className="size-6" />
                </button>
            )}
            {!focusMode && (
                <div className="sticky top-4">
                    <div className="font-bold mb-4">Read Options</div>
                    {/* big-small font, yellow color bg, serif, modern -- tooltip like */}
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
                </div>
            )}
        </aside>
    );
};
LeftSidebar.propTypes = {
    focusMode: PropTypes.bool,
    isArticle: PropTypes.bool,
};

/**
 *
 * @returns
 */
export const RightSidebar = () => {
    return (
        <aside className="w-full md:w-64 p-4 hidden lg:block">
            <div className="sticky top-4"></div>
        </aside>
    );
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const ArticleHeader = ({
    post,
    currentUser,
    author,
    handleSave,
    handleFollow,
    following,
    isSaved,
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
        <div className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 mb-4">
                <div
                    className="flex items-center cursor-pointer"
                    onClick={() => {
                        navigate(`/u/${post.author.username}`);
                        // navigate(`/u/${post.author.username}`, {
                        //     state: { author },
                        // });
                    }}
                >
                    <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage
                            src={post.author.profilePicture}
                            alt={post.author.name}
                        />
                        <AvatarFallback>
                            {post.author.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="">
                        <div className="font-medium flex items-center justify-start gap-2">
                            {post.author.name}

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
                                    className={`px-1 rounded text-xs cursor-pointer dark:invert ${following ? "bg-white text-black" : "bg-black text-white"}`}
                                >
                                    {following ? "Following" : "Follow"}
                                </button>
                            )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {author.role}
                        </div>
                    </div>
                </div>
                <div
                    className="text-sm text-gray-500 dark:text-gray-400 flex flex-row md:flex-col
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
                        <MoreHorizontal
                            className="size-4 cursor-pointer rounded px-2 py-1 box-content
                        hover:bg-gray-100 dark:hover:bg-[#333] text-black dark:text-white"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
ArticleHeader.propTypes = {
    post: PropTypes.object,
    currentUser: PropTypes.object,
    author: PropTypes.object,
    handleSave: PropTypes.func,
    handleFollow: PropTypes.func,
    following: PropTypes.bool,
    isSaved: PropTypes.bool,
};

/**
 *
 * @param {*} param0
 * @returns
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
}) => {
    return (
        <div className="flex items-center justify-between border-t border-b py-4 mb-8 dark:border-[#333] border-gray-200">
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
                        className={`size-4 text-blue-600 ${isLiked ? "fill-blue-600" : ""}`}
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
    currentUser: PropTypes.object,
    handleLike: PropTypes.func,
    handleDislike: PropTypes.func,
    handleSave: PropTypes.func,
    isLiked: PropTypes.bool,
    isDisliked: PropTypes.bool,
    isSaved: PropTypes.bool,
    likes: PropTypes.number,
};
