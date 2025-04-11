import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, EyeOff } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import ProfileHeader from "../../components/Header/ProfileHeader";
import ProfileFooter from "../../components/Footer/ProfileFooter";
import { MarkdownPreview } from "../CreatePosts/Writing/WritingComponents";
import {
    PostFilterTabs,
    PostActions,
    FeaturedWorks,
    ProfileHelmet,
    PostStats,
    formatDates,
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
    const [postsToFetch, setPostsToFetch] = useState(0);
    const [loading, setLoading] = useState(true);
    const userStats = [
        // {
        //     name: "TOTAL LIKES",
        //     href: "#post-view",
        //     amount: posts.reduce((sum, post) => sum + post.totalLikes, 0),
        // },
        {
            name: "WORKS",
            href: "#post-view",
            amount: currentUser.posts.length,
        },
        {
            name: "FOLLOWERS",
            href: `/u/${currentUser.username}/followers`,
            amount: currentUser.followers.length,
        },
        {
            name: "FOLLOWING",
            href: `/u/${currentUser.username}/following`,
            amount: currentUser.following.length,
        },
    ];

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

            if (currentUser.posts.length < postsToFetch) return;

            // post IDs to query string
            const postIdsParam = currentUser.posts
                .slice(0 + postsToFetch, 10 + postsToFetch)
                .join(",");

            setPostsToFetch(postsToFetch + 10);

            const response = await fetch(
                `http://127.0.0.1:3000/u/posts/byids`,
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
                        <div className="flex justify-between items-start gap-16 mb-24">
                            {/* left column with Profile Pic */}
                            <div className="space-y-8 flex-1">
                                <div className="flex items-start md:items-center space-x-8">
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
                                                className="absolute bottom-0 right-0 bg-black dark:bg-[#333] text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    navigate(
                                                        "/profile/settings",
                                                    );
                                                }}
                                            >
                                                <Camera className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        {loading ? (
                                            <div className="space-y-2">
                                                <Skeleton className="h-10 w-3/4" />
                                                <Skeleton className="h-6 w-1/2" />
                                            </div>
                                        ) : (
                                            <h1 className="text-3xl md:text-4xl font-boskaBold leading-[0.95] tracking-tight pointer-events-none md:pointer-events-auto capitalize dark:text-[#fff]">
                                                {currentUser.fullName}
                                                <span className="block mt-2 text-xl md:text-2xl font-boska font-normal tracking-normal capitalize text-lime-700 dark:text-lime-600">
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
                                        <p className="text-stone-700 dark:text-[#d0d0d0] font-zodiak text-lg leading-tight tracking-normal pointer-events-none md:pointer-events-auto">
                                            {currentUser.aboutMe}
                                        </p>
                                    )
                                )}
                            </div>

                            {/* right column - Quick Stats */}
                            <div className="space-y-3 pt-4 w-[400px] font-[montserrat]">
                                {userStats.map((item, index) => (
                                    <a
                                        key={index}
                                        className="flex justify-between items-center rounded border-b border-gray-200 hover:bg-gray-100 dark:border-[#333] dark:hover:bg-[#333] py-3 pr-4 cursor-pointer group"
                                        href={item.href}
                                    >
                                        <span className="text-gray-500 dark:text-[#999] text-sm md:text-sm group-hover:translate-x-2 transition-transform duration-300">
                                            {item.name}
                                        </span>
                                        <span className="dark:text-[#e0e0e0]">
                                            {item.amount}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* featured */}
                        <FeaturedWorks currentUser={currentUser} />

                        {/* filter tabs */}
                        {posts.length > 0 && (
                            <div
                                id="post-view"
                                className="border-b border-gray-200 dark:border-[#333] mb-8"
                            >
                                <PostFilterTabs
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                />
                            </div>
                        )}

                        {/* posts */}
                        <div className="space-y-8 mb-16">
                            {posts.map(
                                (post) =>
                                    (activeTab !== "all"
                                        ? post.type === activeTab
                                        : true) && (
                                        <div
                                            key={post._id}
                                            className="group Xcursor-pointer"
                                        >
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {/* thumbnail */}
                                                {post.thumbnailUrl && (
                                                    <div className="max-w-[15rem] aspect-square overflow-hidden rounded-lg">
                                                        <img
                                                            src={
                                                                post.thumbnailUrl
                                                            }
                                                            alt={post.title}
                                                            className="object-cover size-full"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div
                                                    className={`${post.thumbnailUrl ? "md:w-2/3" : "w-full"} flex flex-col justify-between`}
                                                >
                                                    {/* post metadata and title */}
                                                    <div>
                                                        {/* tag based on post type */}
                                                        <div className="mb-2">
                                                            <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                                                                {post.type}
                                                            </span>
                                                        </div>

                                                        {/* preview snippet */}
                                                        <div className="relative mb-4 max-h-[150px] overflow-hidden">
                                                            <div className="prose prose-sm dark:prose-invert">
                                                                <MarkdownPreview
                                                                    title={
                                                                        post.title
                                                                    }
                                                                    content={
                                                                        post.content.slice(
                                                                            0,
                                                                            350,
                                                                        ) +
                                                                            "..." ||
                                                                        ""
                                                                    }
                                                                    thumbnailUrl={
                                                                        post.thumbnailUrl
                                                                    }
                                                                    isDark={
                                                                        isDark
                                                                    }
                                                                    darkBg="bg-[#111]"
                                                                    textAlignment="left"
                                                                    insidePost={
                                                                        true
                                                                    }
                                                                    contentOnly={
                                                                        true
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-[#111] to-transparent"></div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col space-y-4">
                                                        {/* details */}
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                created{" "}
                                                                {formatDates(
                                                                    post.createdAt,
                                                                )}
                                                            </span>
                                                            <span className="text-gray-400 dark:text-gray-500">
                                                                ·
                                                            </span>
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                last edited{" "}
                                                                {formatDates(
                                                                    post.modifiedAt,
                                                                )}
                                                            </span>
                                                        </div>

                                                        {/* Stats and actions */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                                {post.isPublic && (
                                                                    <PostStats
                                                                        post={
                                                                            post
                                                                        }
                                                                    />
                                                                )}
                                                                {!post.isPublic && (
                                                                    <div className="flex items-center">
                                                                        <EyeOff className="w-4 h-4 mr-1 text-gray-500" />
                                                                        <span>
                                                                            private
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* post actions */}
                                                            <PostActions
                                                                post={post}
                                                                setPosts={
                                                                    setPosts
                                                                }
                                                                loading={
                                                                    loading
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* divider */}
                                            <div className="mt-8 border-b border-gray-100 dark:border-[#333]"></div>
                                        </div>
                                    ),
                            )}
                        </div>

                        {/* load more button */}
                        {currentUser.posts.length > postsToFetch && (
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
