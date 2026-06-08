import { useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useInfiniteQuery } from "@tanstack/react-query";

import Header from "@/components/Header/Header";
import { usePublicationService } from "@/services/publicationService";
import { institutionBySlug } from "@/config/institutions";
import PublicationCard from "./components";
import {
    LeftSideBar,
    RightSideBar,
    ErrorDisplay,
    LoadingSkeleton,
    EndOfFeed,
} from "@/pages/Feed/components";

const LIMIT = 16;

const InstitutionFeed = () => {
    const { uni } = useParams();
    const { getInstitutionFeed } = usePublicationService();
    const instConfig = institutionBySlug[uni] || {
        displayName: uni,
        country: "Unknown",
    };

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["feed", "publications", uni],
        queryFn: ({ pageParam = "" }) =>
            getInstitutionFeed(uni, { cursor: pageParam, limit: LIMIT }),
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
                <title>{instConfig.displayName} | OpenCanvas</title>
            </Helmet>

            <div className="w-full min-h-screen dark:bg-[#222] overflow-x-hidden pt-12 bg-white">
                <Header
                    noBlur={true}
                    ballClr="text-gray-300"
                    noShadow={true}
                    borderClrLight="border-gray-100"
                    exclude={["/about", "/contact"]}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
                    <div className="flex flex-col lg:flex-row">
                        <div className="hidden lg:block lg:w-64">
                            <div className="fixed top-16 w-64 overflow-y-auto">
                                <LeftSideBar />
                            </div>
                        </div>

                        <main className="w-full lg:max-w-2xl mx-auto lg:mx-6 mt-0">
                            {/* Institution Header */}
                            <div className="mb-8 p-6 rounded-xl border border-neutral-200 dark:border-[#333] bg-muted/10 relative overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 w-1 h-full"
                                    style={{
                                        backgroundColor:
                                            instConfig.color || "#333",
                                    }}
                                />

                                <h1 className="text-3xl font-bold text-foreground mb-2">
                                    {instConfig.displayName}
                                </h1>
                                <p className="text-muted-foreground font-medium">
                                    {instConfig.country}
                                </p>
                                {instConfig.website && (
                                    <a
                                        href={instConfig.website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-blue-500 hover:underline mt-2 inline-block"
                                    >
                                        Visit Official Site
                                    </a>
                                )}
                            </div>

                            {error && !isLoading && uniquePubs.length === 0 && (
                                <ErrorDisplay
                                    error={error.message}
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

                        <div className="hidden lg:block lg:w-72">
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

export default InstitutionFeed;
