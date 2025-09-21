import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useInfiniteQuery } from "@tanstack/react-query";

import Header from "@/components/Header/Header";
import { MarkdownPreview } from "@/pages/Create/Editor/components";
import { useDarkMode } from "@/components/Hooks/darkMode";

import {
  // LeftSideBar,
  // RightSideBar,
  ErrorDisplay,
  PostStats,
  PostTags,
  NoPosts,
  EndOfFeed,
  LoadingSkeleton,
  PostAuthorInfo,
} from "./components";

// https://www.youtube.com/watch?v=GEeBG7AoQdM

const SocialFeed = () => {
  const navigate = useNavigate();
  const isDark = useDarkMode();
  const [selectedTopics, setSelectedTopics] = useState([]);

  const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/feed/social/anonymous-user`;

  // Function to handle post click navigation
  const handlePostClick = (post) => {
    navigate(`/p/${post._id}`, { state: { post } });
  };

  const fetchSocialPosts = async ({ pageParam = null }) => {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        limit: 16,
        cursor: pageParam,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to load posts");
    }

    return data;
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["feed", "social"],
    queryFn: fetchSocialPosts,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Process all pages of posts into a flat array and deduplicate
  const allPosts = data?.pages.flatMap((page) => page.posts) || [];
  const uniquePosts = [
    ...new Map(allPosts.map((post) => [post._id, post])).values(),
  ];

  // Apply any additional filtering (if needed)
  const finalFilteredPosts = uniquePosts;

  // Set up infinite scrolling with Intersection Observer
  const observer = useRef();
  const lastPostElementRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  // Handle showing error messages
  const errorMessage = error?.message || "Failed to load posts";

  // Determine loading state for UI
  const isLoading = status === "loading";

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-[#0f0f0f] overflow-x-hidden pt-12">
      <Helmet>
        <title>Articles Feed | OpenCanvas</title>
        <meta
          name="description"
          content="Discover posts from creators on OpenCanvas"
        />
      </Helmet>

      <Header
        noBlur={true}
        ballClr={"text-gray-300"}
        exclude={["/about", "/contact", "/photo-gallery", "/social"]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        <div className="flex flex-col lg:flex-row">
          {/* Left sidebar - fixed position container */}
          <div className="hidden lg:block lg:w-64">
            {/* This is an empty container with the same width as the sidebar */}
            <div className="w-full lg:w-64 h-1"></div>

            {/* The actual fixed sidebar */}
            <div className="fixed top-20 w-64 max-h-[calc(100vh-80px)] overflow-y-auto">
              {/* <LeftSideBar
                selectedTopics={selectedTopics}
                setSelectedTopics={setSelectedTopics}
              /> */}
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
                  <div className="mt-3">{/* <LeftSideBar /> */}</div>
                </details>
              </div>
            </div>

            {/* Error display */}
            {error && !isLoading && uniquePosts.length === 0 && (
              <ErrorDisplay message={errorMessage} />
            )}

            {/* Posts feed */}
            <div className="space-y-6">
              {finalFilteredPosts.map((post, index) => {
                // If it's the last post, attach ref for infinite scrolling
                const isLastPost = uniquePosts.length === index + 1;

                return (
                  <div
                    ref={isLastPost ? lastPostElementRef : null}
                    key={post._id}
                    className="bg-white dark:bg-[#222] rounded-xl shadow-sm overflow-hidden cursor-pointer"
                    onClick={() => handlePostClick(post)}
                  >
                    {post.thumbnailUrl && (
                      <div className="overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-[#333] max-h-80">
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          className="object-contain aspect-video w-full"
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
                            content={post.content.slice(0, 700) + "..." || ""}
                            thumbnailUrl={post.thumbnailUrl}
                            isDark={isDark}
                            darkBg="bg-[#222]"
                            textAlignment={
                              post.type === "poem" ? "left" : "left"
                            }
                            insidePost={true}
                            contentOnly={true}
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-[#222] to-transparent"></div>
                      </div>

                      {/* Post tags */}
                      {post.tags && post.tags.length > 0 && (
                        <PostTags post={post} />
                      )}

                      {/* Post stats */}
                      <PostStats post={post} />
                    </div>
                  </div>
                );
              })}

              {/* Loading state */}
              {(isLoading || isFetchingNextPage) && <LoadingSkeleton />}

              {/* Empty state */}
              {!isLoading && finalFilteredPosts.length === 0 && (
                <NoPosts fetchPosts={() => refetch()} />
              )}

              {/* End of feed message */}
              {!isLoading &&
                !isFetchingNextPage &&
                finalFilteredPosts.length > 0 &&
                !hasNextPage && <EndOfFeed />}
            </div>
          </main>

          {/* Right sidebar - fixed position container */}
          <div className="hidden lg:block lg:w-72">
            {/* This is an empty container with the same width as the sidebar */}
            <div className="w-full lg:w-72 h-1"></div>

            {/* The actual fixed sidebar */}
            <div className="fixed top-20 w-72 max-h-[calc(100vh-80px)] overflow-y-auto">
              {/* <RightSideBar /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialFeed;
