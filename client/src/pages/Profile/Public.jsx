import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircleCheck } from "lucide-react";

// import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import ProfileHeader from "@/components/Header/ProfileHeader";
import ProfileFooter from "@/components/Footer/ProfileFooter";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import {
  ProfileHelmet,
  QuickStatsProfile,
  ContactInformationDropdown,
  FeaturedWorks,
  PostFilterTabs,
  PostList,
  CollectionList,
  NameDesignation,
  ProfileImage,
} from "./components";
import { useDataService } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import { useDarkMode } from "@/components/Hooks/darkMode";

const PublicProfile = () => {
  const isDark = useDarkMode();
  const navigate = useNavigate();
  const { username } = useParams();
  const { currentUser } = useAuth();
  const {
    getUserProfile,
    getUserPosts,
    followUnfollowUser,
    getUserCollections,
  } = useDataService();

  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [profileLoading, setProfileLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [collections, setCollections] = useState([]);

  const hasMore = posts.length < total;
  const isOwnProfile =
    currentUser?._id?.toString() === profile?._id?.toString();

  // Step 1 - load profile. isFollowing comes directly from the server response
  // (backend checks the Follow collection), so we don't need currentUser.following
  useEffect(() => {
    const load = async () => {
      setProfileLoading(true);
      // Reset page state when navigating between profiles
      setPosts([]);
      setPage(1);
      try {
        const clean = username.trim().replace(/^@/, "");
        const res = await getUserProfile(clean);
        setProfile(res.user);
        setIsFollowing(res.isFollowing);
      } catch {
        // getUserProfile already shows a toast, nothing else to do
      } finally {
        setProfileLoading(false);
      }
    };
    load();
  }, [username]);

  // Step 2 - load posts and public collections once profile is ready
  useEffect(() => {
    if (!profile) return;
    loadPosts(1);
    // Public profile: only public collections are returned by the server
    getUserCollections(profile._id)
      .then(setCollections)
      .catch(() => {}); // dataService already shows a toast on error
  }, [profile]);

  // Notify the user if they're looking at their own public profile
  useEffect(() => {
    if (isOwnProfile) {
      toast.info("This is your public profile", {
        duration: 500,
        action: { label: "Close", onClick: () => {} },
      });
    }
  }, [isOwnProfile]);

  const loadPosts = async (pageNum) => {
    setPostsLoading(true);
    try {
      const res = await getUserPosts(profile._id, pageNum);
      setTotal(res.total);
      setPosts((prev) => (pageNum === 1 ? res.data : [...prev, ...res.data]));
      setPage(pageNum);
    } catch {
      toast.error("Failed to fetch posts");
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      localStorage.setItem("urlToRedirectAfterLogin", window.location.pathname);
      navigate("/login-needed");
      return;
    }

    try {
      const res = await followUnfollowUser(profile._id);
      if (res.success) {
        const followed = res.message === "Followed";
        setIsFollowing(followed);
        // Update the visible follower count on the profile without a refetch
        setProfile((p) => ({
          ...p,
          stats: {
            ...p.stats,
            followersCount: p.stats.followersCount + (followed ? 1 : -1),
          },
        }));
        toast.success(res.message);
      }
    } catch {
      // useDataService already shows a toast on error
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#222]">
        <ProfileHeader />
        <div className="flex justify-center items-center h-screen">
          Loading...
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-screen">
          Profile not found
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <ProfileHelmet currentProfile={profile} />
      <div className="min-h-screen bg-white dark:bg-[#222] dark:text-white font-sans">
        <ProfileHeader />

        <main className="pt-24 md:pt-28 px-2 md:px-8 min-h-[90dvh]">
          <div className="max-w-7xl mx-auto pb-[20vh]">
            {/* User details + quick stats */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-16 mb-12 md:mb-24 px-4 md:px-0">
              <div className="space-y-6 md:space-y-8 flex-1 w-full">
                <div className="flex items-start md:items-center space-x-4 md:space-x-8">
                  <div className="relative group flex-shrink-0">
                    <ProfileImage user={profile} />

                    {/* Follow button - hidden on own profile */}
                    {!isOwnProfile && (
                      <button
                        onClick={handleFollow}
                        className={`absolute bottom-0 ${isFollowing ? "right-0 group-hover:-right-4" : "right-0"} bg-lime-300 dark:bg-lime-600
                          text-lime-900 dark:text-lime-50 p-1 md:p-2 rounded-full transition-all duration-200 text-xs cursor-pointer flex items-center justify-center gap-1`}
                      >
                        {isFollowing && <CircleCheck className="size-4" />}
                        <span
                          className={`${isFollowing ? "hidden group-hover:block" : "block"} transition-all duration-200`}
                        >
                          {isFollowing ? "Following" : "Follow"}
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <NameDesignation
                      name={profile.fullName}
                      designation={profile.designation}
                    />
                  </div>
                </div>

                {profile.aboutMe && (
                  <p className="text-stone-700 dark:text-[#d0d0d0] sentient-italic text-sm md:text-lg overflow-hidden leading-tight tracking-normal pointer-events-none md:pointer-events-auto max-w-[65ch] text-wrap !no-underline">
                    {profile.aboutMe}
                  </p>
                )}

                <ContactInformationDropdown currentProfile={profile} />
              </div>

              <QuickStatsProfile currentUser={profile} />
            </div>

            {/* Featured works */}
            <FeaturedWorks currentUser={profile} />

            {/* Filter tabs */}
            {posts.length > 0 && (
              <div id="post-view" className="mb-2 px-4 md:px-0">
                <PostFilterTabs
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>
            )}

            {/* Posts */}
            <PostList
              posts={posts}
              setPosts={setPosts}
              activeTab={activeTab}
              loading={postsLoading}
              isDark={isDark}
              forPrivate={false}
            />

            {/* Load more */}
            {hasMore && (
              <div className="w-full flex items-center justify-center mt-6">
                <Button
                  className="mx-auto z-20 dark:invert"
                  disabled={postsLoading}
                  onClick={() => loadPosts(page + 1)}
                >
                  {postsLoading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}

            {/* Collections section */}
            {collections.length > 0 && (
              <div className="hidden px-4 md:px-0 mb-4">
                <h2 className="text-2xl font-semibold tracking-tight dark:text-[#f0f0f0]">
                  Collections
                </h2>
              </div>
            )}
            {activeTab == "collection" && (
              <CollectionList collections={collections} forPrivate={false} />
            )}
          </div>
        </main>

        <ProfileFooter />
      </div>
    </>
  );
};

export default PublicProfile;
