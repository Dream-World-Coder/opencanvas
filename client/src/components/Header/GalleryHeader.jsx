import React, { useState } from "react";
import { X, Menu, Plus, ChevronUp, ChevronDown, Filter } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createOptions } from "./createOptions";
import SearchBar from "../SearchBar";

const Header = ({ filters }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [createMenuOpen, setCreateMenuOpen] = useState(false);
    const { currentUser } = useAuth();

    let navLinks = [];
    if (!currentUser) {
        navLinks.push({ name: "Login", href: "/login" });
    }
    if (currentUser) {
        navLinks.push({ name: "Profile", href: "/profile" });
    }

    return (
        <header className="fixed top-0 w-full bg-white z-50 border-b border-gray-100 dark:bg-[#111] dark:border-[#222] dark:text-white">
            <div className="max-w-7xl mx-auto px-3 py-0 md:px-0 md:py-2">
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
                                <a
                                    href={link.href}
                                    className={`text-stone-600 hover:text-stone-800 dark:text-[#f1f1f1] dark:hover:text-[#f1f1f1]
                                        ${link.href !== "/profile" ? "hover:bg-lime-300/50" : ""}
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
                                    <span className="text-lime-300 flex items-center">
                                        •
                                    </span>
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

                    {/* mobile options */}
                    <div className="flex md:hidden items-center justify-center gap-3">
                        <Filter
                            className="md:hidden size-4"
                            onClick={() => {
                                setMobileFilterOpen(!mobileFilterOpen);
                            }}
                        />

                        {/* Mobile Create Button */}
                        <button
                            onClick={() => setCreateMenuOpen(!createMenuOpen)}
                            className="text-black dark:text-white"
                        >
                            {createMenuOpen ? (
                                <X className="size-5" />
                            ) : (
                                <Plus className="size-5" />
                            )}
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden hover:bg-white/50 rounded-sm transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <X className="size-5 text-stone-600" />
                            ) : (
                                <Menu className="size-5 text-stone-600" />
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
                {createMenuOpen && (
                    <div className="flex flex-col md:hidden w-64 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50">
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
                <div
                    className={`md:hidden absolute left-0 right-0 bg-white backdrop-blur-md
                        border-b border-stone-200/50 transition-all duration-300 ease-in-out ${
                            isMenuOpen
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 -translate-y-2 pointer-events-none"
                        }`}
                >
                    <div className="px-4 py-6 space-y-6">
                        {/* mobile nav links */}
                        <div className="flex flex-col">
                            {navLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    className="py-2 pl-4 rounded-lg text-stone-600 hover:text-stone-800 hover:bg-gray-300/30 transition-colors"
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
