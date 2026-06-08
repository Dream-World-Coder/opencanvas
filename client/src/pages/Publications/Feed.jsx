import { useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useInfiniteQuery } from "@tanstack/react-query";

import Header from "@/components/Header/Header";
import { useDarkMode } from "@/components/Hooks/darkMode";
import { usePublicationService } from "@/services/publicationService";
import {
    LeftSideBar,
    RightSideBar,
    ErrorDisplay,
    LoadingSkeleton,
    EndOfFeed,
} from "@/pages/Feed/components";
import PublicationCard from "@/components/PublicationCard";
import { institutions } from "@/config/institutions";
import { Badge } from "@/components/ui/badge";

const LIMIT = 16;

const PublicationsFeed = () => {
    const isDark = useDarkMode();
    const { getFeed } = usePublicationService();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["feed", "publications"],
        queryFn: ({ pageParam = "" }) =>
            getFeed({ cursor: pageParam, limit: LIMIT }),
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        staleTime: 1000 * 60 * 5,
    });

    const allPubs =
        data?.pages.flatMap(
            (page) => page.data?.publications || page.publications,
        ) ?? [];
    const uniquePubs = [...new Map(allPubs.map((p) => [p?._id, p])).values()];

    const observer = useRef();
    const lastPubRef = useCallback(
        (node) => {
            if (isFetchingNextPage) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
            });
            if (node) observer.current.observe(node);
        },
        [isFetchingNextPage, hasNextPage, fetchNextPage],
    );

    const isLoading = status === "pending";

    return (
        <>
            <Helmet>
                <title>Publications Feed | OpenCanvas</title>
                <meta
                    name="description"
                    content="Discover early-stage research and publications by institution."
                />
            </Helmet>

            <div className="w-full min-h-screen dark:bg-[#222] overflow-x-hidden pt-12 bg-white">
                <Header
                    noBlur={true}
                    ballClr="text-gray-300"
                    exclude={["/about", "/contact", "/publications"]}
                    noShadow={true}
                    borderClrLight="border-gray-100"
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
                    <div className="flex flex-col lg:flex-row">
                        {/* Left sidebar */}
                        <div className="hidden lg:block lg:w-64">
                            <div className="w-full lg:w-64 h-1" />
                            <div className="fixed top-16 w-64 overflow-y-auto">
                                <LeftSideBar />
                            </div>
                        </div>

                        {/* Main feed */}
                        <main className="w-full lg:max-w-2xl mx-auto lg:mx-6 mt-0">
                            {/* Institution Filter Bar */}
                            <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                <div className="flex gap-2 w-max">
                                    <Badge
                                        variant="default"
                                        className="px-3 py-1 text-sm cursor-default bg-lime-500 rounded-xl"
                                    >
                                        All Institutions
                                    </Badge>
                                    {institutions.map((inst) => (
                                        <Link
                                            key={inst.slug}
                                            to={`/publications/${inst.slug}`}
                                        >
                                            <Badge
                                                variant="outline"
                                                className="px-3 py-1 text-sm hover:bg-muted cursor-pointer transition-colors rounded-xl
                                                border-lime-300 dark:border-lime-700 hover:bg-lime-100 dark:hover:bg-inherit"
                                                style={{
                                                    color: isDark
                                                        ? "#fff"
                                                        : "#000",
                                                }}
                                            >
                                                {inst.shortName ||
                                                    inst.displayName}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {error && !isLoading && uniquePubs.length === 0 && (
                                <ErrorDisplay
                                    error={
                                        error.message ||
                                        "Failed to load publications"
                                    }
                                    fetchPosts={() => refetch()}
                                />
                            )}

                            <div className="space-y-6">
                                {uniquePubs.map((pub, index) => {
                                    const isLast =
                                        index === uniquePubs.length - 1;
                                    return (
                                        <div
                                            ref={isLast ? lastPubRef : null}
                                            key={pub?._id}
                                        >
                                            <PublicationCard
                                                publication={pub}
                                            />
                                        </div>
                                    );
                                })}

                                {(isLoading || isFetchingNextPage) && (
                                    <LoadingSkeleton />
                                )}
                                {!isLoading &&
                                    !isFetchingNextPage &&
                                    uniquePubs.length > 0 &&
                                    !hasNextPage && <EndOfFeed />}
                            </div>
                        </main>

                        {/* Right sidebar */}
                        <div className="hidden lg:block lg:w-72">
                            <div className="w-full lg:w-72 h-1" />
                            <div className="fixed top-20 w-72 max-h-[calc(100vh-80px)] overflow-y-auto">
                                <RightSideBar />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PublicationsFeed;
