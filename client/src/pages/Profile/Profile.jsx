import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import ProfileHeader from "../../components/Header/ProfileHeader";
import ProfileFooter from "../../components/Footer/ProfileFooter";
import {
    ProfileHelmet,
    QuickStatsProfile,
    FeaturedWorks,
    PostFilterTabs,
    PostList,
} from "./components";
import { useAuth } from "../../contexts/AuthContext";
import { useDarkMode } from "../../components/Hooks/darkMode";

const Profile = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const isDark = useDarkMode();
    const [activeTab, setActiveTab] = useState("all");
    const [posts, setPosts] = useState([]);
    // const [collections, setCollections] = useState([]);
    const [postsToFetchIndex, setPostsToFetchIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // fetch posts+collections from user's postIds array
    const fetchUserPosts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("authToken");
            if (
                !currentUser ||
                !currentUser.posts ||
                currentUser.posts.length === 0
            ) {
                setPosts([]);
                setLoading(false);
                return;
            }

            if (currentUser.posts.length < postsToFetchIndex) return;

            // post IDs to query string
            const postIdsParam = currentUser.posts
                .slice(0 + postsToFetchIndex, 10 + postsToFetchIndex)
                .join(",");

            setPostsToFetchIndex(postsToFetchIndex + 10);

            const response = await fetch(
                `http://localhost:3000/u/posts/byids`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
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

    // on mount, i can use [], cuz the user will be logged in in this page
    useEffect(() => {
        async function fetchPost() {
            if (currentUser && currentUser.posts) {
                await fetchUserPosts();
            }
        }
        fetchPost();
    }, [currentUser]);

    return (
        <>
            <ProfileHelmet currentProfile={currentUser} />
            <div
                className={`min-h-screen bg-white dark:bg-[#111] dark:text-white font-sans`}
            >
                <ProfileHeader />

                <main className="pt-32 px-2 md:px-8 min-h-screen">
                    <div className="max-w-7xl mx-auto pb-[20vh]">
                        {/* <div className="grid md:grid-cols-[1.62fr,1fr] gap-16 mb-24 border border-black"> */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-16 mb-12 md:mb-24 px-4 md:px-0">
                            {/* User Details */}
                            <div className="space-y-6 md:space-y-8 flex-1 w-full">
                                <div className="flex items-start space-x-4 md:space-x-8">
                                    {loading ? (
                                        <Skeleton className="size-16 md:size-24 rounded-full" />
                                    ) : (
                                        <div className="relative group">
                                            <div className="size-16 md:size-24 rounded-full overflow-hidden bg-gray-100 dark:bg-[#222]">
                                                <img
                                                    src={
                                                        currentUser.profilePicture
                                                    }
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <button
                                                className="absolute bottom-0 right-0 bg-black dark:bg-[#333] text-white p-1.5 md:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    navigate(
                                                        "/profile/settings",
                                                    );
                                                }}
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
                                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-boskaBold leading-tight md:leading-[0.95] tracking-tight pointer-events-none md:pointer-events-auto capitalize dark:text-[#fff] truncate">
                                                {currentUser.fullName}
                                                <span className="block mt-1 md:mt-2 text-lg md:text-xl lg:text-2xl font-boska font-normal tracking-normal capitalize text-lime-700 dark:text-lime-600">
                                                    {currentUser.role}
                                                </span>
                                            </h1>
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
                                        <p className="text-stone-700 dark:text-[#d0d0d0] font-zodiak text-base md:text-lg leading-tight tracking-normal pointer-events-none md:pointer-events-auto">
                                            {currentUser.aboutMe}
                                        </p>
                                    )
                                )}
                            </div>

                            {/* Quick Stats */}
                            <QuickStatsProfile currentUser={currentUser} />
                        </div>

                        {/* featured */}
                        <FeaturedWorks currentUser={currentUser} />

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
                            forPrivate={true}
                        />

                        {/* load more button */}
                        {currentUser.posts.length > postsToFetchIndex && (
                            <div className="w-[100%] flex items-center justify-center">
                                <Button
                                    className="mx-auto z-20 dark:invert"
                                    onClick={async () => {
                                        if (currentUser && currentUser.posts) {
                                            await fetchUserPosts();
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

export default Profile;
