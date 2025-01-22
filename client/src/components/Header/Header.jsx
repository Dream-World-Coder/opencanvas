import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Navigation Links
    const navLinks = [
        { name: "Literature", href: "/gallery/literature" },
        { name: "Photos", href: "/gallery/photos" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Login", href: "/login" },
    ];

    return (
        <header className="fixed w-full top-0 z-50 bg-white/20 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <nav className="flex items-center justify-between h-16 sm:h-20">
                    {/* Logo */}
                    <a
                        href="/"
                        className="font-[stardom] tracking-tighter bg-lime-400 text-xl sm:text-2xl text-stone-950  font-thin rounded-md box-content p-1"
                    >
                        OpenCanvas
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navLinks.map((link, index) => (
                            <React.Fragment key={index}>
                                <a
                                    href={link.href}
                                    className="text-stone-600 hover:text-stone-800 hover:bg-lime-300/50 box-content px-3 py-1 rounded-lg transition-all text-sm"
                                >
                                    {link.name}
                                </a>
                                {index !== navLinks.length - 1 && (
                                    <span className="text-lime-300">•</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 hover:bg-white/50 rounded-sm transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className="h-6 w-6 text-stone-600" />
                        ) : (
                            <Menu className="h-6 w-6 text-stone-600" />
                        )}
                    </button>
                </nav>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden absolute left-0 right-0 bg-white backdrop-blur-md border-b border-stone-200/50 transition-all duration-300 ease-in-out ${
                        isMenuOpen
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-2 pointer-events-none"
                    }`}
                >
                    <div className="px-4 py-6 space-y-6">
                        {/* Mobile Nav Links */}
                        <div className="flex flex-col space-y-4">
                            {navLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    className="text-stone-600 hover:text-stone-800 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
