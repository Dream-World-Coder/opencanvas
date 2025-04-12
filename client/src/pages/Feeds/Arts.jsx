import { useState } from "react";
import {
    Heart,
    MessageSquareText,
    ArrowRight,
    BookOpen,
    Filter,
} from "lucide-react";
import stories from "./Stories";
import Header from "../../components/Header/GalleryHeader";

const LiteratureFeed = ({ bgClr = "bg-cream-light" }) => {
    const [activeFilter, setActiveFilter] = useState("all");

    const filters = [
        "all",
        "romance",
        "experience",
        "horror",
        "sad",
        "fantasy",
    ];

    // Filter stories based on active filter
    const filteredStories =
        activeFilter === "all"
            ? stories
            : stories.filter(
                  (story) => story.type.toLowerCase() === activeFilter,
              );

    return (
        <div
            className={`min-h-screen ${bgClr} dark:bg-black dark:text-[#f2f2f2] pt-20`}
        >
            <Header filters={filters} />

            {/* Mobile Filter */}
            <div className="md:hidden px-4 mb-6">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-4">
                    <details className="group">
                        <summary className="flex justify-between items-center cursor-pointer list-none">
                            <div className="flex items-center">
                                <Filter
                                    size={16}
                                    className="mr-2 text-stone-500"
                                />
                                <span className="font-medium text-stone-700 dark:text-gray-300">
                                    Filter:{" "}
                                    {activeFilter.charAt(0).toUpperCase() +
                                        activeFilter.slice(1)}
                                </span>
                            </div>
                            <span className="text-stone-400">▼</span>
                        </summary>
                        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-zinc-800">
                            <div className="flex flex-wrap gap-2">
                                {filters.map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-3 py-1.5 text-sm rounded-full ${
                                            activeFilter === filter
                                                ? "bg-lime-100 text-stone-800 dark:bg-lime-900/30 dark:text-lime-200 font-medium"
                                                : "bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-gray-400"
                                        }`}
                                    >
                                        {filter.charAt(0).toUpperCase() +
                                            filter.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </details>
                </div>
            </div>

            {/* Main 3-column layout (left sidebar + content + right sidebar) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="flex flex-col lg:flex-row">
                    {/* Left Sidebar */}
                    <aside className="w-full lg:w-64 mb-6 lg:mb-0 lg:mr-6">
                        <div className="sticky top-24">
                            {/* Desktop Filter */}
                            <div className="hidden md:block mb-6">
                                <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-100 dark:border-[#222]">
                                    <h3 className="font-serif text-lg mb-4 text-stone-800 dark:text-gray-200">
                                        Categories
                                    </h3>
                                    <div className="flex flex-col space-y-2">
                                        {filters.map((filter) => (
                                            <button
                                                key={filter}
                                                onClick={() =>
                                                    setActiveFilter(filter)
                                                }
                                                className={`px-4 py-2 text-sm text-left rounded-md transition-all duration-200 ${
                                                    activeFilter === filter
                                                        ? "bg-lime-100 text-stone-800 dark:bg-lime-900/30 dark:text-lime-200 font-medium"
                                                        : "hover:bg-stone-50 text-stone-600 dark:hover:bg-zinc-800 dark:text-gray-400"
                                                }`}
                                            >
                                                {filter
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    filter.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Placeholder for future left sidebar content */}
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-100 dark:border-[#222] h-64 flex items-center justify-center">
                                <p className="text-stone-400 dark:text-gray-600 text-center">
                                    {/* Left Sidebar */}
                                    <br />
                                    <span className="text-sm">
                                        {/* (For future options/ads) */}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 mt-4">
                        {filteredStories.length === 0 ? (
                            <div className="text-center bg-white dark:bg-zinc-900 rounded-lg shadow-sm py-16">
                                <BookOpen className="h-12 w-12 mx-auto mb-4 text-stone-300 dark:text-zinc-700" />
                                <h3 className="text-xl font-serif text-stone-600 dark:text-gray-400">
                                    No stories found
                                </h3>
                                <p className="mt-2 text-stone-500 dark:text-gray-500">
                                    Try a different filter to discover more
                                    stories.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredStories.map((story, index) => (
                                    <article
                                        key={index}
                                        className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-[#222]"
                                    >
                                        {story.image && (
                                            <div className="h-52 overflow-hidden rounded-t-lg">
                                                <img
                                                    src={story.image}
                                                    alt={story.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        <div className="p-6">
                                            <header className="mb-5">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-xs text-stone-500 uppercase font-medium px-2.5 py-1 bg-stone-50 dark:bg-zinc-800 rounded-full dark:text-gray-400">
                                                        {story.type}
                                                    </span>
                                                    <span className="text-xs text-stone-400 italic dark:text-gray-500">
                                                        {story.date}
                                                    </span>
                                                </div>
                                                <h2 className="font-serif text-xl md:text-2xl text-stone-800 mb-2 leading-tight dark:text-gray-200">
                                                    {story.title}
                                                </h2>
                                                <p className="text-sm text-stone-600 dark:text-gray-400">
                                                    by{" "}
                                                    <span className="text-stone-700 dark:text-gray-300 font-medium">
                                                        {story.author}
                                                    </span>
                                                </p>
                                            </header>

                                            <div className="mb-5">
                                                <p className="text-base leading-relaxed text-stone-600 whitespace-pre-line dark:text-gray-300 font-['Georgia',serif]">
                                                    {story.excerpt.length > 300
                                                        ? `${story.excerpt.slice(0, 300)}...`
                                                        : story.excerpt}
                                                </p>
                                            </div>

                                            <footer className="flex items-center justify-between text-stone-500 pt-4 border-t border-stone-100 dark:border-zinc-800 dark:text-gray-400">
                                                <div className="flex items-center space-x-4">
                                                    <button className="flex items-center space-x-1 text-xs hover:text-stone-700 transition-colors dark:hover:text-gray-300">
                                                        <Heart size={14} />
                                                        <span>
                                                            {story.likes}
                                                        </span>
                                                    </button>
                                                    <button className="flex items-center space-x-1 text-xs hover:text-stone-700 transition-colors dark:hover:text-gray-300">
                                                        <MessageSquareText
                                                            size={14}
                                                        />
                                                        <span>
                                                            {story.saves}
                                                        </span>
                                                    </button>
                                                </div>
                                                <button
                                                    className="text-xs text-stone-600 hover:text-stone-950 hover:bg-lime-100
                                                    border border-stone-200 hover:border-lime-200 dark:border-zinc-700 dark:text-gray-300
                                                    dark:hover:text-gray-100 dark:hover:bg-lime-900/30 dark:hover:border-lime-900/50
                                                    px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
                                                >
                                                    Read
                                                    <ArrowRight
                                                        size={12}
                                                        className="transition-transform duration-300 group-hover:translate-x-1"
                                                    />
                                                </button>
                                            </footer>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </main>

                    {/* Right Sidebar */}
                    <aside className="w-full lg:w-64 mt-6 lg:mt-0 lg:ml-6">
                        <div className="sticky top-24">
                            {/* Placeholder for future right sidebar content */}
                            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-[#222] p-5 rounded-lg h-96 flex items-center justify-center">
                                <p className="text-stone-400 dark:text-gray-600 text-center">
                                    {/* Right Sidebar */}
                                    <br />
                                    <span className="text-sm">
                                        {/* (For future options/ads) */}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default LiteratureFeed;
