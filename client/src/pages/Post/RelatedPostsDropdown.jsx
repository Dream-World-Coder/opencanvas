import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

export const RelatedPostsDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);

    const relatedPosts = [
        {
            id: 1,
            title: "Optimizing React Performance with Memo and Callbacks",
            readTime: "8 min read",
            author: "Alex Johnson",
        },
        {
            id: 2,
            title: "CSS Grid vs Flexbox: When to Use Each",
            readTime: "5 min read",
            author: "Maria Garcia",
        },
        {
            id: 3,
            title: "Building a Design System from Scratch",
            readTime: "10 min read",
            author: "David Chen",
        },
    ];

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="mb-8">
            <div
                className="flex items-center justify-between cursor-pointer mb-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={toggleDropdown}
            >
                <h3 className="text-xl font-bold">Related Posts</h3>
                {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
            </div>

            {isOpen && (
                <div className="grid gap-4 mt-4 transition-all duration-300">
                    {relatedPosts.map((item) => (
                        <Card
                            key={item.id}
                            className="hover:shadow-md transition duration-200 shadow-none dark:bg-[#222] dark:text-[#fff] dark:border-none"
                        >
                            <CardContent className="p-4">
                                <h4 className="font-medium text-lg mb-2">
                                    {item.title}
                                </h4>
                                <div className="flex justify-between text-sm">
                                    <span>{item.author}</span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {item.readTime}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
