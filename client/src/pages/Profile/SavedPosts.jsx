import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import ProfileHeader from "@/components/Header/ProfileHeader";

export default function SavedPosts() {
  const [isLoading] = useState(true);
  if (isLoading)
    return (
      <>
        <ProfileHeader />
        <div className="flex flex-col justify-center items-center h-screen pt-24 space-y-2">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <Card
                key={`skeleton-${index}`}
                className="bg-gray-50 dark:bg-[#222] border-gray-200 dark:border-[#333] w-[680px]"
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
        </div>
      </>
    );
}
