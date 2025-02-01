import { useState, useEffect } from "react";
import { Heart, Bookmark } from "lucide-react";
import stories from "./Stories";

const LiteraryGallery = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Subtle Header */}
            <div
                className="relative h-72 overflow-hidden bg-stone-100"
                style={{
                    transform: `translateY(${scrollY * 0.2}px)`,
                }}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-6">
                        <h1 className="text-3xl font-serif text-stone-800 mb-3">
                            Literary Collection
                        </h1>
                        <p className="text-sm text-stone-600 tracking-wide">
                            A gathering of thoughts, verses, and tales
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {stories.map((story, index) => (
                        <article
                            key={story.id}
                            className="group"
                            style={{
                                transform: `translateY(${Math.sin((scrollY + index * 100) * 0.001) * 8}px)`,
                            }}
                        >
                            <div className="bg-white p-8 border border-stone-200 hover:border-stone-300 transition-all duration-500">
                                <header className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs tracking-widest text-stone-500">
                                            {story.type}
                                        </span>
                                        <span className="text-xs text-stone-400">
                                            {story.date}
                                        </span>
                                    </div>
                                    <h2 className="font-serif text-xl text-stone-800 mb-2">
                                        {story.title}
                                    </h2>
                                    <p className="text-sm text-stone-600">
                                        by {story.author}
                                    </p>
                                </header>

                                <div className="mb-6">
                                    <p className="text-sm leading-relaxed text-stone-700 whitespace-pre-line">
                                        {story.excerpt}
                                    </p>
                                </div>

                                <footer className="flex items-center justify-between text-stone-500">
                                    <div className="flex items-center space-x-4">
                                        <button className="flex items-center space-x-1 text-xs group-hover:text-stone-700">
                                            <Heart size={14} />
                                            <span>{story.likes}</span>
                                        </button>
                                        <button className="flex items-center space-x-1 text-xs group-hover:text-stone-700">
                                            <Bookmark size={14} />
                                            <span>{story.saves}</span>
                                        </button>
                                    </div>
                                    <span className="text-xs text-stone-400">
                                        Read more →
                                    </span>
                                </footer>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LiteraryGallery;
