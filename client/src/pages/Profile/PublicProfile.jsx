import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircleCheck } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

import ProfileHeader from "../../components/Header/ProfileHeader";
import ProfileFooter from "../../components/Footer/ProfileFooter";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import {
  ProfileHelmet,
  QuickStatsProfile,
  ContactInformationDropdown,
  FeaturedWorks,
  PostFilterTabs,
  PostList,
  NameDesignation,
} from "./components";
import { useDataService } from "../../services/dataService";
import { useAuth } from "../../contexts/AuthContext";
import { useDarkMode } from "../../components/Hooks/darkMode";

const PublicProfile = () => {
  const isDark = useDarkMode();
  const navigate = useNavigate();
  const { username } = useParams();
  const { currentUser, setCurrentUser } = useAuth();
  const { followUser } = useDataService();

  const [currentProfile, setCurrentProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  // const [collections, setCollections] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [postsToFetch, setPostsToFetch] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  // fetches user's posts
  const fetchUserPosts = async (user) => {
    try {
      setLoading(true);
      if (!user || !user.posts || user.posts.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      if (user.posts.length < postsToFetch) return;

      // post IDs to query string
      const postIdsParam = user.posts
        .slice(0 + postsToFetch, 20 + postsToFetch)
        .join(",");

      setPostsToFetch(postsToFetch + 20);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/author/posts/byids`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postIds: postIdsParam,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setPosts((prevPosts) => [...prevPosts, ...data.posts]);
      } else {
        console.error("Failed to fetch posts: ", data.message);
        toast("Failed to fetch posts: ", data.message);
      }
    } catch (error) {
      console.error("Error fetching posts: ", error);
      toast("Error fetching posts: ", error);
    } finally {
      setLoading(false);
    }
  };

  // fetch the current profile
  useEffect(() => {
    async function fetchCurrentProfile(username) {
      if (!username) {
        return;
      }
      username = username.trim();
      if (username.startsWith("@")) {
        username = username.slice(1);
      }

      setIsLoading(true);
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/u/${username}`;

      try {
        const res = await fetch(apiUrl);

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        setCurrentProfile(data.user);
        setFollowing(
          !!currentUser &&
            !!currentUser.following
              .map((item) => item.userId)
              .includes(data.user._id),
        );

        // fetching posts
        await fetchUserPosts(data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCurrentProfile(username);
  }, [username, navigate, currentUser]);

  async function handleFollow(userId) {
    let res = await followUser(userId);
    if (res.success && res.message === "followed") {
      setFollowing(true);
      toast.success(res.message, {
        action: {
          label: "Close",
          onClick: () => console.log("Close"),
        },
      });
      setCurrentUser((currentUser) => ({
        ...currentUser,
        following: [...currentUser.following, { userId, since: Date.now() }],
      }));
    } else if (res.success && res.message === "unfollowed") {
      setFollowing(false);
      toast.success(res.message, {
        action: {
          label: "Close",
          onClick: () => console.log("Close"),
        },
      });
      setCurrentUser((currentUser) => ({
        ...currentUser,
        following: [
          ...currentUser.following.filter(
            (i) => i.userId.toString() !== userId.toString(),
          ),
        ],
      }));
    } else {
      toast.error(res.message);
    }
  }

  useEffect(() => {
    if (
      currentUser &&
      currentProfile?._id?.toString() === currentUser?._id?.toString()
    ) {
      toast.info("This is your public profile", {
        duration: 10000,
        action: { label: "Close", onClick: () => {} },
      });
    }
  }, [currentUser?._id, currentProfile?._id]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  // navigating, but still,
  if (!currentProfile)
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-screen">
          Profile Not found...
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <ProfileHelmet currentProfile={currentProfile} />
      <div
        className={`min-h-screen bg-white dark:bg-[#222] dark:text-white font-sans`}
      >
        <ProfileHeader />

        <main className="pt-24 md:pt-28 px-2 md:px-8 min-h-[90dvh]">
          <div className="max-w-7xl mx-auto pb-[20vh]">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-16 mb-12 md:mb-24 px-4 md:px-0">
              {/* User Details */}
              <div className="space-y-6 md:space-y-8 flex-1 w-full">
                <div className="flex items-start md:items-center space-x-4 md:space-x-8">
                  {loading ? (
                    <Skeleton className="size-16 md:size-24 rounded-full" />
                  ) : (
                    <div className="relative group">
                      <div className="size-16 md:size-24 rounded-full overflow-hidden bg-gray-100 dark:bg-[#171717]">
                        <Avatar className="size-full text-xl font-thin">
                          <AvatarImage
                            src={currentProfile.profilePicture}
                            alt={`${currentProfile.username}'s profile image`}
                          />
                          <AvatarFallback className="dark:bg-[#171717]">
                            {currentProfile.fullName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      {currentUser?._id?.toString() !==
                        currentProfile._id?.toString() && (
                        <button
                          onClick={async () => {
                            if (!currentUser) {
                              toast.error("you need to log in first to follow");
                              localStorage.setItem(
                                "urlToRedirectAfterLogin",
                                window.location.pathname,
                              );
                              navigate("/login-needed");
                              return;
                            }
                            await handleFollow(currentProfile._id);
                          }}
                          className={`absolute bottom-0 ${following ? "right-0 group-hover:-right-4" : "right-0"} bg-lime-300 dark:bg-lime-600
                            text-lime-900 dark:text-lime-50 p-1 md:p-2 rounded-full transition-opacity text-xs cursor-pointer flex items-center justify-center gap-1`}
                        >
                          {following ? <CircleCheck className="size-4" /> : ""}
                          <span
                            className={`${following ? "hidden group-hover:block" : "block"} transition-all duration-200`}
                          >
                            {following ? "Following" : "Follow"}
                          </span>
                        </button>
                      )}
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
                        name={currentProfile.fullName}
                        designation={currentProfile.role}
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
                  currentProfile.aboutMe && (
                    <p
                      className="text-stone-700 dark:text-[#d0d0d0] sentient-italic text-sm md:text-lg overflow-hidden
                      leading-tight tracking-normal pointer-events-none md:pointer-events-auto max-w-[65ch] text-wrap !no-underline"
                    >
                      {currentProfile.aboutMe}
                    </p>
                  )
                )}

                <ContactInformationDropdown currentProfile={currentProfile} />
              </div>

              {/* Quick Stats */}
              <QuickStatsProfile currentUser={currentProfile} />
            </div>

            {/* featured */}
            <FeaturedWorks currentUser={currentProfile} />

            {/* filter tabs */}
            {posts.length > 0 && (
              <div id="post-view" className="mb-2 px-4 md:px-0">
                <PostFilterTabs
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>
            )}

            {/* posts */}
            <PostList
              posts={posts}
              setPosts={setPosts}
              activeTab={activeTab}
              loading={loading}
              isDark={isDark}
              forPrivate={false}
            />

            {/* load more button */}
            {currentProfile.posts.length > postsToFetch && (
              <div className="w-[100%] flex items-center justify-center">
                <Button
                  className="mx-auto z-20 dark:invert"
                  onClick={async () => {
                    if (currentProfile && currentProfile.posts) {
                      await fetchUserPosts(currentProfile);
                    }
                  }}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        </main>

        <ProfileFooter />
      </div>
    </>
  );
};

export default PublicProfile;
