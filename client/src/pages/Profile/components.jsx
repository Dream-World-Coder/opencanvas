// client/src/pages/Profile/components.jsx

import { useState, useRef, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";
import { MarkdownPreview } from "@/pages/Create/Editor/components";
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
  BookMarked,
} from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { useCollectionContext } from "../../contexts/CollectionContext";
import { slugify } from "@/pages/Create/Editor/hooks/useWritingPad";
import { Heart } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDates = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
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
    sameAs: currentProfile.contactInformation.map((c) => c.url),
    jobTitle: currentProfile.designation,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${origin}/u/${currentProfile.username}`,
    },
  };
}

// Copy post/collection URL to clipboard, or use native share if available
function sharePost(post) {
  const slug = `${slugify(post.title)}-${post._id}`;
  const postUrl = `${window.location.origin}/p/${slug}`;
  if (navigator.share) {
    navigator.share({ title: post.title, url: postUrl });
  } else {
    navigator.clipboard
      .writeText(postUrl)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"));
  }
}

// Hide a post card by DOM id after deletion (avoids a full re-fetch)
function hidePostCard(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export const ProfileHelmet = ({ currentProfile }) => {
  if (!currentProfile) return null;

  const stopWords = new Set([
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
  ]);

  const keywords = [
    currentProfile.fullName,
    currentProfile.fullName.split(" ")[0],
    ...currentProfile.designation
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => !stopWords.has(w)),
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
        {JSON.stringify(getSchemaData(currentProfile))}
      </script>
    </Helmet>
  );
};
ProfileHelmet.propTypes = { currentProfile: PropTypes.object };

// ─── Profile Image ─────────────────────────────────────────────────────────────

export const ProfileImage = ({ user }) => (
  <div className="size-16 md:size-24 rounded-full overflow-hidden bg-gray-100 dark:bg-[#171717]">
    <Avatar className="size-full">
      <AvatarImage
        src={user.profilePicture}
        alt={`${user.username}'s profile picture`}
      />
      <AvatarFallback className="bg-gradient-to-r from-lime-500 to-green-500 text-white text-4xl font-light font-stardom">
        {user.fullName.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  </div>
);
ProfileImage.propTypes = { user: PropTypes.object };

// ─── Quick Stats ───────────────────────────────────────────────────────────────

