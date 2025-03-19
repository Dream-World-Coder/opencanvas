import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import ProfileHeader from "../../components/Header/ProfileHeader";
// import { useDataService } from "../../services/dataService";

const FollowingPage = () => {
    const [following, setFollowing] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [followingToFetch, setFollowingToFetch] = useState(0);
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

    const fetchUserFollowing = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("authToken");
            if (
                !currentProfile ||
                !currentProfile.following ||
                currentProfile.following.length === 0
            ) {
                setFollowing([]);
                setIsLoading(false);
                return;
            }

            if (currentProfile.following.length < followingToFetch) return;

            const followingIdsQS = currentProfile.following
                .map((item) => item.userId)
                .slice(0 + followingToFetch, 10 + followingToFetch)
                .join(",");

            setFollowingToFetch(followingToFetch + 10);

            const response = await fetch(
                `http://127.0.0.1:3000/u/following/byids`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        followingIds: followingIdsQS,
                    }),
                },
            );

            const data = await response.json();

            if (data.success) {
                setFollowing((prevFollowing) => [
                    ...prevFollowing,
                    ...data.following,
                ]);
            } else {
                console.error("Failed to fetch following: ", data.message);
                toast("Failed to fetch following: ", data.message);
            }
        } catch (error) {
            console.error("Error fetching following: ", error);
            toast("Error fetching following: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    // fetch user profile when username changes
    useEffect(() => {
        fetchCurrentProfile(username);
    }, [username]);

    // fetch following only _after_ currentProfile is set
    useEffect(() => {
        if (currentProfile) {
            fetchUserFollowing();
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
                <h1 className="text-2xl md:text-3xl font-bold mb-6">
                    People Followed by {currentProfile.fullName}
                </h1>
                <div className="grid grid-cols-1 gap-4">
                    {following.map((follower, index) => (
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
                                            currentProfile.following[index]
                                                .since,
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {currentProfile.following.length > followingToFetch && (
                    <div className="w-[100%] flex items-center justify-center mt-6">
                        <Button
                            className="mx-auto z-20"
                            onClick={async () => {
                                if (
                                    currentProfile &&
                                    currentProfile.following
                                ) {
                                    await fetchUserFollowing();
                                }
                            }}
                        >
                            Load More
                        </Button>
                    </div>
                )}

                {!isLoading && currentProfile.following.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Not following anyone yet
                        </p>
                        <p className="text-gray-500 mt-2">
                            {/* Follow someone to see them listed here. */}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FollowingPage;
