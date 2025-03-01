import { ArrowRight } from "lucide-react";
import Flower from "./flowers/Flower";
import FlowerImgPng from "./flowers/flowers-1.png";

const LandingPage = () => {
    const navLinks = [
        { name: "Literature", href: "/gallery/literature" },
        { name: "Photos", href: "/gallery/photos" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Login", href: "/login" },
    ];
    return (
        <div className="min-h-screen bg-[#FFF5E9] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 py-12 relative">
                {/* Navigation */}
                <nav className="flex justify-between items-center mb-32">
                    <h1 className="font-serif text-2xl text-stone-800">
                        OpenCanvas
                    </h1>
                    <div className="space-x-8">
                        {navLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                className="text-stone-600 hover:text-stone-800 hover:bg-rose-200 rounded-lg text-sm transition-colors box-content px-1"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>
                </nav>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center justify-between mb-32">
                    <div className="space-y-8">
                        <h2 className="font-serif text-6xl leading-tight text-stone-800">
                            Where Art Meets
                            <span className="block italic text-stone-600">
                                Storytelling
                            </span>
                        </h2>

                        <p className="text-lg text-stone-600 leading-relaxed max-w-xl">
                            A creative sanctuary for artists, photographers, and
                            writers to share their craft. Express yourself
                            through images, words, or both.
                        </p>

                        <div className="space-y-6">
                            <button className="px-8 py-3 bg-stone-800 text-white rounded-sm hover:bg-stone-700 transition-colors inline-flex items-center group">
                                Start Creating
                                <ArrowRight
                                    size={16}
                                    className="ml-2 transform group-hover:translate-x-1 transition-transform"
                                />
                            </button>
                        </div>
                    </div>
                    <div className="relative mx-auto right-0 top-[auto] w-2/3 h-auto cursor-auto pointer-events-none">
                        <img
                            src={FlowerImgPng}
                            className="object-cover w-full h-full transition-all duration-700 ease-out"
                            alt=""
                        />
                    </div>
                </div>

                {/* Stats Section - Fixed Layout */}
                {/* <div className="absolute bottom-12 left-6 grid grid-cols-2 gap-x-24">
                    <div className="space-y-8">
                        <div className="flex items-center space-x-12 text-sm text-stone-500">
                            <div>
                                <span className="block font-serif text-2xl text-stone-800">
                                    10k+
                                </span>
                                Artists
                            </div>
                            <div>
                                <span className="block font-serif text-2xl text-stone-800">
                                    50k+
                                </span>
                                Artworks
                            </div>
                            <div>
                                <span className="block font-serif text-2xl text-stone-800">
                                    25k+
                                </span>
                                Stories
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* Interactive Flower */}
                {/* <InteractiveFlower /> */}
                {/* <Flower /> */}
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-40 left-20 w-64 h-64 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute bottom-40 left-1/3 w-64 h-64 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            </div>
        </div>
    );
};

export default LandingPage;
