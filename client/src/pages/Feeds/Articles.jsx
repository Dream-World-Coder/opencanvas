import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Eye, ThumbsUp, Clock } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

import Header from "../../components/Header/Header";
import { MarkdownPreview } from "../CreatePosts/Writing/WritingComponents";
import { useDarkMode } from "../../components/Hooks/darkMode";

import { LeftSideBar, RightSideBar } from "./components";

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
    [loading, hasMore]
  );

  // Fetch initial posts
  useEffect(() => {
    fetchPosts();
  }, [selectedTopics]);

  const API_URL = "http://127.0.0.1:3000/feed/anonymous-user";

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
        console.log(nextCursor);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: 10,
          topics: selectedTopics.length > 0 ? selectedTopics : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
        setHasMore(data.hasMore);
          console.log(data.nextCursor);
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
          topics: selectedTopics.length > 0 ? selectedTopics : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
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

  const handlePostClick = (postId) => {
    navigate(`/p/${postId}`);
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
          exclude={[
            "/about",
            "/contact",
            "/gallery/photos",
            "/gallery/literature",
          ]}
        />
        <div className="flex flex-col md:flex-row max-w-screen-xl mx-auto bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100">
          {/* Left sidebar */}
          <aside className={`w-full md:w-64 p-4 ${!focusMode ? "border-r border-gray-200 dark:border-[#333]" : ""} hidden md:block`}>
            {!focusMode && (
              <LeftSideBar
                selectedTopics={selectedTopics}
                setSelectedTopics={setSelectedTopics}
              />
            )}
          </aside>

          {/* Main feed */}
          <main className={`flex-1 p-4 min-h-screen ${!focusMode ? "border-r border-gray-200 dark:border-[#333]" : ""}`}>
            {/* Error display */}
            {error && !loading && posts.length === 0 && (
              <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                <p>{error}</p>
                <Button onClick={fetchPosts} variant="outline" className="mt-2">
                  Retry
                </Button>
              </div>
            )}

            {/* Posts feed */}
            <div className="space-y-4">
              {posts.map((post, index) => {
                // If it's the last post, attach ref for infinite scrolling
                const isLastPost = posts.length === index + 1;

                return (
                  <div
                    ref={isLastPost ? lastPostElementRef : null}
                    key={post._id}
                    className="border border-gray-200 dark:border-[#333] rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => handlePostClick(post._id)}
                  >
                    {post.thumbnailUrl && (
                      <div className="h-72 overflow-hidden">
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
                          <AvatarImage src={post.author?.profilePicture} />
                          <AvatarFallback>
                            {post.author?.displayName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-sm">
                            {post.author?.displayName || post.author?.fullName}
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(post.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="relative mb-4 max-h-[250px] overflow-hidden">
                        <div className="prose prose-sm dark:prose-invert">
                          <MarkdownPreview
                            title={post.title}
                            content={post.content.slice(0, 500) + "..." || ""}
                            thumbnailUrl={post.thumbnailUrl}
                            isDark={isDark}
                            darkBg="bg-[#111]"
                            textAlignment="left"
                            insidePost={true}
                            contentOnly={true}
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-[#111] to-transparent"></div>
                      </div>

                      {post.topics && post.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.topics.map((topic) => (
                            <span
                              key={topic}
                              className="bg-gray-100 dark:bg-[#222] text-xs px-2 py-1 rounded"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center text-gray-500 text-sm">
                        <div className="flex items-center mr-4">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {post.totalLikes || 0}
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {post.views || post.totalViews || 0}
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
                  <p className="text-xl text-gray-500">No posts found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Try different topics or check back later
                  </p>
                </div>
              )}

              {/* End of feed message */}
              {!loading && !hasMore && posts.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>You've reached the end</p>
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
