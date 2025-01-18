import React, { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import BlueFlowerImg from "./flowers/blue-flower.png";

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: "Literature", href: "/gallery/literature" },
        { name: "Photos", href: "/gallery/photos" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Login", href: "/login" },
    ];

    return (
        <div className="min-h-screen bg-sky-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 relative">
                {/* Navigation */}
                <nav className="flex justify-between items-center mb-16 sm:mb-32">
                    <h1 className="font-[stardom] text-xl sm:text-2xl text-stone-800">
                        OpenCanvas
                    </h1>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-2">
                        {navLinks.map((link, index) => (
                            <React.Fragment key={index}>
                                <a
                                    href={link.href}
                                    className="text-stone-600 hover:text-stone-800 hover:bg-sky-200/50 rounded-lg text-sm transition-all duration-300 box-content px-3 py-1"
                                >
                                    {link.name}
                                </a>
                                {index !== navLinks.length - 1 && (
                                    <span className="text-sky-300">•</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? (
                            <X className="h-6 w-6 text-stone-600" />
                        ) : (
                            <Menu className="h-6 w-6 text-stone-600" />
                        )}
                    </button>
                </nav>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 right-0 bg-white/90 backdrop-blur-sm z-50 border-b border-stone-200">
                        <div className="flex flex-col space-y-4 p-6">
                            {navLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    className="text-stone-600 hover:text-stone-800 text-lg transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center justify-between mb-16 sm:mb-32">
                    <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight text-stone-800 pointer-events-none">
                            An Open Canvas
                            <span className="block italic text-stone-600">
                                for <span className="font-[scribe]">you</span>{" "}
                                to fill
                            </span>
                        </h2>
                        <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            A place to share your arts.
                            <br />
                            Express yourself through images, words, or both.
                        </p>
                        <div>
                            <a href="/login" className="no-underline">
                                <button className="px-6 sm:px-8 py-3 bg-[#5789ba] text-white rounded-xl hover:bg-sky-700 transition-all duration-300 inline-flex items-center group">
                                    Start Exploring
                                    {/* Login */}
                                    <ArrowRight
                                        size={16}
                                        className="ml-2 transform group-hover:translate-x-1 transition-transform"
                                    />
                                </button>
                            </a>
                        </div>
                    </div>
                    <div className="relative mx-auto lg:right-0 w-2/3 sm:w-1/2 lg:w-2/3 pointer-events-none">
                        <img
                            src={BlueFlowerImg}
                            className="object-cover w-full h-full transition-all duration-700 ease-out"
                            alt="Blue flower illustration"
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-0 w-full bg-transparent backdrop-blur-sm border-t border-sky-200/25">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-center">
                    <p className="font-serif text-xs sm:text-sm text-gray-400/80 hover:text-[#5789ba] transition-colors">
                        Copyright &copy; 2025 OpenCanvas. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
