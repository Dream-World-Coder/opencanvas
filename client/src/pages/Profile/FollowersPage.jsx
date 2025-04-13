import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import ProfileHeader from "../../components/Header/ProfileHeader";
// import { useDataService } from "../../services/dataService";

const FollowersPage = () => {
    const [followers, setFollowers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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
        const apiUrl = `http://127.0.0.1:3000/u/${username}`;

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
                `http://127.0.0.1:3000/u/followers/byids`,
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
            <div className="max-w-3xl mx-auto pt-28">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-start">
                    {currentProfile.fullName}&apos;s Followers
                    <button
                        className="ml-4 px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md"
                        onClick={() => setFollowers([...followers].reverse())}
                    >
                        reverse order
                    </button>
                </h1>
                <div className="grid grid-cols-1 gap-4">
                    {followers.map((follower, index) => (
                        <Card
                            key={follower._id}
                            className="bg-gray-50 dark:bg-[#222] border-gray-200 dark:border-[#333] shadow-none hover:shadow-sm transition-all duration-300 cursor-pointer"
                            onClick={() => navigate(`/u/${follower.username}`)}
                        >
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    {follower.profilePicture ? (
                                        <img
                                            src={follower.profilePicture}
                                            alt={follower.fullName}
                                            className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-[#333]"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-[#333] flex items-center justify-center text-xl">
                                            {follower.fullName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-medium text-black dark:text-[#eee]">
                                        {follower.fullName}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {follower.username}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                        {follower.role}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Followed{" "}
                                        {formatFollowedDate(
                                            currentProfile.followers[index]
                                                .since,
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {currentProfile.followers.length > followersToFetch && (
                    <div className="w-[100%] flex items-center justify-center mt-6">
                        <Button
                            className="mx-auto z-20"
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
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            No followers yet
                        </p>
                        <p className="text-gray-500 mt-2">
                            {/* When people follow you, they&apos;ll appear here. */}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FollowersPage;
