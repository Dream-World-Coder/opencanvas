import React, { useState } from "react";
import { X, Menu } from "lucide-react";

const Header = ({ filters, navLinks }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("all");

    return (
        <header className="fixed top-0 w-full bg-white/0 backdrop-blur-sm z-50 border-b border-gray-100">
            <div className="max-w-[1400px] mx-auto px-6 py-6">
                <div className="flex flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <h1 className="text-2xl font-stardom font-semibold tracking-tight">
                        Literature Gallery
                        {/* Filters */}
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-4">
                                {filters.map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() =>
                                            setSelectedFilter(filter)
                                        }
                                        className={`text-sm font-sans capitalize ${
                                            selectedFilter === filter
                                                ? "text-black font-medium"
                                                : "text-gray-400 hover:text-gray-600 font-thin"
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </h1>
                    <div className="hidden md:flex items-center space-x-2">
                        {navLinks.map((link, index) => (
                            <React.Fragment key={index}>
                                <a
                                    href={link.href}
                                    className="text-stone-600 hover:text-stone-800 hover:bg-cream-dark/50 box-content px-3 py-1 rounded-lg transition-all text-sm"
                                >
                                    {link.name}
                                </a>
                                {index !== navLinks.length - 1 && (
                                    <span className="text-stone-300">•</span>
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
                </div>
                <div
                    className={`md:hidden absolute left-0 right-0 bg-cream backdrop-blur-sm border-b border-stone-200/50 transition-all duration-300 ease-in-out ${
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
