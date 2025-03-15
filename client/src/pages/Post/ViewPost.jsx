import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
    Eye,
    Bookmark,
    Share2,
    MoreHorizontal,
    ThumbsUp,
    MessageSquareText,
} from "lucide-react";

import Header from "../../components/Header/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useAuth } from "../../contexts/AuthContext";
import { MarkdownPreview } from "../CreatePosts/Writing/WritingComponents";
import { useDataService } from "../../services/dataService";
import { useDarkMode } from "../../components/Hooks/darkMode";
import { useViewTracker } from "../../components/Hooks/viewCount";
import { moreFromAuthor, relatedPosts } from "./data";

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

const ViewPost = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { postId } = useParams();
    const { getPostById, likePost } = useDataService();
    const isDark = useDarkMode();
    const [focusMode, _] = useState(false);

    const [post, setPost] = useState(null);
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    const viewCounted = useViewTracker(postId);

    /* It works because of the loading state,
    the rendering is starting before the useEffect completion,
    thus post.title is undefined. -> not acctually,
    i mean many be the return() executes first before postId gets to change and ask for an re-render
    But with loading on, the return statement is only a simple html, so it works */

    useEffect(() => {
        async function fetchPost() {
            setLoading(true);
            try {
                const postData = await getPostById(postId);
                setPost(postData);
                setLikes(postData.totalLikes);
                setIsLiked(
                    !!currentUser &&
                        !!currentUser.likedPosts.includes(postData._id),
                );
            } catch (err) {
                console.error("Failed to load post", err);
                navigate("/404");
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [postId]);

    async function handleLike(postId) {
        let res = await likePost(postId);
        if (res.success) {
            toast.success(res.message);
            if (res.increase === "increase") {
                setLikes(likes + 1);
            } else {
                setLikes(likes - 1);
            }
        } else {
            toast.error(res.message);
        }
    }

    // use skeleton later
    if (loading)
        return (
            <div className="flex justify-center items-center h-screen">
                Loading post...
            </div>
        );

    // navigated, but still
    if (!post)
        return (
            <div className="flex justify-center items-center h-screen">
                Post not found
            </div>
        );

    const readOptions = [
        { name: "Home", href: "#" },
        { name: "Discover", href: "#" },
        { name: "Bookmarks", href: "#" },
        { name: "Profile", href: "#" },
        { name: "My Feed", href: "#" },
    ];

    function formatDate(dt) {
        const date = new Date(dt);
        const formattedDate = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        return formattedDate;
    }

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        image: [`https://opencanvas.blog${post.thumbnailUrl}`],
        datePublished: {},
        dateModified: {},
        author: {
            "@type": "Person",
            name: {},
        },
        publisher: {
            "@type": "Organization",
            name: "Opencanvas",
            logo: {
                "@type": "ImageObject",
                url: "https://opencanvas.blog/logo.png",
            },
        },
        description:
            "A sample article description goes here, summarizing the main content of the article.",
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://opencanvas.blog/sample-article",
        },
        keywords:
            "SEO, keywords, search engine optimization, blog, web development",
    };

    return (
        <>
            <Helmet>
                <title>{post.title} • OpenCanvas</title>
                <meta name="description" content={post.title} />
                <meta
                    name="keywords"
                    content="technology, blog, javascript, SEO, web development"
                />
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Helmet>

            <div className="w-full h-full grid place-items-center bg-white dark:bg-[#111] overflow-x-hidden pt-20">
                <Header
                    noBlur={true}
                    ballClr={"text-gray-300"}
                    exclude={[
                        "/about",
                        "/contact",
                        "/gallery/photos",
                        "/gallery/literature",
                    ]}
                />
                <div className="flex flex-col md:flex-row max-w-screen-xl mx-auto bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100">
                    {/* Left sidebar - Read Options or folder structure in case of collection */}
                    <aside
                        className={`w-full md:w-64 p-4 ${!focusMode ? "border-r border-gray-200 dark:border-[#333]" : ""} hidden md:block`}
                    >
                        {!focusMode && (
                            <div className="sticky top-4">
                                <div className="font-bold mb-4">
                                    Read Options
                                </div>
                                {/* big-small font, yellow color bg, serif, modern -- tooltip like */}
                                <nav className="space-y-2">
                                    {readOptions.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.href}
                                            className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[#222] transition duration-0"
                                        >
                                            {link.name}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        )}
                    </aside>

                    {/* Main content */}
                    <main
                        className={`flex-1 p-4 md:p-6 lg:p-8 min-h-screen ${!focusMode ? "border-r border-gray-200 dark:border-[#333]" : ""}`}
                    >
                        {/* Article header */}
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 mb-4">
                                <div className="flex items-center">
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
                                        <div className="font-medium flex items-center justify-center gap-2">
                                            {post.author.name}
                                            <button className="px-1 rounded bg-black text-white dark:invert text-xs cursor-pointer">
                                                Follow
                                            </button>
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {post.author.role}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="text-sm text-gray-500 dark:text-gray-400 flex flex-row md:flex-col
                                    justify-between md:justify-center gap-2 md:gap-0 w-full md:w-fit mt-2 md:mt-0"
                                >
                                    <div>
                                        {formatDate(post.publishedAt)} ·{" "}
                                        {post.readTime || "2 min read"}
                                    </div>
                                    <div className="flex items-center justify-center text-white">
                                        <Bookmark className="size-4 cursor-pointer rounded px-2 py-1 box-content hover:bg-[#111] dark:text-white text-black hover:text-white dark:hover:bg-[#eee] dark:hover:text-black" />
                                        <span className="w-px h-[15px] dark:bg-[#ccc]/60 bg-[#444]/60" />
                                        <Share2
                                            className="size-4 cursor-pointer rounded px-2 py-1 box-content hover:bg-[#111] dark:text-white text-black hover:text-white dark:hover:bg-[#eee] dark:hover:text-black"
                                            onClick={() => sharePost(post)}
                                        />
                                        <span className="w-px h-[15px] dark:bg-[#ccc]/60 bg-[#444]/60" />
                                        <MoreHorizontal className="size-4 cursor-pointer rounded px-2 py-1 box-content hover:bg-[#111] dark:text-white text-black hover:text-white dark:hover:bg-[#eee] dark:hover:text-black" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Article content */}
                        <div className="prose dark:prose-invert max-w-none pt-4 mb-16">
                            <MarkdownPreview
                                title={post.title}
                                content={post.content}
                                thumbnailUrl={post.thumbnailUrl}
                                isDark={isDark}
                                darkBg="bg-[#111]"
                                textAlignment="left"
                                insidePost={true}
                            />
                            <div className="flex flex-wrap gap-2 mb-6">
                                {post.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Engagement section */}
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
                                    onClick={() => {
                                        if (!currentUser) {
                                            toast.error(
                                                "you need to log in first to like",
                                            );
                                        } else {
                                            handleLike(post._id);
                                            setIsLiked(!isLiked);
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
                                    className="flex items-center gap-2"
                                >
                                    <MessageSquareText className="size-4" />
                                    <span>{post.totalComments}</span>
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                    <Bookmark className="size-4" />
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

                        {/* More from author section */}
                        <div className="mb-12">
                            <h3 className="text-xl font-bold mb-4">
                                More from {post.author.name}
                            </h3>
                            <div className="grid gap-4">
                                {moreFromAuthor.map((item) => (
                                    <Card
                                        key={item.id}
                                        className="hover:shadow-md transition duration-200 shadow-none dark:bg-[#222] dark:text-[#fff] dark:border-none"
                                    >
                                        <CardContent className="p-4">
                                            <h4 className="font-medium text-lg mb-2">
                                                {item.title}
                                            </h4>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.readTime}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Related posts section */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-4">
                                Related Posts
                            </h3>
                            <div className="grid gap-4">
                                {relatedPosts.map((item) => (
                                    <Card
                                        key={item.id}
                                        className="hover:shadow-md transition duration-200 shadow-none dark:bg-[#222] dark:text-[#fff] dark:border-none"
                                    >
                                        <CardContent className="p-4">
                                            <h4 className="font-medium text-lg mb-2">
                                                {item.title}
                                            </h4>
                                            <div className="flex justify-between text-sm">
                                                <span>{item.author}</span>
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {item.readTime}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </main>

                    {/* Right sidebar - Empty as requested */}
                    <aside className="w-full md:w-64 p-4 hidden lg:block">
                        <div className="sticky top-4">
                            {/* This section is intentionally left empty as per requirements */}
                            {/* You can add content here in the future */}
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
};

export default ViewPost;
