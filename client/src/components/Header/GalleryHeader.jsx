import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Menu, Plus, ChevronUp, ChevronDown, Filter } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createOptions } from "./createOptions";
import SearchBar from "../SearchBar";
import { useDataService } from "../../services/dataService";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Header = ({ filters }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [createMenuOpen, setCreateMenuOpen] = useState(false);
    const { currentUser } = useAuth();
    const { getNewPostId } = useDataService();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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

    let navLinks = [{ name: "Articles", href: "/articles" }];
    if (!currentUser) {
        navLinks.push({ name: "Login", href: "/login" });
    }
    if (currentUser) {
        navLinks.push({ name: "Profile", href: "/profile" });
    }

    return (
        <header className="fixed top-0 w-full bg-white z-50 border-b border-gray-100 dark:bg-[#111] dark:border-[#222] dark:text-white">
            <div className="max-w-7xl mx-auto px-3 py-3 md:px-0 md:py-2">
                <div className="flex flex-row justify-between items-center">
                    <h1 className="text-lg md:text-2xl font-stardom font-semibold tracking-tight">
                        Literature Gallery
                        {/* desktop filters */}
                        <div className="hidden md:flex items-center space-x-6">
                            <div className="items-center space-x-4">
                                {filters.map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() =>
                                            setSelectedFilter(filter)
                                        }
                                        className={`text-sm font-sans capitalize ${
                                            selectedFilter === filter
                                                ? "text-black font-medium dark:text-white"
                                                : "text-gray-400 hover:text-gray-600 font-thin dark:text-[#f1f1f1] dark:hover:text-[#f1f1f1]"
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </h1>

                    {/* desktop search & create */}
                    <div className="hidden md:flex items-center space-x-2">
                        <SearchBar round={true} hideSubmitBtn={true} />

                        {navLinks.map((link, index) => (
                            <React.Fragment key={index}>
                                <button
                                    onClick={() => navigate(link.href)}
                                    className={`text-stone-600 hover:text-stone-800 dark:text-[#f1f1f1] dark:hover:text-[#f1f1f1]
                                                    ${link.href !== "/profile" ? "hover:bg-lime-300/50" : ""}
                                                    box-content px-3 py-1 rounded-lg transition-all text-sm flex items-center`}
                                >
                                    {link.href !== "/profile" ? (
                                        link.name
                                    ) : (
                                        <Avatar>
                                            <AvatarImage
                                                src={currentUser.profilePicture}
                                                alt={`${currentUser.username}`}
                                            />
                                            <AvatarFallback>
                                                {currentUser.fullName
                                                    .slice(0, 2)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </button>
                                {index !== navLinks.length - 1 && (
                                    <span className="text-lime-300 flex items-center">
                                        •
                                    </span>
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
                                    <span>Create</span>
                                    {!createMenuOpen && (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                    {createMenuOpen && (
                                        <ChevronUp className="w-4 h-4" />
                                    )}
                                </button>
                            )}

                            {/* create menu dropdown -- desktop */}
                            {createMenuOpen && (
                                <div className="hidden md:block absolute right-0 mt-2 w-64 bg-white dark:bg-[#111] border border-gray-100 dark:border-[#333] rounded-lg shadow-lg py-2 z-50">
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

                    {/* mobile options */}
                    <div className="flex md:hidden items-center justify-center gap-3">
                        <Filter
                            className="md:hidden size-4"
                            onClick={() => {
                                setMobileFilterOpen(!mobileFilterOpen);
                            }}
                        />

                        {/* Mobile Create Button */}
                        {currentUser && (
                            <button
                                onClick={() =>
                                    setCreateMenuOpen(!createMenuOpen)
                                }
                                className="text-black dark:text-white"
                            >
                                {createMenuOpen ? (
                                    <X className="size-5" />
                                ) : (
                                    <Plus className="size-5" />
                                )}
                            </button>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden hover:bg-white/50 rounded-sm transition-colors dark:hover:bg-[#333]/50"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <X className="size-5 text-stone-600 dark:text-gray-300" />
                            ) : (
                                <Menu className="size-5 text-stone-600 dark:text-gray-300" />
                            )}
                        </button>
                    </div>
                </div>

                {mobileFilterOpen && (
                    <div className="flex flex-col md:hidden items-center justify-center space-x-4">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                className={`text-lg font-sans capitalize ${
                                    selectedFilter === filter
                                        ? "text-black font-medium dark:text-[#fff]"
                                        : "text-gray-400 hover:text-gray-600 font-thind dark:text-[#f1f1f1] dark:hover:text-[#f1f1f1]"
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                )}
                {/* mobile create menu open */}
                {createMenuOpen && (
                    <div className="md:hidden absolute right-0 mt-2 w-64 bg-white dark:bg-[#111] border border-gray-100 dark:border-[#333] rounded-lg shadow-lg py-2 z-50">
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
                                    {loading ? "Loading..." : option.label}{" "}
                                    {!loading && (
                                        <Plus className="w-4 h-4 opacity-0 group-hover:opacity-[100] transition-all duration-150 text-stone-700 dark:text-stone-200" />
                                    )}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
                <div
                    className={`md:hidden absolute left-0 right-0 bg-white dark:bg-[#111] backdrop-blur-md
                        border-b border-stone-200/50 dark:border-stone-700/50 transition-all duration-300 ease-in-out ${
                            isMenuOpen
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 -translate-y-2 pointer-events-none"
                        }`}
                >
                    <div className="px-4 py-2 space-y-2">
                        {/* mobile nav links */}
                        <div className="flex flex-col">
                            {navLinks.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        navigate(link.href);
                                        setIsMenuOpen(false);
                                    }}
                                    className="py-2 pl-4 rounded-lg text-stone-600 dark:text-gray-300 hover:text-stone-800 hover:bg-gray-300/30 transition-colors text-left w-full"
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
