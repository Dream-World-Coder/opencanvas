// Its the public view --> add options like link share

// import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "../../components/Header/Header"; // add prop to implement non blur & color of *
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MarkdownPreview } from "../CreatePosts/Writing/WritingComponents"; // add prop: in edit: for image pop regulate
import { Save, Share, MoreHorizontal, Heart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// replace 5 min read with save & share on top

const ViewPost = ({ postId }) => {
    const data = `## hello world!`;
    function isDarkMode() {
        return (
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
        );
    }

    const readOptions = [
        { name: "Home", href: "#" },
        { name: "Discover", href: "#" },
        { name: "Bookmarks", href: "#" },
        { name: "Profile", href: "#" },
        { name: "My Feed", href: "#" },
    ];

    // Sample data - in a real app, this would come from props or API
    const post = {
        title: "Understanding Modern Web Development Workflows",
        content:
            "Learn how to use the latest tools and techniques to build performant web applications that scale efficiently...",
        author: {
            name: "Jane Smith",
            avatar: "/api/placeholder/40/40",
            role: "Senior Developer",
        },
        publishedAt: "March 3, 2025",
        readTime: "5 min read",
        tags: ["Web Development", "JavaScript", "React"],
        likes: 243,
        comments: 42,
    };

    const moreFromAuthor = [
        {
            id: 1,
            title: "Getting Started with TypeScript in 2025",
            readTime: "4 min read",
        },
        {
            id: 2,
            title: "Building Accessible UIs with React and Tailwind",
            readTime: "7 min read",
        },
        {
            id: 3,
            title: "State Management Patterns for Modern Applications",
            readTime: "6 min read",
        },
    ];

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
    return (
        <>
            <Helmet></Helmet>
            <div className="w-full h-full grid place-items-center bg-white dark:bg-[#111] overflow-x-hidden pt-20">
                <Header noBlur={true} ballClr={"text-gray-300"} />
                <div className="flex flex-col md:flex-row max-w-screen-xl mx-auto bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100">
                    {/* Left sidebar - Read Options or folder structure in case of collection */}
                    <aside className="w-full md:w-64 p-4 border-r border-gray-200 dark:border-[#333] hidden md:block">
                        <div className="sticky top-4">
                            <div className="font-bold mb-4">Read Options</div>
                            {/* big-small font, yellow color bg, serif, modern -- tooltip like */}
                            <nav className="space-y-2">
                                {readOptions.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.href}
                                        className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[#222] transition duration-0"
                                    >
                                        {link.name}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1 p-4 md:p-6 lg:p-8 min-h-screen border-r border-gray-200 dark:border-[#333]">
                        {/* Article header */}
                        <div className="mb-8">
                            <div className="flex items-center mb-4">
                                <Avatar className="h-10 w-10 mr-3">
                                    <AvatarImage
                                        src={post.author.avatar}
                                        alt={post.author.name}
                                    />
                                    <AvatarFallback>
                                        {post.author.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium flex items-center justify-center gap-2">
                                        {post.author.name}
                                        <button className="px-1 rounded bg-black text-white dark:invert text-xs cursor-pointer">
                                            Follow
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {post.author.role}
                                    </div>
                                </div>
                                <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                                    <div>
                                        {post.publishedAt} · {post.readTime}
                                    </div>
                                    <div className="flex items-center justify-center">
                                        {/* <Separator /> */}
                                        {[
                                            Heart,
                                            Save,
                                            Share,
                                            MoreHorizontal,
                                        ].map((item, index) => (
                                            <item
                                                key={index}
                                                className="size-4"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold mb-4">
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {post.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Article content */}
                        <div className="prose dark:prose-invert max-w-none mb-12 leading-[1.5]">
                            <MarkdownPreview
                                content={data}
                                isDark={isDarkMode()}
                                darkBg="bg-[#111]"
                                textAlignment="left"
                            />
                        </div>

                        {/* Engagement section */}
                        <div className="flex items-center justify-between border-t border-b py-4 mb-8 dark:border-[#333] border-gray-200">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-red-500"
                                    >
                                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                    </svg>
                                    <span>{post.likes}</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <span>{post.comments}</span>
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                                    </svg>
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                        <polyline points="16 6 12 2 8 6" />
                                        <line x1="12" y1="2" x2="12" y2="15" />
                                    </svg>
                                </Button>
                            </div>
                        </div>

                        {/* More from author section */}
                        <div className="mb-12">
                            <h3 className="text-xl font-bold mb-4">
                                More from {post.author.name}
                            </h3>
                            <div className="grid gap-4">
                                {moreFromAuthor.map((item) => (
                                    <Card
                                        key={item.id}
                                        className="hover:shadow-md transition duration-200 shadow-none dark:bg-[#222] dark:text-[#fff] dark:border-none"
                                    >
                                        <CardContent className="p-4">
                                            <h4 className="font-medium text-lg mb-2">
                                                {item.title}
                                            </h4>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.readTime}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Related posts section */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-4">
                                Related Posts
                            </h3>
                            <div className="grid gap-4">
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
                        </div>
                    </main>

                    {/* Right sidebar - Empty as requested */}
                    <aside className="w-full md:w-64 p-4 hidden lg:block">
                        <div className="sticky top-4">
                            {/* This section is intentionally left empty as per requirements */}
                            {/* You can add content here in the future */}
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
};

export default ViewPost;
