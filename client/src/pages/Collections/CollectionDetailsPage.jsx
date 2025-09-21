// client/src/pages/CollectionDetailsPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Calendar,
  User,
  Edit,
  Trash2,
  Share2,
  MoreVertical,
  Grid,
  List,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useDataService } from "../../services/dataService";
import { useCollectionContext } from "../../contexts/CollectionContext";
import { toast } from "sonner";

const CollectionDetailsPage = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { setPostIdToSave } = useCollectionContext();
  const { getCollectionById, deleteCollection, removePostFromCollection } =
    useDataService();

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showDropdown, setShowDropdown] = useState(false);
  const [removingPost, setRemovingPost] = useState(null);

  // Load collection
  useEffect(() => {
    const loadCollection = async () => {
      try {
        setLoading(true);
        const data = await getCollectionById(collectionId);
        setCollection(data);
      } catch (error) {
        toast.error("Failed to load collection");
        navigate("/collections");
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [collectionId, getCollectionById, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Collection not found
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            The collection you're looking for doesn't exist or is private.
          </p>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  const isOwner =
    collection.authorId._id === currentUser?._id ||
    collection.authorId === currentUser?._id;

  // Filter and sort posts
  const filteredPosts = (collection.posts || [])
    .filter(
      (post) =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "title":
          return a.title.localeCompare(b.title);
        case "recent":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const handleDeleteCollection = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${collection.title}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await deleteCollection(collectionId);
      toast.success("Collection deleted successfully");
      navigate("/collections");
    } catch (error) {
      toast.error("Failed to delete collection");
    }
  };

  const handleRemovePost = async (postId, postTitle) => {
    if (!confirm(`Remove "${postTitle}" from this collection?`)) {
      return;
    }

    try {
      setRemovingPost(postId);
      await removePostFromCollection(collectionId, postId);

      // Update local state
      setCollection((prev) => ({
        ...prev,
        posts: prev.posts.filter((post) => post._id !== postId),
      }));

      toast.success("Post removed from collection");
    } catch (error) {
      toast.error("Failed to remove post");
    } finally {
      setRemovingPost(null);
    }
  };

  const PostCard = ({ post, viewMode }) => {
    if (viewMode === "list") {
      return (
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-center gap-4">
            {/* Thumbnail */}
            <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex-shrink-0 overflow-hidden">
              {post.thumbnailUrl ? (
                <img
                  src={post.thumbnailUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ExternalLink className="h-6 w-6 text-neutral-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <Link to={`/posts/${post._id}`} className="group">
                <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400 line-clamp-2 mb-2 transition-colors">
                  {post.title}
                </h3>
              </Link>

              {post.content && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                  {post.content.substring(0, 150)}...
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  {post.authorId?.username && (
                    <span>by {post.authorId.username}</span>
                  )}
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPostIdToSave(post._id)}
                    className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Save to another collection"
                  >
                    <Bookmark className="h-4 w-4 text-neutral-500 hover:text-lime-600" />
                  </button>

                  {isOwner && (
                    <button
                      onClick={() => handleRemovePost(post._id, post.title)}
                      disabled={removingPost === post._id}
                      className="p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      title="Remove from collection"
                    >
                      <Trash2
                        className={`h-4 w-4 ${
                          removingPost === post._id
                            ? "animate-pulse text-red-400"
                            : "text-red-500 hover:text-red-600"
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Grid view
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden group">
        <Link to={`/posts/${post._id}`}>
          {/* Thumbnail */}
          <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            {post.thumbnailUrl ? (
              <img
                src={post.thumbnailUrl}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ExternalLink className="h-12 w-12 text-neutral-400" />
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link to={`/posts/${post._id}`}>
              <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-2 hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
                {post.title}
              </h3>
            </Link>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setPostIdToSave(post._id)}
                className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Save to another collection"
              >
                <Bookmark className="h-4 w-4 text-neutral-500 hover:text-lime-600" />
              </button>

              {isOwner && (
                <button
                  onClick={() => handleRemovePost(post._id, post.title)}
                  disabled={removingPost === post._id}
                  className="p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  title="Remove from collection"
                >
                  <Trash2
                    className={`h-4 w-4 ${
                      removingPost === post._id
                        ? "animate-pulse text-red-400"
                        : "text-red-500 hover:text-red-600"
                    }`}
                  />
                </button>
              )}
            </div>
          </div>

          {post.content && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-3">
              {post.content.substring(0, 120)}...
            </p>
          )}

          {/* Post footer */}
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              {post.authorId?.profilePicture && (
                <img
                  src={post.authorId.profilePicture}
                  alt={post.authorId.username}
                  className="w-4 h-4 rounded-full"
                />
              )}
              <span>{post.authorId?.username || "Unknown"}</span>
            </div>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Collection info */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            {/* Cover/Banner area */}
            <div className="h-48 bg-gradient-to-r from-lime-400 to-lime-600 relative">
              {collection.thumbnailUrl && (
                <img
                  src={collection.thumbnailUrl}
                  alt={collection.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20"></div>

              {/* Actions */}
              {isOwner && (
                <div className="absolute top-4 right-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {showDropdown && (
                      <div className="absolute right-0 top-12 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-10 min-w-[140px]">
                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2">
                          <Edit className="h-3 w-3" />
                          Edit Collection
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2">
                          <Share2 className="h-3 w-3" />
                          Share
                        </button>
                        <button
                          onClick={handleDeleteCollection}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete Collection
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Collection details */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {collection.title}
                    </h1>
                    {collection.isPrivate && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs rounded-full">
                        <EyeOff className="h-3 w-3" />
                        Private
                      </span>
                    )}
                  </div>

                  {collection.description && (
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                      {collection.description}
                    </p>
                  )}

                  {/* Tags */}
                  {collection.tags && collection.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {collection.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-lime-100 dark:bg-lime-950/30 text-lime-800 dark:text-lime-300 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-col sm:items-end gap-2 text-sm text-neutral-500">
                  <div className="flex items-center gap-4">
                    <span>{collection.posts?.length || 0} posts</span>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{collection.totalUpvotes || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <Link
                      to={`/users/${collection.authorId._id || collection.authorId}`}
                      className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors"
                    >
                      {collection.authorId?.username || "Unknown"}
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(collection.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts section */}
        {collection.posts && collection.posts.length > 0 && (
          <>
            {/* Posts header with controls */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search posts in this collection..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="recent">Recently Added</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Alphabetical</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex rounded-lg border border-neutral-300 dark:border-neutral-600 overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 ${
                        viewMode === "grid"
                          ? "bg-lime-600 text-white"
                          : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                      } transition-colors`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 ${
                        viewMode === "list"
                          ? "bg-lime-600 text-white"
                          : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                      } transition-colors`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts display */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                  No posts found
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Try adjusting your search term
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {filteredPosts.map((post) => (
                  <PostCard key={post._id} post={post} viewMode={viewMode} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {(!collection.posts || collection.posts.length === 0) && (
          <div className="text-center py-12">
            <Bookmark className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              No posts in this collection
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {isOwner
                ? "Start adding posts to organize your content"
                : "This collection is empty"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionDetailsPage;
