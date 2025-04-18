import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { MarkdownPreview } from "../CreatePosts/Writing/WritingComponents";
import { useDataService } from "../../services/dataService";
import { useDarkMode } from "../../components/Hooks/darkMode";
import { toast } from "sonner";
import {
    PostHelmet,
    LoadingPost,
    NotPost,
    LeftSidebar,
    RightSidebar,
} from "./components";

const PrivatePostView = ({ isArticle = true }) => {
    const location = useLocation();
    const { postId } = useParams();
    const { getPostByIdSecured } = useDataService();
    const isDark = useDarkMode();
    // const focusMode = true;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPost() {
            setLoading(true);
            try {
                const postData = await getPostByIdSecured(postId);
                setPost(postData);
            } catch (err) {
                console.error("Failed to load post", err);
                toast.error("Failed to load post", err);
            } finally {
                setLoading(false);
            }
        }
        if (!location.state) {
            fetchPost();
        } else {
            const postData = location.state?.post;
            setPost(postData);
            setLoading(false);
        }
    }, [postId]);

    if (loading) return <LoadingPost />;
    if (!post) return <NotPost />;

    return (
        <>
            <PostHelmet post={post} />
            <div className="w-full h-full grid place-items-center bg-white dark:bg-[#111] overflow-x-hidden pt-16">
                <Header
                    noBlur={true}
                    ballClr={"text-gray-300"}
                    exclude={["/about", "/contact", "/photo-gallery"]}
                    abs={true}
                />
                <div className="flex flex-col md:flex-row min-h-screen max-w-screen-xl mx-auto bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100">
                    <LeftSidebar focusMode={true} isArticle={isArticle} />
                    <main
                        className={`flex-1 p-4 md:p-6 lg:p-8 min-h-screen max-w-3xl`}
                    >
                        <div className="prose dark:prose-invert max-w-none pt-4 mb-16">
                            <MarkdownPreview
                                title={post.title}
                                content={post.content}
                                thumbnailUrl={post.thumbnailUrl}
                                isDark={isDark}
                                darkBg="bg-[#111]"
                                textAlignment={
                                    post.type !== "poem" ? "left" : "center"
                                }
                                insidePost={true}
                                artType={post.type}
                            />
                            <div className="flex flex-wrap gap-2 mb-6">
                                {post.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </main>
                    <RightSidebar />
                </div>

                <Footer />
            </div>
        </>
    );
};

PrivatePostView.propTypes = {
    isArticle: PropTypes.bool,
};

export default PrivatePostView;
