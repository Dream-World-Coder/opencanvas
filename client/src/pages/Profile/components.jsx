import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";
import {
    Eye,
    Edit,
    Trash2,
    MoreHorizontal,
    Share2,
    Info,
    Copy,
    ChevronLeft,
    ChevronRight,
    ThumbsUp,
    MessageCircle,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useDataService } from "../../services/dataService";
import { useAuth } from "../../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

export const formatDates = (date) => {
    try {
        return formatDistanceToNow(new Date(date), {
            addSuffix: true,
        });
    } catch (error) {
        console.log(error);
        return "some time ago";
    }
};

function getSchemaData(currentProfile) {
    const origin = window.location.origin;

    return {
        "@context": "https://schema.org",
        "@type": "Person",
        name: currentProfile.fullName,
        image: `${origin}${currentProfile.profilePicture}`,
        description: currentProfile.aboutMe,
        url: `${origin}/u/${currentProfile.username}`,
        sameAs: currentProfile.contactInformation.map((contact) => contact.url),
        jobTitle: currentProfile.role,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${origin}/u/${currentProfile.username}`,
        },
    };
}

export const ProfileHelmet = ({ currentProfile }) => {
    const stopWords = [
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
    ];
    if (!currentProfile) return null;

    const schemaData = getSchemaData(currentProfile);

    const keywords = [
        currentProfile.fullName,
        currentProfile.fullName.split(" ")[0],
        ...currentProfile.role
            .toLowerCase()
            .split(/\s+/)
            .filter((word) => !stopWords.includes(word)),
        "opencanvas",
    ];

    return (
        <Helmet>
            <title>{currentProfile.fullName} | OpenCanvas</title>
            <meta
                name="description"
                content={`OpenCanvas profile page of ${currentProfile.fullName}`}
            />
            <meta name="keywords" content={[...new Set(keywords)].join(", ")} />
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
        </Helmet>
    );
};
ProfileHelmet.propTypes = {
    currentProfile: PropTypes.object,
};

export const PostFilterTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: "all", label: "All Works" },
        { id: "article", label: "Articles" },
        { id: "story", label: "Stories" },
        { id: "poem", label: "Poems" },
        { id: "collection", label: "Collections" },
    ];

    return (
        <div className="flex overflow-x-auto no-scrollbar space-x-6 md:space-x-10">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                            ? "border-b-2 border-black dark:border-white text-black dark:text-white"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};
PostFilterTabs.propTypes = {
    setActiveTab: PropTypes.func,
    activeTab: PropTypes.string,
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

function hideDiv(id) {
    const elementToHide = document.getElementById(id);
    if (elementToHide) {
        elementToHide.style.display = "none";
    }
}
export const PostActions = ({ post, setPosts, loading }) => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { deletePost, changePostVisibility, changeFeaturedSettings } =
        useDataService();

    return (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg backdrop-blur-sm flex items-center cursor-pointer">
            {/* view */}
            <div
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                title="View"
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/p/${post._id}`, { state: { post } });
                }}
            >
                <Eye
                    title="View"
                    className="w-4 h-4 text-gray-600 dark:text-gray-300 rounded-full"
                />
            </div>

            {/* edit */}
            <div
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                title="Edit"
                onClick={(e) => {
                    e.stopPropagation();
                    localStorage.setItem("newPostId", post._id.toString());
                    window.location.href = "/edit-post";
                }}
            >
                <Edit
                    title="Edit"
                    className="w-4 h-4 text-gray-600 dark:text-gray-300"
                />
            </div>

            {/* delete */}
            <AlertDialog title="Delete">
                <AlertDialogTrigger className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                    <Trash2
                        title="Delete"
                        className="w-4 h-4 text-gray-600 dark:text-gray-300"
                    />
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the post.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            title="Delete"
                            onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                    let res = await deletePost(post._id);
                                    toast(res.message);
                                    hideDiv(post._id);
                                } catch (error) {
                                    console.error(error);
                                    toast("Failed to delete post.");
                                }
                            }}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* dropdown menu */}
            <DropdownMenu
                className="size-6 grid place-items-center overflow-hidden"
                title="More"
                onClick={(e) => e.stopPropagation()}
            >
                <DropdownMenuTrigger className="p-2 box-content hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                    <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>
                        <button
                            onClick={async () => {
                                let tmp = await changePostVisibility(
                                    post._id,
                                    !post.isPublic,
                                );
                                if (tmp.success) {
                                    toast.success(tmp.message);
                                    setPosts((prevPosts) =>
                                        prevPosts.map((p) =>
                                            p._id === post._id
                                                ? {
                                                      ...p,
                                                      isPublic: !post.isPublic,
                                                  }
                                                : p,
                                        ),
                                    );
                                }
                            }}
                            className={`hover:opacity-70 transition-opacity flex items-center justify-start gap-2 size-full ${loading ? "opacity-20" : ""}`}
                        >
                            make {post.isPublic ? "private" : "public"}
                        </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <button
                            onClick={async () => {
                                let tmp = await changeFeaturedSettings(
                                    post._id,
                                    "Post",
                                );
                                if (tmp.success) {
                                    toast.success(tmp.message);
                                } else {
                                    toast.error(tmp.response.data.message);
                                }
                            }}
                            className={`hover:opacity-70 transition-opacity flex items-center justify-start gap-2 size-full ${loading ? "opacity-20" : ""}`}
                        >
                            {currentUser.featuredItems
                                .map((item) => item.itemId.toString())
                                .includes(post._id.toString())
                                ? "remove from featured"
                                : "feature at top"}
                        </button>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* share */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    sharePost(post);
                }}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
                <Share2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
        </div>
    );
};
PostActions.propTypes = {
    post: PropTypes.object,
    setPosts: PropTypes.func,
    loading: PropTypes.bool,
};

