import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";

import ProfileHeader from "@/components/Header/ProfileHeader";
import { PostList } from "@/pages/Profile/components";
import { useDataService } from "@/services/dataService";
import { useDarkMode } from "@/components/Hooks/darkMode";

export default function SavedPosts() {
  const navigate = useNavigate();
  const isDark = useDarkMode();
  const { getSavedPosts } = useDataService();

  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const hasMore = posts.length < total;

  const loadPosts = async (pageNum) => {
    setLoading(true);
    try {
      const res = await getSavedPosts(pageNum);
      setTotal(res.total);
      setPosts((prev) => (pageNum === 1 ? res.data : [...prev, ...res.data]));
      setPage(pageNum);
    } catch {
      toast.error("Failed to load saved posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#222] dark:text-white">
      <ProfileHeader />

      <main className="max-w-3xl mx-auto pt-28 pb-40 px-4">
        <h1 className="text-2xl md:text-3xl font-bold font-serif mb-8">
          Saved Posts
          {total > 0 && (
            <span className="ml-2 text-base font-normal text-gray-500 dark:text-gray-400">
              ({total})
            </span>
          )}
        </h1>

        {/* Skeleton */}
        {loading && posts.length === 0 && (
          <div className="space-y-3">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Card
                  key={i}
                  className="bg-gray-50 dark:bg-[#222] border-gray-200 dark:border-[#333]"
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <Skeleton className="w-16 h-16 rounded-md bg-gray-200 dark:bg-[#333] flex-shrink-0" />
                    <div className="flex-grow space-y-2">
                      <Skeleton className="h-5 w-3/4 bg-gray-200 dark:bg-[#333]" />
                      <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-[#333]" />
                      <Skeleton className="h-4 w-full bg-gray-200 dark:bg-[#333]" />
                      <Skeleton className="h-3 w-32 bg-gray-200 dark:bg-[#333]" />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-20 border border-gray-100 dark:border-[#333] rounded-lg">
            <Bookmark className="mx-auto mb-4 size-10 text-gray-300 dark:text-gray-600" />
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No saved posts yet
            </p>
            <p className="text-gray-500 dark:text-gray-500 mt-2 mb-6">
              Posts you save will appear here.
            </p>
            <Button
              variant="outline"
              className="dark:border-[#444] dark:text-gray-300"
              onClick={() => navigate(-1)}
            >
              Browse articles
            </Button>
          </div>
        )}

        {/* Post list - reuses the same component as the profile pages */}
        {posts.length > 0 && (
          <PostList
            posts={posts}
            setPosts={setPosts}
            activeTab="all"
            loading={loading}
            isDark={isDark}
            forPrivate={false}
          />
        )}

        {/* Load more */}
        {hasMore && (
          <div className="w-full flex items-center justify-center mt-8 border-t border-gray-100 dark:border-[#222] pt-6">
            <Button
              variant="outline"
              className="px-6 dark:border-[#444] dark:text-gray-300"
              disabled={loading}
              onClick={() => loadPosts(page + 1)}
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
