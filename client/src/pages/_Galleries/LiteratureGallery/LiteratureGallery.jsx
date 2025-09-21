import { useState, useEffect } from "react";
import { Heart, MessageSquareText, ArrowRight } from "lucide-react";
import stories from "./Stories";
import Header from "../../../components/Header/GalleryHeader";

const LiteraryGallery = ({ bgClr = "bg-cream-light" }) => {
    const filters = [
        "all",
        "romance",
        "experience",
        "horror",
        "sad",
        "fantasy",
    ];

    return (
        <div
            className={`min-h-screen ${bgClr} dark:bg-black dark:text-[#f2f2f2] pt-24`}
        >
            <Header filters={filters} />

            {/* Main Content */}
            <div className="max-w-3xl mx-auto pb-24">
                <div className="grid grid-cols-1 w-full">
                    {stories.map((story, index) => (
                        <article key={index} className="w-full">
                            <div
                                className={`p-8 border-b border-stone-200
                                    hover:border-stone-300 transition-all duration-500 group
                                    hover:shadow-lg hover:shadow-stone-100/50 dark:shadow-none dark:border-[#333] dark:hover:shadow-none dark:hover:border-[#333]`}
                            >
                                <header className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs text-stone-500 uppercase font-bold md:font-light font-stardom md:font-serif underline underline-offset-4 decoration-2 decoration-lime-300/75 dark:text-gray-300 dark:hover:text-gray-300">
                                            {story.type}
                                        </span>
                                        <span className="text-xs text-stone-400 italic font-bold md:font-light font-stardom md:font-serif dark:text-gray-300 dark:hover:text-gray-300">
                                            {story.date}
                                        </span>
                                    </div>
                                    <h2 className="font-serif text-xl text-stone-800 mb-2 hover:text-stone-900 transition-colors dark:text-gray-200 dark:hover:text-gray-200">
                                        {story.title}
                                    </h2>
                                    <p className="text-sm text-stone-600 font-light dark:text-gray-400 dark:hover:text-gray-400">
                                        by{" "}
                                        <span
                                            href="#"
                                            className="text-stone-700 font-bold md:font-light font-stardom underline cursor-auto dark:text-gray-400 dark:hover:text-gray-400"
                                        >
                                            {story.author}
                                        </span>
                                    </p>
                                </header>

                                <div className="mb-6">
                                    <p className="text-base leading-relaxed text-stone-700 whitespace-pre-line font-light dark:text-gray-300 font-[montserrat]">
                                        {story.excerpt.length > 300
                                            ? `${story.excerpt.slice(0, 300)}...`
                                            : story.excerpt}
                                    </p>
                                </div>

                                <footer className="flex items-center justify-between text-stone-500 dark:text-gray-200 dark:hover:text-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <button className="flex items-center space-x-1 text-xs hover:text-stone-700 transition-colors cursor-auto dark:text-gray-200 dark:hover:text-gray-200">
                                            <Heart size={14} />
                                            <span>{story.likes}</span>
                                        </button>
                                        <button className="flex items-center space-x-1 text-xs hover:text-stone-700 transition-colors cursor-auto dark:text-gray-200 dark:hover:text-gray-200">
                                            <MessageSquareText size={14} />
                                            <span>{story.saves}</span>
                                        </button>
                                    </div>
                                    <span
                                        className="group text-xs text-stone-600 group-hover:text-stone-950 group-hover:bg-lime-300/60
                                        border group-hover:border-lime-300 dark:text-gray-200 dark:hover:text-gray-200 dark:group-hover:text-gray-200 dark:group-hover:bg-lime-600/60
                                        px-3 py-1 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        Read
                                        <ArrowRight
                                            size={12}
                                            className={`transition-transform duration-300 group-hover:translate-x-1`}
                                        />
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