export const PostActionsPublic = ({ post }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg backdrop-blur-sm flex items-center cursor-pointer">
            {/* view */}
            <div
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                title="View"
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/p/${post._id}`, { state: { post } });
                }}
            >
                <Eye
                    title="View"
                    className="w-4 h-4 text-gray-600 dark:text-gray-300 rounded-full"
                />
            </div>

            {/* share */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    sharePost(post);
                }}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
                <Share2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
        </div>
    );
};
PostActionsPublic.propTypes = {
    post: PropTypes.object,
};

export const ContactInformationDropdown = ({ currentProfile }) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger className="flex items-center justify-center gap-2">
                <Info className="size-5" /> Contact
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Contact Information</AlertDialogTitle>
                    <AlertDialogDescription>
                        {currentProfile.contactInformation.map(
                            (item, index) => (
                                <div key={index} className="mb-3">
                                    <h3 className="flex items-center justify-between font-semibold text-[#111] dark:text-white">
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
                                    <div className="text-xs">{item.url}</div>
                                </div>
                            ),
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

ContactInformationDropdown.propTypes = {
    currentProfile: PropTypes.object,
};

export const FeaturedWorks = ({ currentUser }) => {
    const scrollContainerRef = useRef(null);
    const navigate = useNavigate();
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    // Check if scrolling is available
    const checkScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const hasScrollableContent =
            container.scrollWidth > container.clientWidth;
        const atLeftEdge = container.scrollLeft <= 10;
        const atRightEdge =
            container.scrollLeft + container.clientWidth >=
            container.scrollWidth - 10;

        setShowLeftArrow(hasScrollableContent && !atLeftEdge);
        setShowRightArrow(hasScrollableContent && !atRightEdge);
    };

    // Scroll functions
    const scrollLeft = () => {
        scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    };

    const scrollRight = () => {
        scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    };

    // Check on mount and resize
    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, []);

    return (
        <>
            {currentUser.featuredItems.length > 0 && (
                <div className="mb-24 relative">
                    <h2 className="text-2xl font-semibold tracking-tight mb-8 dark:text-[#f0f0f0]">
                        <span className="bg-inherit dark:bg-inherit hover:bg-lime-100 dark:hover:bg-[#222] rounded-md box-content px-2 py-1">
                            Featured Works
                        </span>
                    </h2>

                    {/* Left Scroll Indicator */}
                    {showLeftArrow && (
                        <button
                            onClick={scrollLeft}
                            className="absolute left-0 top-1/2 mt-4 transform -translate-y-1/2 bg-white dark:bg-[#1a1a1a] p-2 rounded-full shadow-md z-10 flex items-center"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}

                    {/* Right Scroll Indicator */}
                    {showRightArrow && (
                        <button
                            onClick={scrollRight}
                            className="absolute right-0 top-1/2 mt-4 transform -translate-y-1/2 bg-white dark:bg-[#1a1a1a] p-2 rounded-full shadow-md z-10 flex items-center"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}

                    <div
                        ref={scrollContainerRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide flex-nowrap pb-4"
                        onScroll={checkScroll}
                    >
                        {currentUser.featuredItems.map((item) => (
                            <div
                                key={item.itemId}
                                className="group cursor-pointer min-w-[200px] md:min-w-[300px] max-w-[200px] md:max-w-[300px]"
                                onClick={() => {
                                    item.itemType === "Post"
                                        ? navigate(`/p/${item.itemId}`)
                                        : navigate(`/c/${item.itemId}`);
                                }}
                            >
                                <div className="relative aspect-square overflow-hidden mb-4">
                                    <img
                                        src={item.itemThumbnail}
                                        alt={item.itemTitle}
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {/* dark inset on hover */}
                                    <div className="absolute inset-0 bg-black/20 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        {/* <Share2 className="w-6 h-6 text-white" /> */}
                                    </div>
                                </div>
                                <h3 className="text-lg font-medium mb-1 flex justify-between dark:text-[#e8e8e8]">
                                    {item.itemTitle}
                                    <Share2 className="w-6 h-6 text-black dark:text-white rounded-lg p-1 hover:bg-yellow-200 dark:hover:bg-[#2c2c2c]" />
                                </h3>
                                <p className="text-sm text-gray-400 dark:text-[#888]">
                                    {item.itemType.toLowerCase()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};
FeaturedWorks.propTypes = {
    currentUser: PropTypes.object,
};

export const PostStats = ({ post }) => {
    return (
        <>
            {/* views */}
            <div className="flex items-center">
                <b>{post.totalViews || 0} &nbsp; </b> Views
            </div>

            {/* likes */}
            <div className="flex items-center">
                <b>{post.totalLikes || 0} &nbsp; </b> Likes
            </div>

            {/* comments */}
            <div className="flex items-center">
                <b>{post.totalComments || 0} &nbsp; </b> Comments
            </div>

            {/* readtime */}
            <span className="text-sm text-gray-500 dark:text-gray-400">
                {post.readTime}
            </span>
        </>
    );
};
PostStats.propTypes = {
    post: PropTypes.object,
};
