import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Eye, ThumbsUp, Clock, Filter } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

import Header from "../../components/Header/Header";
import { useAuth } from "../../contexts/AuthContext";
import { useDarkMode } from "../../components/Hooks/darkMode";

/**
 * It is a common feed
 * if user is authenticated show him different things,
 * No need to create seperate components, just modify it
 */

const ArticleFeed = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const isDark = useDarkMode();
    const [focusMode, setFocusMode] = useState(false);
    const [selectedTopics, setSelectedTopics] = useState([]);

    // Feed state
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [nextCursor, setNextCursor] = useState(null);
    const [error, setError] = useState(null);
    const [pageNumber, setPageNumber] = useState(1); // Fallback pagination

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

    // API URL - adjust this to match your actual backend route
    const API_URL = "http://127.0.0.1:3000/feed/anonymous-user";

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        setPageNumber(1);

        try {
            console.log("Fetching initial posts");

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
            console.log("Received initial posts:", data);

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

            // Load mock data for development
            if (process.env.NODE_ENV === "development") {
                loadMockData();
            }
        } finally {
            setLoading(false);
        }
    };

    const loadMorePosts = async () => {
        if (!hasMore || loading) return;

        setLoading(true);
        const nextPage = pageNumber + 1;

        try {
            console.log("Loading more posts, page:", nextPage);

            // Prepare request body - handle cursor properly
            const requestBody = {
                limit: 10,
                topics: selectedTopics.length > 0 ? selectedTopics : undefined,
            };

            // Only include cursor if it exists and has a valid format
            if (nextCursor) {
                try {
                    // Simple validation - check if it's base64 encoded
                    const decoded = atob(nextCursor);
                    // Check if it's valid JSON
                    JSON.parse(decoded);
                    requestBody.cursor = nextCursor;
                } catch (e) {
                    console.warn(
                        "Invalid cursor format, falling back to page-based pagination",
                    );
                    // Use page-based pagination as fallback
                    requestBody.page = nextPage;
                }
            } else {
                // Use page-based pagination as fallback
                requestBody.page = nextPage;
            }

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(
                    `API request failed with status ${response.status}`,
                );
            }

            const data = await response.json();
            console.log("Received more posts:", data);

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
                setPageNumber(nextPage);
            } else {
                toast.error(data.message || "Failed to load more posts");
            }
        } catch (error) {
            console.error("Error loading more posts:", error);
            toast.error("Failed to load more posts. Please try again later.");

            // Load mock data for development
            if (process.env.NODE_ENV === "development") {
                loadMoreMockData();
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle manual load more button click
    const handleLoadMoreClick = () => {
        if (!loading && hasMore) {
            loadMorePosts();
        }
    };

    // Mock data helpers for development
    const loadMockData = () => {
        console.log("Loading mock data");
        const mockPosts = generateMockPosts(10);
        setPosts(mockPosts);
        setHasMore(true);
        setNextCursor("mock-cursor-1");
    };

    const loadMoreMockData = () => {
        console.log("Loading more mock data");
        const moreMockPosts = generateMockPosts(5, posts.length);
        setPosts((prevPosts) => [...prevPosts, ...moreMockPosts]);
        setHasMore(moreMockPosts.length >= 5);
        setNextCursor(moreMockPosts.length >= 5 ? "mock-cursor-2" : null);
    };

    const generateMockPosts = (count, startIndex = 0) => {
        return Array(count)
            .fill(0)
            .map((_, i) => ({
                _id: `mock-post-${startIndex + i + 1}`,
                title: `Sample Post ${startIndex + i + 1}`,
                content: `This is a sample post content. It contains enough text to demonstrate how the excerpt would look in the feed. We want to make sure it's long enough to be truncated properly when displayed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nisl eu nisl.`,
                author: {
                    _id: `user-${(i % 5) + 1}`,
                    username: `user${(i % 5) + 1}`,
                    displayName: `User ${(i % 5) + 1}`,
                    profilePicture: null,
                },
                createdAt: new Date(Date.now() - i * 86400000).toISOString(),
                totalLikes: Math.floor(Math.random() * 100),
                views: Math.floor(Math.random() * 1000),
                topics: ["Technology", "Writing"].filter(
                    () => Math.random() > 0.5,
                ),
            }));
    };

    // Navigate to post detail page
    const handlePostClick = (postId) => {
        navigate(`/p/${postId}`);
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Truncate content for excerpt
    const createExcerpt = (content) => {
        if (!content) return "";
        // Strip markdown syntax for cleaner excerpt
        const plainText = content
            .replace(/#{1,6}\s/g, "") // Remove headings
            .replace(/\*\*/g, "") // Remove bold
            .replace(/\*/g, "") // Remove italic
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Replace links with just the text
            .replace(/!\[.*?\]\(.*?\)/g, "[image]") // Replace images
            .replace(/```[\s\S]*?```/g, "[code]") // Replace code blocks
            .replace(/`([^`]+)`/g, "$1"); // Replace inline code

        return plainText.length > 500
            ? plainText.substring(0, 500) + "..."
            : plainText;
    };

    const feedOptions = [
        { name: "For You", href: "#" },
        { name: "Following", href: "#" },
        { name: "Popular", href: "#" },
        { name: "Recommended", href: "#" },
        { name: "Latest", href: "#" },
    ];

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
                    exclude={[
                        "/about",
                        "/contact",
                        "/gallery/photos",
                        "/gallery/literature",
                    ]}
                />
                <div className="flex flex-col md:flex-row max-w-screen-xl mx-auto bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100">
                    {/* Left sidebar - Feed Options */}
                    <aside
                        className={`w-full md:w-64 p-4 ${!focusMode ? "border-r border-gray-200 dark:border-[#333]" : ""} hidden md:block`}
                    >
                        {!focusMode && (
                            <div className="sticky top-4">
                                <div className="font-bold mb-4">
                                    Feed Options
                                </div>
                                <nav className="space-y-2">
                                    {feedOptions.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.href}
                                            className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[#222] transition duration-0"
                                        >
                                            {link.name}
                                        </a>
                                    ))}
                                </nav>

                                <div className="mt-8">
                                    <div className="font-bold mb-4 flex items-center">
                                        <Filter className="w-4 h-4 mr-2" />
                                        Topics
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            "Technology",
                                            "Writing",
                                            "Art",
                                            "Science",
                                            "Philosophy",
                                        ].map((topic) => (
                                            <div
                                                key={topic}
                                                className="flex items-center"
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`topic-${topic}`}
                                                    className="mr-2"
                                                    onChange={() => {
                                                        setSelectedTopics(
                                                            (prev) => {
                                                                if (
                                                                    prev.includes(
                                                                        topic,
                                                                    )
                                                                ) {
                                                                    return prev.filter(
                                                                        (t) =>
                                                                            t !==
                                                                            topic,
                                                                    );
                                                                } else {
                                                                    return [
                                                                        ...prev,
                                                                        topic,
                                                                    ];
                                                                }
                                                            },
                                                        );
                                                    }}
                                                    checked={selectedTopics.includes(
                                                        topic,
                                                    )}
                                                />
                                                <label
                                                    htmlFor={`topic-${topic}`}
                                                >
                                                    {topic}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* Main content - Feed */}
                    <main
                        className={`flex-1 p-4 md:p-6 lg:p-8 min-h-screen ${!focusMode ? "border-r border-gray-200 dark:border-[#333]" : ""}`}
                    >
                        <h1 className="text-2xl font-bold mb-6">
                            Discover Posts
                        </h1>

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

                        {/* Posts Feed */}
                        <div className="space-y-8">
                            {posts.map((post, index) => {
                                // If it's the last post, attach ref for infinite scrolling
                                if (posts.length === index + 1) {
                                    return (
                                        <div
                                            ref={lastPostElementRef}
                                            key={post._id}
                                            className="border border-gray-200 dark:border-[#333] rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                                            onClick={() =>
                                                handlePostClick(post._id)
                                            }
                                        >
                                            {post.thumbnailUrl && (
                                                <div className="h-48 overflow-hidden">
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
                                                            {post.author?.fullName?.charAt(
                                                                0,
                                                            ) ||
                                                                post.author?.username?.charAt(
                                                                    0,
                                                                ) ||
                                                                "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <span className="font-medium text-sm">
                                                            {post.author
                                                                ?.fullName ||
                                                                post.author
                                                                    ?.username}
                                                        </span>
                                                        <div className="flex items-center text-xs text-gray-500">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {formatDate(
                                                                post.createdAt,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <h2 className="text-xl font-bold mb-2">
                                                    {post.title}
                                                </h2>
                                                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                                                    {createExcerpt(
                                                        post.content,
                                                    )}
                                                </p>

                                                {post.topics &&
                                                    post.topics.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {post.topics.map(
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
                                                    )}

                                                <div className="flex items-center text-gray-500 text-sm">
                                                    <div className="flex items-center mr-4">
                                                        <ThumbsUp className="h-4 w-4 mr-1" />
                                                        {post.totalLikes || 0}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        {post.views || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div
                                            key={post._id}
                                            className="border border-gray-200 dark:border-[#333] rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                                            onClick={() =>
                                                handlePostClick(post._id)
                                            }
                                        >
                                            {post.thumbnailUrl && (
                                                <div className="h-48 overflow-hidden">
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
                                                            {post.author?.displayName?.charAt(
                                                                0,
                                                            ) ||
                                                                post.author?.username?.charAt(
                                                                    0,
                                                                ) ||
                                                                "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <span className="font-medium text-sm">
                                                            {post.author
                                                                ?.fullName ||
                                                                post.author
                                                                    ?.username}
                                                        </span>
                                                        <div className="flex items-center text-xs text-gray-500">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {formatDate(
                                                                post.createdAt,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <h2 className="text-xl font-bold mb-2">
                                                    {post.title}
                                                </h2>
                                                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                                                    {createExcerpt(
                                                        post.content,
                                                    )}
                                                </p>

                                                {post.topics &&
                                                    post.topics.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {post.topics.map(
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
                                                    )}

                                                <div className="flex items-center text-gray-500 text-sm">
                                                    <div className="flex items-center">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        {post.totalViews || 0}
                                                    </div>
                                                    <div className="flex items-center mr-4">
                                                        <ThumbsUp className="h-4 w-4 mr-1" />
                                                        {post.totalLikes || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            })}

                            {/* Loading state for infinite scroll */}
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

                            {/* Manual load more button as fallback */}
                            {!loading && hasMore && posts.length > 0 && (
                                <div className="text-center py-4">
                                    <Button
                                        onClick={handleLoadMoreClick}
                                        variant="outline"
                                    >
                                        Load More Posts
                                    </Button>
                                </div>
                            )}

                            {!hasMore && posts.length > 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>You've reached the end</p>
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Right sidebar */}
                    <aside className="w-full md:w-64 p-4 hidden lg:block">
                        <div className="sticky top-4">
                            <div className="p-4 border border-gray-200 dark:border-[#333] rounded-lg mb-6">
                                <h3 className="font-bold mb-3">
                                    Trending Topics
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        "#Technology",
                                        "#Writing",
                                        "#Programming",
                                        "#ArtificialIntelligence",
                                        "#CreativeWriting",
                                    ].map((tag) => (
                                        <div
                                            key={tag}
                                            className="text-sm cursor-pointer hover:text-blue-500"
                                        >
                                            {tag}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {currentUser ? (
                                <div className="p-4 border border-gray-200 dark:border-[#333] rounded-lg">
                                    <h3 className="font-bold mb-3">
                                        Suggested Writers
                                    </h3>
                                    <div className="space-y-3">
                                        {Array(3)
                                            .fill(0)
                                            .map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center"
                                                >
                                                    <Avatar className="h-8 w-8 mr-2">
                                                        <AvatarFallback>
                                                            U
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="text-sm">
                                                        Writer Name
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="ml-auto text-xs px-2 py-0 h-6"
                                                    >
                                                        Follow
                                                    </Button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 border border-gray-200 dark:border-[#333] rounded-lg">
                                    <h3 className="font-bold mb-3">
                                        Join OpenCanvas
                                    </h3>
                                    <p className="text-sm mb-4">
                                        Sign up to follow writers, like posts,
                                        and create your own content.
                                    </p>
                                    <Button
                                        onClick={() => navigate("/signup")}
                                        className="w-full mb-2"
                                    >
                                        Sign Up
                                    </Button>
                                    <Button
                                        onClick={() => navigate("/login")}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Log In
                                    </Button>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
};

export default ArticleFeed;
