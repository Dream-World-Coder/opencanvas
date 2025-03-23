import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
    Eye,
    Edit,
    Trash2,
    MoreHorizontal,
    Share2,
    Info,
    Copy,
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

export const TabComponent = ({ activeTab, setActiveTab }) => {
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
TabComponent.propTypes = {
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
                    navigate(`/p/${post._id}`);
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
                    navigate(`/p/${post._id}`);
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

PostActions.propTypes = {
    post: PropTypes.object,
    setPosts: PropTypes.func,
    loading: PropTypes.bool,
};
PostActionsPublic.propTypes = {
    post: PropTypes.object,
};

export const FollowUnfollow = ({ currentProfile }) => {
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

FollowUnfollow.propTypes = {
    currentProfile: PropTypes.object,
};
