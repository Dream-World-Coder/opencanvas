// client/src/pages/Collection/CollectionDetailsPage.jsx
// Displays a single collection: metadata sidebar + post list.
// Layout inspired by a YT playlist — info panel on top/left, posts below/right.
// Handles both public (/c/:id) and private (/c/private/:id) collections.

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  ArrowLeft,
  EyeOff,
  ThumbsUp,
  Share2,
  Trash2,
  BookMarked,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { slugify } from "@/pages/Create/Editor/hooks/useWritingPad";

import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { useDataService } from "@/services/dataService";
import { useCollectionContext } from "@/contexts/CollectionContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
};

// ─── Collection info panel ────────────────────────────────────────────────────
// Shows thumbnail, title, description, stats, and owner actions.

const CollectionInfo = ({ collection, isOwner, onDelete, onShare }) => (
  <div className="space-y-4">
    {/* Thumbnail */}
    <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]">
      {collection.thumbnailUrl ? (
        <img
          src={collection.thumbnailUrl}
          alt={collection.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-6 font-serif text-gray-400 dark:text-gray-600 text-lg text-center leading-snug">
          {collection.title}
        </div>
      )}
    </div>

    {/* Title + privacy badge */}
    <div className="flex items-start gap-2">
      <h1 className="text-xl md:text-2xl font-stardom tracking-tight dark:text-[#f0f0f0] leading-tight">
        {collection.title}
      </h1>
      {collection.isPrivate && (
        <span className="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500 shrink-0">
          <EyeOff className="size-3" />
          Private
        </span>
      )}
    </div>

    {/* Description */}
    {collection.description && (
      <p className="text-sm text-stone-600 dark:text-[#aaa] leading-relaxed">
        {collection.description}
      </p>
    )}

    {/* Tags */}
    {collection.tags?.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {collection.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs bg-lime-100 dark:bg-lime-950/30 text-lime-800 dark:text-lime-300 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>
    )}

    {/* Stats row */}
    <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
      <span>{collection.posts?.length ?? 0} posts</span>
      <span>·</span>
      <div className="flex items-center gap-1">
        <ThumbsUp className="size-3" />
        <span>{collection.stats?.likesCount ?? 0}</span>
      </div>
      <span>·</span>
      <span>created {timeAgo(collection.createdAt)}</span>
    </div>

    {/* Author link */}
    {collection.authorId?.username && (
      <Link
        to={`/u/${collection.authorId.username}`}
        className="text-xs text-gray-500 dark:text-gray-400 hover:text-lime-700 dark:hover:text-lime-400 transition-colors"
      >
        by @{collection.authorId.username}
      </Link>
    )}

    {/* Owner actions */}
    {isOwner && (
      <div className="flex items-center gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1.5 text-xs dark:border-[#444] dark:text-gray-300"
          onClick={onShare}
        >
          <Share2 className="size-3.5" />
          Share
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>
    )}
  </div>
);

CollectionInfo.propTypes = {
  collection: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    isPrivate: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string),
    posts: PropTypes.array,
    createdAt: PropTypes.string,
    stats: PropTypes.shape({
      likesCount: PropTypes.number,
    }),
    authorId: PropTypes.shape({
      username: PropTypes.string,
    }),
  }).isRequired,
  isOwner: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
};

// ─── Post row ─────────────────────────────────────────────────────────────────
// Each post in the playlist list.

const PostRow = ({ post, index, isOwner, onRemove, removingId }) => {
  const navigate = useNavigate();
  const { setPostIdToSave } = useCollectionContext();

  const slug = `${slugify(post.title)}-${post._id}`;

  return (
    <div
      className="group flex gap-3 py-3 cursor-pointer"
      onClick={() => navigate(`/p/${slug}`, { state: { post } })}
    >
      {/* Index number */}
      <span className="shrink-0 w-5 text-xs text-gray-400 dark:text-gray-600 pt-1 text-right">
        {index + 1}
      </span>

      {/* Thumbnail */}
      <div className="shrink-0 w-24 h-14 md:w-32 md:h-20 rounded-md overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]">
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-2 text-xs text-gray-400 dark:text-gray-600 font-serif text-center leading-snug">
            {post.title}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <h3 className="text-sm font-medium dark:text-[#e8e8e8] line-clamp-2 group-hover:text-lime-700 dark:group-hover:text-lime-400 transition-colors leading-snug">
          {post.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 dark:text-gray-500">
          {post.readTime && <span>{post.readTime}</span>}
          {post.stats?.viewsCount > 0 && (
            <>
              <span>·</span>
              <span>{post.stats.viewsCount} views</span>
            </>
          )}
        </div>
      </div>

      {/* Actions — fade in on hover, stop click propagation so they don't navigate */}
      <div
        className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setPostIdToSave(post._id)}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] transition-colors"
          title="Save to collection"
        >
          <BookMarked className="size-3.5 text-gray-500 dark:text-gray-400" />
        </button>

        {isOwner && (
          <button
            onClick={() => onRemove(post._id, post.title)}
            disabled={removingId === post._id}
            className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            title="Remove from collection"
          >
            <Trash2
              className={`size-3.5 ${removingId === post._id ? "animate-pulse text-red-300" : "text-red-400 dark:text-red-500"}`}
            />
          </button>
        )}
      </div>
    </div>
  );
};

