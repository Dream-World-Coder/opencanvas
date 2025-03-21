import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown, Plus, Menu, X, Settings } from "lucide-react";
import { createOptions } from "./createOptions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDataService } from "../../services/dataService";

const navLinks = [
    // { href: "/gallery/photos", label: "Gallery" },
    { href: "/gallery/literature", label: "Literature" },
    { href: "/articles", label: "Articles" },
    // { href: "/about", label: "About" },
    // { href: "/contact", label: "Contact" },
    { href: "/saved-posts", label: "Saved" },
    { href: "/profile", label: "Profile" },
];

export default function ProfileHeader() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [createMenuOpen, setCreateMenuOpen] = useState(false);
    const { getNewPostId } = useDataService();
    const [loading, setLoading] = useState(false);

    async function handlePostCreate(option) {
        setLoading(true);
        localStorage.removeItem("blogPost");
        localStorage.removeItem("newPostId");
        setCreateMenuOpen(false);
        let newPostId = await getNewPostId();
        localStorage.setItem("newPostId", newPostId);

        console.log(`newPostId writingPad: ${newPostId}`);

        window.location.href = option.href;
        setLoading(false);
    }

    return (
        <nav className="fixed top-0 w-full bg-white dark:bg-[#111] dark:text-white z-50 border-b border-gray-100 dark:border-[#222]">
            <div className="max-w-[1400px] mx-auto flex justify-between items-center px-8 py-6">
                <a
                    href="/"
                    className="text-base md:text-2xl text-stone-950 bg-lime-400 tracking-normal font-thin rounded-md box-content px-1 py-0 md:px-1 md:py-1"
                >
                    <span className="font-['Six_Caps'] text-lg md:text-2xl tracking-wide">
                        opencanvas
                    </span>
                </a>
                <div className="hidden md:flex items-center space-x-5 text-[15px]">
                    {navLinks.map((link, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                navigate(link.href);
                            }}
                            className={`px-3 py-1 box-content rounded-md hover:opacity-70 dark:hover:opacity-100 hover:bg-lime-300 dark:hover:bg-[#333]`}
                        >
                            {link.label}
                        </button>
                    ))}

                    <AlertDialog>
                        <AlertDialogTrigger className="hover:bg-red-300/80 dark:hover:bg-red-800/80 rounded-md px-3 py-1 box-content">
                            Logout
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you sure to logout?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will remove your current
                                    session. You can login later.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-500"
                                    onClick={() => {
                                        navigate("/logout");
                                    }}
                                >
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <button
                        className="size-6"
                        onClick={() => {
                            navigate("/profile/settings");
                        }}
                    >
                        <Settings />
                    </button>

                    {/* Create Button with Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setCreateMenuOpen(!createMenuOpen)}
                            className="flex items-center space-x-2 bg-black dark:bg-[#333] text-white px-4 py-2 rounded-full hover:bg-stone-800/90 dark:hover:bg-[#333] transition-colors"
                        >
                            <span>Create</span>
                            {!createMenuOpen && (
                                <ChevronDown className="w-4 h-4" />
                            )}
                            {createMenuOpen && (
                                <ChevronUp className="w-4 h-4" />
                            )}
                        </button>

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
                    {/* Mobile Create Button */}
                    <button
                        onClick={() => setCreateMenuOpen(!createMenuOpen)}
                        className="w-fit p-1 flex items-center justify-center bg-black text-white dark:bg-white dark:text-black rounded-full hover:bg-stone-800/90 transition-colors"
                    >
                        {createMenuOpen ? (
                            <X className="w-4 h-4" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>

                    {/* mobile */}
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
                                        {loading ? "Loading..." : option.label}{" "}
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
            {/* mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-[#111] border-t border-gray-100 dark:border-[#333]">
                    <div className="px-4 py-2 space-y-1">
                        {navLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                className="block px-4 py-2 hover:bg-lime-300/60 rounded-md"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                        <a
                            className="block px-4 py-2 hover:bg-lime-300/60 rounded-md"
                            href="/logout"
                        >
                            Settings
                        </a>
                        <a
                            className="block px-4 py-2 text-red-700 hover:bg-red-300/60 rounded-md"
                            href="/logout"
                        >
                            Logout
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
}
