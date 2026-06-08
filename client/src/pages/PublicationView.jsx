import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicationService } from "@/services/publicationService";
import { useDarkMode } from "@/components/Hooks/darkMode";
import { postDarkThemes } from "@/services/themes";
import { institutionBySlug } from "@/config/institutions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, Library } from "lucide-react";

import {
    LoadingPost,
    NotPost,
    LeftSidebar,
    RightSidebar,
    EngagementSection,
    CommentsBox,
} from "@/pages/PostView/components";

const PublicationView = () => {
    const { currentUser } = useAuth();
    const { uni, id } = useParams();
    const isDark = useDarkMode();
    const {
        getById,
        incrementView,
        toggleInteraction,
        toggleSave,
        getInteractions,
    } = usePublicationService();

    const [pub, setPub] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [commentTrayOpen, setCommentTrayOpen] = useState(false);

    const darkTheme = isDark ? postDarkThemes.dark : postDarkThemes.light;

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const data = await getById(uni, id);
                setPub(data);
                setLikesCount(data.stats?.likesCount ?? 0);

                // Fire and forget view increment
                incrementView(id).catch(() => {});

                if (currentUser) {
                    const interactions = await getInteractions(id);
                    setIsLiked(interactions.liked);
                    setIsDisliked(interactions.disliked);
                    setIsSaved(interactions.saved);
                }
            } catch (err) {
                toast.error("Failed to load publication");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [uni, id, currentUser]);

    const handleVote = async (vote) => {
        if (!currentUser) return toast.error("You need to log in first");
        const wasLiked = isLiked;
        const wasDisliked = isDisliked;

        try {
            const res = await toggleInteraction(pub._id, vote);
            if (vote === "like") {
                if (
                    res.message.includes("recorded") ||
                    res.message.includes("switched")
                ) {
                    setIsLiked(true);
                    setIsDisliked(false);
                    setLikesCount((n) => n + 1);
                } else {
                    setIsLiked(false);
                    setLikesCount((n) => n - 1);
                }
            } else {
                if (
                    res.message.includes("recorded") ||
                    res.message.includes("switched")
                ) {
                    setIsDisliked(true);
                    setIsLiked(false);
                    if (wasLiked) setLikesCount((n) => n - 1);
                } else {
                    setIsDisliked(false);
                }
            }
        } catch (err) {
            // Handled by service
        }
    };

    const handleSave = async () => {
        if (!currentUser) return toast.error("You need to log in first");
        try {
            const res = await toggleSave(pub._id);
            setIsSaved(res.message === "Saved");
            toast.success(res.message);
        } catch (err) {}
    };

    if (loading) return <LoadingPost />;
    if (!pub) return <NotPost />;

    const instConfig = institutionBySlug[pub.institution] || {
        displayName: pub.institution,
        color: "#64748b",
    };

    // Mock post object to safely inject into existing Comments/Engagement components
    const mockPostForComments = {
        _id: pub._id,
        authorSnapshot: {
            username: "External Publication",
            profilePicture: "",
        }, // Prevent null errors
        stats: { ...pub.stats, likesCount },
    };

    return (
        <>
            <Helmet>
                <title>{pub.title} | OpenCanvas</title>
            </Helmet>

            <div
                className={`w-full min-h-screen flex flex-col items-center bg-white ${darkTheme.colors.bg} overflow-x-hidden pt-16`}
            >
                <Header
                    noBlur={true}
                    ballClr="text-gray-300"
                    exclude={["/about", "/contact"]}
                    abs={true}
                />

                <div
                    className={`flex flex-col md:flex-row md:gap-10 w-full min-h-screen max-w-screen-xl 2xl:max-w-[1536px] 2xl:w-[1536px] mx-auto bg-white ${darkTheme.colors.bg} text-neutral-900 ${darkTheme.colors.primaryText}`}
                >
                    <LeftSidebar />

                    <main className="w-full max-w-full min-w-0 flex-1 py-4 lg:py-8 px-6 lg:px-0 2xl:px-16 min-h-screen">
                        {/* Header Area */}
                        <div className="mb-10 mt-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
                            <Badge
                                variant="outline"
                                className="mb-4"
                                style={{
                                    borderColor: instConfig.color,
                                    color: instConfig.color,
                                }}
                            >
                                <Library className="w-3 h-3 mr-1" />
                                {instConfig.displayName}
                            </Badge>

                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
                                {pub.title}
                            </h1>

                            <div className="text-muted-foreground font-medium mb-6 leading-relaxed">
                                {pub.authors.map((a, i) => (
                                    <span key={i}>
                                        <span className="text-foreground/80">
                                            {a.name}
                                        </span>
                                        {a.affiliation && (
                                            <span className="text-xs text-muted-foreground ml-1">
                                                ({a.affiliation})
                                            </span>
                                        )}
                                        {i < pub.authors.length - 1 && " • "}
                                    </span>
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm mb-6 text-muted-foreground">
                                <span className="font-semibold">
                                    {new Date(
                                        pub.publishedAt,
                                    ).toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                                <span>
                                    Source:{" "}
                                    <span className="uppercase">
                                        {pub.source.replace("_", " ")}
                                    </span>
                                </span>
                                {pub.doi && (
                                    <span>
                                        DOI:{" "}
                                        <a
                                            href={`https://doi.org/${pub.doi}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            {pub.doi}
                                        </a>
                                    </span>
                                )}
                                {pub.arxivId && (
                                    <span>
                                        ArXiv:{" "}
                                        <a
                                            href={`https://arxiv.org/abs/${pub.arxivId}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            {pub.arxivId}
                                        </a>
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-3">
                                {pub.pdfUrl && (
                                    <Button asChild>
                                        <a
                                            href={pub.pdfUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <FileText className="w-4 h-4 mr-2" />{" "}
                                            Open PDF
                                        </a>
                                    </Button>
                                )}
                                {pub.externalUrl && (
                                    <Button variant="outline" asChild>
                                        <a
                                            href={pub.externalUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />{" "}
                                            View Source
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Abstract */}
                        <article className="w-full max-w-full min-w-0 p-0 mb-16">
                            <h3 className="text-xl font-bold mb-4">Abstract</h3>
                            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-line mb-8">
                                {pub.abstract ||
                                    "No abstract available for this publication."}
                            </p>

                            {pub.categories?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6 border-t border-neutral-100 dark:border-neutral-800 pt-6">
                                    {pub.categories.map((cat, i) => (
                                        <span
                                            key={i}
                                            className="text-xs px-2 py-1 rounded-lg bg-lime-100 dark:bg-[#171717] text-neutral-700 dark:text-[#9da5b4]"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </article>

                        {/* Engagement & Comments using existing components safely mapped */}
                        <EngagementSection
                            post={mockPostForComments}
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
                            post={mockPostForComments}
                            commentTrayOpen={commentTrayOpen}
                            setCommentTrayOpen={setCommentTrayOpen}
                        />
                    </main>

                    <RightSidebar content={pub.abstract} isArticle={false} />
                </div>
                <Footer />
            </div>
        </>
    );
};

export default PublicationView;
