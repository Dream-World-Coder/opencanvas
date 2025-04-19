import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createOptions } from "./createOptions";
import SearchBar from "../SearchBar";
import { useDataService } from "../../services/dataService";

const Header = ({
    noBlur = false,
    ballClr = "text-lime-300",
    exclude = [""],
    abs = false,
    darkBg = "dark:bg-[#222]",
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [createMenuOpen, setCreateMenuOpen] = useState(false);
    const { currentUser } = useAuth();
    const { getNewPostId } = useDataService();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    async function handlePostCreate(option) {
        setLoading(true);
        localStorage.removeItem("blogPost");
        localStorage.removeItem("newPostId");
        setCreateMenuOpen(false);
        let newPostId = await getNewPostId();
        localStorage.setItem("newPostId", newPostId);

        setTimeout(() => {
            // window.location.href = option.href;
            navigate(option.href);
        }, 300);
        setLoading(false);
    }

    // Navigation Links
    let navLinks = [
        { name: "Articles", href: "/articles" },
        { name: "Social", href: "/literature" },
        { name: "Photos", href: "/photo-gallery" },
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
            className={`${abs ? "absolute" : "fixed"} w-full top-0 z-50
                ${
                    noBlur
                        ? `bg-white ${darkBg} dark:text-white border-b border-gray-100 dark:border-[#333] shadow-sm dark:shadow-none`
                        : `bg-white/20 ${darkBg}/20 backdrop-blur-md`
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-0 py-3">
                <nav className="flex items-center justify-between">
                    <div className="flex items-center justify-center gap-2">
                        {/* Logo */}
                        <div
                            onClick={() => navigate("/")}
                            className="bg-lime-400 font-thin text-stone-950
                            rounded-md box-content px-1 md:px-1 py-0
                            text-xl md:text-2xl tracking-wide"
                        >
                            <span className="font-['Six_Caps'] text-black">
                                opencanvas
                            </span>
                        </div>
                        <SearchBar round={true} hideSubmitBtn={true} />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navLinks.map((link, index) => (
                            <React.Fragment key={index}>
                                {!exclude.includes(link.href) && (
                                    <>
                                        <button
                                            onClick={() => navigate(link.href)}
                                            className={`text-stone-600 hover:text-stone-800 dark:text-[#f8f8f8] dark:hover:text-[#fff]
                                                            ${link.href !== "/profile" ? "hover:bg-lime-300/50 dark:hover:bg-lime-700/50" : ""}
                                                            box-content px-3 py-1 rounded-lg transition-all text-sm`}
                                        >
                                            {link.href !== "/profile" ? (
                                                link.name
                                            ) : (
                                                <img
                                                    src={
                                                        currentUser.profilePicture
                                                    }
                                                    className="size-6 md:size-8 rounded-full overflow-hidden object-cover block cursor-pointer"
                                                    alt="Profile"
                                                />
                                            )}
                                        </button>
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
                            {currentUser && (
                                <button
                                    onClick={() =>
                                        setCreateMenuOpen(!createMenuOpen)
                                    }
                                    className="flex items-center space-x-2 bg-black dark:bg-[#333] text-white px-4 py-2 rounded-full hover:bg-stone-800/90 transition-colors"
                                >
                                    <span className="text-sm">Create</span>
                                    {!createMenuOpen && (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                    {createMenuOpen && (
                                        <ChevronUp className="w-4 h-4" />
                                    )}
                                </button>
                            )}

                            {/* Create Menu Dropdown --desktop */}
                            {createMenuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111] border border-gray-100 dark:border-[#333] rounded-lg shadow-lg py-2 z-50">
                                    {createOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors group
                                                ${loading ? "pointer-events-none opacity-70" : ""}`}
                                            onClick={() => {
                                                handlePostCreate(option);
                                            }}
                                            disabled={loading}
                                        >
                                            <div
                                                className={`p-2 rounded-full ${option.color}`}
                                            >
                                                {loading ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <option.icon className="w-4 h-4 text-white" />
                                                )}
                                            </div>
                                            <span className="flex items-center justify-center gap-3">
                                                {loading
                                                    ? "Loading..."
                                                    : option.label}{" "}
                                                {!loading && (
                                                    <Plus className="w-4 h-4 opacity-0 group-hover:opacity-[100] transition-all duration-150 text-stone-700 dark:text-stone-200" />
                                                )}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:hidden flex items-center justify-center gap-2">
                        {/* mobile create button */}
                        {currentUser && (
                            <button
                                onClick={() =>
                                    setCreateMenuOpen(!createMenuOpen)
                                }
                                className="w-fit p-1 flex items-center justify-center bg-black text-white rounded-full hover:bg-stone-800/90 transition-colors dark:invert"
                            >
                                {createMenuOpen ? (
                                    <X className="w-4 h-4" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                            </button>
                        )}

                        {/* mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 hover:bg-white/50 rounded-sm transition-colors dark:hover:bg-[#222]/50"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6 text-stone-600 dark:text-gray-200" />
                            ) : (
                                <Menu className="h-6 w-6 text-stone-600 dark:text-gray-200" />
                            )}
                        </button>

                        {/* mobile phones */}
                        {createMenuOpen && (
                            <div
                                className="absolute top-20 right-0 w-64 bg-white border border-gray-100
                                rounded-lg shadow-lg py-2 z-50 dark:bg-[#111] dark:border-[#333]"
                            >
                                {createOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50
                                        dark:hover:bg-[#333] transition-colors group ${loading ? "pointer-events-none opacity-70" : ""}`}
                                        onClick={() => {
                                            handlePostCreate(option);
                                        }}
                                        disabled={loading}
                                    >
                                        <div
                                            className={`p-2 rounded-full ${option.color}`}
                                        >
                                            {loading ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <option.icon className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <span className="flex items-center justify-center gap-3">
                                            {loading
                                                ? "Loading..."
                                                : option.label}{" "}
                                            {!loading && (
                                                <Plus className="w-4 h-4 opacity-0 group-hover:opacity-[100] transition-all duration-150 text-stone-700 dark:text-stone-200" />
                                            )}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>

                {/* mobile menu */}
                <div
                    className={`md:hidden absolute left-0 right-0 bg-white dark:bg-[#111] backdrop-blur-md border-b border-stone-200/50 dark:border-stone-700/50 transition-all duration-300 ease-in-out ${
                        isMenuOpen
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-2 pointer-events-none"
                    }`}
                >
                    <div className="px-4 py-6 space-y-6">
                        {/* mobile nav links */}
                        <div className="flex flex-col">
                            {navLinks.map((link, index) => (
                                <button
                                    key={index}
                                    className="py-2 pl-4 rounded-lg text-stone-600 dark:text-gray-300 hover:text-stone-800 dark:hover:text-gray-200 hover:bg-lime-300/50 transition-colors"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        navigate(link.href);
                                    }}
                                >
                                    {link.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
