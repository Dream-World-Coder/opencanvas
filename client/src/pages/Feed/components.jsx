// src/pages/Feed/components.jsx

import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { BookOpen, Clock } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/contexts/AuthContext";
import { timeAgo } from "@/services/formatDate";
import { useState } from "react";
import { PanelLeftClose, PanelRightClose, X } from "lucide-react";
import { useDataService } from "../../services/dataService";
import { useEffect } from "react";
import { toast } from "sonner";

// ─── OpenCanvas Illustration ────────────────────────────────────────────────
// A minimal SVG illustration representing reading, discovery, and science.
// Uses lime, violet, and sky color palette.
const OpenCanvasIllustration = () => (
  <svg
    viewBox="0 0 160 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-[140px] mx-auto"
    aria-hidden="true"
  >
    {/* Background orb — sky */}
    <circle cx="80" cy="80" r="60" fill="#e0f2fe" className="dark:opacity-10" />

    {/* Open book base */}
    <rect
      x="30"
      y="85"
      width="100"
      height="60"
      rx="4"
      fill="#f0fdf4"
      stroke="#a3e635"
      strokeWidth="1.5"
    />

    {/* Book spine */}
    <line x1="80" y1="85" x2="80" y2="145" stroke="#a3e635" strokeWidth="1.5" />

    {/* Left page lines */}
    <line
      x1="40"
      y1="100"
      x2="72"
      y2="100"
      stroke="#bef264"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <line
      x1="40"
      y1="108"
      x2="72"
      y2="108"
      stroke="#bef264"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <line
      x1="40"
      y1="116"
      x2="60"
      y2="116"
      stroke="#bef264"
      strokeWidth="1"
      strokeLinecap="round"
    />

    {/* Right page lines */}
    <line
      x1="88"
      y1="100"
      x2="120"
      y2="100"
      stroke="#bef264"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <line
      x1="88"
      y1="108"
      x2="120"
      y2="108"
      stroke="#bef264"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <line
      x1="88"
      y1="116"
      x2="108"
      y2="116"
      stroke="#bef264"
      strokeWidth="1"
      strokeLinecap="round"
    />

    {/* Floating atom / science icon — violet */}
    <circle cx="80" cy="50" r="7" fill="#7c3aed" opacity="0.15" />
    <circle cx="80" cy="50" r="3" fill="#7c3aed" opacity="0.7" />
    <ellipse
      cx="80"
      cy="50"
      rx="12"
      ry="5"
      stroke="#7c3aed"
      strokeWidth="1"
      opacity="0.5"
    />
    <ellipse
      cx="80"
      cy="50"
      rx="12"
      ry="5"
      stroke="#7c3aed"
      strokeWidth="1"
      opacity="0.5"
      transform="rotate(60 80 50)"
    />
    <ellipse
      cx="80"
      cy="50"
      rx="12"
      ry="5"
      stroke="#7c3aed"
      strokeWidth="1"
      opacity="0.5"
      transform="rotate(120 80 50)"
    />

    {/* Star sparkles — sky */}
    <circle cx="50" cy="62" r="2" fill="#38bdf8" opacity="0.8" />
    <circle cx="110" cy="68" r="1.5" fill="#38bdf8" opacity="0.6" />
    <circle cx="95" cy="40" r="1.5" fill="#a3e635" opacity="0.8" />
    <circle cx="60" cy="38" r="1" fill="#7c3aed" opacity="0.5" />

    {/* Upward arrow — discovery */}
    <path d="M80 28 L76 36 L84 36 Z" fill="#a3e635" opacity="0.9" />
    <line
      x1="80"
      y1="36"
      x2="80"
      y2="44"
      stroke="#a3e635"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// ─── Donate Button ───────────────────────────────────────────────────────────
// Small, unobtrusive donate CTA using violet accent.
const DonateButton = () => (
  <a
    href="https://ko-fi.com" // Replace with your actual donation link
    target="_blank"
    rel="noopener noreferrer"
    className="block w-full text-center text-xs py-2 px-3 rounded-lg border border-lime-200 dark:border-lime-900 text-lime-600 dark:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-950 transition-colors duration-150"
  >
    ♥ Support OpenCanvas
  </a>
);

// ─── LeftSideBar ─────────────────────────────────────────────────────────────
// Collapsible left sidebar for the feed page.
// Feed options and topic filters are hidden (not yet implemented).
// Shows an OpenCanvas illustration and donate button when open.
export const LeftSideBar = ({ selectedTopics, setSelectedTopics }) => {
  // Persist sidebar open/closed state across sessions
  const [sidebarClosed, setSidebarClosed] = useState(
    JSON.parse(localStorage.getItem("feedSidebarClosed")) ?? false,
  );

  // Toggle sidebar and save preference to localStorage
  const toggleSidebar = () => {
    const next = !sidebarClosed;
    localStorage.setItem("feedSidebarClosed", JSON.stringify(next));
    setSidebarClosed(next);
  };

  return (
    <div
      className={`relative p-4 bg-white dark:bg-[#222] h-screen
        ${sidebarClosed ? "border-none" : "border-r border-gray-100 dark:border-[#333]"}`}
    >
      {/* Toggle button — positioned left when closed, right when open */}
      <button
        className={`absolute top-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer transition-colors
          ${sidebarClosed ? "left-4" : "right-4"}`}
        onClick={toggleSidebar}
        aria-label={sidebarClosed ? "Open sidebar" : "Close sidebar"}
      >
        {sidebarClosed ? (
          <PanelRightClose size={20} />
        ) : (
          <PanelLeftClose size={20} />
        )}
      </button>

      {/* Sidebar content — only shown when open */}
      {!sidebarClosed && (
        <div className="flex flex-col items-center gap-6 mt-10 px-2">
          {/* Illustration + tagline */}
          <div className="text-center">
            <OpenCanvasIllustration />
            <p className="mt-3 text-xs font-semibold tracking-wide text-lime-600 dark:text-lime-400 uppercase">
              OpenCanvas
            </p>
            <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
              High-quality science,
              <br />
              papers & stories
            </p>
          </div>

          {/* Donate CTA */}
          <DonateButton />

          {/*
            Feed Options and Trending Topics are hidden until implemented.
            Uncomment and restore these sections when ready:

            <FeedOptions feedOptions={feedOptions} />
            <TopicFilters filters={filters} selectedTopics={selectedTopics} toggleTopic={toggleTopic} />
          */}
        </div>
      )}
    </div>
  );
};

LeftSideBar.propTypes = {
  selectedTopics: PropTypes.array,
  setSelectedTopics: PropTypes.func,
};

export const RightSideBar = () => {
  const { currentUser } = useAuth();
  const { getTopWriters, getUserProfile, followUnfollowUser } =
    useDataService();
  const navigate = useNavigate();

  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Per-writer follow state: { [userId]: bool }
  const [followMap, setFollowMap] = useState({});

  const [suggestedWritersVisible, setSuggestedWritersVisible] = useState(true);

  useEffect(() => {
    fetchWriters();
  }, []);

  async function fetchWriters() {
    setLoading(true);
    try {
      const res = await getTopWriters();
      setWriters(res);

      // Fetch follow status for each writer in parallel (only if logged in)
      if (currentUser && res.length > 0) {
        const profiles = await Promise.all(
          res.map((w) => getUserProfile(w.username).catch(() => null)),
        );
        const map = {};
        res.forEach((w, i) => {
          // getUserProfile returns { user, isFollowing }
          map[w._id] = profiles[i]?.isFollowing ?? false;
        });
        setFollowMap(map);
      }
    } catch (e) {
      console.log(e);
      setWriters([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleFollow(writerId) {
    if (!currentUser) {
      toast.error("You need to log in first");
      return;
    }
    try {
      const res = await followUnfollowUser(writerId);
      if (!res.success) return;
      const followed = res.message === "Followed";
      // Update only this writer's entry in the map
      setFollowMap((prev) => ({ ...prev, [writerId]: followed }));
      toast.success(res.message);
    } catch {
      // useDataService already shows a toast
    }
  }

  return (
    <div className="p-4 bg-white dark:bg-[#222] rounded-none shadow-none h-[88dvh] flex flex-col justify-between">
      {currentUser ? (
        <div
          className={`p-4 border border-gray-100 dark:border-[#333] rounded-lg transition-opacity ${suggestedWritersVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          {/* Card header */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">Suggested Writers</h3>
            <X
              size={16}
              className="cursor-pointer text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              onClick={() => setSuggestedWritersVisible(false)}
            />
          </div>

          {/* Writer list — skeleton while loading, real rows after */}
          <div className="space-y-3">
            {loading ? (
              <WritersSkeleton />
            ) : (
              writers.map((writer) => (
                <WriterRow
                  key={writer._id}
                  writer={writer}
                  isFollowing={followMap[writer._id] ?? false}
                  onNavigate={() => navigate(`/u/${writer.username}`)}
                  onFollow={() => handleFollow(writer._id)}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        // Logged-out CTA
        <div className="p-4 border border-gray-200 dark:border-[#333] rounded-lg">
          <h3 className="font-bold mb-3">Join OpenCanvas</h3>
          <p className="text-sm mb-4">
            Sign up to follow writers, like posts, and create your own content.
          </p>
          <Button
            onClick={() => navigate("/signup")}
            className="w-full mb-2 bg-lime-600 hover:bg-lime-600"
          >
            Sign Up
          </Button>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="w-full"
          >
            Log In
          </Button>
        </div>
      )}

      <div className="text-xs">© OPENCANVAS 2025 All rights reserved</div>
    </div>
  );
};

// ── Single writer row ─────────────────────────────────────────────────────────

function WriterRow({ writer, isFollowing, onNavigate, onFollow }) {
  return (
    <div
      onClick={onNavigate}
      className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded-md px-1 py-0.5 transition-colors"
    >
      <Avatar className="h-8 w-8 mr-2 shrink-0">
        <AvatarImage src={writer.profilePicture} alt={writer.username} />
        <AvatarFallback>
          {writer.fullName?.slice(0, 1).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="text-sm truncate flex-1">
        {writer.fullName || "Unknown"}
      </div>

      <Button
        size="sm"
        variant="outline"
        className="ml-auto text-xs px-2 py-0 h-6 shrink-0"
        onClick={(e) => {
          e.stopPropagation(); // don't navigate when clicking Follow
          onFollow();
        }}
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function WritersSkeleton() {
  return Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className="flex items-center gap-2 animate-pulse">
      {/* Avatar placeholder */}
      <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-[#333] shrink-0" />
      {/* Name placeholder */}
      <div className="h-3 flex-1 rounded bg-gray-100 dark:bg-[#333]" />
      {/* Button placeholder */}
      <div className="h-6 w-14 rounded bg-gray-100 dark:bg-[#333] shrink-0" />
    </div>
  ));
}

export const ErrorDisplay = ({ error, fetchPosts }) => {
  return (
    <div className="p-6 mb-6 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-sm text-red-600 dark:text-red-400">
      <p>{`${error}`}</p>
      <Button onClick={fetchPosts} variant="outline" className="mt-4">
        Retry
      </Button>
    </div>
  );
};

ErrorDisplay.propTypes = {
  error: PropTypes.string,
  fetchPosts: PropTypes.func,
};

export const PostStats = ({ post }) => {
  return (
    <div className="flex items-center justify-between p-2 border-y border-gray-200 border-dashed dark:border-[#333] text-gray-700 dark:text-gray-300 text-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          {/* <Eye className="h-4 w-4 mr-1.5" />
              <span>{post.stats.viewsCount || 0}</span> */}
          <b>
            {post.stats.viewsCount || 0}
            &nbsp;
          </b>
          Views
        </div>
        <div className="flex items-center">
          {/* <Heart className="h-4 w-4 mr-1.5" />
                    <span>{post.stats.likesCount || 0}</span> */}
          <b>
            {post.stats.likesCount || 0}
            &nbsp;
          </b>
          Likes
        </div>
        <div className="flex items-center">
          <b>
            {post.stats.commentsCount || 0}
            &nbsp;
          </b>
          Comments
        </div>
      </div>
      <div className="flex items-center">
        <BookOpen className="h-4 w-4 mr-1.5" />
        <span className="hidden md:inline">
          {post?.readTime || "2 min read"}
        </span>
        <span className="md:hidden">
          {`${post?.readTime?.split(" ")[0]} ${post?.readTime?.split(" ")[1]}`}
        </span>
      </div>
    </div>
  );
};
PostStats.propTypes = {
  post: PropTypes.object,
};

export const PostTags = ({ post }) => {
  return (
    post?.tags?.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((topic) => (
          <span
            key={topic}
            className="bg-gray-100 dark:bg-[#313131] text-xs px-3 py-1 rounded-full font-medium text-gray-800 dark:text-gray-300"
          >
            {topic}
          </span>
        ))}
      </div>
    )
  );
};
PostTags.propTypes = {
  post: PropTypes.object,
};

export const PostAuthorInfo = ({ post }) => {
  return (
    <div className="flex items-center mb-4">
      <Avatar className="size-8 md:size-10 ring-2 ring-white dark:ring-[#333] mr-3">
        <AvatarImage src={post.authorSnapshot?.profilePicture} />
        <AvatarFallback className="bg-gradient-to-br from-lime-500 to-green-500 text-white">
          {post.authorSnapshot?.fullName?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <div>
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
          {post.authorSnapshot?.fullName}
        </span>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Clock className="h-3 w-3 mr-1" />
          {timeAgo(post.createdAt)}
        </div>
      </div>
    </div>
  );
};
PostAuthorInfo.propTypes = {
  post: PropTypes.object,
};

export const NoPosts = ({ fetchPosts }) => {
  return (
    <div className="bg-white dark:bg-[#222] rounded-xl shadow-sm p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-[#2a2a2a] rounded-full flex items-center justify-center">
        <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
        No posts found
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
        Try different topics or check back later for new content
      </p>
      <Button onClick={fetchPosts} variant="outline" className="mt-6">
        Refresh Feed
      </Button>
    </div>
  );
};
NoPosts.propTypes = {
  fetchPosts: PropTypes.func,
};

export const EndOfFeed = () => {
  return (
    <div className="text-center py-8 px-4 bg-white dark:bg-[#222] rounded-xl shadow-sm">
      <p className="text-gray-500 dark:text-gray-400">
        You&apos;ve reached the end of your feed
      </p>
      <Button
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
        variant="outline"
        className="mt-4"
      >
        Back to top
      </Button>
    </div>
  );
};

export const LoadingSkeleton = () => {
  return Array(2)
    .fill(0)
    .map((_, i) => (
      <div
        key={`skeleton-${i}`}
        className="bg-white dark:bg-[#222] rounded-xl shadow-sm overflow-hidden"
      >
        <Skeleton className="h-52 w-full" />
        <div className="p-5 sm:p-6">
          <div className="flex items-center mb-4">
            <Skeleton className="h-10 w-10 rounded-full mr-3" />
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>
          <Skeleton className="h-8 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-5" />

          <div className="flex gap-2 mb-4">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-[#2a2a2a] flex justify-between">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    ));
};
