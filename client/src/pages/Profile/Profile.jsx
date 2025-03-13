import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    // X,
    // SquareArrowOutUpRight,
    Share2,
    Grid,
    Rows,
    Camera,
    ThumbsUp,
    MessageCircle,
    Eye,
    Edit,
    Trash2,
    MoreHorizontal,
} from "lucide-react";
import ProfileHeader from "../../components/Header/ProfileHeader";
// import ProfileFooter from "../../components/Footer/ProfileFooter";
import { useAuth } from "../../contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
// import { MarkdownPreview } from "../CreatePosts/Writing/WritingComponents";
import { toast } from "sonner";
// import ShareButton from "../../components/ShareButton";
// in posts also hide details like deletehash for public options

function sharePost(post) {
    const baseUrl = window.location.origin;
    const postUrl = `${baseUrl}/p/${post._id}`;

    navigator.clipboard
        .writeText(postUrl)
        .then(() => {
            toast.success("Link copied to clipboard");
        })
        .catch((err) => {
            console.error("Failed to copy link:", err);
            toast.error("Faild to copy link");
        });
}
const Profile = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [viewMode, setViewMode] = useState("grid");
    const [activeTab, setActiveTab] = useState("written");
    const [posts, setPosts] = useState([]);
    const [postsToFetch, setPostsToFetch] = useState(0);
    const [loading, setLoading] = useState(false);

    const userStats = [
        { name: "POSTS", amount: currentUser.posts.length },
        { name: "FOLLOWERS", amount: currentUser.followers.length },
        { name: "FOLLOWING", amount: currentUser.following.length },
    ];

    let collections = [];
    if (currentUser) {
        collections = currentUser.collections;
    }

    // fetch posts from user's postIds array
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
        if (currentUser && currentUser.posts) {
            fetchUserPosts();
        }
    }, [currentUser]);

    return (
        <div
            className={`min-h-screen bg-white dark:bg-black dark:text-white font-sans`} //bg-cream-light
        >
            <ProfileHeader />

            <main className="pt-32 px-2 md:px-8">
                <div className="max-w-[1400px] mx-auto pb-[20vh]">
                    <div className="grid md:grid-cols-[1.6fr,1fr] gap-16 mb-24">
                        {/* Left Column with Profile Pic */}
                        <div className="space-y-8">
                            <div className="flex items-start md:items-center space-x-8">
                                {loading ? (
                                    <Skeleton className="size-16 md:size-24 rounded-full" />
                                ) : (
                                    <div className="relative group">
                                        <div className="size-16 md:size-24 rounded-full overflow-hidden bg-gray-100 dark:bg-[#222]">
                                            <img
                                                src={currentUser.profilePicture}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button className="absolute bottom-0 right-0 bg-black dark:bg-[#333] text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
                                        <h1
                                            className="text-4xl md:text-6xl font-boska leading-[0.95] tracking-tighter
                                            pointer-events-none md:pointer-events-auto uppercase dark:text-[#f8f8f8]"
                                        >
                                            {currentUser.fullName}
                                            <span className="block text-xl md:text-4xl font-normal tracking-normal md:tracking-tighter italic capitalize leading-[1.7rem] dark:text-[#e0e0e0]">
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
                                    <p
                                        className="text-stone-700 dark:text-[#b0b0b0] font-boskaLight font-bold md:font-normal
                                    text-lg md:text-2xl leading-tight tracking-normal
                                    max-w-xl pointer-events-none md:pointer-events-auto"
                                    >
                                        &quot; {currentUser.aboutMe} &quot;
                                    </p>
                                )
                            )}
                        </div>

                        {/* Right Column - Quick Stats */}
                        <div className="space-y-3 pt-4">
                            {loading
                                ? Array(4)
                                      .fill(0)
                                      .map((_, i) => (
                                          <div
                                              key={i}
                                              className="flex justify-between items-center py-3 pr-4"
                                          >
                                              <Skeleton className="h-4 w-24" />
                                              <Skeleton className="h-4 w-12" />
                                          </div>
                                      ))
                                : userStats.map((item, index) => (
                                      <div
                                          key={index}
                                          className="flex justify-between items-center border-b border-gray-200 dark:border-[#333] py-3 pr-4"
                                      >
                                          <span className="text-gray-500 dark:text-[#999] text-sm md:text-md">
                                              {item.name}
                                          </span>
                                          <span className="dark:text-[#e0e0e0]">
                                              {item.amount}
                                          </span>
                                      </div>
                                  ))}
                        </div>
                    </div>

                    {/* Collections Carousel */}
                    {collections.length > 0 && (
                        <div className="mb-24">
                            <h2 className="text-2xl font-semibold tracking-tight mb-8 dark:text-[#f0f0f0]">
                                <span className="bg-inherit dark:bg-inherit hover:bg-lime-100 dark:hover:bg-[#222] rounded-md box-content px-2 py-1">
                                    Featured Works
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {loading
                                    ? Array(4)
                                          .fill(0)
                                          .map((_, i) => (
                                              <div
                                                  key={i}
                                                  className="space-y-3"
                                              >
                                                  <Skeleton className="aspect-square w-full" />
                                                  <Skeleton className="h-5 w-3/4" />
                                                  <Skeleton className="h-4 w-1/3" />
                                              </div>
                                          ))
                                    : collections.map((collection) => (
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

                    {/* post viewing options */}
                    {posts.length > 0 && (
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex space-x-8">
                                {/* <button
                                    onClick={() => setActiveTab("all")}
                                    className={`pb-2 dark:text-[#e0e0e0] ${activeTab === "all" ? "border-b-2 border-black dark:border-[#f0f0f0]" : ""}`}
                                >
                                    All Posts
                                </button> */}
                                {/* pic post seperately */}
                                <button
                                    onClick={() => setActiveTab("written")}
                                    className={`pb-2 dark:text-[#e0e0e0] ${activeTab === "written" ? "border-b-2 border-black dark:border-[#f0f0f0]" : ""}`}
                                >
                                    Written
                                </button>
                                <button
                                    onClick={() => setActiveTab("photos")}
                                    className={`pb-2 dark:text-[#e0e0e0] ${activeTab === "photos" ? "border-b-2 border-black dark:border-[#f0f0f0]" : ""}`}
                                >
                                    Photos
                                </button>
                            </div>
                            <div className="hidden md:flex space-x-4">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 ${
                                        viewMode === "grid"
                                            ? "bg-black dark:bg-[#333] text-white"
                                            : "text-gray-400 dark:text-[#999]"
                                    }`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode("rows")}
                                    className={`p-2 ${
                                        viewMode === "rows"
                                            ? "bg-black dark:bg-[#333] text-white"
                                            : "text-gray-400 dark:text-[#999]"
                                    }`}
                                >
                                    <Rows className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Here i am remapping entire posts, need to find method for partial map, only map the newwly fetched posts */}
                    {/* posts */}
                    <div
                        className={`grid gap-8 mb-24 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
                    >
                        {loading
                            ? Array(6)
                                  .fill(0)
                                  .map((_, i) => (
                                      <div key={i} className="space-y-4">
                                          <Skeleton className="aspect-[4/3] w-full" />
                                          <div className="flex justify-between">
                                              <Skeleton className="h-5 w-32" />
                                              <div className="flex gap-4">
                                                  <Skeleton className="h-5 w-12" />
                                                  <Skeleton className="h-5 w-12" />
                                              </div>
                                          </div>
                                      </div>
                                  ))
                            : posts.map((post) => (
                                  <div
                                      key={post._id}
                                      className="group cursor-auto transition-all duration-300"
                                  >
                                      {post.type === "image" ? (
                                          // Photo Post - Enhanced Design
                                          <div className="space-y-3 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                                              <div className="relative aspect-[4/3] overflow-hidden">
                                                  <img
                                                      src={post.image}
                                                      alt={post.title}
                                                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                                                      loading="lazy"
                                                  />
                                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                      <div className="absolute bottom-0 w-full p-4 flex justify-end">
                                                          <Share2 className="w-5 h-5 text-white drop-shadow-md" />
                                                      </div>
                                                  </div>
                                              </div>
                                              <div className="p-4">
                                                  <h3 className="font-medium text-lg mb-2 line-clamp-2 dark:text-[#f0f0f0]">
                                                      {post.title}
                                                  </h3>
                                                  <div className="flex items-center justify-between">
                                                      <div className="flex items-center space-x-1">
                                                          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                                          <span className="text-sm text-gray-500 dark:text-gray-400">
                                                              {post.author
                                                                  ?.name ||
                                                                  "Anonymous"}
                                                          </span>
                                                      </div>
                                                      <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                                                          <div className="flex items-center">
                                                              <Heart className="w-4 h-4 mr-1 text-rose-500" />
                                                              <span>
                                                                  {post.likes}
                                                              </span>
                                                          </div>
                                                          <div className="flex items-center">
                                                              <MessageCircle className="w-4 h-4 mr-1 text-blue-500" />
                                                              <span>
                                                                  {
                                                                      post.comments
                                                                  }
                                                              </span>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      ) : (
                                          // Text Post
                                          <div className="p-6 rounded-xl border border-gray-100 dark:border-[#222] bg-white dark:bg-[#111] shadow-sm hover:shadow-md transition-all duration-300 relative">
                                              <div className="flex justify-between items-start mb-4">
                                                  <h3 className="font-medium text-lg dark:text-[#f0f0f0] capitalize">
                                                      {post.title}
                                                  </h3>
                                              </div>

                                              {post.thumbnailUrl && (
                                                  <div className="mb-4 overflow-hidden rounded-lg aspect-video">
                                                      <img
                                                          src={
                                                              post.thumbnailUrl
                                                          }
                                                          alt={post.title}
                                                          className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                                                          loading="lazy"
                                                      />
                                                  </div>
                                              )}

                                              <div className="flex items-center justify-between border-t border-gray-100 dark:border-[#222] pt-4 mt-2">
                                                  <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                                                      <div className="flex items-center">
                                                          <ThumbsUp className="w-4 h-4 mr-1 text-gray-500" />
                                                          <span>
                                                              {post.totalLikes}
                                                          </span>
                                                      </div>
                                                      <div className="flex items-center">
                                                          <MessageCircle className="w-4 h-4 mr-1 text-gray-500" />
                                                          <span>
                                                              {
                                                                  post.totalComments
                                                              }
                                                          </span>
                                                      </div>
                                                  </div>
                                                  <div className="text-sm">
                                                      {post.readTime}
                                                  </div>
                                              </div>

                                              {/* Hover Actions Menu - Improved */}
                                              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                                  <div className="bg-white/90 dark:bg-gray-800/90 shadow-lg rounded-lg backdrop-blur-sm flex">
                                                      <button
                                                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg"
                                                          title="View"
                                                          onClick={(e) => {
                                                              e.stopPropagation();
                                                              navigate(
                                                                  `/p/${post._id}`,
                                                              );
                                                          }}
                                                      >
                                                          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                                      </button>
                                                      <button
                                                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                          title="Edit"
                                                          onClick={(e) =>
                                                              e.stopPropagation()
                                                          }
                                                      >
                                                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                                      </button>
                                                      <button
                                                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                          title="Delete"
                                                          onClick={(e) =>
                                                              e.stopPropagation()
                                                          }
                                                      >
                                                          <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                                      </button>
                                                      <button
                                                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                          title="Share"
                                                          onClick={(e) => {
                                                              e.stopPropagation();
                                                              sharePost(post);
                                                          }}
                                                      >
                                                          <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                                      </button>
                                                      <button
                                                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg"
                                                          title="More"
                                                          onClick={(e) =>
                                                              e.stopPropagation()
                                                          }
                                                      >
                                                          <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                                      </button>
                                                  </div>
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              ))}
                    </div>
                    {currentUser.posts.length > postsToFetch && (
                        <div className="w-[100%] flex items-center justify-center">
                            <Button
                                className="mx-auto z-20 dark:invert"
                                onClick={() => {
                                    if (currentUser && currentUser.posts) {
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

            {/* <ProfileFooter /> */}
        </div>
    );
};

export default Profile;
