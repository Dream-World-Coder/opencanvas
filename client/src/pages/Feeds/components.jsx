import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { BookOpen, Clock } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "../../contexts/AuthContext";
import { timeAgo } from "../../services/formatDate";
import { useState } from "react";
import { PanelLeftClose } from "lucide-react";
import { PanelRightClose } from "lucide-react";
import { X } from "lucide-react";

export const LeftSideBar = ({ selectedTopics, setSelectedTopics }) => {
  const [sidebarClosed, setSidebarClosed] = useState(
    JSON.parse(localStorage.getItem("feedSidebarClosed")),
  );

  const feedOptions = [
    { name: "For You" },
    { name: "Following" },
    { name: "Popular" },
    { name: "Latest" },
  ];
  const filters = [
    "AI",
    "Math",
    "Physics",
    "Adventure",
    "Experience",
    "Regular",
  ];

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topic.toLowerCase())) {
        return prev.filter((t) => t !== topic.toLowerCase());
      } else {
        return [...prev, topic.toLowerCase()];
      }
    });
  };

  return (
    <div
      className={`p-4 bg-white dark:bg-[#222] rounded-none shadow-none ${sidebarClosed ? "border-none" : "border-r-0 md:border-r"} border-gray-100 dark:border-[#333] h-screen`}
    >
      <div
        className={`absolute top-4 text-neutral-500 dark:text-neutral-500 cursor-pointer ${sidebarClosed ? "left-4" : "right-4"}`}
        onClick={() => {
          localStorage.setItem("feedSidebarClosed", !sidebarClosed);
          setSidebarClosed(!sidebarClosed);
        }}
      >
        {sidebarClosed ? (
          <PanelRightClose size={20} className="font-thin" />
        ) : (
          <PanelLeftClose size={20} className="font-thin" />
        )}
      </div>

      {!sidebarClosed && (
        <>
          <div className="border-none dark:border-[#333] p-4 rounded-xl">
            <div className="font-bold mb-4">Feed Options</div>
            {feedOptions.map((link, index) => (
              <div
                key={index}
                className="block p-1.5 rounded hover:bg-lime-50 dark:hover:bg-[#171717] transition duration-0 cursor-pointer"
              >
                {link.name}
              </div>
            ))}
          </div>

          <div className="mt-8 border-none dark:border-[#333] p-4 rounded-xl">
            <div className="font-bold mb-4 flex items-center">
              {/* <Filter className="w-4 h-4 mr-2" /> */}
              Trending Topics
            </div>
            <div className="space-y-2">
              {filters.map((topic) => (
                <div key={topic} className="flex items-center">
                  <div
                    className="w-4 h-4 mr-2 border border-gray-300 cursor-pointer flex items-center justify-center rounded-full"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleTopic(topic);
                    }}
                    role="checkbox"
                    aria-checked={selectedTopics.includes(topic.toLowerCase())}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleTopic(topic);
                      }
                    }}
                  >
                    {selectedTopics.includes(topic.toLowerCase()) && (
                      <div className="w-2 h-2 bg-lime-500 rounded-sm"></div>
                    )}
                  </div>
                  <div
                    className="cursor-pointer select-none"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleTopic(topic);
                    }}
                  >
                    {topic}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
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
  const navigate = useNavigate();

  const [suggestedWritersVisible, setSuggestedWritersVisible] = useState(true);

  return (
    <div className="p-4 bg-white dark:bg-[#222] rounded-none shadow-none h-[88dvh] flex flex-col justify-between">
      {currentUser ? (
        <div
          className={`p-4 border border-gray-100 dark:border-[#333] rounded-lg ${suggestedWritersVisible ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold size-full">Suggested Writers</h3>
            <X
              size={16}
              onClick={() => {
                setSuggestedWritersVisible(false);
              }}
            />
          </div>
          <div className="space-y-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">Writer Name</div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto text-xs px-2 py-0 h-6"
                  >
                    Follow
                  </Button>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="p-4 border border-gray-200 dark:border-[#333] rounded-lg">
          <h3 className="font-bold mb-3">Join OpenCanvas</h3>
          <p className="text-sm mb-4">
            Sign up to follow writers, like posts, and create your own content.
          </p>
          <Button onClick={() => navigate("/signup")} className="w-full mb-2">
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
              <span>{post.totalViews || 0}</span> */}
          <b>
            {post.totalViews || 0}
            &nbsp;
          </b>
          Views
        </div>
        <div className="flex items-center">
          {/* <Heart className="h-4 w-4 mr-1.5" />
                    <span>{post.totalLikes || 0}</span> */}
          <b>
            {post.totalLikes || 0}
            &nbsp;
          </b>
          Likes
        </div>
        <div className="flex items-center">
          <b>
            {post.totalComments || 0}
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
  );
};
PostTags.propTypes = {
  post: PropTypes.object,
};

export const PostAuthorInfo = ({ post }) => {
  return (
    <div className="flex items-center mb-4">
      <Avatar className="size-8 md:size-10 ring-2 ring-white dark:ring-[#333] mr-3">
        <AvatarImage src={post.author?.profilePicture} />
        <AvatarFallback className="bg-gradient-to-br from-lime-500 to-green-500 text-white">
          {post.author?.name?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <div>
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
          {post.author?.name}
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
