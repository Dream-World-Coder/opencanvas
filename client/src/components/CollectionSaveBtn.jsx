// client/src/components/CollectionSaveButton.jsx
import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useCollectionContext } from "../contexts/CollectionContext";
import { toast } from "sonner";

const CollectionSaveButton = ({
  postId,
  isAlreadySaved = false,
  variant = "default",
  size = "sm",
}) => {
  const { setPostIdToSave } = useCollectionContext();
  const [isSaved, setIsSaved] = useState(isAlreadySaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!postId) {
      toast.error("Post ID is required");
      return;
    }

    setPostIdToSave(postId);
  };

  // Size variants
  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Style variants
  const variantClasses = {
    default: `${sizeClasses[size]} rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors`,
    outline: `${sizeClasses[size]} border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-lime-400 dark:hover:border-lime-500 hover:bg-lime-50 dark:hover:bg-lime-950/20 transition-colors`,
    solid: `${sizeClasses[size]} bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors`,
    ghost: `${sizeClasses[size]} text-neutral-600 dark:text-neutral-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-950/20 rounded-lg transition-colors`,
  };

  return (
    <button
      onClick={handleSaveClick}
      disabled={isLoading}
      className={`${variantClasses[variant]} group relative flex items-center justify-center`}
      title={isSaved ? "Saved to collection" : "Save to collection"}
      aria-label={isSaved ? "Saved to collection" : "Save to collection"}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : isSaved ? (
        <BookmarkCheck
          className={`${iconSizes[size]} ${
            variant === "solid"
              ? "text-white"
              : "text-lime-600 dark:text-lime-400"
          }`}
        />
      ) : (
        <Bookmark
          className={`${iconSizes[size]} ${
            variant === "solid" ? "text-white" : "text-current"
          } group-hover:text-lime-600 dark:group-hover:text-lime-400`}
        />
      )}

      {/* Tooltip for better UX */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {isSaved ? "Saved to collection" : "Save to collection"}
      </div>
    </button>
  );
};

// Example usage in a Post Card component
const PostCard = ({ post }) => {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      {/* Post thumbnail */}
      {post.thumbnailUrl && (
        <img
          src={post.thumbnailUrl}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-4">
        {/* Post header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white line-clamp-2">
            {post.title}
          </h3>

          {/* Save button */}
          <CollectionSaveButton postId={post._id} variant="ghost" size="sm" />
        </div>

        {/* Post content preview */}
        {post.content && (
          <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-3 mb-3">
            {post.content.substring(0, 150)}...
          </p>
        )}

        {/* Post footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={post.author?.profilePicture || "/default-avatar.png"}
              alt={post.author?.username}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {post.author?.username}
            </span>
          </div>

          <time className="text-xs text-neutral-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </time>
        </div>
      </div>
    </div>
  );
};

export default CollectionSaveButton;
export { PostCard };
