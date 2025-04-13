import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { toast } from "sonner";

import Header from "../../components/Header/Header";
import { MarkdownPreview } from "../CreatePosts/Writing/WritingComponents";
import { useDarkMode } from "../../components/Hooks/darkMode";

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
} from "./components";

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

    const API_URL = "http://127.0.0.1:3000/feed/anonymous-user";

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
                <title>Articles Feed | OpenCanvas</title>
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
                    <div className="flex flex-col lg:flex-row">
                        {/* Left sidebar - fixed position container */}
                        <div className="hidden lg:block lg:w-64">
                            {/* This is an empty container with the same width as the sidebar */}
                            <div className="w-full lg:w-64 h-1"></div>

                            {/* The actual fixed sidebar */}
                            <div className="fixed top-24 w-64 max-h-[calc(100vh-80px)] overflow-y-auto">
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
                                {posts
                                    .filter((post) =>
                                        selectedTopics.length > 0
                                            ? post.tags.some((tag) =>
                                                  selectedTopics.includes(
                                                      tag.toLowerCase(),
                                                  ),
                                              )
                                            : true,
                                    )
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
                                                className="bg-white dark:bg-[#171717] rounded-xl shadow-sm overflow-hidden cursor-pointer"
                                                onClick={() =>
                                                    handlePostClick(post)
                                                }
                                            >
                                                {post.thumbnailUrl && (
                                                    <div className="h-52 sm:h-64 overflow-hidden">
                                                        <img
                                                            src={
                                                                post.thumbnailUrl
                                                            }
                                                            alt={post.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-5 sm:p-6">
                                                    <PostAuthorInfo
                                                        post={post}
                                                    />

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
                                                                    ) + "..." ||
                                                                    ""
                                                                }
                                                                thumbnailUrl={
                                                                    post.thumbnailUrl
                                                                }
                                                                isDark={isDark}
                                                                darkBg="bg-[#171717]"
                                                                textAlignment="left"
                                                                insidePost={
                                                                    true
                                                                }
                                                                contentOnly={
                                                                    true
                                                                }
                                                            />
                                                        </div>
                                                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-[#171717] to-transparent"></div>
                                                    </div>

                                                    {/* Post tags */}
                                                    {post.tags &&
                                                        post.tags.length >
                                                            0 && (
                                                            <PostTags
                                                                post={post}
                                                            />
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

                        {/* Right sidebar - fixed position container */}
                        <div className="hidden lg:block lg:w-72">
                            {/* This is an empty container with the same width as the sidebar */}
                            <div className="w-full lg:w-72 h-1"></div>

                            {/* The actual fixed sidebar */}
                            <div className="fixed top-24 w-72 max-h-[calc(100vh-80px)] overflow-y-auto">
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
