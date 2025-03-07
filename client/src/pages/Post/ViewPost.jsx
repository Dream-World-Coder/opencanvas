// Its the public view --> add options like link share

import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "../../components/Header/Header"; // add prop to implement non blur & color of *
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MarkdownPreview } from "../CreatePosts/Writing/WritingComponents"; // add prop: in edit: for image pop regulate
import {
    Bookmark,
    Share2,
    MoreHorizontal,
    Heart,
    MessageSquareText,
} from "lucide-react";

function useDarkMode() {
    const getDarkMode = () =>
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    const [isDark, setIsDark] = useState(getDarkMode());

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (e) => setIsDark(e.matches);

        // Add event listener
        mediaQuery.addEventListener("change", handleChange);

        // Cleanup event listener on component unmount
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return isDark;
}

const ViewPost = ({ postId }) => {
    const isDark = useDarkMode();
    const data = `In modern web development, providing a seamless user experience is crucial. One way to achieve this is by aligning your website's appearance with the user's system preferences, such as dark mode. This blog will guide you through detecting system dark mode using pure JavaScript and applying dynamic styles accordingly.
### Why Detect Dark Mode?
> Dark mode has become a popular feature across various platforms due to its aesthetic appeal and reduced eye strain in low-light environments. Automatically switching your website's theme based on the user's preference can enhance the overall user experience.
### Detecting Dark Mode in JavaScript
JavaScript provides a straightforward way to detect if the user has enabled dark mode using the \`window.matchMedia()\` method.
\`\`\`javascript
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
console.log(\`System Dark Mode: \${isDarkMode}');
\`\`\`
The \`prefers-color-scheme\` media query checks the user's system preference, and \`.matches\` returns \`true\` if dark mode is enabled.
### Listening for Dark Mode Changes
Users can switch between light and dark mode at any time. To ensure your website adapts dynamically, listen for changes using the \`addEventListener\` method:
\`\`\`javascript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', (event) => {
    if (event.matches) {
        console.log('Dark mode is ON');
        document.body.classList.add('dark');
    } else {
        console.log('Dark mode is OFF');
        document.body.classList.remove('dark');
    }
});
\`\`\`
### Applying Styles Dynamically
Combine the detection logic with CSS classes to apply dark mode styles dynamically:
\`\`\`css
body.dark {
    background-color: #121212;
    color: #ffffff;
}
body {
    transition: background-color 0.3s ease, color 0.3s ease;
}
\`\`\`
![img](https://picsum.photos/1200)
### Best Practices

- Use \`transition\` properties to create smooth visual effects.
- Allow users to override system preferences with manual toggle switches.
- Test your implementation on different devices and browsers.

### Conclusion
Detecting and applying system dark mode in JavaScript is a simple yet effective way to enhance user experience. By combining media queries, event listeners, and dynamic class manipulation, you can create a visually adaptive website that caters to user preferences.
Implement this feature in your projects to provide a modern and user-friendly interface.`;

    const readOptions = [
        { name: "Home", href: "#" },
        { name: "Discover", href: "#" },
        { name: "Bookmarks", href: "#" },
        { name: "Profile", href: "#" },
        { name: "My Feed", href: "#" },
    ];

    // Sample data - in a real app, this would come from props or API
    const post = {
        title: "How to Detect System Dark Mode in JavaScript",
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

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Article",
        // headline: { title },
        // image: ["https://opencanvas.blog/photos/1x1/photo.jpg"],
        datePublished: {},
        dateModified: {},
        author: {
            "@type": "Person",
            name: {},
        },
        publisher: {
            "@type": "Organization",
            name: "Opencanvas",
            logo: {
                "@type": "ImageObject",
                url: "https://opencanvas.blog/logo.png",
            },
        },
        description:
            "A sample article description goes here, summarizing the main content of the article.",
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://opencanvas.blog/sample-article",
        },
        keywords:
            "SEO, keywords, search engine optimization, blog, web development",
    };

    return (
        <>
            <Helmet>
                {/* <title>{title} • OpenCanvas</title> */}
                {/* <meta name="description" content={title} /> */}
                <meta
                    name="keywords"
                    content="technology, blog, javascript, SEO, web development"
                />
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Helmet>

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
                                    <div className="flex items-center justify-center mt-2 text-white">
                                        <Heart className="size-4 cursor-pointer rounded px-2 py-1 box-content hover:bg-[#111] text-red-600 hover:text-white dark:hover:bg-[#eee] dark:hover:text-black" />
                                        <span className="w-px h-[15px] dark:bg-[#ccc]/60 bg-[#444]/60" />
                                        <Bookmark className="size-4 cursor-pointer rounded px-2 py-1 box-content hover:bg-[#111] dark:text-white text-black hover:text-white dark:hover:bg-[#eee] dark:hover:text-black" />
                                        <span className="w-px h-[15px] dark:bg-[#ccc]/60 bg-[#444]/60" />
                                        <Share2 className="size-4 cursor-pointer rounded px-2 py-1 box-content hover:bg-[#111] dark:text-white text-black hover:text-white dark:hover:bg-[#eee] dark:hover:text-black" />
                                        <span className="w-px h-[15px] dark:bg-[#ccc]/60 bg-[#444]/60" />
                                        <MoreHorizontal className="size-4 cursor-pointer rounded px-2 py-1 box-content hover:bg-[#111] dark:text-white text-black hover:text-white dark:hover:bg-[#eee] dark:hover:text-black" />
                                    </div>
                                </div>
                            </div>
                            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight mb-4 md:mt-2">
                                {post.title}
                            </h1>
                        </div>

                        {/* Article content */}
                        <div className="prose dark:prose-invert max-w-none pt-4 mb-16">
                            <MarkdownPreview
                                content={data}
                                isDark={isDark}
                                darkBg="bg-[#111]"
                                textAlignment="left"
                                insidePost={true}
                            />
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

                        {/* Engagement section */}
                        <div className="flex items-center justify-between border-t border-b py-4 mb-8 dark:border-[#333] border-gray-200">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <Heart className="size-4 text-red-600" />
                                    <span>{post.likes}</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <MessageSquareText className="size-4" />
                                    <span>{post.comments}</span>
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                    <Bookmark className="size-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <Share2 className="size-4" />
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
