import { useState, useEffect } from "react";
import { Heart, Bookmark, ArrowRight } from "lucide-react";
import stories from "./Stories";
import Footer from "../../../components/Footer/GalleryFooter";
import Header from "../../../components/Header/GalleryHeader";
import vineSvg from "../../../assets/icons/vine.svg";

const LiteraryGallery = ({ bgClr = "bg-cream-light" }) => {
    const [scrollY, setScrollY] = useState(0);
    const [hoveredId, setHoveredId] = useState(null);

    const filters = ["all", "stories", "poems", "romance", "experience"];

    useEffect(() => {
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        if (!isMobile) {
            const handleScroll = () => {
                setScrollY(window.scrollY);
            };

            window.addEventListener("scroll", handleScroll);
            return () => {
                window.removeEventListener("scroll", handleScroll);
            };
        }
    }, []);

    return (
        <div className={`min-h-screen ${bgClr} pt-24`}>
            <Header filters={filters} />

            {/* Top / Hero */}
            {/* ----------------------------------- */}
            {/* Replace some portions with various filters, and no love/save/author viewing form here, its just preview */}
            {/* ----------------------------------- */}
            <div
                className={`relative h-32 md:h-72 overflow-hidden bg-inherit`}
                style={{
                    transform: `translateY(${scrollY * 0.2}px)`,
                }}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-6">
                        <h1 className="text-3xl text-stone-800 mb-3 tracking-wide font-scribe pointer-events-none md:pointer-events-auto">
                            <span className="relative px-4 pt-3">
                                Literary Collection
                                <img
                                    className="hidden md:block object-cover w-16 absolute opacity-70 top-[-28%] left-[110%]"
                                    src={vineSvg}
                                    alt=""
                                />
                            </span>
                        </h1>
                        <p
                            className="hidden md:flex flex-col text-sm text-stone-600 tracking-wide font-bold
                            items-center justify-center
                            md:font-light font-serif pointer-events-none md:pointer-events-auto"
                        >
                            A gathering of thoughts, verses, and tales
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-16 border border-black/0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stories.map((story, index) => (
                        <article
                            key={index}
                            className=""
                            onMouseEnter={() => setHoveredId(story.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <div
                                className={`bg-gradient-to-br ${story.gradient} p-8 border-b border-stone-200
                                    hover:border-stone-300 transition-all duration-500 group
                                    hover:shadow-lg hover:shadow-stone-100/50 rounded`}
                            >
                                <header className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs text-stone-500 uppercase font-bold md:font-light font-stardom md:font-serif underline underline-offset-4 decoration-2 decoration-lime-300/75">
                                            {story.type}
                                        </span>
                                        <span className="text-xs text-stone-400 italic font-bold md:font-light font-stardom md:font-serif">
                                            {story.date}
                                        </span>
                                    </div>
                                    <h2 className="font-serif text-xl text-stone-800 mb-2 hover:text-stone-900 transition-colors">
                                        {story.title}
                                    </h2>
                                    <p className="text-sm text-stone-600 font-light">
                                        by{" "}
                                        <span
                                            href="#"
                                            className="text-stone-700 font-bold md:font-light font-stardom underline cursor-auto"
                                        >
                                            {story.author}
                                        </span>
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
                                        <button className="flex items-center space-x-1 text-xs hover:text-stone-700 transition-colors cursor-auto">
                                            <Heart size={14} />
                                            <span>{story.likes}</span>
                                        </button>
                                        <button className="flex items-center space-x-1 text-xs hover:text-stone-700 transition-colors cursor-auto">
                                            <Bookmark size={14} />
                                            <span>{story.saves}</span>
                                        </button>
                                    </div>
                                    <span
                                        className="group text-xs text-stone-600 group-hover:text-stone-950 group-hover:bg-lime-300/60
                                        border group-hover:border-lime-300
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

            <Footer />
        </div>
    );
};

export default LiteraryGallery;
