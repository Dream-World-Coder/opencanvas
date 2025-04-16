import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";

import ProfileHeader from "../../components/Header/ProfileHeader";
// import { useDataService } from "../../services/dataService";

const FollowersPage = () => {
    const [followers, setFollowers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [orderReversed, setOrderReversed] = useState(false);
    const [followersToFetch, setFollowersToFetch] = useState(0);
    const navigate = useNavigate();
    const { username } = useParams();
    const [currentProfile, setCurrentProfile] = useState(null);

    async function fetchCurrentProfile(username) {
        if (!username) {
            navigate("/404");
            return;
        }

        setIsLoading(true);
        const apiUrl = `http://localhost:3000/u/${username}`;

        try {
            const res = await fetch(apiUrl);

            if (!res.ok) {
                navigate("/404");
                return;
            }

            const data = await res.json();
            setCurrentProfile(data.user);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchUserFollowers = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("authToken");
            if (
                !currentProfile ||
                !currentProfile.followers ||
                currentProfile.followers.length === 0
            ) {
                setFollowers([]);
                setIsLoading(false);
                return;
            }

            if (currentProfile.followers.length < followersToFetch) return;

            const followerIdsQS = currentProfile.followers
                .map((item) => item.userId)
                .slice(0 + followersToFetch, 10 + followersToFetch)
                .join(",");

            setFollowersToFetch(followersToFetch + 10);

            const response = await fetch(
                `http://localhost:3000/u/followers/byids`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        followerIds: followerIdsQS,
                    }),
                },
            );

            const data = await response.json();

            if (data.success) {
                setFollowers((prevFollowers) => [
                    ...prevFollowers,
                    ...data.followers,
                ]);
            } else {
                console.error("Failed to fetch followers: ", data.message);
                toast("Failed to fetch followers: ", data.message);
            }
        } catch (error) {
            console.error("Error fetching followers: ", error);
            toast("Error fetching followers: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    // fetch user profile when username changes
    useEffect(() => {
        fetchCurrentProfile(username);
    }, [username]);

    // fetch followers only _after_ currentProfile is set
    useEffect(() => {
        if (currentProfile) {
            fetchUserFollowers();
        }
    }, [currentProfile]); // run only when _currentProfile_ updates

    const formatFollowedDate = (sinceDate) => {
        try {
            return formatDistanceToNow(new Date(sinceDate), {
                addSuffix: true,
            });
        } catch (error) {
            console.log(error);
            return "some time ago";
        }
    };

    if (isLoading)
        return (
            <div className="flex justify-center items-center h-screen pt-32">
                {Array(4)
                    .fill(0)
                    .map((_, index) => (
                        <Card
                            key={`skeleton-${index}`}
                            className="bg-gray-50 dark:bg-[#222] border-gray-200 dark:border-[#333]"
                        >
                            <CardContent className="p-4 flex items-start gap-4">
                                <Skeleton className="w-16 h-16 rounded-full bg-gray-200 dark:bg-[#333]" />
                                <div className="flex-grow">
                                    <Skeleton className="h-5 w-32 bg-gray-200 dark:bg-[#333] mb-2" />
                                    <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-[#333] mb-2" />
                                    <Skeleton className="h-4 w-full bg-gray-200 dark:bg-[#333] mb-1" />
                                    <Skeleton className="h-4 w-2/3 bg-gray-200 dark:bg-[#333] mb-2" />
                                    <Skeleton className="h-3 w-32 bg-gray-200 dark:bg-[#333]" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                Loading...
            </div>
        );

    return (
        <div className="min-h-screen bg-white dark:bg-[#111] text-gray-800 dark:text-gray-100 p-4 md:p-6">
            <ProfileHeader />
            <div className="max-w-3xl mx-auto pt-24">
                <div className="flex items-center justify-between mb-6 pb-4">
                    <h1 className="text-2xl md:text-3xl font-bold">
                        {currentProfile.fullName}&apos;s Followers
                    </h1>
                    <button
                        className="px-3 py-1.5 text-sm border border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-gray-600 rounded-md flex items-center space-x-1.5 transition-all duration-200"
                        onClick={() => {
                            setFollowers([...followers].reverse());
                            setOrderReversed(!orderReversed);
                        }}
                    >
                        <span>{orderReversed ? "Newest" : "Oldest"} first</span>
                    </button>
                </div>

                <div className="space-y-3">
                    {followers.map((follower, index) => (
                        <Card
                            key={follower._id}
                            className="border border-gray-100 dark:border-[#333] bg-transparent hover:bg-gray-50 dark:hover:bg-[#222] transition-all duration-300 cursor-pointer rounded-lg overflow-hidden shadow-none"
                            onClick={() => navigate(`/u/${follower.username}`)}
                        >
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    {follower.profilePicture ? (
                                        <img
                                            src={follower.profilePicture}
                                            alt={follower.fullName}
                                            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border border-gray-200 dark:border-[#333]"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-100 dark:bg-[#333] flex items-center justify-center text-lg font-medium">
                                            {follower.fullName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-[#eee]">
                                                {follower.fullName}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                @{follower.username}
                                            </p>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
                                            <CalendarDays
                                                size={14}
                                                className="mr-1"
                                            />
                                            <span>
                                                Followed{" "}
                                                {orderReversed
                                                    ? formatFollowedDate(
                                                          [
                                                              ...currentProfile.followers,
                                                          ].reverse()[index]
                                                              .since,
                                                      )
                                                    : formatFollowedDate(
                                                          currentProfile
                                                              .followers[index]
                                                              .since,
                                                      )}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mt-2">
                                        {follower.role}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {currentProfile.followers.length > followersToFetch && (
                    <div className="w-full flex items-center justify-center mt-8 border-t border-gray-100 dark:border-[#222] pt-6">
                        <Button
                            className="px-6 py-2 border border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-[#222] text-gray-800 dark:text-gray-200 rounded-md transition-all duration-200"
                            onClick={async () => {
                                if (
                                    currentProfile &&
                                    currentProfile.followers
                                ) {
                                    await fetchUserFollowers();
                                }
                            }}
                        >
                            Load More
                        </Button>
                    </div>
                )}

                {!isLoading && currentProfile.followers.length === 0 && (
                    <div className="text-center py-12 border border-gray-100 dark:border-[#333] rounded-lg mt-6">
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            No followers yet
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 mt-2">
                            When people follow {currentProfile.fullName},
                            they&apos;ll appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FollowersPage;
