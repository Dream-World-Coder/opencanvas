import { useState, useRef, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";
import { MarkdownPreview } from "../CreatePosts/Writing/WritingComponents";
import {
  Eye,
  EyeOff,
  Edit,
  Trash2,
  MoreHorizontal,
  Share2,
  Copy,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  MessageCircle,
  SquareChartGantt,
  Users,
  UserCheck,
  Contact,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
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
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
    </Helmet>
  );
};
ProfileHelmet.propTypes = {
  currentProfile: PropTypes.object,
};

export const QuickStatsProfile = ({ currentUser }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const userStats = [
    {
      name: "WORKS",
      href: "#post-view",
      amount: currentUser.posts.length,
      icon: SquareChartGantt,
    },
    {
      name: "FOLLOWERS",
      href: `/u/${currentUser.username}/followers`,
      amount: currentUser.followers.length,
      icon: Users,
    },
    {
      name: "FOLLOWING",
      href: `/u/${currentUser.username}/following`,
      amount: currentUser.following.length,
      icon: UserCheck,
    },
  ];

  return (
    <div className="w-full md:w-[300px] lg:w-[400px] font-sans border border-gray-300 md:border-gray-200 dark:border-[#222] mt-6 md:mt-0 rounded-lg bg-white dark:bg-[#171717] overflow-hidden">
      {userStats.map((item, index) => (
        <a
          key={index}
          className={`flex items-center justify-between px-4 py-3 border-b last:border-b-0 border-gray-300 md:border-gray-200 dark:border-[#222]
            hover:bg-gray-50 dark:hover:bg-[#111] transition-all duration-300 ease-in-out ${
              hoveredItem === index ? "bg-gray-50 dark:bg-[#222]" : ""
            }`}
          href={item.href}
          onMouseEnter={() => setHoveredItem(index)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div className="flex items-center space-x-3">
            <span
              className={`text-gray-400 dark:text-gray-500 transition-all duration-300 ${
                hoveredItem === index ? "text-gray-600 dark:text-gray-300" : ""
              }`}
            >
              <item.icon size={16} strokeWidth={1.5} />
            </span>
            <span
              className={`font-medium text-xs tracking-wider text-gray-500 dark:text-gray-400 transition-all duration-300 ${
                hoveredItem === index
                  ? "text-gray-700 dark:text-gray-200 translate-x-1"
                  : ""
              }`}
            >
              {item.name}
            </span>
          </div>
          <div
            className={`flex items-center transition-all duration-300 ${
              hoveredItem === index ? "scale-110" : ""
            }`}
          >
            <span className="font-semibold text-base text-gray-800 dark:text-gray-200">
              {item.amount}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ml-1 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${
                hoveredItem === index
                  ? "transform translate-x-1 opacity-100 text-gray-600 dark:text-gray-300"
                  : "opacity-0"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>
      ))}
    </div>
  );
};
QuickStatsProfile.propTypes = {
  currentUser: PropTypes.object.isRequired,
};

export const PostFilterTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "all", label: "All Works" },
    { id: "article", label: "Articles" },
    { id: "story", label: "Stories" },
    { id: "poem", label: "Poems" },
    { id: "collection", label: "Collections" },
  ];

  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef(null);

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Scroll active tab into view
  useEffect(() => {
    if (scrollRef.current && isMobile) {
      const activeElement = document.getElementById(`tab-${activeTab}`);
      if (activeElement) {
        const scrollLeft =
          activeElement.offsetLeft -
          scrollRef.current.offsetWidth / 2 +
          activeElement.offsetWidth / 2;
        scrollRef.current.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [activeTab, isMobile]);

  return (
    <div className="w-full mb-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative" ref={scrollRef}>
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="h-12 bg-transparent inline-flex items-center justify-start rounded-none border-b border-gray-200 dark:border-[#333] w-full p-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  id={`tab-${tab.id}`}
                  className={cn(
                    "h-full data-[state=active]:shadow-none rounded-none data-[state=active]:dark:bg-[#222] px-4 py-2 text-sm font-medium transition-all data-[state=active]:border-b-2 data-[state=active]:border-primary relative",
                    "data-[state=active]:text-primary data-[state=active]:dark:text-primary dark:text-gray-400 text-gray-600",
                    "hover:text-gray-900 dark:hover:text-gray-200 focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800",
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" className="opacity-0" />
          </ScrollArea>

          {/* Visual indicators for scrolling on mobile */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent pointer-events-none sm:hidden" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
        </div>
      </Tabs>
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
          toast.success("Link copied to clipboard", {
            action: {
              label: "Close",
              onClick: () => console.log("Close"),
            },
          });
        })
        .catch((err) => {
          console.error("Failed to copy link:", err);
          toast.error("Faild to copy link");
        });
}

// better than setting currentuser, else have to remap all posts again
function hideDiv(id) {
  const elementToHide = document.getElementById(id);
  if (elementToHide) {
    elementToHide.style.display = "none";
  }
}
export const PostActions = ({ post, setPosts, loading }) => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();
  const { deletePost, changePostVisibility, changeFeaturedSettings } =
    useDataService();

  return (
    <div className="bg-gray-100 dark:bg-neutral-900 rounded-lg backdrop-blur-sm flex items-center cursor-pointer">
      {/* view */}
      <div
        className="p-2 hover:bg-gray-200 dark:hover:bg-[#444] rounded-full"
        title="View"
        onClick={(e) => {
          e.stopPropagation();
          post.isPublic
            ? navigate(`/p/${post._id}`, { state: { post } })
            : navigate(`/private/p/${post._id}`, {
                state: { post },
              });
        }}
      >
        <Eye
          title="View"
          className="w-4 h-4 text-gray-600 dark:text-gray-300 rounded-full"
        />
      </div>

      {/* edit */}
      <div
        className="p-2 hover:bg-gray-200 dark:hover:bg-[#444] rounded-full"
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
        <AlertDialogTrigger className="p-2 hover:bg-gray-200 dark:hover:bg-[#444] rounded-full">
          <Trash2
            title="Delete"
            className="w-4 h-4 text-gray-600 dark:text-gray-300"
          />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              post.
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
        <DropdownMenuTrigger className="p-2 box-content hover:bg-gray-200 dark:hover:bg-[#444] rounded-full">
          <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <button
              onClick={async () => {
                let tmp = await changePostVisibility(post._id, !post.isPublic);
                if (tmp.success) {
                  toast.success(tmp.message, {
                    action: {
                      label: "Close",
                      onClick: () => console.log("Close"),
                    },
                  });
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

          {/* feature post / remove feature */}
          <DropdownMenuItem>
            <button
              onClick={async () => {
                let res = await changeFeaturedSettings(post._id, "Post");
                if (res.success && res.added == true) {
                  toast.success(res.message, {
                    action: {
                      label: "Close",
                      onClick: () => console.log("Close"),
                    },
                  });
                  setCurrentUser((currentUser) => ({
                    ...currentUser,
                    featuredItems: [
                      ...currentUser.featuredItems,
                      {
                        itemId: post._id,
                        itemType: "Post",
                        itemTitle: post.title,
                        itemThumbnail: post.thumbnailUrl,
                      },
                    ],
                  }));
                } else if (res.success && res.added == false) {
                  toast.success(res.message, {
                    action: {
                      label: "Close",
                      onClick: () => console.log("Close"),
                    },
                  });
                  setCurrentUser((currentUser) => ({
                    ...currentUser,
                    featuredItems: [
                      ...currentUser.featuredItems.filter(
                        (item) => item.itemId != post._id,
                      ),
                    ],
                  }));
                } else {
                  toast.error(res.response.data.message);
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
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#444] transition-colors duration-200"
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
    <div className="bg-gray-100 dark:bg-neutral-900 rounded-lg backdrop-blur-sm flex items-center cursor-pointer">
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
        <Contact className="size-5" /> Contact
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Contact Information</AlertDialogTitle>
          <AlertDialogDescription>
            {currentProfile.contactInformation.map((item, index) => (
              <div key={index} className="mb-3">
                <h3 className="flex items-center justify-between font-semibold text-[#222] dark:text-white">
                  {item.title}

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.url);
                      toast.success("url copied to clipboard", {
                        action: {
                          label: "Close",
                          onClick: () => console.log("Close"),
                        },
                      });
                    }}
                  >
                    <Copy />
                  </button>
                </h3>
                <div className="text-xs">{item.url}</div>
              </div>
            ))}
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

export const FeaturedWorks = memo(function FeaturedWorks({ currentUser }) {
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // const colors1 = [
  //   // Soft lime greens
  //   "bg-[#E8F5E8]/100 dark:bg-zinc-900 border-[#E8F5E8] dark:border-neutral-800 dark:text-neutral-200",
  //   "bg-[#D4F1D4]/100 dark:bg-zinc-900 border-[#D4F1D4] dark:border-neutral-800 dark:text-neutral-200",
  //   "bg-[#C8E6C9]/100 dark:bg-zinc-900 border-[#C8E6C9] dark:border-neutral-800 dark:text-neutral-200",

  //   // Pastel lime-yellows
  //   "bg-[#F0F8D0]/100 dark:bg-zinc-900 border-[#F0F8D0] dark:border-neutral-800 dark:text-neutral-200",
  //   "bg-[#E8F5CD]/100 dark:bg-zinc-900 border-[#E8F5CD] dark:border-neutral-800 dark:text-neutral-200",
  //   "bg-[#F5F8E1]/100 dark:bg-zinc-900 border-[#F5F8E1] dark:border-neutral-800 dark:text-neutral-200",

  //   // Complementary pastels
  //   "bg-[#E1F5FE]/100 dark:bg-zinc-900 border-[#E1F5FE] dark:border-neutral-800 dark:text-neutral-200", // Soft blue
  //   "bg-[#FCE4EC]/100 dark:bg-zinc-900 border-[#FCE4EC] dark:border-neutral-800 dark:text-neutral-200", // Soft pink
  //   "bg-[#F3E5F5]/100 dark:bg-zinc-900 border-[#F3E5F5] dark:border-neutral-800 dark:text-neutral-200", // Soft lavender
  //   "bg-[#FFF3E0]/100 dark:bg-zinc-900 border-[#FFF3E0] dark:border-neutral-800 dark:text-neutral-200", // Soft peach
  // ];

  const colors = [
    // Soft lime green
    "bg-gradient-to-br from-[#E8F5E8] to-[#D4F1D4] dark:bg-zinc-900 border-[#E8F5E8] dark:border-neutral-800 dark:text-neutral-200",

    // Pastel lime-yellow
    "bg-gradient-to-br from-[#F0F8D0] to-[#E8F5CD] dark:bg-zinc-900 border-[#F0F8D0] dark:border-neutral-800 dark:text-neutral-200",

    // Mint to sage
    "bg-gradient-to-br from-[#C8E6C9] to-[#B8D4B8] dark:bg-zinc-900 border-[#C8E6C9] dark:border-neutral-800 dark:text-neutral-200",

    // Soft blue complement
    "bg-gradient-to-br from-[#E1F5FE] to-[#B3E5FC] dark:bg-zinc-900 border-[#E1F5FE] dark:border-neutral-800 dark:text-neutral-200",

    // Peachy pink
    "bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] dark:bg-zinc-900 border-[#FFF3E0] dark:border-neutral-800 dark:text-neutral-200",

    // Soft lavender
    "bg-gradient-to-br from-[#F3E5F5] to-[#E1BEE7] dark:bg-zinc-900 border-[#F3E5F5] dark:border-neutral-800 dark:text-neutral-200",
  ];

  // checkk if scrolling is available
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const hasScrollableContent = container.scrollWidth > container.clientWidth;
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

  const featuredItems = currentUser.featuredItems; //.reverse();

  return (
    <>
      {currentUser.featuredItems.length > 0 && (
        <div className="mb-24 relative px-4 md:px-0">
          <h2 className="text-2xl font-semibold tracking-tight mb-8 dark:text-[#f0f0f0]">
            <span className="border-none border-gray-100 dark:border-[#222] rounded-md box-content px-2 py-1">
              Featured Works
            </span>
          </h2>

          {/* Left Scroll Indicator */}
          {showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 mt-0 transform -translate-y-1/2 bg-white dark:bg-[#1a1a1a] p-2 rounded-full shadow-md z-10 flex items-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Scroll Indicator */}
          {showRightArrow && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 mt-0 transform -translate-y-1/2 bg-white dark:bg-[#1a1a1a] p-2 rounded-full shadow-md z-10 flex items-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide flex-nowrap pb-4"
            onScroll={checkScroll}
          >
            {featuredItems.map((item, index) => (
              <div
                key={item.itemId}
                className="group cursor-pointer min-w-[200px] md:min-w-[300px] max-w-[200px] md:max-w-[300px]"
                onClick={() => {
                  item.itemType.toLowerCase() === "post"
                    ? navigate(`/p/${item.itemId}`)
                    : navigate(`/c/${item.itemId}`);
                }}
              >
                <div className="relative aspect-square overflow-hidden mb-4 border border-gray-100 dark:border-[#333]">
                  {item.itemThumbnail ? (
                    <img
                      src={item.itemThumbnail}
                      alt={item.itemTitle}
                      className="object-cover size-full transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className={`size-full transition-transform duration-500 group-hover:scale-105 border ${colors[index % colors.length]} p-5 text-xl font-serif overflow-hidden`}
                    >
                      {item.itemTitle}
                    </div>
                  )}
                  {/* dark inset on hover */}
                  <div className="absolute inset-0 bg-black/10 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"></div>
                </div>
                <h3 className="text-base font-medium mb-1 flex justify-between dark:text-[#e8e8e8]">
                  {item.itemTitle}
                  <Share2
                    className="w-6 h-6 min-h-[24px] min-w-[24px] text-black dark:text-white rounded-lg p-1 hover:bg-yellow-200 dark:hover:bg-[#2c2c2c]"
                    onClick={async (e) => {
                      e.stopPropagation();
                      let baseUrl = window.location.origin;
                      let typ =
                        item.itemType.toLowerCase() === "collection"
                          ? "c"
                          : "p";
                      await navigator.clipboard.writeText(
                        `${baseUrl}/${typ}/${item.itemId}`,
                      );
                      toast.success("link copied to clipboard", {
                        action: {
                          label: "Close",
                          onClick: () => console.log("Close"),
                        },
                      });
                    }}
                  />
                </h3>
                <p className="text-sm text-gray-400 dark:text-[#888]">
                  {item.itemType.toLowerCase() === "collection"
                    ? "Collection"
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
});
FeaturedWorks.propTypes = {
  currentUser: PropTypes.object,
};

const MockFeatureItem = ({ post = null, collection = null }) => {
  const navigate = useNavigate();
  let item = {};
  if (post) {
    item = {
      itemType: "Post",
      itemThumbnail: post.thumbnailUrl,
      itemTitle: post.title,
    };
  } else if (collection) {
    item = {
      itemType: "Collection",
      itemThumbnail: collection.thumbnailUrl,
      itemTitle: collection.title,
    };
  } else {
    return;
  }
  return (
    <div
      className="group cursor-pointer min-w-[200px] md:min-w-[300px] max-w-[200px] md:max-w-[300px]"
      onClick={() => {
        item.itemType.toLowerCase() === "post"
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
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"></div>
      </div>
      <h3 className="text-lg font-medium mb-1 flex justify-between dark:text-[#e8e8e8]">
        {item.itemTitle}
        <Share2
          className="w-6 h-6 text-black dark:text-white rounded-lg p-1 hover:bg-yellow-200 dark:hover:bg-[#2c2c2c]"
          onClick={async (e) => {
            e.stopPropagation();
            let baseUrl = window.location.origin;
            let typ = item.itemType.toLowerCase() === "collection" ? "c" : "p";
            await navigator.clipboard.writeText(
              `${baseUrl}/${typ}/${item.itemId}`,
            );
            toast.success("link copied to clipboard", {
              action: {
                label: "Close",
                onClick: () => console.log("Close"),
              },
            });
          }}
        />
      </h3>
      <p className="text-sm text-gray-400 dark:text-[#888]">
        {item.itemType.toLowerCase() === "collection" ? "Collection" : ""}
      </p>
    </div>
  );
};
MockFeatureItem.propTypes = {
  post: PropTypes.object,
  collection: PropTypes.object,
};

export const PostStats = ({ post }) => {
  return (
    <div className="flex flex-wrap gap-4 items-center text-xs">
      {/* views */}
      <div className="flex items-center gap-1">
        <Eye className="w-4 h-4 block sm:hidden" />
        <b>{post.totalViews || 0}&nbsp;</b>
        <span className="hidden sm:inline">Views</span>
      </div>

      {/* likes */}
      <div className="flex items-center gap-1">
        <ThumbsUp className="w-4 h-4 block sm:hidden" />
        <b>{post.totalLikes || 0}&nbsp;</b>
        <span className="hidden sm:inline">Likes</span>
      </div>

      {/* comments */}
      <div className="flex items-center gap-1">
        <MessageCircle className="w-4 h-4 block sm:hidden" />
        <b>{post.totalComments || 0}&nbsp;</b>
        <span className="hidden sm:inline">Comments</span>
      </div>

      {/* read time */}
      <span className="text-gray-500 dark:text-gray-400">{post.readTime}</span>
    </div>
  );
};
PostStats.propTypes = {
  post: PropTypes.object,
};

export const PostDetails = ({ post }) => {
  return (
    <div className="">
      <div className="flex flex-col lg:flex-row items-start lg:items-center lg:space-x-2">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          created {formatDates(post.createdAt)}
        </span>
        <span className="text-gray-400 dark:text-gray-500 hidden lg:block">
          ·
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          last edited {formatDates(post.modifiedAt)}
        </span>
      </div>
      {post.tags && (
        <div className="flex flex-wrap gap-2 text-xs text-black dark:text-neutral-300 mt-2">
          Tags:
          {post.tags?.map((tag) => (
            <span
              className="bg-lime-200 dark:bg-neutral-700 rounded-full px-2"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
PostDetails.propTypes = {
  post: PropTypes.object,
};

export const PostList = memo(function PostList({
  posts,
  setPosts,
  activeTab,
  loading,
  isDark,
  forPrivate,
}) {
  const navigate = useNavigate();
  const handlePostClick = (post, forPrivate) => {
    if (forPrivate) return;
    navigate(`/p/${post._id}`, { state: { post } });
  };

  return (
    <div className="space-y-8 mb-16 px-4 md:px-0">
      {posts.map(
        (post) =>
          (activeTab !== "all" ? post.type === activeTab : true) && (
            <div
              key={post._id}
              id={`${post._id}`}
              onClick={() => handlePostClick(post, forPrivate)}
              className={`group ${forPrivate ? "" : "cursor-pointer"}`}
            >
              <div className="flex flex-col gap-4">
                {/* Post metadata and title section */}
                <div className="w-full">
                  {/* tag based on post type */}
                  {/* <div className="mb-2">
                      <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 box-content font-medium">
                          {post.type}
                      </span>
                  </div> */}

                  {/* Content area with thumbnail (if available) */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail - made responsive, full width on mobile */}
                    {post.thumbnailUrl && (
                      <div className="w-full max-w-[17rem] aspect-video overflow-hidden rounded-lg _mx-auto _sm:_mx-0">
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Content preview */}
                    <div className="w-full flex flex-col justify-start items-start">
                      {/* preview snippet */}
                      <div className="relative mb-4 max-h-[150px] max-w-[300px] md:max-w-none overflow-hidden">
                        <div className="prose prose-sm dark:prose-invert">
                          <MarkdownPreview
                            title={post.title}
                            content={post.content.slice(0, 700) + "..." || ""}
                            thumbnailUrl={post.thumbnailUrl}
                            isDark={isDark}
                            darkBg="bg-[#222]"
                            textAlignment="left"
                            insidePost={true}
                            contentOnly={true}
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-[#222] to-transparent"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post details and actions */}
                <div className="flex flex-col space-y-4">
                  {/* details */}
                  <PostDetails post={post} />

                  {/* Stats and actions */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      {post.isPublic ? (
                        <PostStats post={post} />
                      ) : (
                        <div className="flex items-center">
                          <EyeOff className="w-4 h-4 mr-1 text-gray-500" />
                          <span>private</span>
                        </div>
                      )}
                    </div>

                    {/* post actions */}
                    {forPrivate ? (
                      <PostActions
                        post={post}
                        setPosts={setPosts}
                        loading={loading}
                      />
                    ) : (
                      <PostActionsPublic post={post} />
                    )}
                  </div>
                </div>
              </div>

              {/* divider */}
              <div className="mt-8 border-b border-gray-100 dark:border-[#333]"></div>
            </div>
          ),
      )}
    </div>
  );
});
PostList.propTypes = {
  posts: PropTypes.array,
  setPosts: PropTypes.func,
  activeTab: PropTypes.string,
  loading: PropTypes.bool,
  isDark: PropTypes.bool,
  forPrivate: PropTypes.bool,
};

export const NameDesignation = ({ name, designation }) => {
  return (
    <h1
      className="text-xl md:text-3xl lg:text-4xl font-sans md:font-stardom text-black  dark:text-[#fff]
        leading-tight md:leading-[0.95] tracking-tight pointer-events-none md:pointer-events-auto capitalize truncate"
    >
      {name}

      <span
        className="block mt-1 md:mt-2 text-sm md:text-xl font-sans md:font-['Sentient-Regular'] font-normal
          tracking-normal capitalize text-neutral-900 dark:text-neutral-50"
      >
        {designation}
      </span>
    </h1>
  );
};
NameDesignation.propTypes = {
  name: PropTypes.string,
  designation: PropTypes.string,
};
