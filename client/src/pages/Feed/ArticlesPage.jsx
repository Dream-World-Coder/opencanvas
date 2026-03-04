import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useInfiniteQuery } from "@tanstack/react-query";

import Header from "@/components/Header/Header";
import { MarkdownPreview } from "@/pages/Create/Editor/components";
import { useDarkMode } from "@/components/Hooks/darkMode";
import { useDataService } from "@/services/dataService";
import { slugify } from "@/pages/Create/Editor/hooks/useWritingPad";

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

const LIMIT = 16;

const ArticleFeed = () => {
  const navigate = useNavigate();
  const isDark = useDarkMode();
  const focusMode = false;
  const [selectedTopics, setSelectedTopics] = useState([]);
  const { getArticlesFeed } = useDataService();

  const handlePostClick = (post) => {
    navigate(`/p/${slugify(post?.title)}-${post?._id}`, { state: { post } });
  };

  // React Query infinite query - page-number based to match the backend
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["feed", "articles"],
    queryFn: ({ pageParam = 1 }) =>
      getArticlesFeed({ page: pageParam, limit: LIMIT }),
    // Backend returns { page, results, data } - use page number to derive next
    getNextPageParam: (lastPage) => {
      const fetchedSoFar = (lastPage.page - 1) * LIMIT + lastPage.results;
      // If we got a full page back there's likely more
      return lastPage.results === LIMIT ? lastPage.page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 5, // Fresh for 5 minutes
  });

  // Flatten all pages into a single deduplicated list
  const allPosts = data?.pages.flatMap((page) => page.data) ?? [];
  const uniquePosts = [...new Map(allPosts.map((p) => [p?._id, p])).values()];

  // Intersection observer - triggers next page fetch when last post scrolls into view
  const observer = useRef();
  const lastPostRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  // React Query v5: loading state is "pending" not "loading"
  const isLoading = status === "pending";

  return (
    <>
      <Helmet>
        <title>Articles Feed | OpenCanvas</title>
        <meta
          name="description"
          content="Discover posts from creators on OpenCanvas"
        />
      </Helmet>

      <div className="w-full min-h-screen dark:bg-[#222] overflow-x-hidden pt-12 bg-white">
        <Header
          noBlur={true}
          ballClr="text-gray-300"
          exclude={["/about", "/contact", "/photo-gallery", "/articles"]}
          noShadow={true}
          borderClrLight="border-gray-100"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
          <div className="flex flex-col lg:flex-row">
            {/* Left sidebar */}
            <div className="hidden lg:block lg:w-64">
              <div className="w-full lg:w-64 h-1" />
              <div className="fixed top-16 w-64 overflow-y-auto">
                {!focusMode && (
                  <LeftSideBar
                    selectedTopics={selectedTopics}
                    setSelectedTopics={setSelectedTopics}
                  />
                )}
              </div>
            </div>

            {/* Main feed */}
            <main className="w-full lg:max-w-2xl mx-auto lg:mx-6 mt-0">
              {/* Mobile topics menu */}
              <div className="lg:hidden mb-4">
                <div className="bg-white dark:bg-[#222] p-4 rounded-xl border border-neutral-200 dark:border-[#333]">
                  <details>
                    <summary className="font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
                      Topics ({selectedTopics.length})
                    </summary>
                    <div className="mt-3">
                      {!focusMode && (
                        <LeftSideBar
                          selectedTopics={selectedTopics}
                          setSelectedTopics={setSelectedTopics}
                        />
                      )}
                    </div>
                  </details>
                </div>
              </div>

              {/* Error */}
              {error && !isLoading && uniquePosts.length === 0 && (
                <ErrorDisplay
                  message={error.message || "Failed to load posts"}
                />
              )}

              {/* Posts */}
              <div className="space-y-6">
                {uniquePosts.map((post, index) => {
                  const isLast = index === uniquePosts.length - 1;
                  return (
                    <div
                      ref={isLast ? lastPostRef : null}
                      key={post?._id}
                      className="bg-white dark:bg-[#222] rounded-none shadow-none overflow-hidden cursor-pointer"
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

                      <div className="p-2 sm:p-6">
                        <PostAuthorInfo post={post} />

                        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-white capitalize">
                          {post.title}
                        </h2>

                        <div className="relative mb-5 max-h-[220px] overflow-hidden">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <MarkdownPreview
                              content={
                                post?.content?.slice(0, 700) + "..." || ""
                              }
                              thumbnailUrl={post?.thumbnailUrl}
                              isDark={isDark}
                              darkBg="bg-[#222]"
                              textAlignment="left"
                              insidePost={true}
                              contentOnly={true}
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-[#222] to-transparent" />
                        </div>

                        {post.tags?.length > 0 && <PostTags post={post} />}
                        <PostStats post={post} />
                      </div>
                    </div>
                  );
                })}

                {(isLoading || isFetchingNextPage) && <LoadingSkeleton />}

                {!isLoading && uniquePosts.length === 0 && !error && (
                  <NoPosts fetchPosts={() => refetch()} />
                )}

                {!isLoading &&
                  !isFetchingNextPage &&
                  uniquePosts.length > 0 &&
                  !hasNextPage && <EndOfFeed />}
              </div>
            </main>

            {/* Right sidebar */}
            <div className="hidden lg:block lg:w-72">
              <div className="w-full lg:w-72 h-1" />
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
