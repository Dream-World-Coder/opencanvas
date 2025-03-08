import React, { useState } from "react";
import { Menu, X, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createOptions } from "./createOptions";
import SearchBar from "../SearchBar";

const Header = ({
    noBlur = false,
    ballClr = "text-lime-300",
    exclude = [""],
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [createMenuOpen, setCreateMenuOpen] = useState(false);
    const { currentUser } = useAuth();

    // Navigation Links
    let navLinks = [
        { name: "Literature", href: "/gallery/literature" },
        { name: "Photos", href: "/gallery/photos" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];

    if (!currentUser) {
        navLinks.push({ name: "Login", href: "/login" });
    }
    if (currentUser) {
        navLinks.push({ name: "Profile", href: "/profile" });
    }

    return (
        <header
            className={`fixed w-full top-0 z-50 ${noBlur ? "bg-white dark:bg-black dark:text-white border-b border-gray-200 dark:border-[#333]" : "bg-white/20 dark:bg-[#222]/20 backdrop-blur-md"}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <nav className="flex items-center justify-between h-16 sm:h-20">
                    <div className="flex items-center justify-center gap-2">
                        {/* Logo */}
                        <a
                            href="/"
                            className="bg-lime-400 font-thin text-stone-950
                        rounded-md box-content px-1 md:px-1 py-0
                        text-xl md:text-2xl tracking-wide"
                        >
                            <span className="font-['Six_Caps']">
                                opencanvas
                            </span>
                        </a>
                        <SearchBar round={true} hideSubmitBtn={true} />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navLinks.map((link, index) => (
                            <React.Fragment key={index}>
                                {!exclude.includes(link.href) && (
                                    <>
                                        <a
                                            href={link.href}
                                            className={`text-stone-600 hover:text-stone-800 dark:text-[#f8f8f8] dark:hover:text-[#fff]
                                    ${link.href !== "/profile" ? "hover:bg-lime-300/50 dark:hover:bg-lime-700/50" : ""}
                                    box-content px-3 py-1 rounded-lg transition-all text-sm`}
                                        >
                                            {link.href !== "/profile" ? (
                                                link.name
                                            ) : (
                                                <img
                                                    src="/defaults/profile.jpeg"
                                                    className="size-6 md:size-8 rounded-full overflow-hidden object-cover block cursor-pointer"
                                                    alt=""
                                                />
                                            )}
                                        </a>
                                        {index !== navLinks.length - 1 && (
                                            <span
                                                className={`${ballClr} flex items-center`}
                                            >
                                                •
                                            </span>
                                        )}
                                    </>
                                )}
                            </React.Fragment>
                        ))}
                        {/* Create Button with Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setCreateMenuOpen(!createMenuOpen)
                                }
                                className="flex items-center space-x-2 bg-black dark:bg-[#333] text-white px-4 py-2 rounded-full hover:bg-stone-800/90 transition-colors"
                            >
                                <span>Create</span>
                                {!createMenuOpen && (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                                {createMenuOpen && (
                                    <ChevronUp className="w-4 h-4" />
                                )}
                            </button>

                            {/* Create Menu Dropdown */}
                            {createMenuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111] border border-gray-100 dark:border-[#333] rounded-lg shadow-lg py-2 z-50">
                                    {createOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors group"
                                            onClick={() => {
                                                localStorage.removeItem(
                                                    "blogPost",
                                                );
                                                setCreateMenuOpen(false);
                                                window.location.href =
                                                    option.href;
                                            }}
                                        >
                                            <div
                                                className={`p-2 rounded-full ${option.color}`}
                                            >
                                                <option.icon className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="flex items-center justify-center gap-3">
                                                {option.label}{" "}
                                                <Plus className="w-4 h-4 opacity-0 group-hover:opacity-[100] transition-all duration-150 text-stone-700 dark:text-stone-200" />
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:hidden flex items-center justify-center gap-2">
                        {/* Mobile Create Button */}
                        <button
                            onClick={() => setCreateMenuOpen(!createMenuOpen)}
                            className="w-fit p-1 flex items-center justify-center bg-black text-white rounded-full hover:bg-stone-800/90 transition-colors"
                        >
                            {createMenuOpen ? (
                                <X className="w-4 h-4" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                        </button>

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

                        {createMenuOpen && (
                            <div className="absolute top-20 right-0 w-64 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50">
                                {createOptions.map((option) => (
                                    <a
                                        key={option.id}
                                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                                        onClick={() => {
                                            setCreateMenuOpen(false);
                                            localStorage.removeItem("blogPost");
                                        }}
                                        href={option.href}
                                    >
                                        <div
                                            className={`p-2 rounded-full ${option.color}`}
                                        >
                                            <option.icon className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="flex items-center justify-center gap-3">
                                            {option.label}{" "}
                                            <Plus className="w-4 h-4 opacity-0 group-hover:opacity-[100] transition-all duration-150 text-stone-700" />
                                        </span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
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
                        <div className="flex flex-col">
                            {navLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    className="py-2 pl-4 rounded-lg text-stone-600 hover:text-stone-800 hover:bg-lime-300/50 transition-colors"
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