export const QuickStatsProfile = ({ currentUser }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const stats = [
    {
      name: "WORKS",
      href: "#post-view",
      amount: currentUser.stats?.postsCount ?? 0,
      icon: SquareChartGantt,
    },
    {
      name: "LIKES RECEIVED",
      href: `#`,
      amount: currentUser.stats?.likesReceivedCount ?? 0,
      icon: Heart,
    },
    {
      name: "FOLLOWERS",
      href: `/u/${currentUser.username}/followers`,
      amount: currentUser.stats?.followersCount ?? 0,
      icon: Users,
    },
    {
      name: "FOLLOWING",
      href: `/u/${currentUser.username}/following`,
      amount: currentUser.stats?.followingCount ?? 0,
      icon: UserCheck,
    },
  ];

  return (
    <div className="w-full md:w-[300px] lg:w-[400px] font-sans border border-gray-300 md:border-gray-200 dark:border-[#222] mt-6 md:mt-0 rounded-lg bg-white dark:bg-[#171717] overflow-hidden">
      {stats.map((item, index) => (
        <a
          key={index}
          href={item.href}
          className={`flex items-center justify-between px-4 py-3 border-b last:border-b-0 border-gray-300 md:border-gray-200 dark:border-[#222]
            hover:bg-gray-50 dark:hover:bg-[#111] transition-all duration-300 ease-in-out
            ${hoveredItem === index ? "bg-gray-50 dark:bg-[#222]" : ""}`}
          onMouseEnter={() => setHoveredItem(index)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div className="flex items-center space-x-3">
            <span
              className={`text-gray-400 dark:text-gray-500 transition-all duration-300
                ${hoveredItem === index ? "text-gray-600 dark:text-gray-300" : ""}`}
            >
              <item.icon size={16} strokeWidth={1.5} />
            </span>
            <span
              className={`font-medium text-xs tracking-wider text-gray-500 dark:text-gray-400 transition-all duration-300
                ${hoveredItem === index ? "text-gray-700 dark:text-gray-200 translate-x-1" : ""}`}
            >
              {item.name}
            </span>
          </div>
          <div
            className={`flex items-center transition-all duration-300 ${hoveredItem === index ? "scale-110" : ""}`}
          >
            <span className="font-semibold text-base text-gray-800 dark:text-gray-200">
              {item.amount}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ml-1 text-gray-400 dark:text-gray-500 transition-transform duration-300
                ${hoveredItem === index ? "transform translate-x-1 opacity-100 text-gray-600 dark:text-gray-300" : "opacity-0"}`}
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
QuickStatsProfile.propTypes = { currentUser: PropTypes.object.isRequired };

// ─── Post Filter Tabs ──────────────────────────────────────────────────────────

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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Scroll the active tab into view on mobile
  useEffect(() => {
    if (!scrollRef.current || !isMobile) return;
    const activeEl = document.getElementById(`tab-${activeTab}`);
    if (activeEl) {
      const scrollLeft =
        activeEl.offsetLeft -
        scrollRef.current.offsetWidth / 2 +
        activeEl.offsetWidth / 2;
      scrollRef.current.scrollTo({ left: scrollLeft, behavior: "smooth" });
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

          {/* Fade edges to hint at horizontal scroll on mobile */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent pointer-events-none sm:hidden" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
        </div>
      </Tabs>
    </div>
  );
};
PostFilterTabs.propTypes = {
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func,
};

// ─── Post Actions (owner) ──────────────────────────────────────────────────────

export const PostActions = ({ post, setPosts, loading }) => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();
  const { deletePost, changePostVisibility, changeFeaturedSettings } =
    useDataService();
  const { setPostIdToSave } = useCollectionContext();

  return (
    <div className="bg-gray-100 dark:bg-neutral-900 rounded-lg backdrop-blur-sm flex items-center cursor-pointer">
      {/* View */}
      <div
        className="p-2 hover:bg-gray-200 dark:hover:bg-[#444] rounded-full"
        title="View"
        onClick={(e) => {
          e.stopPropagation();
          const slug = `${slugify(post.title)}-${post._id}`;
          post.isPublic
            ? navigate(`/p/${slug}`, { state: { post } })
            : navigate(`/private/p/${slug}`, { state: { post } });
        }}
      >
        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300 rounded-full" />
      </div>

      {/* Edit — post ID goes in the URL, no localStorage */}
      <div
        className="p-2 hover:bg-gray-200 dark:hover:bg-[#444] rounded-full"
        title="Edit"
        onClick={(e) => {
          localStorage.setItem("blogPost", "");
          e.stopPropagation();
          navigate(
            `/editor/markdown/create?type=${post.type}&id=${post._id}&editing=${true}`,
          );
        }}
      >
        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </div>

      {/* Delete */}
      <AlertDialog>
        <AlertDialogTrigger className="p-2 hover:bg-gray-200 dark:hover:bg-[#444] rounded-full">
          <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
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
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const res = await deletePost(post._id);
                  toast(res.message);
                  hidePostCard(post._id);
                } catch {
                  toast.error("Failed to delete post.");
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* More options dropdown */}
      <DropdownMenu onClick={(e) => e.stopPropagation()}>
        <DropdownMenuTrigger className="p-2 box-content hover:bg-gray-200 dark:hover:bg-[#444] rounded-full">
          <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          {/* Toggle public/private */}
          <DropdownMenuItem>
            <button
              disabled={loading}
              className={`hover:opacity-70 transition-opacity flex items-center gap-2 size-full ${loading ? "opacity-20" : ""}`}
              onClick={async () => {
                const res = await changePostVisibility(
                  post._id,
                  !post.isPublic,
                );
                if (res.success) {
                  toast.success(res.message);
                  setPosts((prev) =>
                    prev.map((p) =>
                      p._id === post._id
                        ? { ...p, isPublic: !post.isPublic }
                        : p,
                    ),
                  );
                }
              }}
            >
              Make {post.isPublic ? "Private" : "Public"}
            </button>
          </DropdownMenuItem>

          {/* Toggle featured */}
          <DropdownMenuItem>
            <button
              disabled={loading}
              className={`hover:opacity-70 transition-opacity flex items-center gap-2 size-full ${loading ? "opacity-20" : ""}`}
              onClick={async () => {
                const res = await changeFeaturedSettings(post._id);
                if (!res.success) {
                  toast.error(res.response?.data?.message);
                  return;
                }
                toast.success(res.message);
                setCurrentUser((prev) => ({
                  ...prev,
                  featuredItems: res.added
                    ? [
                        ...prev.featuredItems,
                        {
                          itemId: post._id,
                          itemType: "Post",
                          itemTitle: post.title,
                          itemThumbnail: post.thumbnailUrl,
                        },
                      ]
                    : prev.featuredItems.filter(
                        (item) => item.itemId !== post._id,
                      ),
                }));
              }}
            >
              {currentUser.featuredItems
                .map((item) => item.itemId.toString())
                .includes(post._id.toString())
                ? "Remove from Featured"
                : "Feature at Top"}
            </button>
          </DropdownMenuItem>

          {/* Save in collection */}
          <DropdownMenuItem>
            <button
              disabled={loading}
              className={`hover:opacity-70 transition-opacity flex items-center gap-2 size-full ${loading ? "opacity-20" : ""}`}
              onClick={() => setPostIdToSave(post._id)}
            >
              Save in Collection
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Share */}
      <div
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#444] transition-colors duration-200"
        onClick={(e) => {
          e.stopPropagation();
          sharePost(post);
        }}
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

// ─── Post Actions (public visitor) ────────────────────────────────────────────

export const PostActionsPublic = ({ post }) => {
  const navigate = useNavigate();
  const { setPostIdToSave } = useCollectionContext();

  return (
    <div className="bg-gray-100 dark:bg-neutral-900 rounded-lg backdrop-blur-sm flex items-center cursor-pointer">
      <div
        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
        title="View"
        onClick={(e) => {
          e.stopPropagation();
          const slug = `${slugify(post.title)}-${post._id}`;
          navigate(`/p/${slug}`, { state: { post } });
        }}
      >
        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300 rounded-full" />
      </div>

      <div
        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
        title="Save in Collection"
        onClick={(e) => {
          e.stopPropagation();
          setPostIdToSave(post._id);
        }}
      >
        <BookMarked className="w-4 h-4 text-gray-600 dark:text-gray-300 rounded-full" />
      </div>

      <div
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        onClick={(e) => {
          e.stopPropagation();
          sharePost(post);
        }}
      >
        <Share2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>
    </div>
  );
};
PostActionsPublic.propTypes = { post: PropTypes.object };

// ─── Contact Information ───────────────────────────────────────────────────────

export const ContactInformationDropdown = ({ currentProfile }) => (
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
                    toast.success("URL copied to clipboard");
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
ContactInformationDropdown.propTypes = { currentProfile: PropTypes.object };

// ─── Featured Works ────────────────────────────────────────────────────────────

const FEATURED_COLORS = [
  "bg-gradient-to-br from-[#E8F5E8] to-[#D4F1D4] dark:bg-zinc-900 border-[#E8F5E8] dark:border-neutral-800 dark:text-neutral-200",
  "bg-gradient-to-br from-[#F0F8D0] to-[#E8F5CD] dark:bg-zinc-900 border-[#F0F8D0] dark:border-neutral-800 dark:text-neutral-200",
  "bg-gradient-to-br from-[#C8E6C9] to-[#B8D4B8] dark:bg-zinc-900 border-[#C8E6C9] dark:border-neutral-800 dark:text-neutral-200",
  "bg-gradient-to-br from-[#E1F5FE] to-[#B3E5FC] dark:bg-zinc-900 border-[#E1F5FE] dark:border-neutral-800 dark:text-neutral-200",
  "bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] dark:bg-zinc-900 border-[#FFF3E0] dark:border-neutral-800 dark:text-neutral-200",
  "bg-gradient-to-br from-[#F3E5F5] to-[#E1BEE7] dark:bg-zinc-900 border-[#F3E5F5] dark:border-neutral-800 dark:text-neutral-200",
];

export const FeaturedWorks = memo(function FeaturedWorks({ currentUser }) {
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollable = el.scrollWidth > el.clientWidth;
    setShowLeftArrow(scrollable && el.scrollLeft > 10);
    setShowRightArrow(
      scrollable && el.scrollLeft + el.clientWidth < el.scrollWidth - 10,
    );
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  if (!currentUser.featuredItems.length) return null;

  return (
    <div className="mb-24 relative px-4 md:px-0">
      <h2 className="text-2xl font-semibold tracking-tight mb-8 dark:text-[#f0f0f0]">
        <span className="border-none border-gray-100 dark:border-[#222] rounded-md box-content px-2 py-1">
          Featured Works
        </span>
      </h2>

      {showLeftArrow && (
        <button
          onClick={() =>
            scrollContainerRef.current.scrollBy({
              left: -300,
              behavior: "smooth",
            })
          }
          className="absolute left-0 top-1/2 mt-0 transform -translate-y-1/2 bg-white dark:bg-[#1a1a1a] p-2 rounded-full shadow-md z-10 flex items-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() =>
            scrollContainerRef.current.scrollBy({
              left: 300,
              behavior: "smooth",
            })
          }
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
        {currentUser.featuredItems.map((item, index) => (
          <div
            key={item.itemId}
            className="group cursor-pointer min-w-[200px] md:min-w-[300px] max-w-[200px] md:max-w-[300px]"
            onClick={() =>
              navigate(
                item.itemType.toLowerCase() === "post"
                  ? `/p/${item.itemId}`
                  : `/c/${item.itemId}`,
              )
            }
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
                  className={`size-full transition-transform duration-500 group-hover:scale-105 border ${FEATURED_COLORS[index % FEATURED_COLORS.length]} p-5 text-xl font-serif overflow-hidden`}
                >
                  {item.itemTitle}
                </div>
              )}
              <div className="absolute inset-0 bg-black/10 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <h3 className="text-base font-medium mb-1 flex justify-between dark:text-[#e8e8e8]">
              {item.itemTitle}
              <Share2
                className="w-6 h-6 min-h-[24px] min-w-[24px] text-black dark:text-white rounded-lg p-1 hover:bg-yellow-200 dark:hover:bg-[#2c2c2c]"
                onClick={async (e) => {
                  e.stopPropagation();
                  const type =
                    item.itemType.toLowerCase() === "collection" ? "c" : "p";
                  await navigator.clipboard.writeText(
                    `${window.location.origin}/${type}/${item.itemId}`,
                  );
                  toast.success("Link copied to clipboard");
                }}
              />
            </h3>
            <p className="text-sm text-gray-400 dark:text-[#888]">
              {item.itemType.toLowerCase() === "collection" ? "Collection" : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});
FeaturedWorks.propTypes = { currentUser: PropTypes.object };

// ─── Post Stats ────────────────────────────────────────────────────────────────

export const PostStats = ({ post }) => (
  <div className="flex flex-wrap gap-4 items-center text-xs">
    <div className="flex items-center gap-1">
      <Eye className="w-4 h-4 block sm:hidden" />
      <b>{post?.stats?.viewsCount || 0}&nbsp;</b>
      <span className="hidden sm:inline">Views</span>
    </div>
    <div className="flex items-center gap-1">
      <ThumbsUp className="w-4 h-4 block sm:hidden" />
      <b>{post?.stats?.likesCount || 0}&nbsp;</b>
      <span className="hidden sm:inline">Likes</span>
    </div>
    <div className="flex items-center gap-1">
      <MessageCircle className="w-4 h-4 block sm:hidden" />
      <b>{post?.stats?.commentsCount || 0}&nbsp;</b>
      <span className="hidden sm:inline">Comments</span>
    </div>
    <span className="text-gray-500 dark:text-gray-400">{post.readTime}</span>
  </div>
);
PostStats.propTypes = { post: PropTypes.object };

// ─── Post Details ──────────────────────────────────────────────────────────────

export const PostDetails = ({ post }) => (
  <div>
    <div className="flex flex-col lg:flex-row items-start lg:items-center lg:space-x-2">
      <span className="text-xs text-gray-600 dark:text-gray-400">
        created {formatDates(post.createdAt)}
      </span>
      <span className="text-gray-400 dark:text-gray-500 hidden lg:block">
        ·
      </span>
      <span className="text-xs text-gray-600 dark:text-gray-400">
        last edited {formatDates(post.updatedAt)}
      </span>
    </div>
    {post.tags?.length > 0 && (
      <div className="flex flex-wrap gap-2 text-xs text-black dark:text-neutral-300 mt-2">
        Tags:
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="bg-lime-200 dark:bg-neutral-700 rounded-full px-2"
          >
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
);
PostDetails.propTypes = { post: PropTypes.object };

// ─── Post List ─────────────────────────────────────────────────────────────────

export const PostList = memo(function PostList({
  posts,
  setPosts,
  activeTab,
  loading,
  isDark,
  forPrivate,
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 mb-16 px-4 md:px-0">
      {posts.map(
        (post) =>
          (activeTab === "all" || post.type === activeTab) && (
            <div
              key={post._id}
              id={`${post._id}`}
              onClick={() => {
                if (!forPrivate) {
                  const slug = `${slugify(post.title)}-${post._id}`;
                  navigate(`/p/${slug}`, { state: { post } });
                }
              }}
              className={`group ${forPrivate ? "" : "cursor-pointer"}`}
            >
              <div className="flex flex-col gap-4">
                <div className="w-full">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail */}
                    {post.thumbnailUrl && (
                      <div className="w-full max-w-[17rem] aspect-video overflow-hidden rounded-lg">
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
                      <div className="relative mb-4 max-h-[150px] max-w-[300px] md:max-w-none overflow-hidden">
                        <div className="prose prose-sm dark:prose-invert">
                          <MarkdownPreview
                            title={post.title}
                            content={
                              (post.content ?? "").slice(0, 700) +
                              (post.content ? "..." : "")
                            }
                            thumbnailUrl={post.thumbnailUrl}
                            isDark={isDark}
                            darkBg="bg-[#222]"
                            textAlignment="left"
                            insidePost={true}
                            contentOnly={true}
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-[#222] to-transparent" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details + actions row */}
                <div className="flex flex-col space-y-4">
                  <PostDetails post={post} />
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

              <div className="mt-8 border-b border-gray-100 dark:border-[#333]" />
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

// ─── Collection List ───────────────────────────────────────────────────────────
// Renders a user's collections as article-style rows (no heading — caller adds one).
// forPrivate=true shows the private badge and routes private collections to /c/private/:id.

export const CollectionList = ({ collections, forPrivate }) => {
  const navigate = useNavigate();

  if (!collections || collections.length === 0) return null;

  return (
    <div className="px-4 md:px-0 mb-16">
      {collections.map((col) => {
        // Private collections are behind an auth-gated route
        const href =
          forPrivate && col.isPrivate
            ? `/c/private/${col._id}`
            : `/c/${col._id}`;

        return (
          <div key={col._id} className="group">
            <div className="flex gap-4 py-6">
              {/* Thumbnail */}
              <div
                onClick={() => navigate(href)}
                className="cursor-pointer flex-shrink-0 w-24 h-16 md:w-36 md:h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]"
              >
                {col.thumbnailUrl ? (
                  <img
                    src={col.thumbnailUrl}
                    alt={col.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  // Show title as placeholder text — same pattern as FeaturedWorks
                  <div className="w-full h-full flex items-center justify-center p-2 text-xs text-gray-400 dark:text-gray-600 font-serif text-center leading-snug">
                    {col.title}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div
                    onClick={() => navigate(href)}
                    className="cursor-pointer flex items-center gap-2 mb-1"
                  >
                    <h2 className="text-base font-medium dark:text-[#e8e8e8] truncate group-hover:text-lime-700 dark:group-hover:text-lime-400 transition-colors">
                      {col.title}
                    </h2>
                    {/* Private badge — only visible to the owner (forPrivate=true) */}
                    {forPrivate && col.isPrivate && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                        <EyeOff className="size-3" />
                        Private
                      </span>
                    )}
                  </div>

                  {col.description && (
                    <p className="text-sm text-stone-600 dark:text-[#aaa] line-clamp-2 leading-snug">
                      {col.description}
                    </p>
                  )}
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                  <span>{col.posts?.length ?? 0} posts</span>
                  {col.tags?.length > 0 && (
                    <>
                      <span>·</span>
                      <span className="hidden sm:inline">
                        {col.tags.slice(0, 3).join(", ")}
                        {col.tags.length > 3 && ` +${col.tags.length - 3}`}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-b border-gray-100 dark:border-[#333]" />
          </div>
        );
      })}
    </div>
  );
};
CollectionList.propTypes = {
  collections: PropTypes.array,
  forPrivate: PropTypes.bool,
};

// ─── Name + Designation ────────────────────────────────────────────────────────

export const NameDesignation = ({ name, designation }) => (
  <h1
    className="text-xl md:text-3xl lg:text-4xl font-sans md:font-stardom text-black dark:text-[#fff]
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
NameDesignation.propTypes = {
  name: PropTypes.string,
  designation: PropTypes.string,
};
