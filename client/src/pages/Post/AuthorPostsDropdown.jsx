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
                              <div
                                  key={post._id}
                                  onClick={() => {
                                      navigate(`/p/${post._id}`);
                                  }}
                                  className="p-6 rounded-xl border border-gray-100 dark:border-[#222] bg-white dark:bg-[#111] shadow-sm hover:shadow-md transition-all duration-300 relative"
                              >
                                  <div className="flex justify-between items-start mb-4">
                                      <h3 className="font-medium text-3xl dark:text-[#f0f0f0] capitalize">
                                          {post.title}
                                      </h3>
                                  </div>

                                  {post.thumbnailUrl && (
                                      <div className="mb-4 overflow-hidden rounded-lg aspect-video">
                                          <img
                                              src={post.thumbnailUrl}
                                              alt={post.title}
                                              className="object-cover w-full h-full"
                                              loading="lazy"
                                          />
                                      </div>
                                  )}

                                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-[#222] pt-4 mt-2">
                                      <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                                          <div className="flex items-center">
                                              <Eye className="w-4 h-4 mr-1 text-gray-500" />
                                              <span>{post.totalViews}</span>
                                          </div>
                                          <div className="flex items-center">
                                              <ThumbsUp className="w-4 h-4 mr-1 text-gray-500" />
                                              <span>{post.totalLikes}</span>
                                          </div>
                                          <div className="flex items-center">
                                              <MessageSquare className="w-4 h-4 mr-1 text-gray-500" />
                                              <span>{post.totalComments}</span>
                                          </div>
                                      </div>
                                      <div className="text-sm">
                                          {post.readTime}
                                      </div>
                                  </div>
                              </div>
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
