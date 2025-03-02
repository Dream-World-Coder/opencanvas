import { useState } from "react";
import {
    Book,
    FilePenLine,
    NotebookPen,
    Library,
    Pen,
    Camera,
    ChevronUp,
    ChevronDown,
    Plus,
    Menu,
    X,
} from "lucide-react";

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

const navLinks = [
    { href: "/gallery/photos", label: "Gallery" },
    { href: "/gallery/literature", label: "Stories" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

const createOptions = [
    {
        id: "poem",
        href: "/createpost/poem",
        icon: Pen,
        label: "New Poem",
        color: "bg-purple-500",
    },
    {
        id: "story",
        href: "/createpost/story",
        icon: FilePenLine,
        label: "New Story",
        color: "bg-blue-500",
    },
    {
        id: "article",
        href: "#",
        icon: NotebookPen,
        label: "New Article",
        color: "bg-amber-500",
    },
    {
        id: "picture",
        href: "/createpost/image",
        icon: Camera,
        label: "Upload Picture",
        color: "bg-emerald-500",
    },
    {
        id: "mybook",
        href: "#",
        icon: Book,
        label: "Create Book",
        color: "bg-indigo-500",
    },
    {
        id: "collection",
        href: "#",
        icon: Library,
        label: "Create Collection",
        color: "bg-rose-500",
    },
];

export default function ProfileHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [createMenuOpen, setCreateMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 w-full bg-white z-50 border-b border-gray-100">
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
                        <a
                            key={index}
                            href={link.href}
                            className={`px-3 py-1 box-content rounded-md hover:opacity-70 hover:bg-lime-300`}
                        >
                            {link.label}
                        </a>
                    ))}

                    <AlertDialog>
                        <AlertDialogTrigger className="hover:bg-red-300/80 rounded-md px-3 py-1 box-content">
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
                                        window.location.href = "/logout";
                                    }}
                                >
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Create Button with Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setCreateMenuOpen(!createMenuOpen)}
                            className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full hover:bg-stone-800/90 transition-colors"
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
                            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50">
                                {createOptions.map((option) => (
                                    <a
                                        key={option.id}
                                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                                        onClick={() => {
                                            setCreateMenuOpen(false);
                                            // Handle creation...
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
                </div>
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                    {mobileMenuOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
            </div>
            {/* mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100">
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
                        {/* Mobile Create Button */}
                        <button
                            onClick={() => setCreateMenuOpen(!createMenuOpen)}
                            className="w-full mt-4 flex items-center justify-center space-x-2 bg-black text-white px-4 py-2 rounded-full hover:bg-stone-800/90 transition-colors"
                        >
                            <span>Create</span>
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
