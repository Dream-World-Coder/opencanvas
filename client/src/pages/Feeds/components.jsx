import { Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { useAuth } from "../../contexts/AuthContext";

export const LeftSideBar = ({ selectedTopics, setSelectedTopics }) => {
    const feedOptions = [
        { name: "For You" },
        { name: "Following" },
        { name: "Popular" },
        { name: "Latest" },
    ];

    return (
        <div className="sticky top-4">
            <div className="font-bold mb-4">Feed Options</div>
            <nav className="space-y-2">
                {feedOptions.map((link, index) => (
                    <div
                        key={index}
                        className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[#222] transition duration-0 cursor-pointer"
                    >
                        {link.name}
                    </div>
                ))}
            </nav>

            <div className="mt-8">
                <div className="font-bold mb-4 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Topics
                </div>
                <div className="space-y-2">
                    {[
                        "Technology",
                        "Writing",
                        "Art",
                        "Science",
                        "Philosophy",
                        "A",
                    ].map((topic) => (
                        <div key={topic} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`topic-${topic}`}
                                className="mr-2"
                                onChange={() => {
                                    setSelectedTopics((prev) => {
                                        if (
                                            prev.includes(topic.toLowerCase())
                                        ) {
                                            return prev.filter(
                                                (t) =>
                                                    t !== topic.toLowerCase(),
                                            );
                                        } else {
                                            return [
                                                ...prev,
                                                topic.toLowerCase(),
                                            ];
                                        }
                                    });
                                    console.log(selectedTopics);
                                }}
                                checked={selectedTopics.includes(
                                    topic.toLowerCase(),
                                )}
                            />
                            <label htmlFor={`topic-${topic}`}>{topic}</label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

LeftSideBar.propTypes = {
    selectedTopics: PropTypes.array,
    setSelectedTopics: PropTypes.func,
};

export const RightSideBar = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="sticky top-4">
            <div className="p-4 border border-gray-200 dark:border-[#333] rounded-lg mb-6">
                <h3 className="font-bold mb-3">Trending Topics</h3>
                <div className="space-y-2">
                    {[
                        "#Technology",
                        "#Writing",
                        "#Programming",
                        "#ArtificialIntelligence",
                        "#CreativeWriting",
                    ].map((tag) => (
                        <div
                            key={tag}
                            className="text-sm cursor-pointer hover:text-blue-500"
                        >
                            {tag}
                        </div>
                    ))}
                </div>
            </div>

            {currentUser ? (
                <div className="p-4 border border-gray-200 dark:border-[#333] rounded-lg">
                    <h3 className="font-bold mb-3">Suggested Writers</h3>
                    <div className="space-y-3">
                        {Array(3)
                            .fill(0)
                            .map((_, i) => (
                                <div key={i} className="flex items-center">
                                    <Avatar className="h-8 w-8 mr-2">
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm">Writer Name</div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="ml-auto text-xs px-2 py-0 h-6"
                                    >
                                        Follow
                                    </Button>
                                </div>
                            ))}
                    </div>
                </div>
            ) : (
                <div className="p-4 border border-gray-200 dark:border-[#333] rounded-lg">
                    <h3 className="font-bold mb-3">Join OpenCanvas</h3>
                    <p className="text-sm mb-4">
                        Sign up to follow writers, like posts, and create your
                        own content.
                    </p>
                    <Button
                        onClick={() => navigate("/signup")}
                        className="w-full mb-2"
                    >
                        Sign Up
                    </Button>
                    <Button
                        onClick={() => navigate("/login")}
                        variant="outline"
                        className="w-full"
                    >
                        Log In
                    </Button>
                </div>
            )}
        </div>
    );
};
