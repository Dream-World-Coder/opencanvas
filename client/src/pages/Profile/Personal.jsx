import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import ProfileHeader from "@/components/Header/ProfileHeader";
import ProfileFooter from "@/components/Footer/ProfileFooter";
import {
  ProfileHelmet,
  QuickStatsProfile,
  FeaturedWorks,
  PostFilterTabs,
  PostList,
  CollectionList,
  NameDesignation,
  ProfileImage,
} from "./components";
import { useAuth } from "@/contexts/AuthContext";
import { useDarkMode } from "@/components/Hooks/darkMode";
import { useDataService } from "@/services/dataService";
import { useCollectionContext } from "@/contexts/CollectionContext";

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isDark = useDarkMode();
  const { getMyPosts, getUserCollections } = useDataService();
  const { setIsCreatingNewColl } = useCollectionContext();

  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);

  const hasMore = posts.length < total;

  const loadPosts = async (pageNum) => {
    setLoading(true);
    try {
      const res = await getMyPosts(pageNum);
      setTotal(res.total);
      // Append on load-more, replace on first load
      setPosts((prev) => (pageNum === 1 ? res.data : [...prev, ...res.data]));
      setPage(pageNum);
    } catch {
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  // currentUser is guaranteed to exist here (protected route)
  useEffect(() => {
    if (!currentUser) return;
    loadPosts(1);
    // Load the user's own collections (owner sees all, including private)
    getUserCollections(currentUser._id)
      .then(setCollections)
      .catch(() => {}); // dataService already shows a toast on error
  }, [currentUser]);

  return (
    <>
      <ProfileHelmet currentProfile={currentUser} />
      <div className="min-h-screen bg-white dark:bg-[#222] dark:text-white font-sans">
        <ProfileHeader />

        <main className="pt-24 md:pt-28 px-2 md:px-0 min-h-[90dvh]">
          <div className="max-w-7xl mx-auto pb-[20vh]">
            {/* User details + quick stats */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-16 mb-12 md:mb-24 px-4 md:px-0">
              <div className="space-y-6 md:space-y-8 flex-1 w-full">
                <div className="flex items-start md:items-center space-x-4 md:space-x-8">
                  {loading ? (
                    <Skeleton className="size-16 md:size-24 rounded-full" />
                  ) : (
                    <div className="relative group">
                      <ProfileImage user={currentUser} />
                      <button
                        className="absolute bottom-0 right-0 bg-black dark:bg-[#333] text-white p-1.5 md:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => navigate("/profile/settings")}
                      >
                        <Camera className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {loading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-8 md:h-10 w-3/4" />
                        <Skeleton className="h-5 md:h-6 w-1/2" />
                      </div>
                    ) : (
                      <NameDesignation
                        name={currentUser.fullName}
                        designation={currentUser.designation}
                      />
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                ) : (
                  currentUser.aboutMe && (
                    <p className="text-stone-700 dark:text-[#d0d0d0] sentient-italic text-sm md:text-lg max-w-[65ch] leading-tight tracking-normal pointer-events-none md:pointer-events-auto text-wrap overflow-hidden !no-underline">
                      {currentUser.aboutMe}
                    </p>
                  )
                )}
              </div>

              <QuickStatsProfile currentUser={currentUser} />
            </div>

            {/* Featured works */}
            <FeaturedWorks currentUser={currentUser} />

            {/* Filter tabs - only show once posts have loaded */}
            {posts.length > 0 && (
              <div id="post-view" className="mb-2 px-4 md:px-0">
                <PostFilterTabs
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>
            )}

            {/* Post list */}
            <PostList
              posts={posts}
              setPosts={setPosts}
              activeTab={activeTab}
              loading={loading}
              isDark={isDark}
              forPrivate={true}
            />

            {/* Load more */}
            {hasMore && (
              <div className="w-full flex items-center justify-center mt-6">
                <Button
                  className="mx-auto z-20 dark:invert"
                  disabled={loading}
                  onClick={() => loadPosts(page + 1)}
                >
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}

            {/* Collections section */}
            {collections.length > 0 && (
              <div className="hidden px-4 md:px-0 mb-4 _flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight dark:text-[#f0f0f0]">
                  Collections
                </h2>
                <Button
                  size="sm"
                  className="dark:invert"
                  onClick={() => setIsCreatingNewColl(true)}
                >
                  New
                </Button>
              </div>
            )}
            {activeTab == "collection" && (
              <CollectionList collections={collections} forPrivate={true} />
            )}
          </div>
        </main>

        <ProfileFooter />
      </div>
    </>
  );
};

export default Profile;
