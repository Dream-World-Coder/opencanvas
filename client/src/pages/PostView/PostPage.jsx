import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { AuthorPostsDropdown } from "./recommendations/AuthorPostsDropdown";
import { RelatedPostsDropdown } from "./recommendations/RelatedPostsDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { useDataService } from "@/services/dataService";
import { useDarkMode } from "@/components/Hooks/darkMode";
import { useViewTracker } from "@/components/Hooks/viewCount";
import { postDarkThemes } from "@/services/themes";
import {
  PostHelmet,
  LoadingPost,
  NotPost,
  NotPublicPost,
  LeftSidebar,
  RightSidebar,
  EngagementSection,
  CommentsBox,
  ArticleHeader,
  ThemedMarkdownPreview,
} from "./components";

const ViewPost = () => {
  // const location = useLocation();
  const { currentUser } = useAuth();
  const { slug } = useParams();
  const isDark = useDarkMode();
  const {
    getPost,
    getUserProfile,
    voteOnPost,
    saveUnsavePost,
    followUnfollowUser,
    getMyPostInteractions,
    // getUserPosts,
  } = useDataService();

  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Engagement state - resolved from the Interaction collection, not currentUser
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Local like count so we can update it without refetching the post
  const [likesCount, setLikesCount] = useState(0);

  const [commentTrayOpen, setCommentTrayOpen] = useState(false);
  const [authorPosts, setAuthorPosts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(
    isDark ? postDarkThemes.dark : postDarkThemes.light,
  );

  // Scroll to heading anchor if URL has a hash
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;
    setTimeout(() => {
      const el = document.getElementById(hash);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth" });
      el.classList.add("highlighted__heading");
      setTimeout(() => el.classList.remove("highlighted__heading"), 3000);
    }, 600);
  }, []);

  useEffect(() => {
    const init = async (postData) => {
      setPost(postData);
      setLikesCount(postData.stats?.likesCount ?? 0);

      // Fetch author public profile - gives us isFollowing too
      // authorSnapshot.username is denormalized on the post so no extra ID lookup needed
      const authorUsername = postData.authorSnapshot?.username;
      if (authorUsername) {
        try {
          const { user, isFollowing: following } =
            await getUserProfile(authorUsername);
          setAuthor(user);
          setIsFollowing(following);
        } catch {
          // Non-critical - author section just won't render
        }
      }

      // Fetch interaction state for logged-in users
      if (currentUser) {
        try {
          const interactions = await getMyPostInteractions(postData._id);
          setIsLiked(interactions.isLiked);
          setIsDisliked(interactions.isDisliked);
          setIsSaved(interactions.isSaved);
        } catch {
          // Non-critical - buttons default to unselected
        }
      }

      setLoading(false);
    };

    // If navigated from a feed/list, the post data may be in router state
    // avoiding a redundant network request for the full post
    // if (location.state?.post) {
    //   // init(location.state.post); changed now, .contentPreview is present only
    // } else {
    //   //
    // }
    setLoading(true);
    getPost(slug)
      .then(init)
      .catch(() => setLoading(false));

    // Reset per-post UI state when slug changes
    setAuthorPosts([]);
    setIsOpen(false);
    setCommentTrayOpen(false);
  }, [slug]);

  // Track view - postId extracted from slug on the backend, we pass the slug
  const viewCounted = useViewTracker(slug);
  useEffect(() => {
    if (viewCounted && post) {
      setPost((p) => ({
        ...p,
        stats: { ...p.stats, viewsCount: p.stats.viewsCount + 1 },
      }));
    }
  }, [viewCounted]);

  // ── Vote handler ─────────────────────────────────────────────────────────
  // Single handler for both like and dislike. Derives the new local state
  // from the server's response message rather than trying to predict it.
  const handleVote = async (vote) => {
    if (!currentUser) {
      toast.error("You need to log in first");
      return;
    }

    const wasLiked = isLiked;
    const wasDisliked = isDisliked;

    try {
      const res = await voteOnPost(post._id, vote);
      if (!res.success) return;

      if (vote === "like") {
        if (res.message === "Vote recorded") {
          setIsLiked(true);
          setIsDisliked(false);
          setLikesCount((n) => n + 1);
          if (wasDisliked) {
            /* dislike removed server-side, no likes delta needed */
          }
        } else if (res.message === "Vote removed") {
          setIsLiked(false);
          setLikesCount((n) => n - 1);
        } else if (res.message === "Vote switched") {
          // was dislike, now like
          setIsLiked(true);
          setIsDisliked(false);
          setLikesCount((n) => n + 1);
        }
      } else {
        // dislike
        if (res.message === "Vote recorded") {
          setIsDisliked(true);
          setIsLiked(false);
          if (wasLiked) setLikesCount((n) => n - 1); // like removed server-side
        } else if (res.message === "Vote removed") {
          setIsDisliked(false);
        } else if (res.message === "Vote switched") {
          // was like, now dislike
          setIsDisliked(true);
          setIsLiked(false);
          setLikesCount((n) => n - 1);
        }
      }

      toast.success(res.message);
    } catch {
      // useDataService already shows a toast
    }
  };

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!currentUser) {
      toast.error("You need to log in first");
      return;
    }
    try {
      const res = await saveUnsavePost(post._id);
      if (!res.success) return;
      const saved = res.message === "Post saved";
      setIsSaved(saved);
      toast.success(res.message);
    } catch {
      // useDataService already shows a toast
    }
  };

  // ── Follow handler ────────────────────────────────────────────────────────
  const handleFollow = async () => {
    if (!currentUser) {
      toast.error("You need to log in first");
      return;
    }
    try {
      const res = await followUnfollowUser(author._id);
      if (!res.success) return;
      const followed = res.message === "Followed";
      setIsFollowing(followed);
      toast.success(res.message);
    } catch {
      // useDataService already shows a toast
    }
  };

  if (loading) return <LoadingPost />;
  if (!post) return <NotPost />;
  if (!post.isPublic) return <NotPublicPost />;

  return (
    <>
      <PostHelmet post={post} author={author} />

      <div
        className={`w-full min-h-screen flex flex-col items-center bg-white ${darkTheme.colors.bg} overflow-x-hidden pt-16`}
      >
        <Header
          noBlur={true}
          ballClr="text-gray-300"
          exclude={["/about", "/contact", "/photo-gallery"]}
          abs={true}
        />

        <div
          className={`flex flex-col md:flex-row w-full min-h-screen max-w-screen-xl 2xl:max-w-[1536px] 2xl:w-[1536px] mx-auto bg-white
            ${darkTheme.colors.bg} text-neutral-900 ${darkTheme.colors.primaryText}`}
        >
          <LeftSidebar />

          <main className="w-full max-w-full min-w-0 flex-1 py-4 lg:py-8 px-6 lg:px-0 2xl:px-16 min-h-screen">
            <ArticleHeader
              post={post}
              currentUser={currentUser}
              author={author}
              handleSave={handleSave}
              handleFollow={handleFollow}
              following={isFollowing}
              isSaved={isSaved}
              darkTheme={darkTheme}
              setDarkTheme={setDarkTheme}
            />

            {/* Article content */}
            <article className="w-full max-w-full min-w-0 p-0 mb-16">
              <ThemedMarkdownPreview
                title={post.title}
                content={post.content}
                thumbnailUrl={post.thumbnailUrl}
                isDark={isDark}
                darkBg={darkTheme.colors.bg}
                darkTheme={darkTheme.colors}
                textAlignment={post.type !== "poem" ? "left" : "center"}
                artType={post.type}
              />

              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-lg bg-lime-100 dark:bg-[#171717] text-neutral-700 dark:text-[#9da5b4]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>

            <EngagementSection
              post={post}
              currentUser={currentUser}
              handleLike={() => handleVote("like")}
              handleDislike={() => handleVote("dislike")}
              handleSave={handleSave}
              isLiked={isLiked}
              isDisliked={isDisliked}
              isSaved={isSaved}
              likes={likesCount}
              commentTrayOpen={commentTrayOpen}
              setCommentTrayOpen={setCommentTrayOpen}
              darkTheme={darkTheme}
            />

            <CommentsBox
              post={post}
              commentTrayOpen={commentTrayOpen}
              setCommentTrayOpen={setCommentTrayOpen}
            />

            <AuthorPostsDropdown
              author={author}
              currentPostId={post._id.toString()}
              authorPosts={authorPosts}
              setAuthorPosts={setAuthorPosts}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              darkTheme={darkTheme}
            />

            <RelatedPostsDropdown darkTheme={darkTheme} />
          </main>

          <RightSidebar
            content={post.content}
            isArticle={post.type?.toLowerCase() === "article"}
          />
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ViewPost;
