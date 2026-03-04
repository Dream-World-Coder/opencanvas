import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { MarkdownPreview } from "@/pages/Create/Editor/components";
import { useDataService } from "@/services/dataService";
import { useDarkMode } from "@/components/Hooks/darkMode";
import { LoadingPost, NotPost, LeftSidebar, RightSidebar } from "./components";

const PrivatePostView = () => {
  const location = useLocation();
  const { slug } = useParams(); // route is /private/p/:slug
  const { getPrivatePost } = useDataService();
  const isDark = useDarkMode();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const postData = await getPrivatePost(slug);
        setPost(postData);
      } catch {
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    // If navigated from the editor or post list, post data may already
    // be in router state - skip the network request
    if (location.state?.post) {
      setPost(location.state.post);
      setLoading(false);
    } else {
      fetchPost();
    }
  }, [slug]);

  if (loading) return <LoadingPost />;
  if (!post) return <NotPost />;

  return (
    <div className="w-full h-full grid place-items-center bg-white dark:bg-[#111] overflow-x-hidden pt-16">
      <Header
        noBlur={true}
        ballClr="text-gray-300"
        exclude={["/about", "/contact", "/photo-gallery"]}
        abs={true}
      />

      <div className="flex flex-col md:flex-row min-h-screen max-w-screen-xl mx-auto bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100">
        {/* Private posts can be public too - only show sidebar if so */}
        {post.isPublic && <LeftSidebar />}

        <main className="flex-1 p-4 md:p-6 lg:p-8 min-h-screen max-w-3xl">
          <div className="prose dark:prose-invert max-w-none pt-4 mb-16">
            <MarkdownPreview
              title={post.title}
              content={post.content}
              thumbnailUrl={post.thumbnailUrl}
              isDark={isDark}
              darkBg="bg-[#111]"
              textAlignment={post.type !== "poem" ? "left" : "center"}
              insidePost={true}
              artType={post.type}
            />

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </main>

        <RightSidebar
          content={post.content}
          isArticle={post.type?.toLowerCase() === "article"}
        />
      </div>

      <Footer />
    </div>
  );
};

export default PrivatePostView;
