// client/src/pages/CollectionsPage.jsx
// Lists collections for the logged-in user or another user.
// Own profile pulls from CollectionContext; other users are fetched on mount.

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FolderPlus, EyeOff, Trash2, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { useCollectionContext } from "@/contexts/CollectionContext";
import { useDataService } from "@/services/dataService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
};

// ─── Single collection row (article-list style) ────────────────────────────────

const CollectionRow = ({ collection, isOwner, onDelete }) => {
  const navigate = useNavigate();

  // Private collections use a separate auth-gated route
  const href = collection.isPrivate
    ? `/c/private/${collection._id}`
    : `/c/${collection._id}`;

  const handleShare = (e) => {
    e.stopPropagation();
    // Private collections don't have a shareable public URL
    if (collection.isPrivate) {
      toast.info("This collection is private");
      return;
    }
    const url = `${window.location.origin}/c/${collection._id}`;
    navigator.share
      ? navigator.share({ title: collection.title, url })
      : navigator.clipboard
          .writeText(url)
          .then(() => toast.success("Link copied"))
          .catch(() => toast.error("Failed to copy link"));
  };

  return (
    <div className="group">
      <div className="flex gap-4 py-6">
        {/* Thumbnail */}
        <div
          onClick={() => navigate(href)}
          className="cursor-pointer flex-shrink-0 w-24 h-16 md:w-36 md:h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]"
        >
          {collection.thumbnailUrl ? (
            <img
              src={collection.thumbnailUrl}
              alt={collection.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            // Placeholder shows the title as text — same pattern as FeaturedWorks
            <div className="w-full h-full flex items-center justify-center p-2 text-xs text-gray-400 dark:text-gray-600 font-serif text-center leading-snug">
              {collection.title}
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
                {collection.title}
              </h2>
              {/* Private badge — only visible to the owner */}
              {collection.isPrivate && isOwner && (
                <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                  <EyeOff className="size-3" />
                  Private
                </span>
              )}
            </div>

            {collection.description && (
              <p className="text-sm text-stone-600 dark:text-[#aaa] line-clamp-2 leading-snug">
                {collection.description}
              </p>
            )}
          </div>

          {/* Meta + actions row */}
          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
              <span>{collection.posts?.length ?? 0} posts</span>
              <span>·</span>
              <span>{timeAgo(collection.createdAt)}</span>
              {collection.tags?.length > 0 && (
                <>
                  <span>·</span>
                  <span className="hidden sm:inline">
                    {collection.tags.slice(0, 3).join(", ")}
                    {collection.tags.length > 3 &&
                      ` +${collection.tags.length - 3}`}
                  </span>
                </>
              )}
            </div>

            {/* Actions — only shown to the owner */}
            {isOwner && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleShare}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] transition-colors"
                  title="Share"
                >
                  <Share2 className="size-3.5 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(collection._id, collection.title);
                  }}
                  className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="size-3.5 text-red-400 dark:text-red-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-b border-gray-100 dark:border-[#333]" />
    </div>
  );
};

CollectionRow.propTypes = {
  collection: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    isPrivate: PropTypes.bool,
    posts: PropTypes.array,
    tags: PropTypes.arrayOf(PropTypes.string),
    createdAt: PropTypes.string,
    // authorId can be a plain ID string or a populated object
    authorId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ _id: PropTypes.string }),
    ]),
  }).isRequired,
  isOwner: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const CollectionsPage = () => {
  const { userId } = useParams(); // present only when viewing another user
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { collections, loading, refreshCollections, setIsCreatingNewColl } =
    useCollectionContext();
  const { getUserCollections, deleteCollection } = useDataService();

  const [otherCollections, setOtherCollections] = useState([]);
  const [otherLoading, setOtherLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isOwnProfile = !userId || userId === currentUser?._id;
  const displayCollections = isOwnProfile ? collections : otherCollections;
  const isLoading = isOwnProfile ? loading : otherLoading;

  // Fetch another user's (public) collections when their userId is in the URL
  useEffect(() => {
    if (isOwnProfile || !userId) return;
    setOtherLoading(true);
    getUserCollections(userId)
      .then((data) => setOtherCollections(data || []))
      .catch(() => {}) // dataService already shows a toast
      .finally(() => setOtherLoading(false));
  }, [userId]);

  const handleDelete = async (collectionId, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteCollection(collectionId);
      toast.success("Collection deleted");
      refreshCollections();
    } catch {
      // dataService already shows a toast
    }
  };

  // Simple title/description search filter
  const filtered = displayCollections.filter((c) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  });

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white dark:bg-[#222] dark:text-white font-sans">
      <Header exclude={["/about", "/contact"]} />

      <main className="pt-24 md:pt-28 px-4 md:px-8 min-h-[90dvh]">
        <div className="max-w-3xl mx-auto pb-[20vh]">
          {/* Page title + new collection button */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-stardom tracking-tight dark:text-[#f0f0f0]">
              {isOwnProfile ? "My Collections" : "Collections"}
            </h1>
            {isOwnProfile && (
              <Button
                onClick={() => setIsCreatingNewColl(true)}
                className="flex items-center gap-2 dark:invert"
              >
                <FolderPlus className="size-4" />
                New
              </Button>
            )}
          </div>

          {/* Search — only shown when there's something to search */}
          {displayCollections.length > 3 && (
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full mb-6 px-4 py-2 text-sm border border-gray-200 dark:border-[#333] rounded-lg
                bg-transparent dark:text-white placeholder:text-gray-400
                focus:outline-none focus:ring-1 focus:ring-lime-400 dark:focus:ring-lime-600"
            />
          )}

          {/* Loading */}
          {isLoading && (
            <div className="py-16 text-center text-sm text-gray-400">
              Loading...
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div className="py-16 text-center space-y-4">
              <p className="text-gray-400 dark:text-gray-500">
                {searchTerm
                  ? "No collections match your search."
                  : isOwnProfile
                    ? "You haven't created any collections yet."
                    : "No public collections yet."}
              </p>
              {isOwnProfile && !searchTerm && (
                <Button
                  onClick={() => setIsCreatingNewColl(true)}
                  className="dark:invert"
                >
                  Create your first collection
                </Button>
              )}
            </div>
          )}

          {/* Collection list */}
          {!isLoading && filtered.length > 0 && (
            <div>
              {filtered.map((collection) => (
                <CollectionRow
                  key={collection._id}
                  collection={collection}
                  isOwner={
                    isOwnProfile ||
                    collection.authorId === currentUser?._id ||
                    collection.authorId?._id === currentUser?._id
                  }
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CollectionsPage;
