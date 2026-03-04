import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";

import ProfileHeader from "@/components/Header/ProfileHeader";
import { useDataService } from "@/services/dataService";

const FollowingPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { getUserProfile, getUserFollowing } = useDataService();

  const [profile, setProfile] = useState(null);
  const [following, setFollowing] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [profileLoading, setProfileLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [reversed, setReversed] = useState(false);

  // Step 1 - load the public profile to get the userId
  useEffect(() => {
    const load = async () => {
      setProfileLoading(true);
      try {
        const { user } = await getUserProfile(username);
        setProfile(user);
      } catch {
        navigate("/404");
      } finally {
        setProfileLoading(false);
      }
    };
    load();
  }, [username]);

  // Step 2 - load first page of following once we have the profile
  useEffect(() => {
    if (!profile) return;
    loadFollowing(1);
  }, [profile]);

  const loadFollowing = async (pageNum) => {
    setFollowingLoading(true);
    try {
      const res = await getUserFollowing(profile._id, pageNum);
      setTotal(res.total);
      setFollowing((prev) =>
        pageNum === 1 ? res.data : [...prev, ...res.data],
      );
      setPage(pageNum);
    } catch {
      toast.error("Failed to load following");
    } finally {
      setFollowingLoading(false);
    }
  };

  const formatSince = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "some time ago";
    }
  };

  const displayedFollowing = reversed ? [...following].reverse() : following;
  const hasMore = following.length < total;

  // ── Loading state ────────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#111]">
        <ProfileHeader />
        <div className="max-w-3xl mx-auto pt-24 pb-80 space-y-3 px-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card
                key={i}
                className="bg-gray-50 dark:bg-[#222] border-gray-200 dark:border-[#333]"
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <Skeleton className="w-14 h-14 rounded-full bg-gray-200 dark:bg-[#333]" />
                  <div className="flex-grow space-y-2">
                    <Skeleton className="h-5 w-32 bg-gray-200 dark:bg-[#333]" />
                    <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-[#333]" />
                    <Skeleton className="h-4 w-full bg-gray-200 dark:bg-[#333]" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#111] text-gray-800 dark:text-gray-100 p-4 md:p-0">
      <ProfileHeader />

      <div className="max-w-3xl mx-auto pt-24 pb-80 px-4">
        {/* Header row */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 pb-4">
          <h1 className="text-xl md:text-3xl font-bold font-serif capitalize">
            People Followed by {profile.fullName}
            <span className="ml-2 text-base font-normal text-gray-500 dark:text-gray-400">
              ({total})
            </span>
          </h1>
          <button
            className="px-3 py-1.5 text-sm border border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-gray-600 rounded-md transition-all duration-200"
            onClick={() => setReversed((r) => !r)}
          >
            {reversed ? "Newest" : "Oldest"} first
          </button>
        </div>

        {/* Empty state */}
        {!followingLoading && following.length === 0 && (
          <div className="text-center py-12 border border-gray-100 dark:border-[#333] rounded-lg mt-6">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Not following anyone yet
            </p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">
              When {profile.fullName} follows someone, they&apos;ll appear here.
            </p>
          </div>
        )}

        {/* Following cards */}
        <div className="space-y-3">
          {displayedFollowing.map((user) => (
            <Card
              key={user._id}
              className="border border-gray-300 md:border-gray-100 dark:border-[#333] bg-transparent hover:bg-gray-50 dark:hover:bg-[#222] transition-all duration-300 cursor-pointer rounded-lg overflow-hidden shadow-none"
              onClick={() => navigate(`/u/${user.username}`)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="size-12 md:size-14 border border-gray-200 dark:border-[#333] flex-shrink-0">
                  <AvatarImage src={user.profilePicture} alt={user.fullName} />
                  <AvatarFallback>
                    {user.fullName?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-[#eee]">
                        {user.fullName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{user.username}
                      </p>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
                      <CalendarDays size={14} className="mr-1" />
                      <span>Followed {formatSince(user.since)}</span>
                    </div>
                  </div>
                  {user.designation && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mt-2">
                      {user.designation}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="w-full flex items-center justify-center mt-8 border-t border-gray-100 dark:border-[#222] pt-6">
            <Button
              className="px-6 py-2 border border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-[#222] text-gray-800 dark:text-gray-200 rounded-md transition-all duration-200"
              disabled={followingLoading}
              onClick={() => loadFollowing(page + 1)}
            >
              {followingLoading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowingPage;
