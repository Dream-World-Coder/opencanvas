import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import { Skeleton } from "@/components/ui/skeleton";

import { ChevronDown, ChevronUp } from "lucide-react";

export const AuthorPostsDropdown = ({
  author,
  currentPostId,
  authorPosts,
  setAuthorPosts,
  isOpen,
  setIsOpen,
  darkTheme,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [publicPosts, setPublicPosts] = useState([]);

  // fetch author posts from postIds array
  const fetchAuthorPosts = async () => {
    try {
      setLoading(true);
      // fetch 6 posts instead of 4 to makeup for private posts
      const postIdsParam = author.posts.slice(0, 6).join(",");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/author/posts/byids`,
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
        setAuthorPosts(data.posts);

        // filter public posts and take the first 4
        const filtered = data.posts
          .filter(
            (post) => post.isPublic && post._id.toString() !== currentPostId,
          )
          .slice(0, 4);
        setPublicPosts(filtered);
      } else {
        console.error("Failed to fetch author posts: ", data.message);
      }
    } catch (error) {
      console.error("Error fetching author posts: ", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // fetch posts when opening if we don't have them yet
    if (newIsOpen && authorPosts.length === 0) {
      fetchAuthorPosts();
    }
  };

  return (
    <div className={`mb-12`}>
      <div
        className={`flex items-center justify-between cursor-pointer mb-2 bg-gray-50 ${darkTheme.colors.headerBg}
                    p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-[#313026] transition-colors`}
        onClick={toggleDropdown}
      >
        <h3 className={`text-xl font-bold ${darkTheme.colors.primaryText}`}>
          More from {author?.fullName}
        </h3>
        {isOpen ? (
          <ChevronUp
            className={`h-5 w-5 text-gray-500 ${darkTheme.colors.primaryText}`}
          />
        ) : (
          <ChevronDown
            className={`h-5 w-5 text-gray-500 ${darkTheme.colors.primaryText}`}
          />
        )}
      </div>

      {isOpen && (
        <div className={`space-y-6 transition-all duration-300`}>
          {loading
            ? Array(3)
                .fill()
                .map((_, index) => (
                  <div key={`skeleton-${index}`} className={`flex space-x-4`}>
                    <Skeleton
                      className={`h-16 w-16 rounded-sm flex-shrink-0`}
                    />
                    <div className={`flex-1`}>
                      <Skeleton className={`h-4 w-3/4 mb-2`} />
                      <Skeleton className={`h-3 w-1/2 mb-2`} />
                      <Skeleton className={`h-3 w-1/4`} />
                    </div>
                  </div>
                ))
            : publicPosts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => {
                    navigate(`/p/${post._id}`, {
                      state: { post },
                    });
                  }}
                  className={`flex flex-col border hover:bg-gray-50 p-3 rounded-xl transition-all duration-200 cursor-pointer
                                      ${darkTheme.colors.cardBg} ${darkTheme.colors.primaryText} ${darkTheme.colors.border}`}
                >
                  <div className={`flex space-x-4`}>
                    {post.thumbnailUrl && (
                      <div
                        className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded-sm`}
                      >
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          className={`object-cover w-full h-full`}
                          loading={`lazy`}
                        />
                      </div>
                    )}

                    <div className={`flex-1`}>
                      <h3
                        className={`font-medium text-lg text-gray-900 dark:text-[#f8f8f8] line-clamp-2 capitalize`}
                      >
                        {post.title}
                      </h3>
                      <div
                        className={`flex items-center mt-2 text-sm text-gray-700 dark:text-gray-300 space-x-3`}
                      >
                        <div className={`flex items-center`}>
                          <b>
                            {post.totalViews || 0}
                            &nbsp;
                          </b>
                          <span>Views</span>
                        </div>
                        <div>·</div>
                        <div className={`flex items-center`}>
                          <b>{post.totalLikes || 0} &nbsp;</b>
                          <span>Likes</span>
                        </div>
                        <div>·</div>
                        <div>{post.readTime || "2 min read"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          {publicPosts.length === 0 && !loading && (
            <div
              className={`text-center py-8 text-gray-500 ${darkTheme.colors.secondaryText} italic text-sm`}
            >
              No stories published yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

AuthorPostsDropdown.propTypes = {
  author: PropTypes.object,
  darkTheme: PropTypes.object,
  currentPostId: PropTypes.string,
  authorPosts: PropTypes.array,
  setAuthorPosts: PropTypes.func,
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
};
