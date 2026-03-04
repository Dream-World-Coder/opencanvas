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

const LIMIT = 10;

const FollowersPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { getUserProfile, getUserFollowers } = useDataService();

  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [profileLoading, setProfileLoading] = useState(true);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [reversed, setReversed] = useState(false);

  // Step 1 - load the public profile (we need the userId for the followers call)
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

  // Step 2 - load first page of followers once we have the profile
  useEffect(() => {
    if (!profile) return;
    loadFollowers(1);
  }, [profile]);

  const loadFollowers = async (pageNum) => {
    setFollowersLoading(true);
    try {
      const res = await getUserFollowers(profile._id, pageNum);
      setTotal(res.total);
      // Append on load-more, replace on first load
      setFollowers((prev) =>
        pageNum === 1 ? res.data : [...prev, ...res.data],
      );
      setPage(pageNum);
    } catch {
      toast.error("Failed to load followers");
    } finally {
      setFollowersLoading(false);
    }
  };

  const formatSince = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "some time ago";
    }
  };

  const displayedFollowers = reversed ? [...followers].reverse() : followers;
  const hasMore = followers.length < total;

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

  // ── Null guard — profile failed to load ──────────────────────────────────
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#111] text-gray-800 dark:text-gray-100 p-4 md:p-0">
      <ProfileHeader />

      <div className="max-w-3xl mx-auto pt-24 pb-80 px-4">
        {/* Header row */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 pb-4">
          <h1 className="text-xl md:text-3xl font-bold font-serif capitalize">
            {profile.fullName}&apos;s Followers
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
        {!followersLoading && followers.length === 0 && (
          <div className="text-center py-12 border border-gray-100 dark:border-[#333] rounded-lg mt-6">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No followers yet
            </p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">
              When people follow {profile.fullName}, they&apos;ll appear here.
            </p>
          </div>
        )}

        {/* Follower cards */}
        <div className="space-y-3">
          {displayedFollowers.map((follower) => (
            <Card
              key={follower._id}
              className="border border-gray-300 md:border-gray-100 dark:border-[#333] bg-transparent hover:bg-gray-50 dark:hover:bg-[#222] transition-all duration-300 cursor-pointer rounded-lg overflow-hidden shadow-none"
              onClick={() => navigate(`/u/${follower.username}`)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="size-12 md:size-14 border border-gray-200 dark:border-[#333] flex-shrink-0">
                  <AvatarImage
                    src={follower.profilePicture}
                    alt={follower.fullName}
                  />
                  <AvatarFallback>
                    {follower.fullName?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

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
                      <CalendarDays size={14} className="mr-1" />
                      <span>Followed {formatSince(follower.since)}</span>
                    </div>
                  </div>
                  {follower.designation && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mt-2">
                      {follower.designation}
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
              disabled={followersLoading}
              onClick={() => loadFollowers(page + 1)}
            >
              {followersLoading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowersPage;
