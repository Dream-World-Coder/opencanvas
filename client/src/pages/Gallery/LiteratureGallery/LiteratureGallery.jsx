import { useState, useEffect } from "react";
import { Heart, Bookmark, ArrowRight } from "lucide-react";
import stories from "./Stories";
import Footer from "../Components/GalleryFooter";
import Header from "../Components/GalleryHeader";

const LiteraryGallery = ({ bgClr = "bg-cream-light" }) => {
    const [scrollY, setScrollY] = useState(0);
    const [hoveredId, setHoveredId] = useState(null);

    const filters = ["all", "stories", "poems", "romance", "experience"];
    const navLinks = [
        { name: "Literature", href: "/gallery/literature" },
        { name: "Photos", href: "/gallery/photos" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Login", href: "/login" },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={`min-h-screen ${bgClr} pt-24`}>
            <Header filters={filters} navLinks={navLinks} />

            {/* Top / Hero */}
            <div
                className={`relative h-72 overflow-hidden bg-inherit`}
                style={{
                    transform: `translateY(${scrollY * 0.2}px)`,
                }}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-6">
                        <h1 className="text-3xl text-stone-800 mb-3 tracking-wide font-[scribe]">
                            Literary Collection
                        </h1>
                        <div className="h-px w-[100%] mx-auto bg-gradient-to-r from-transparent via-stone-500/40 to-transparent mb-3"></div>
                        <p className="text-sm text-stone-600 tracking-wide font-light font-stardom">
                            A gathering of thoughts, verses, and tales
                        </p>
                        <div className="h-px w-[100%] mx-auto bg-gradient-to-r from-transparent via-stone-500/40 to-transparent mt-3"></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-16 border border-black/0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* <div className="columns-1 md:columns-1 gap-4 border border-gray-800/0"> */}
                    {stories.map((story, index) => (
                        <article
                            key={index}
                            className=""
                            onMouseEnter={() => setHoveredId(story.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <div
                                className={`bg-gradient-to-br ${story.gradient} p-8 border-b border-stone-200
                                    hover:border-stone-300 transition-all duration-500
                                    hover:shadow-lg hover:shadow-stone-100/50 rounded`}
                            >
                                <header className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        {/*  rounded-full border border-stone-500/30 box-content px-2 py-1 */}
                                        <span className="text-xs tracking-widest text-stone-500 uppercase font-stardom">
                                            {story.type}
                                        </span>
                                        <span className="text-xs text-stone-400 italic font-stardom">
                                            {story.date}
                                        </span>
                                    </div>
                                    <h2 className="font-serif text-xl text-stone-800 mb-2 hover:text-stone-900 transition-colors">
                                        {story.title}
                                    </h2>
                                    <p className="text-sm text-stone-600 font-light">
                                        by{" "}
                                        <a
                                            href="#"
                                            className="text-stone-700 font-stardom underline"
                                        >
                                            {story.author}
                                        </a>
                                    </p>
                                </header>

                                <div className="mb-6">
                                    <p className="text-md leading-relaxed text-stone-700 whitespace-pre-line font-light">
                                        {story.excerpt.length > 150
                                            ? `${story.excerpt.slice(0, 150)}...`
                                            : story.excerpt}
                                    </p>
                                </div>

                                <footer className="flex items-center justify-between text-stone-500">
                                    <div className="flex items-center space-x-4">
                                        <button className="flex items-center space-x-1 text-xs hover:text-stone-700 transition-colors group">
                                            <Heart
                                                size={14}
                                                className={`group-hover:fill-rose-600
                                                    ${hoveredId === story.id ? "animate-pulse" : ""}`}
                                            />
                                            <span>{story.likes}</span>
                                        </button>
                                        <button className="flex items-center space-x-1 text-xs hover:text-stone-700 transition-colors group">
                                            <Bookmark
                                                size={14}
                                                className="group-hover:fill-sky-400"
                                            />
                                            <span>{story.saves}</span>
                                        </button>
                                    </div>
                                    <span className="group text-xs text-stone-400 hover:text-stone-600 hover:bg-sky-100 px-3 py-1 rounded-xl transition-colors flex items-center gap-1">
                                        Read more
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

            <Footer />
        </div>
    );
};

export default LiteraryGallery;
