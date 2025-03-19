import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
    Share2,
    ThumbsUp,
    MessageCircle,
    Eye,
    Info,
    Copy,
    CircleCheck,
} from "lucide-react";
import ProfileHeader from "../../components/Header/ProfileHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useDataService } from "../../services/dataService";
import { useAuth } from "../../contexts/AuthContext";
import { MarkdownPreview } from "../CreatePosts/Writing/WritingComponents";
import { useDarkMode } from "../../components/Hooks/darkMode";
import { formatDistanceToNow } from "date-fns";

const formatDates = (date) => {
    try {
        return formatDistanceToNow(new Date(date), {
            addSuffix: true,
        });
    } catch (error) {
        console.log(error);
        return "some time ago";
    }
};

function sharePost(post) {
    const baseUrl = window.location.origin;
    const postUrl = `${baseUrl}/p/${post._id}`;

    navigator.share
        ? navigator.share({
              title: post.title,
              url: window.location.origin + `/p/${post._id}`,
          })
        : navigator.clipboard
              .writeText(postUrl)
              .then(() => {
                  toast.success("Link copied to clipboard");
              })
              .catch((err) => {
                  console.error("Failed to copy link:", err);
                  toast.error("Faild to copy link");
              });
}

const PublicProfile = () => {
    const isDark = useDarkMode();
    const navigate = useNavigate();
    const { username } = useParams();
    const { currentUser } = useAuth();
    const { followUser } = useDataService();

    const [currentProfile, setCurrentProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [postsToFetch, setPostsToFetch] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [following, setFollowing] = useState(false);

    useEffect(() => {
        async function fetchCurrentProfile(username) {
            if (!username) {
                navigate("/404");
                return;
            }

            setIsLoading(true);
            const apiUrl = `http://127.0.0.1:3000/u/${username}`;

            try {
                const res = await fetch(apiUrl);

                if (!res.ok) {
                    navigate("/404");
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
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCurrentProfile(username);
    }, [username, navigate, currentUser]);

    // fetch posts from user's postIds array
    const fetchUserPosts = async () => {
        try {
            setLoading(true);
            if (
                !currentProfile ||
                !currentProfile.posts ||
                currentProfile.posts.length === 0
            ) {
                setPosts([]);
                setLoading(false);
                return;
            }

            if (currentProfile.posts.length < postsToFetch) return;

            // post IDs to query string
            const postIdsParam = currentProfile.posts
                .slice(0 + postsToFetch, 10 + postsToFetch)
                .join(",");

            setPostsToFetch(postsToFetch + 10);

            const response = await fetch(
                `http://127.0.0.1:3000/author/posts/byids`,
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

    // fetching posts
    useEffect(() => {
        if (currentProfile) {
            fetchUserPosts();
        }
    }, [currentProfile]);

    async function handleFollow(personToFollow) {
        let res = await followUser(personToFollow);
        if (res.success) {
            setFollowing(!following);
            toast.success(res.message);
        } else {
            toast.error(res.message);
        }
    }

    if (isLoading)
        return (
            <div className="flex justify-center items-center h-screen">
                Loading...
            </div>
        );

    // navigating, but still,
    if (!currentProfile)
        return (
            <div className="flex justify-center items-center h-screen">
                Profile Not found...
            </div>
        );

    const userStats = [
        {
            name: "POSTS",
            href: "#post-view",
            amount: currentProfile.posts.length,
        },
        {
            name: "FOLLOWERS",
            href: `/u/${username}/followers`,
            amount: currentProfile.followers.length,
        },
        {
            name: "FOLLOWING",
            href: `/u/${username}/following`,
            amount: currentProfile.following.length,
        },
    ];

    let collections = [];
    if (currentProfile) {
        collections = currentProfile.collections;
    }

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: currentProfile.fullName,
        image: `${window.location.origin}${currentProfile.profilePicture}`,
        description: currentProfile.aboutMe,
        url: `${window.location.origin}/u/${currentProfile.username}`,
        sameAs: currentProfile.contactInformation.map((contact) => contact.url),
        // Array of social media links (Twitter, LinkedIn, etc.)
        jobTitle: currentProfile.role,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${window.location.origin}/u/${currentProfile.username}`,
        },
    };

    return (
        <>
            <Helmet>
                <title>{currentProfile.fullName} | OpenCanvas</title>
                <meta
                    name="description"
                    content={`OpenCanvas profile page of ${currentProfile.fullName}`}
                />
                <meta
                    name="keywords"
                    content={[
                        ...new Set([
                            currentProfile.fullName,
                            currentProfile.fullName.split(" ")[0],
                            ...currentProfile.role
                                .toLowerCase()
                                .split(/\s+/)
                                .filter(
                                    (word) =>
                                        ![
                                            "a",
                                            "an",
                                            "the",
                                            "and",
                                            "or",
                                            "but",
                                            "is",
                                            "to",
                                            "of",
                                            "in",
                                            "on",
                                            "at",
                                            "with",
                                            "for",
                                            "from",
                                            "by",
                                        ].includes(word),
                                ),
                        ]),
                        "opencanvas",
                    ].join(", ")}
                />
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Helmet>
            <div
                className={`min-h-screen bg-white dark:bg-black dark:text-white font-sans`} //bg-cream-light
            >
                <ProfileHeader />

                <main className="pt-32 px-2 md:px-8">
                    <div className="max-w-[1400px] mx-auto pb-[20vh]">
                        {/* <div className="grid md:grid-cols-[1.6fr,1fr] gap-16 mb-24"> */}
                        <div className="flex justify-between items-start gap-16 mb-24">
                            {/* Left Column with Profile Pic */}
                            <div className="space-y-8 flex-1">
                                <div className="flex items-start md:items-center space-x-8">
                                    {loading ? (
                                        <Skeleton className="size-16 md:size-24 rounded-full" />
                                    ) : (
                                        <div className="relative group">
                                            <div className="size-16 md:size-24 rounded-full overflow-hidden bg-gray-100 dark:bg-[#222]">
                                                <img
                                                    src={
                                                        currentProfile.profilePicture
                                                    }
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            {currentUser?._id?.toString() !==
                                                currentProfile._id?.toString() && (
                                                <button
                                                    onClick={async () => {
                                                        if (!currentUser) {
                                                            toast.error(
                                                                "you need to log in first to follow",
                                                            );
                                                            return;
                                                        }
                                                        await handleFollow(
                                                            currentProfile._id,
                                                        );
                                                    }}
                                                    className={`absolute bottom-0 ${following ? "right-0 group-hover:-right-4" : "right-0"} bg-lime-600 dark:bg-[#333]
                                                        text-white p-2 rounded-full transition-opacity text-xs cursor-pointer flex items-center justify-center gap-1`}
                                                >
                                                    {following ? (
                                                        <CircleCheck className="size-4" />
                                                    ) : (
                                                        ""
                                                    )}
                                                    <span
                                                        className={`${following ? "hidden group-hover:block" : "block"} transition-all duration-200`}
                                                    >
                                                        {following
                                                            ? "Following"
                                                            : "Follow"}
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        {loading ? (
                                            <div className="space-y-2">
                                                <Skeleton className="h-10 w-3/4" />
                                                <Skeleton className="h-6 w-1/2" />
                                            </div>
                                        ) : (
                                            <h1 className="text-4xl md:text-5xl font-[montserrat] leading-[0.95] tracking-tighter pointer-events-none md:pointer-events-auto capitalize dark:text-[#f8f8f8]">
                                                {currentProfile.fullName}
                                                <span className="block mt-2 text-xl md:text-3xl font-normal tracking-normal capitalize dark:text-[#e0e0e0]">
                                                    {currentProfile.role}
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
                                    currentProfile.aboutMe && (
                                        <p className="text-stone-700 dark:text-[#b0b0b0] montserrat-regular text-lg leading-tight tracking-normal pointer-events-none md:pointer-events-auto">
                                            {currentProfile.aboutMe}
                                        </p>
                                    )
                                )}

                                <AlertDialog>
                                    <AlertDialogTrigger className="flex items-center justify-center gap-2">
                                        <Info className="size-5" /> Contact
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Contact Information
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {currentProfile.contactInformation.map(
                                                    (item, index) => (
                                                        <div
                                                            key={index}
                                                            className="mb-3"
                                                        >
                                                            <h3 className="flex items-center justify-between font-semibold text-[#111]">
                                                                {item.title}

                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(
                                                                            item.url,
                                                                        );
                                                                        toast.success(
                                                                            "url copied to clipboard",
                                                                        );
                                                                    }}
                                                                >
                                                                    <Copy />
                                                                </button>
                                                            </h3>
                                                            <div className="text-xs">
                                                                {item.url}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Close
                                            </AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            {/* Right Column - Quick Stats */}
                            <div className="space-y-3 pt-4 w-[400px] font-[montserrat]">
                                {userStats.map((item, index) => (
                                    <a
                                        key={index}
                                        className="flex justify-between items-center rounded border-b border-gray-200 hover:bg-gray-200 dark:border-[#333] dark:hover:bg-[#333] py-3 pr-4 cursor-pointer group"
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

                        {/* collections */}
                        {collections.length > 0 && (
                            <div className="mb-24">
                                <h2 className="text-2xl font-semibold tracking-tight mb-8 dark:text-[#f0f0f0]">
                                    <span className="bg-inherit dark:bg-inherit hover:bg-lime-100 dark:hover:bg-[#222] rounded-md box-content px-2 py-1">
                                        Featured Works
                                    </span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {collections.map((collection) => (
                                        <div
                                            key={collection.id}
                                            className="group cursor-pointer"
                                        >
                                            <div className="relative aspect-square overflow-hidden mb-4">
                                                <img
                                                    src={collection.cover}
                                                    alt={collection.title}
                                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                                />
                                                {/* dark inset on hover */}
                                                <div className="absolute inset-0 bg-black/20 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                    {/* <Share2 className="w-6 h-6 text-white" /> */}
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-medium mb-1 flex justify-between dark:text-[#e8e8e8]">
                                                {collection.title}
                                                <Share2 className="w-6 h-6 text-black dark:text-white rounded-lg p-1 hover:bg-yellow-200 dark:hover:bg-[#2c2c2c]" />
                                            </h3>
                                            <p className="text-sm text-gray-400 dark:text-[#888]">
                                                {collection.items}{" "}
                                                {collection.type === "album"
                                                    ? "photos"
                                                    : "pieces"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* filters */}
                        {posts.length > 0 && (
                            <div
                                id="post-view"
                                className="border-b border-gray-200 dark:border-gray-800 mb-8"
                            >
                                <div className="flex overflow-x-auto no-scrollbar space-x-6 md:space-x-10">
                                    <button
                                        onClick={() => setActiveTab("all")}
                                        className={`py-3 text-sm font-medium transition-colors ${
                                            activeTab === "all"
                                                ? "border-b-2 border-black dark:border-white text-black dark:text-white"
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                        }`}
                                    >
                                        All Posts
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("article")}
                                        className={`py-3 text-sm font-medium transition-colors ${
                                            activeTab === "article"
                                                ? "border-b-2 border-black dark:border-white text-black dark:text-white"
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                        }`}
                                    >
                                        Articles
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("story")}
                                        className={`py-3 text-sm font-medium transition-colors ${
                                            activeTab === "story"
                                                ? "border-b-2 border-black dark:border-white text-black dark:text-white"
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                        }`}
                                    >
                                        Stories
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("poem")}
                                        className={`py-3 text-sm font-medium transition-colors ${
                                            activeTab === "poem"
                                                ? "border-b-2 border-black dark:border-white text-black dark:text-white"
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                        }`}
                                    >
                                        Poems
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* posts layout */}
                        <div className="space-y-8 mb-16">
                            {posts.map(
                                (post) =>
                                    post.isPublic &&
                                    (activeTab !== "all"
                                        ? post.type === activeTab
                                        : true) && (
                                        <div
                                            key={post._id}
                                            onClick={() =>
                                                navigate(`/p/${post._id}`)
                                            }
                                            className="group cursor-pointer"
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
                                                                            500,
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
                                                        {/* stats */}
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
                                                                {/* views */}
                                                                <div className="flex items-center">
                                                                    <Eye className="w-4 h-4 mr-1 text-gray-400" />
                                                                    <span>
                                                                        {post.totalViews ||
                                                                            0}
                                                                    </span>
                                                                </div>

                                                                {/* likes */}
                                                                <div className="flex items-center">
                                                                    <ThumbsUp className="w-4 h-4 mr-1 text-gray-400" />
                                                                    <span>
                                                                        {post.totalLikes ||
                                                                            0}
                                                                    </span>
                                                                </div>

                                                                {/* comments */}
                                                                <div className="flex items-center">
                                                                    <MessageCircle className="w-4 h-4 mr-1 text-gray-400" />
                                                                    <span>
                                                                        {post.totalComments ||
                                                                            0}
                                                                    </span>
                                                                </div>

                                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {
                                                                        post.readTime
                                                                    }
                                                                </span>
                                                            </div>

                                                            {/* share */}
                                                            <div
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    sharePost(
                                                                        post,
                                                                    );
                                                                }}
                                                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                                            >
                                                                <Share2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* divider */}
                                            <div className="mt-8 border-b border-gray-100 dark:border-gray-800"></div>
                                        </div>
                                    ),
                            )}
                        </div>

                        {currentProfile.posts.length > postsToFetch && (
                            <div className="w-[100%] flex items-center justify-center">
                                <Button
                                    className="mx-auto z-20 dark:invert"
                                    onClick={() => {
                                        if (
                                            currentProfile &&
                                            currentProfile.posts
                                        ) {
                                            fetchUserPosts();
                                        }
                                    }}
                                >
                                    Load More
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default PublicProfile;
