// client/src/pages/CollectionsPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FolderPlus,
  Grid,
  List,
  Search,
  Filter,
  Eye,
  EyeOff,
  Calendar,
  User,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useCollectionContext } from "../../contexts/CollectionContext";
import { useDataService } from "../../services/dataService";
import { toast } from "sonner";

const CollectionsPage = () => {
  const { userId } = useParams(); // For viewing other users' collections
  const { currentUser } = useAuth();
  const { collections, loading, refreshCollections, setIsCreatingNewColl } =
    useCollectionContext();
  const { getUserCollections, deleteCollection } = useDataService();

  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'public', 'private'
  const [sortBy, setSortBy] = useState("recent"); // 'recent', 'oldest', 'title'
  const [userCollections, setUserCollections] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const isOwnProfile = !userId || userId === currentUser?._id;
  const displayCollections = isOwnProfile ? collections : userCollections;

  // Fetch collections for specific user (if not own profile)
  useEffect(() => {
    if (!isOwnProfile && userId) {
      const fetchUserCollections = async () => {
        try {
          setPageLoading(true);
          const data = await getUserCollections(userId);
          setUserCollections(data || []);
        } catch (error) {
          toast.error("Failed to load collections");
        } finally {
          setPageLoading(false);
        }
      };

      fetchUserCollections();
    }
  }, [userId, isOwnProfile, getUserCollections]);

  // Filter and sort collections
  const filteredCollections = displayCollections
    .filter((collection) => {
      // Search filter
      const matchesSearch =
        collection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType =
        filterType === "all" ||
        (filterType === "public" && !collection.isPrivate) ||
        (filterType === "private" && collection.isPrivate);

      return matchesSearch && matchesType;
    })
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

  const handleDeleteCollection = async (collectionId, collectionTitle) => {
    if (
      !confirm(
        `Are you sure you want to delete "${collectionTitle}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await deleteCollection(collectionId);
      toast.success("Collection deleted successfully");
      refreshCollections();
    } catch (error) {
      toast.error("Failed to delete collection");
    }
  };

  const CollectionCard = ({ collection, viewMode }) => {
    const isOwner =
      collection.authorId._id === currentUser?._id ||
      collection.authorId === currentUser?._id;

    if (viewMode === "list") {
      return (
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <Link
                to={`/collections/${collection._id}`}
                className="block hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex-shrink-0 overflow-hidden">
                    {collection.thumbnailUrl ? (
                      <img
                        src={collection.thumbnailUrl}
                        alt={collection.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-6 w-6 text-neutral-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                        {collection.title}
                      </h3>
                      {collection.isPrivate && (
                        <EyeOff className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                      )}
                    </div>

                    {collection.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
                        {collection.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span>{collection.posts?.length || 0} posts</span>
                      <span>
                        {new Date(collection.createdAt).toLocaleDateString()}
                      </span>
                      {!isOwnProfile && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{collection.authorId?.username}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Actions */}
            {isOwner && (
              <div className="relative ml-4">
                <button
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === collection._id ? null : collection._id,
                    )
                  }
                  className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-neutral-500" />
                </button>

                {activeDropdown === collection._id && (
                  <div className="absolute right-0 top-8 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-10 min-w-[120px]">
                    <button className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2">
                      <Edit className="h-3 w-3" />
                      Edit
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2">
                      <Share2 className="h-3 w-3" />
                      Share
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteCollection(collection._id, collection.title)
                      }
                      className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Grid view
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden group">
        <Link to={`/collections/${collection._id}`} className="block">
          {/* Thumbnail */}
          <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
            {collection.thumbnailUrl ? (
              <img
                src={collection.thumbnailUrl}
                alt={collection.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText className="h-12 w-12 text-neutral-400" />
              </div>
            )}

            {/* Privacy indicator */}
            {collection.isPrivate && (
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1">
                <EyeOff className="h-4 w-4 text-white" />
              </div>
            )}

            {/* Post count overlay */}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              {collection.posts?.length || 0} posts
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link to={`/collections/${collection._id}`}>
              <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-1 hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
                {collection.title}
              </h3>
            </Link>

            {isOwner && (
              <div className="relative">
                <button
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === collection._id ? null : collection._id,
                    )
                  }
                  className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4 text-neutral-500" />
                </button>

                {activeDropdown === collection._id && (
                  <div className="absolute right-0 top-8 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-10 min-w-[120px]">
                    <button className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2">
                      <Edit className="h-3 w-3" />
                      Edit
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2">
                      <Share2 className="h-3 w-3" />
                      Share
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteCollection(collection._id, collection.title)
                      }
                      className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {collection.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
              {collection.description}
            </p>
          )}

          {/* Tags */}
          {collection.tags && collection.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {collection.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-lime-100 dark:bg-lime-950/30 text-lime-800 dark:text-lime-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {collection.tags.length > 3 && (
                <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs rounded-full">
                  +{collection.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(collection.createdAt).toLocaleDateString()}</span>
            </div>

            {!isOwnProfile && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{collection.authorId?.username}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const isLoading = isOwnProfile ? loading : pageLoading;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {isOwnProfile ? "My Collections" : `Collections`}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              {isOwnProfile
                ? "Organize and save your favorite posts"
                : `Explore collections by this user`}
            </p>
          </div>

          {isOwnProfile && (
            <button
              onClick={() => setIsCreatingNewColl(true)}
              className="flex items-center gap-2 px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors"
            >
              <FolderPlus className="h-4 w-4" />
              New Collection
            </button>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              {/* Type Filter */}
              {isOwnProfile && (
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
                >
                  <option value="all">All Collections</option>
                  <option value="public">Public Only</option>
                  <option value="private">Private Only</option>
                </select>
              )}

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
              >
                <option value="recent">Recently Created</option>
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

        {/* Collections Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="text-center py-12">
            <FolderPlus className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              {searchTerm || filterType !== "all"
                ? "No collections found"
                : isOwnProfile
                  ? "No collections yet"
                  : "No collections to show"}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filters"
                : isOwnProfile
                  ? "Create your first collection to organize your saved posts"
                  : "This user hasn't created any public collections yet"}
            </p>
            {isOwnProfile && !searchTerm && filterType === "all" && (
              <button
                onClick={() => setIsCreatingNewColl(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors"
              >
                <FolderPlus className="h-4 w-4" />
                Create Your First Collection
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {filteredCollections.length} collection
                {filteredCollections.length !== 1 ? "s" : ""} found
              </p>

              {(searchTerm || filterType !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                  className="text-sm text-lime-600 dark:text-lime-400 hover:text-lime-700 dark:hover:text-lime-300 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Collections display */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredCollections.map((collection) => (
                <CollectionCard
                  key={collection._id}
                  collection={collection}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Load more button (if implementing pagination) */}
            {/* You can add pagination logic here later */}
          </>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;
