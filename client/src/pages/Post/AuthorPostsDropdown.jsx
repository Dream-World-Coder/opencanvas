import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ChevronDown,
    ChevronUp,
    Eye,
    MessageSquare,
    ThumbsUp,
} from "lucide-react";

export const AuthorPostsDropdown = ({ author, currentPostId }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [authorPosts, setAuthorPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [publicPosts, setPublicPosts] = useState([]);

    // fetch author posts from postIds array
    const fetchAuthorPosts = async () => {
        try {
            setLoading(true);
            // fetch 6 posts instead of 4 to makeup for private posts
            const postIdsParam = author.posts.slice(0, 6).join(",");
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
                setAuthorPosts(data.posts);

                // filter public posts and take the first 4
                const filtered = data.posts
                    .filter(
                        (post) =>
                            post.isPublic &&
                            post._id.toString() !== currentPostId,
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
        <div className="mb-12">
            <div
                className="flex items-center justify-between cursor-pointer mb-2 bg-gray-50 dark:bg-[#222] p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333] transition-colors"
                onClick={toggleDropdown}
            >
                <h3 className="text-xl font-bold">
                    More from {author?.fullName}
                </h3>
                {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
            </div>

            {isOpen && (
                <div className="grid gap-4 mt-4 transition-all duration-300">
                    {loading
                        ? // Skeleton loaders while fetching
                          Array(4)
                              .fill()
                              .map((_, index) => (
                                  <Card
                                      key={`skeleton-${index}`}
                                      className="overflow-hidden dark:bg-[#222] dark:border-none"
                                  >
                                      <CardContent className="p-4 flex">
                                          <Skeleton className="h-16 w-16 rounded-md flex-shrink-0 mr-3" />
                                          <div className="flex-1">
                                              <Skeleton className="h-6 w-3/4 mb-2" />
                                              <Skeleton className="h-4 w-1/2 mb-2" />
                                              <Skeleton className="h-4 w-1/4" />
                                          </div>
                                      </CardContent>
                                  </Card>
                              ))
                        : publicPosts.map((post) => (
                              <Card
                                  key={post._id}
                                  onClick={() => {
                                      navigate(`/p/${post._id}`);
                                  }}
                                  className="cursor-pointer hover:shadow-md transition duration-200 shadow-none dark:bg-[#222] dark:text-[#fff] dark:border-none"
                              >
                                  <CardContent className="p-4">
                                      <div className="flex">
                                          {post.thumbnailUrl && (
                                              <div className="mr-3 flex-shrink-0">
                                                  <img
                                                      src={post.thumbnailUrl}
                                                      alt={post.title}
                                                      className="w-16 h-16 object-cover rounded-md"
                                                      onError={(e) => {
                                                          e.target.src =
                                                              "/api/placeholder/64/64";
                                                          e.target.alt =
                                                              "Image not available";
                                                      }}
                                                  />
                                              </div>
                                          )}
                                          <div className="flex-1">
                                              <h4 className="font-medium text-lg mb-2">
                                                  {post.title}
                                              </h4>
                                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                  {post.readTime}
                                              </div>
                                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                  <div className="flex items-center">
                                                      <Eye className="h-4 w-4 mr-1" />
                                                      <span>
                                                          {post.totalViews || 0}
                                                      </span>
                                                  </div>
                                                  <div className="flex items-center">
                                                      <ThumbsUp className="h-4 w-4 mr-1" />
                                                      <span>
                                                          {post.totalLikes || 0}
                                                      </span>
                                                  </div>
                                                  <div className="flex items-center">
                                                      <MessageSquare className="h-4 w-4 mr-1" />
                                                      <span>
                                                          {post.totalComments ||
                                                              0}
                                                      </span>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </CardContent>
                              </Card>
                          ))}
                    {publicPosts.length === 0 && !loading && (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            No public posts available from this author.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