PostRow.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    thumbnailUrl: PropTypes.string,
    readTime: PropTypes.string,
    stats: PropTypes.shape({
      viewsCount: PropTypes.number,
    }),
  }).isRequired,
  index: PropTypes.number.isRequired,
  isOwner: PropTypes.bool.isRequired,
  onRemove: PropTypes.func.isRequired,
  removingId: PropTypes.string, // null when nothing is being removed
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const CollectionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const {
    getCollection,
    getPrivateCollection,
    deleteCollection,
    togglePostInCollection,
  } = useDataService();

  const [collection, setCollection] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  // Detect if we're on the private route
  const isPrivateRoute = location.pathname.startsWith("/c/private/");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = isPrivateRoute
          ? await getPrivateCollection(id)
          : await getCollection(id);
        setCollection(data.collection);
        setPosts(data.posts || []);
      } catch {
        // dataService shows a toast; redirect to home on failure
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const isOwner =
    collection?.authorId?._id === currentUser?._id ||
    collection?.authorId === currentUser?._id;

  const handleDelete = async () => {
    if (!confirm(`Delete "${collection.title}"? This cannot be undone.`))
      return;
    try {
      await deleteCollection(id);
      toast.success("Collection deleted");
      navigate(-1); // go back to wherever the user came from
    } catch {
      // dataService shows a toast
    }
  };

  const handleShare = () => {
    if (collection.isPrivate) {
      toast.info("This collection is private");
      return;
    }
    const url = `${window.location.origin}/c/${id}`;
    navigator.share
      ? navigator.share({ title: collection.title, url })
      : navigator.clipboard
          .writeText(url)
          .then(() => toast.success("Link copied"))
          .catch(() => toast.error("Failed to copy link"));
  };

  const handleRemovePost = async (postId, postTitle) => {
    if (!confirm(`Remove "${postTitle}" from this collection?`)) return;
    setRemovingId(postId);
    try {
      await togglePostInCollection(postId, id);
      // Optimistic UI: remove from local state immediately
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setCollection((prev) => ({
        ...prev,
        posts: (prev.posts || []).filter((p) => p.toString() !== postId),
      }));
      toast.success("Post removed");
    } catch {
      // dataService shows a toast
    } finally {
      setRemovingId(null);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#222]">
        <Header exclude={["/about", "/contact"]} />
        <div className="flex items-center justify-center h-screen text-sm text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────

  if (!collection) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#222]">
        <Header exclude={["/about", "/contact"]} />
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-gray-400">Collection not found or is private.</p>
          <Button className="dark:invert" onClick={() => navigate(-1)}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white dark:bg-[#222] dark:text-white font-sans">
      <Header exclude={["/about", "/contact"]} />

      <main className="pt-24 md:pt-28 px-4 md:px-8 min-h-[90dvh]">
        <div className="max-w-7xl mx-auto pb-[20vh]">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 mb-8 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>

          {/*
            Two-column layout on md+:
            - Left: sticky info panel (like YT playlist sidebar)
            - Right: scrollable post list
          */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            {/* Info panel — sticky on desktop */}
            <div className="w-full md:w-72 lg:w-80 md:sticky md:top-32 shrink-0">
              <CollectionInfo
                collection={collection}
                isOwner={isOwner}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            </div>

            {/* Post list */}
            <div className="flex-1 min-w-0">
              {posts.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 py-8">
                  {isOwner
                    ? "No posts yet. Save posts to this collection from any post page."
                    : "This collection is empty."}
                </p>
              ) : (
                <div>
                  {/* Post count header */}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                    {posts.length} post{posts.length !== 1 ? "s" : ""}
                  </p>

                  {/* Divider */}
                  <div className="border-t border-gray-100 dark:border-[#333]" />

                  {posts.map((post, i) => (
                    <div key={post._id}>
                      <PostRow
                        post={post}
                        index={i}
                        isOwner={isOwner}
                        onRemove={handleRemovePost}
                        removingId={removingId}
                      />
                      <div className="border-b border-gray-100 dark:border-[#333]" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CollectionDetailsPage;
