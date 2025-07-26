import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
// import PropTypes from "prop-types";

import { toast } from "sonner";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
// import { MarkdownPreview } from "../CreatePosts/Writing/WritingComponents";
import { AuthorPostsDropdown } from "./AuthorPostsDropdown";
import { RelatedPostsDropdown } from "./RelatedPostsDropdown";
import { useAuth } from "../../contexts/AuthContext";
import { useDataService } from "../../services/dataService";
import { useDarkMode } from "../../components/Hooks/darkMode";
import { useViewTracker } from "../../components/Hooks/viewCount";
import { postDarkThemes } from "../../services/themes";
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
  const location = useLocation();
  const { currentUser, setCurrentUser } = useAuth();
  const { postId } = useParams();
  const {
    getPostById,
    getAuthorProfile,
    likePost,
    dislikePost,
    savePost,
    followUser,
  } = useDataService();
  const isDark = useDarkMode();

  const [post, setPost] = useState(null);
  const [likes, setLikes] = useState(0);
  const [author, setAuthor] = useState(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentTrayOpen, setCommentTrayOpen] = useState(false);

  // needed here to fetch freshly instead prefetched
  const [authorPosts, setAuthorPosts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(
    isDark ? postDarkThemes.dark : postDarkThemes.light,
  );

  const viewCounted = useViewTracker(postId);
  useEffect(() => {
    if (viewCounted) {
      post.totalViews += 1;
    }
  }, [viewCounted, post]);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const postData = await getPostById(postId);
        setPost(postData);
        setLikes(postData.totalLikes);
        setIsLiked(
          !!currentUser && !!currentUser.likedPosts.includes(postData._id),
        );
        setIsDisliked(
          !!currentUser && !!currentUser.dislikedPosts.includes(postData._id),
        );
        setIsSaved(
          !!currentUser && !!currentUser.savedPosts.includes(postData._id),
        );
        setFollowing(
          !!currentUser &&
            !!currentUser.following
              .map((item) => item.userId)
              .includes(postData.authorId),
        );

        // fetch author
        const authorProfile = await getAuthorProfile(postData.authorId);
        setAuthor(authorProfile);
      } catch (err) {
        console.error("Failed to load post", err);
      } finally {
        setLoading(false);
      }
    }

    if (!location.state) {
      fetchPost();
    } else {
      const postData = location.state.post;
      setPost(postData);
      setLikes(postData.totalLikes);
      setIsLiked(
        !!currentUser && !!currentUser.likedPosts.includes(postData._id),
      );
      setIsDisliked(
        !!currentUser && !!currentUser.dislikedPosts.includes(postData._id),
      );
      setIsSaved(
        !!currentUser && !!currentUser.savedPosts.includes(postData._id),
      );
      setFollowing(
        !!currentUser &&
          !!currentUser.following
            .map((item) => item.userId)
            .includes(postData.authorId),
      );

      getAuthorProfile(postData.authorId)
        .then((profile) => setAuthor(profile))
        .catch((err) => console.error("Failed to fetch author", err))
        .finally(() => setLoading(false));
    }
    setAuthorPosts([]);
    setIsOpen(false);
  }, [postId]);

  async function handleLike(postId) {
    // remove dislike first if needed
    if (isDisliked) {
      let removeDislikeRes = await dislikePost(postId);
      if (removeDislikeRes.success) {
        setIsDisliked(false);
        setCurrentUser((currentUser) => ({
          ...currentUser,
          dislikedPosts: [
            ...currentUser.dislikedPosts.filter(
              (item) => item.toString() !== postId.toString(),
            ),
          ],
        }));
      } else {
        toast.error("Failed to remove dislike");
        return;
      }
    }

    // now like
    let res = await likePost(postId);
    if (res.success) {
      toast.success(res.message);
      if (res.increase === "increase") {
        setLikes(likes + 1);
        setCurrentUser((currentUser) => ({
          ...currentUser,
          likedPosts: [...currentUser.likedPosts, postId],
        }));
      } else {
        // removing like -- toggle action
        setLikes(likes - 1);
        setCurrentUser((currentUser) => ({
          ...currentUser,
          likedPosts: [
            ...currentUser.likedPosts.filter(
              (item) => item.toString() !== postId.toString(),
            ),
          ],
        }));
      }
      setIsLiked(!isLiked);
    } else {
      toast.error(res.message);
    }
  }

  async function handleDislike(postId) {
    // remove like first if needed
    if (isLiked) {
      let removeLikeRes = await likePost(postId);
      if (removeLikeRes.success && removeLikeRes.increase === "decrease") {
        setIsLiked(false);
        setLikes(likes - 1);
        setCurrentUser((currentUser) => ({
          ...currentUser,
          likedPosts: [
            ...currentUser.likedPosts.filter(
              (item) => item.toString() !== postId.toString(),
            ),
          ],
        }));
      } else {
        toast.error("Failed to remove like");
        return;
      }
    }

    // now handle the dislike
    let res = await dislikePost(postId);
    if (res.success) {
      toast.success(res.message);
      setIsDisliked(!isDisliked);
      setCurrentUser((currentUser) => ({
        ...currentUser,
        dislikedPosts: [...currentUser.dislikedPosts, postId],
      }));
    } else {
      toast.error(res.message);
    }
  }

  async function handleSave(postId) {
    let res = await savePost(postId);
    if (res.success && res.saved == true) {
      setIsSaved(true);
      toast.success(res.message);
      setCurrentUser((currentUser) => ({
        ...currentUser,
        savedPosts: [...currentUser.savedPosts, postId],
      }));
    } else if (res.success && res.saved != true) {
      setIsSaved(false);
      toast.success(res.message);
      setCurrentUser((currentUser) => ({
        ...currentUser,
        savedPosts: [
          ...currentUser.savedPosts.filter(
            (i) => i.toString() !== postId.toString(),
          ),
        ],
      }));
    } else {
      toast.error(res.message);
    }
  }

  async function handleFollow(userId) {
    let res = await followUser(userId);
    if (res.success && res.message === "followed") {
      setFollowing(true);
      toast.success(res.message);
      setCurrentUser((currentUser) => ({
        ...currentUser,
        following: [...currentUser.following, { userId, since: Date.now() }],
      }));
    } else if (res.success && res.message === "unfollowed") {
      setFollowing(false);
      toast.success(res.message);
      setCurrentUser((currentUser) => ({
        ...currentUser,
        following: [
          ...currentUser.following.filter(
            (i) => i.userId.toString() !== userId.toString(),
          ),
        ],
      }));
    } else {
      toast.error(res.message);
    }
  }

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;

    const scrollToHash = () => {
      const elm = document.getElementById(hash);
      if (elm) {
        elm.scrollIntoView({ behavior: "smooth" });
        elm.classList.add("highlighted__heading");
        setTimeout(() => {
          elm.classList.remove("highlighted__heading");
        }, 3000);
      }
    };

    setTimeout(scrollToHash, 600);
  }, []);

  if (loading) return <LoadingPost />;
  if (!post) return <NotPost />;
  if (!post.isPublic) return <NotPublicPost />;

  return (
    <>
      <PostHelmet post={post} author={author} />

      <div
        className={`w-full h-full grid place-items-center bg-white ${darkTheme.colors.bg} overflow-x-hidden pt-16`}
      >
        <Header
          noBlur={true}
          ballClr={"text-gray-300"}
          exclude={["/about", "/contact", "/photo-gallery"]}
          abs={true}
          // darkBg={`${darkTheme.colors.headerBg}`}
        />
        <div
          className={`flex flex-col md:flex-row min-h-screen max-w-screen-xl mx-auto bg-white
                        ${darkTheme.colors.bg} text-gray-900 ${darkTheme.colors.primaryText}`}
        >
          <LeftSidebar />

          {/* Main content */}
          <main
            className={`flex-1 py-4 md:py-6 lg:py-8 px-4 md:px-2 lg:px-0 min-h-screen max-w-[calc(100vw-1rem)] md:max-w-3xl`}
          >
            {/* Article header */}
            <ArticleHeader
              post={post}
              currentUser={currentUser}
              author={author}
              handleSave={handleSave}
              handleFollow={handleFollow}
              following={following}
              isSaved={isSaved}
              darkTheme={darkTheme}
              setDarkTheme={setDarkTheme}
            />

            {/* Article content */}
            <div className="prose dark:prose-invert max-w-none pt-4 mb-16">
              <article className="w-full max-w-4xl mx-auto">
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
              </article>
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-[#171717] text-gray-700 dark:text-[#9da5b4]`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Engagement section */}
            <EngagementSection
              post={post}
              currentUser={currentUser}
              handleLike={handleLike}
              handleDislike={handleDislike}
              handleSave={handleSave}
              isLiked={isLiked}
              isDisliked={isDisliked}
              isSaved={isSaved}
              likes={likes}
              commentTrayOpen={commentTrayOpen}
              setCommentTrayOpen={setCommentTrayOpen}
              darkTheme={darkTheme}
            />

            <CommentsBox
              post={post}
              commentTrayOpen={commentTrayOpen}
              setCommentTrayOpen={setCommentTrayOpen}
            />

            {/* More from author section */}
            <AuthorPostsDropdown
              author={author}
              currentPostId={post._id.toString()}
              authorPosts={authorPosts}
              setAuthorPosts={setAuthorPosts}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              darkTheme={darkTheme}
            />

            {/* Related posts section */}
            <RelatedPostsDropdown darkTheme={darkTheme} />
          </main>

          <RightSidebar
            content={post.content}
            isArticle={post.type.toLowerCase() === "article"}
          />
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ViewPost;
