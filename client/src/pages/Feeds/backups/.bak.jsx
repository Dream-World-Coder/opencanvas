import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Clock } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

import Header from "../../../components/Header/Header";
import { MarkdownPreview } from "../../CreatePosts/Writing/WritingComponents";
import { useDarkMode } from "../../../components/Hooks/darkMode";

import { LeftSideBar, RightSideBar } from "../components";

const ArticleFeed = () => {
    const navigate = useNavigate();
    const isDark = useDarkMode();
    const [focusMode] = useState(!false);
    const [selectedTopics, setSelectedTopics] = useState([]);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [nextCursor, setNextCursor] = useState(null);
    const [error, setError] = useState(null);

    // Ref for infinite scrolling
    const observer = useRef();
    const lastPostElementRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMorePosts();
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore],
    );

    // Fetch initial posts
    useEffect(() => {
        fetchPosts();
    }, [selectedTopics]);

    const API_URL = `${import.meta.env.VITE_BACKEND_URL}/feed/anonymous-user`;

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);

        try {
            // console.log(nextCursor);
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    limit: 10,
                    topics:
                        selectedTopics.length > 0 ? selectedTopics : undefined,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `API request failed with status ${response.status}`,
                );
            }

            const data = await response.json();

            if (data.success) {
                setPosts(data.posts);
                setHasMore(data.hasMore);
                // console.log(data.nextCursor);
                setNextCursor(data.nextCursor);
            } else {
                setError(data.message || "Failed to load posts");
                toast.error(data.message || "Failed to load posts");
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            setError("Failed to load posts. Please try again later.");
            toast.error("Failed to load posts. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const loadMorePosts = async () => {
        if (!hasMore || loading) return;
        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    limit: 10,
                    cursor: nextCursor,
                    topics:
                        selectedTopics.length > 0 ? selectedTopics : undefined,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `API request failed with status ${response.status}`,
                );
            }

            const data = await response.json();

            if (data.success) {
                // Append new posts, filter out duplicates by ID
                const allPosts = [...posts];
                const existingIds = new Set(allPosts.map((post) => post._id));

                data.posts.forEach((post) => {
                    if (!existingIds.has(post._id)) {
                        allPosts.push(post);
                        existingIds.add(post._id);
                    }
                });

                setPosts(allPosts);
                setHasMore(data.hasMore);
                setNextCursor(data.nextCursor);
            } else {
                toast.error(data.message || "Failed to load more posts");
            }
        } catch (error) {
            console.error("Error loading more posts:", error);
            toast.error("Failed to load more posts. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handlePostClick = (post) => {
        navigate(`/p/${post._id}`, { state: { post } });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <>
            <Helmet>
                <title>Feed | OpenCanvas</title>
                <meta
                    name="description"
                    content="Discover posts from creators on OpenCanvas"
                />
            </Helmet>

            <div className="w-full h-full grid place-items-center bg-white dark:bg-[#111] overflow-x-hidden pt-20">
                <Header
                    noBlur={true}
                    ballClr={"text-gray-300"}
                    exclude={["/about", "/contact", "/photo-gallery"]}
                />
                <div className="flex flex-col md:flex-row max-w-screen-xl mx-auto bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100">
                    {/* Left sidebar */}
                    <aside
                        className={`w-full md:w-64 p-4 border-r border-gray-200 dark:border-[#333] hidden md:block`}
                    >
                        {!focusMode && (
                            <LeftSideBar
                                selectedTopics={selectedTopics}
                                setSelectedTopics={setSelectedTopics}
                            />
                        )}
                    </aside>

                    {/* Main feed */}
                    <main
                        className={`flex-1 p-4 min-h-screen min-w-[60%] border-r border-gray-200 dark:border-[#333]`}
                    >
                        {/* Error display */}
                        {error && !loading && posts.length === 0 && (
                            <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                                <p>{error}</p>
                                <Button
                                    onClick={fetchPosts}
                                    variant="outline"
                                    className="mt-2"
                                >
                                    Retry
                                </Button>
                            </div>
                        )}

                        {/* Posts feed */}
                        <div className="space-y-4">
                            {posts
                                // .filter((post) =>
                                //     selectedTopics && selectedTopics.length > 0
                                //         ? post.tags.some((tag) =>
                                //               selectedTopics.includes(tag),
                                //           )
                                //         : true,
                                // )
                                .map((post, index) => {
                                    // If it's the last post, attach ref for infinite scrolling
                                    const isLastPost =
                                        posts.length === index + 1;

                                    return (
                                        <div
                                            ref={
                                                isLastPost
                                                    ? lastPostElementRef
                                                    : null
                                            }
                                            key={post._id}
                                            className="border border-gray-200 dark:border-[#333] rounded-sm overflow-hidden cursor-pointer"
                                            onClick={() =>
                                                handlePostClick(post)
                                            }
                                        >
                                            {post.thumbnailUrl && (
                                                <div className="max-h-[350px] overflow-hidden">
                                                    <img
                                                        src={post.thumbnailUrl}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-4">
                                                <div className="flex items-center mb-3">
                                                    <Avatar className="h-8 w-8 mr-2">
                                                        <AvatarImage
                                                            src={
                                                                post.author
                                                                    ?.profilePicture
                                                            }
                                                        />
                                                        <AvatarFallback>
                                                            {post.author?.name?.charAt(
                                                                0,
                                                            ) || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <span className="font-medium text-sm">
                                                            {post.author?.name}
                                                        </span>
                                                        <div className="flex items-center text-xs text-gray-500">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {formatDate(
                                                                post.createdAt,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="relative mb-4 max-h-[250px] overflow-hidden">
                                                    <div className="prose prose-sm dark:prose-invert">
                                                        <MarkdownPreview
                                                            title={post.title}
                                                            content={
                                                                post.content.slice(
                                                                    0,
                                                                    350,
                                                                ) + "..." || ""
                                                            }
                                                            thumbnailUrl={
                                                                post.thumbnailUrl
                                                            }
                                                            isDark={isDark}
                                                            darkBg="bg-[#111]"
                                                            textAlignment="left"
                                                            insidePost={true}
                                                            contentOnly={true}
                                                        />
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-[#111] to-transparent"></div>
                                                </div>

                                                {/* {post.tags &&
                                                    post.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {post.tags.map(
                                                                (topic) => (
                                                                    <span
                                                                        key={
                                                                            topic
                                                                        }
                                                                        className="bg-gray-100 dark:bg-[#222] text-xs px-2 py-1 rounded"
                                                                    >
                                                                        {topic}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    )} */}

                                                <div className="flex items-center text-black dark:text-[#f8f8f8] text-sm">
                                                    <div className="flex items-center mr-4">
                                                        <b>
                                                            {post.totalViews ||
                                                                0}
                                                            &nbsp;
                                                        </b>
                                                        Views
                                                    </div>
                                                    <div className="flex items-center mr-4">
                                                        <b>
                                                            {post.totalLikes ||
                                                                0}
                                                            &nbsp;
                                                        </b>
                                                        Likes
                                                    </div>
                                                    <div className="flex items-center">
                                                        {post.readTime ||
                                                            "2 min read"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                            {/* Loading state */}
                            {loading &&
                                Array(3)
                                    .fill(0)
                                    .map((_, i) => (
                                        <div
                                            key={`skeleton-${i}`}
                                            className="border border-gray-200 dark:border-[#333] rounded-lg overflow-hidden"
                                        >
                                            <Skeleton className="h-48 w-full" />
                                            <div className="p-4">
                                                <div className="flex items-center mb-3">
                                                    <Skeleton className="h-8 w-8 rounded-full mr-2" />
                                                    <div>
                                                        <Skeleton className="h-4 w-32" />
                                                        <Skeleton className="h-3 w-24 mt-1" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-6 w-3/4 mb-2" />
                                                <Skeleton className="h-4 w-full mb-1" />
                                                <Skeleton className="h-4 w-full mb-1" />
                                                <Skeleton className="h-4 w-2/3 mb-4" />
                                                <div className="flex gap-2 mb-4">
                                                    <Skeleton className="h-6 w-16 rounded" />
                                                    <Skeleton className="h-6 w-16 rounded" />
                                                </div>
                                                <div className="flex">
                                                    <Skeleton className="h-4 w-16 mr-4" />
                                                    <Skeleton className="h-4 w-16" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                            {/* Empty state */}
                            {!loading && posts.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-xl text-gray-500">
                                        No posts found
                                    </p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Try different topics or check back later
                                    </p>
                                </div>
                            )}

                            {/* End of feed msg */}
                            {!loading && !hasMore && posts.length > 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>You&apos;ve reached the end</p>
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Right sidebar */}
                    <aside className="w-full md:w-64 p-4 hidden lg:block">
                        {!focusMode && <RightSideBar />}
                    </aside>
                </div>
            </div>
        </>
    );
};

export default ArticleFeed;


// V2
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { toast } from "sonner";

import Header from "../../../components/Header/Header";
import { MarkdownPreview } from "../../CreatePosts/Writing/WritingComponents";
import { useDarkMode } from "../../../components/Hooks/darkMode";

import {
    LeftSideBar,
    RightSideBar,
    ErrorDisplay,
    PostStats,
    PostTags,
    NoPosts,
    EndOfFeed,
    LoadingSkeleton,
    PostAuthorInfo,
} from "../components";

const ArticleFeed = () => {
    const navigate = useNavigate();
    const isDark = useDarkMode();
    const [focusMode] = useState(false);
    const [selectedTopics, setSelectedTopics] = useState([]);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [nextCursor, setNextCursor] = useState(null);
    const [error, setError] = useState(null);

    const API_URL = `${import.meta.env.VITE_BACKEND_URL}/feed/anonymous-user`;

    // Ref for infinite scrolling
    const observer = useRef();
    const lastPostElementRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMorePosts();
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore],
    );

    // Fetch initial posts
    useEffect(() => {
        fetchPosts();
    }, [selectedTopics]);

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    limit: 10,
                    topics:
                        selectedTopics.length > 0 ? selectedTopics : undefined,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `API request failed with status ${response.status}`,
                );
            }

            const data = await response.json();

            if (data.success) {
                setPosts(data.posts);
                setHasMore(data.hasMore);
                setNextCursor(data.nextCursor);
            } else {
                setError(data.message || "Failed to load posts");
                toast.error(data.message || "Failed to load posts");
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            setError("Failed to load posts. Please try again later.");
            toast.error("Failed to load posts. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const loadMorePosts = async () => {
        if (!hasMore || loading) return;
        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    limit: 10,
                    cursor: nextCursor,
                    topics:
                        selectedTopics.length > 0 ? selectedTopics : undefined,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `API request failed with status ${response.status}`,
                );
            }

            const data = await response.json();

            if (data.success) {
                // Append new posts, filter out duplicates by ID
                const allPosts = [...posts];
                const existingIds = new Set(allPosts.map((post) => post._id));

                data.posts.forEach((post) => {
                    if (!existingIds.has(post._id)) {
                        allPosts.push(post);
                        existingIds.add(post._id);
                    }
                });

                setPosts(allPosts);
                setHasMore(data.hasMore);
                setNextCursor(data.nextCursor);
            } else {
                toast.error(data.message || "Failed to load more posts");
            }
        } catch (error) {
            console.error("Error loading more posts:", error);
            toast.error("Failed to load more posts. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handlePostClick = (post) => {
        navigate(`/p/${post._id}`, { state: { post } });
    };

    return (
        <>
            <Helmet>
                <title>Feed | OpenCanvas</title>
                <meta
                    name="description"
                    content="Discover posts from creators on OpenCanvas"
                />
            </Helmet>

            <div className="w-full min-h-screen bg-gray-50 dark:bg-[#0f0f0f] overflow-x-hidden pt-16">
                <Header
                    noBlur={true}
                    ballClr={"text-gray-300"}
                    exclude={[
                        "/about",
                        "/contact",
                        "/photo-gallery",
                        "/articles",
                    ]}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
                    <div className="flex flex-col lg:flex-row relative">
                        {/* Left sidebar */}
                        <aside className="w-full lg:w-64 lg:sticky lg:top-10 h-fit hidden lg:block">
                            {!focusMode && (
                                <LeftSideBar
                                    selectedTopics={selectedTopics}
                                    setSelectedTopics={setSelectedTopics}
                                />
                            )}
                        </aside>

                        {/* Main feed */}
                        <main className="w-full lg:max-w-2xl mx-auto lg:mx-6 mt-2">
                            {/* Mobile topics menu */}
                            <div className="lg:hidden mb-4">
                                <div className="bg-white dark:bg-[#171717] p-4 rounded-xl shadow-sm">
                                    <details>
                                        <summary className="font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
                                            Topics ({selectedTopics.length})
                                        </summary>
                                        <div className="mt-3">
                                            {!focusMode && (
                                                <LeftSideBar
                                                    selectedTopics={
                                                        selectedTopics
                                                    }
                                                    setSelectedTopics={
                                                        setSelectedTopics
                                                    }
                                                />
                                            )}
                                        </div>
                                    </details>
                                </div>
                            </div>

                            {/* Error display */}
                            {error && !loading && posts.length === 0 && (
                                <ErrorDisplay />
                            )}

                            {/* Posts feed */}
                            <div className="space-y-6">
                                {posts.map((post, index) => {
                                    // If it's the last post, attach ref for infinite scrolling
                                    const isLastPost =
                                        posts.length === index + 1;

                                    return (
                                        <div
                                            ref={
                                                isLastPost
                                                    ? lastPostElementRef
                                                    : null
                                            }
                                            key={post._id}
                                            className="bg-white dark:bg-[#171717] rounded-xl shadow-sm overflow-hidden cursor-pointer"
                                            onClick={() =>
                                                handlePostClick(post)
                                            }
                                        >
                                            {post.thumbnailUrl && (
                                                <div className="h-52 sm:h-64 overflow-hidden">
                                                    <img
                                                        src={post.thumbnailUrl}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-5 sm:p-6">
                                                <PostAuthorInfo post={post} />

                                                <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                                                    {post.title}
                                                </h2>

                                                <div className="relative mb-5 max-h-[220px] overflow-hidden">
                                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                                        <MarkdownPreview
                                                            content={
                                                                post.content.slice(
                                                                    0,
                                                                    350,
                                                                ) + "..." || ""
                                                            }
                                                            thumbnailUrl={
                                                                post.thumbnailUrl
                                                            }
                                                            isDark={isDark}
                                                            darkBg="bg-[#171717]"
                                                            textAlignment="left"
                                                            insidePost={true}
                                                            contentOnly={true}
                                                        />
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-[#171717] to-transparent"></div>
                                                </div>

                                                {/* Post tags */}
                                                {post.tags &&
                                                    post.tags.length > 0 && (
                                                        <PostTags post={post} />
                                                    )}

                                                {/* Post stats */}
                                                <PostStats post={post} />
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Loading state */}
                                {loading && <LoadingSkeleton />}

                                {/* Empty state */}
                                {!loading && posts.length === 0 && (
                                    <NoPosts fetchPosts={fetchPosts} />
                                )}

                                {/* End of feed message */}
                                {!loading && !hasMore && posts.length > 0 && (
                                    <EndOfFeed />
                                )}
                            </div>
                        </main>

                        {/* Right sidebar */}
                        <aside className="w-full lg:w-72 lg:sticky lg:top-10 h-fit mt-6 lg:mt-0 hidden lg:block">
                            {!focusMode && <RightSideBar />}
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ArticleFeed;

// V3
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useInfiniteQuery } from "@tanstack/react-query";

import { toast } from "sonner";

import Header from "../../../components/Header/Header";
import { MarkdownPreview } from "../../CreatePosts/Writing/WritingComponents";
import { useDarkMode } from "../../../components/Hooks/darkMode";

import {
    LeftSideBar,
    RightSideBar,
    ErrorDisplay,
    PostStats,
    PostTags,
    NoPosts,
    EndOfFeed,
    LoadingSkeleton,
    PostAuthorInfo,
} from "../components";

const ArticleFeed = () => {
    const navigate = useNavigate();
    const isDark = useDarkMode();
    const [focusMode] = useState(false);
    const [selectedTopics, setSelectedTopics] = useState([]);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [nextCursor, setNextCursor] = useState(null);
    const [error, setError] = useState(null);

    const API_URL = `${import.meta.env.VITE_BACKEND_URL}/feed/anonymous-user`;

    // Ref for infinite scrolling
    const observer = useRef();
    const lastPostElementRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMorePosts();
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore],
    );

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    limit: 16,
                    // topics:
                    //     selectedTopics.length > 0 ? selectedTopics : undefined,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `API request failed with status ${response.status}`,
                );
            }

            const data = await response.json();

            if (data.success) {
                setPosts(data.posts);
                setHasMore(data.hasMore);
                setNextCursor(data.nextCursor);
            } else {
                setError(data.message || "Failed to load posts");
                toast.error(data.message || "Failed to load posts");
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            setError("Failed to load posts. Please try again later.");
            toast.error("Failed to load posts. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const loadMorePosts = async () => {
        if (!hasMore || loading) return;
        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    limit: 16,
                    cursor: nextCursor,
                    // topics:
                    //     selectedTopics.length > 0 ? selectedTopics : undefined,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `API request failed with status ${response.status}`,
                );
            }

            const data = await response.json();

            if (data.success) {
                // Append new posts, filter out duplicates by ID
                const allPosts = [...posts];
                const existingIds = new Set(allPosts.map((post) => post._id));

                data.posts.forEach((post) => {
                    if (!existingIds.has(post._id)) {
                        allPosts.push(post);
                        existingIds.add(post._id);
                    }
                });

                setPosts(allPosts);
                setHasMore(data.hasMore);
                setNextCursor(data.nextCursor);
            } else {
                toast.error(data.message || "Failed to load more posts");
            }
        } catch (error) {
            console.error("Error loading more posts:", error);
            toast.error("Failed to load more posts. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // fetch initial posts
    useEffect(() => {
        fetchPosts();
    }, []);

    const handlePostClick = (post) => {
        navigate(`/p/${post._id}`, { state: { post } });
    };

    const finalFilteredPosts = posts.filter((post) =>
        selectedTopics.length > 0
            ? post.tags.some((tag) =>
                  selectedTopics.includes(tag.toLowerCase()),
              )
            : true,
    );

    return (
        <>
            <Helmet>
                <title>Articles Feed | OpenCanvas</title>
                <meta
                    name="description"
                    content="Discover posts from creators on OpenCanvas"
                />
            </Helmet>

            <div className="w-full min-h-screen bg-gray-50 dark:bg-[#0f0f0f] overflow-x-hidden pt-12">
                <Header
                    noBlur={true}
                    ballClr={"text-gray-300"}
                    exclude={[
                        "/about",
                        "/contact",
                        "/photo-gallery",
                        "/articles",
                    ]}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
                    <div className="flex flex-col lg:flex-row">
                        {/* Left sidebar - fixed position container */}
                        <div className="hidden lg:block lg:w-64">
                            {/* This is an empty container with the same width as the sidebar */}
                            <div className="w-full lg:w-64 h-1"></div>

                            {/* The actual fixed sidebar */}
                            <div className="fixed top-20 w-64 max-h-[calc(100vh-80px)] overflow-y-auto">
                                {!focusMode && (
                                    <LeftSideBar
                                        selectedTopics={selectedTopics}
                                        setSelectedTopics={setSelectedTopics}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Main feed */}
                        <main className="w-full lg:max-w-2xl mx-auto lg:mx-6 mt-2">
                            {/* Mobile topics menu */}
                            <div className="lg:hidden mb-4">
                                <div className="bg-white dark:bg-[#222] p-4 rounded-xl shadow-sm">
                                    <details>
                                        <summary className="font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
                                            Topics ({selectedTopics.length})
                                        </summary>
                                        <div className="mt-3">
                                            {!focusMode && (
                                                <LeftSideBar
                                                    selectedTopics={
                                                        selectedTopics
                                                    }
                                                    setSelectedTopics={
                                                        setSelectedTopics
                                                    }
                                                />
                                            )}
                                        </div>
                                    </details>
                                </div>
                            </div>

                            {/* Error display */}
                            {error && !loading && posts.length === 0 && (
                                <ErrorDisplay />
                            )}

                            {/* Posts feed */}
                            <div className="space-y-6">
                                {finalFilteredPosts.map((post, index) => {
                                    // If it's the last post, attach ref for infinite scrolling
                                    const isLastPost =
                                        posts.length === index + 1;

                                    return (
                                        <div
                                            ref={
                                                isLastPost
                                                    ? lastPostElementRef
                                                    : null
                                            }
                                            key={post._id}
                                            className="bg-white dark:bg-[#222] rounded-xl shadow-sm overflow-hidden cursor-pointer"
                                            onClick={() =>
                                                handlePostClick(post)
                                            }
                                        >
                                            {post.thumbnailUrl && (
                                                <div className="overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-[#333] max-h-72">
                                                    <img
                                                        src={post.thumbnailUrl}
                                                        alt={post.title}
                                                        className="object-contain aspect-video" // just change it to cover for filling results
                                                    />
                                                </div>
                                            )}
                                            <div className="p-5 sm:p-6">
                                                <PostAuthorInfo post={post} />

                                                <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                                                    {post.title}
                                                </h2>

                                                <div className="relative mb-5 max-h-[220px] overflow-hidden">
                                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                                        <MarkdownPreview
                                                            content={
                                                                post.content.slice(
                                                                    0,
                                                                    350,
                                                                ) + "..." || ""
                                                            }
                                                            thumbnailUrl={
                                                                post.thumbnailUrl
                                                            }
                                                            isDark={isDark}
                                                            darkBg="bg-[#222]"
                                                            textAlignment={
                                                                post.type ===
                                                                "poem"
                                                                    ? "left"
                                                                    : "left"
                                                            }
                                                            insidePost={true}
                                                            contentOnly={true}
                                                            // artType={
                                                            //     post.type
                                                            // }
                                                        />
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-[#222] to-transparent"></div>
                                                </div>

                                                {/* Post tags */}
                                                {post.tags &&
                                                    post.tags.length > 0 && (
                                                        <PostTags post={post} />
                                                    )}

                                                {/* Post stats */}
                                                <PostStats post={post} />
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Loading state */}
                                {loading && <LoadingSkeleton />}

                                {/* Empty state */}
                                {!loading &&
                                    finalFilteredPosts.length === 0 && (
                                        <NoPosts fetchPosts={fetchPosts} />
                                    )}

                                {/* End of feed message */}
                                {!loading &&
                                    !hasMore &&
                                    finalFilteredPosts.length > 0 && (
                                        <EndOfFeed />
                                    )}
                            </div>
                        </main>

                        {/* Right sidebar - fixed position container */}
                        <div className="hidden lg:block lg:w-72">
                            {/* This is an empty container with the same width as the sidebar */}
                            <div className="w-full lg:w-72 h-1"></div>

                            {/* The actual fixed sidebar */}
                            <div className="fixed top-20 w-72 max-h-[calc(100vh-80px)] overflow-y-auto">
                                {!focusMode && <RightSideBar />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ArticleFeed;



/*
Art Gallery:
*/
export const LiteratureFeed2 = ({ bgClr = "bg-cream-light" }) => {
    const filters = [
        "all",
        "romance",
        "experience",
        "horror",
        "sad",
        "fantasy",
    ];

    return (
        <div
            className={`min-h-screen ${bgClr} dark:bg-black dark:text-[#f2f2f2] pt-24`}
        >
            <Header filters={filters} />

            {/* Main Content */}
            <div className="max-w-3xl mx-auto pb-24">
                <div className="grid grid-cols-1 w-full">
                    {stories.map((story, index) => (
                        <article key={index} className="w-full">
                            <div
                                className={`p-8 border-b border-stone-200
                                    hover:border-stone-300 transition-all duration-500 group
                                    hover:shadow-lg hover:shadow-stone-100/50 dark:shadow-none dark:border-[#333] dark:hover:shadow-none dark:hover:border-[#333]`}
                            >
                                <header className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs text-stone-500 uppercase font-bold md:font-light font-stardom md:font-serif underline underline-offset-4 decoration-2 decoration-lime-300/75 dark:text-gray-300 dark:hover:text-gray-300">
                                            {story.type}
                                        </span>
                                        <span className="text-xs text-stone-400 italic font-bold md:font-light font-stardom md:font-serif dark:text-gray-300 dark:hover:text-gray-300">
                                            {story.date}
                                        </span>
                                    </div>
                                    <h2 className="font-serif text-xl text-stone-800 mb-2 hover:text-stone-900 transition-colors dark:text-gray-200 dark:hover:text-gray-200">
                                        {story.title}
                                    </h2>
                                    <p className="text-sm text-stone-600 font-light dark:text-gray-400 dark:hover:text-gray-400">
                                        by{" "}
                                        <span
                                            href="#"
                                            className="text-stone-700 font-bold md:font-light font-stardom underline cursor-auto dark:text-gray-400 dark:hover:text-gray-400"
                                        >
                                            {story.author}
                                        </span>
                                    </p>
                                </header>

                                <div className="mb-6">
                                    <p className="text-base leading-relaxed text-stone-700 whitespace-pre-line font-light dark:text-gray-300 font-[montserrat]">
                                        {story.excerpt.length > 300
                                            ? `${story.excerpt.slice(0, 300)}...`
                                            : story.excerpt}
                                    </p>
                                </div>

                                <footer className="flex items-center justify-between text-stone-500 dark:text-gray-200 dark:hover:text-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <button className="flex items-center space-x-1 text-xs hover:text-stone-700 transition-colors cursor-auto dark:text-gray-200 dark:hover:text-gray-200">
                                            <Heart size={14} />
                                            <span>{story.likes}</span>
                                        </button>
                                        <button className="flex items-center space-x-1 text-xs hover:text-stone-700 transition-colors cursor-auto dark:text-gray-200 dark:hover:text-gray-200">
                                            <MessageSquareText size={14} />
                                            <span>{story.saves}</span>
                                        </button>
                                    </div>
                                    <span
                                        className="group text-xs text-stone-600 group-hover:text-stone-950 group-hover:bg-lime-300/60
                                        border group-hover:border-lime-300 dark:text-gray-200 dark:hover:text-gray-200 dark:group-hover:text-gray-200 dark:group-hover:bg-lime-600/60
                                        px-3 py-1 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        Read
                                        <ArrowRight
                                            size={12}
                                            className={`transition-transform duration-300 group-hover:translate-x-1`}
                                        />
                                    </span>
                                </footer>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};
