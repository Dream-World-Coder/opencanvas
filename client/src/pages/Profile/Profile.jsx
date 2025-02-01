import { useState } from "react";
import {
    ArrowUpRight,
    Share2,
    Grid,
    Rows,
    Plus,
    ChevronDown,
    Camera,
    Heart,
    MessageCircle,
    ChevronUp,
    Menu,
    X,
} from "lucide-react";
import posts from "./posts";
import collections from "./collections";
import createOptions from "./createOptions";

const Profile = ({ bgClr = "bg-cream-light" }) => {
    const [viewMode, setViewMode] = useState("grid");
    const [activeTab, setActiveTab] = useState("all");
    const [createMenuOpen, setCreateMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: "/gallery/photos", label: "Gallery" },
        { href: "/gallery/literature", label: "Stories" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
    ];

    const userStats = [
        { name: "COLLECTIONS", amount: "12" },
        { name: "TOTAL WORKS", amount: "68" },
        { name: "FOLLOWING", amount: "143" },
    ];

    return (
        <div className={`min-h-screen ${bgClr} font-sans`}>
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white z-50 border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto flex justify-between items-center px-8 py-6">
                    <a
                        href="/"
                        className="text-md md:text-2xl text-stone-950 bg-lime-400 tracking-normal font-thin rounded-md box-content p-1"
                    >
                        {/* OpenCanvas: font-stardom font-bold md:font-thin */}
                        <span className="font-['Six_Caps'] text-2xl tracking-wide">
                            <span className="font-[Smooch] text-lg">my</span>
                            opencanvas
                        </span>{" "}
                    </a>
                    <div className="hidden md:flex items-center space-x-5 text-[15px]">
                        {navLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                className="hover:opacity-70 hover:bg-lime-300 px-3 py-1 box-content rounded-md"
                            >
                                {link.label}
                            </a>
                        ))}

                        {/* Create Button with Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setCreateMenuOpen(!createMenuOpen)
                                }
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
                                    className="block px-4 py-2 hover:bg-lime-300 rounded-md"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </a>
                            ))}
                            {/* Mobile Create Button */}
                            <button
                                onClick={() =>
                                    setCreateMenuOpen(!createMenuOpen)
                                }
                                className="w-full mt-4 flex items-center justify-center space-x-2 bg-black text-white px-4 py-2 rounded-full hover:bg-stone-800/90 transition-colors"
                            >
                                <span>Create</span>
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Profile Header */}
            <main className="pt-32 px-8">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid md:grid-cols-[1.6fr,1fr] gap-16 mb-24">
                        {/* Left Column with Profile Pic */}
                        <div className="space-y-8">
                            <div className="flex items-center space-x-8">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                                        <img
                                            src="https://picsum.photos/96"
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <h1
                                        className="text-5xl md:text-7xl font-boska leading-[0.95] tracking-tighter
                                        pointer-events-none md:pointer-events-auto uppercase"
                                    >
                                        Mr. Lorem
                                        <span className="block text-2xl md:text-5xl font-bold md:font-normal tracking-normal md:tracking-tighter italic capitalize leading-[1.7rem]">
                                            visual artist and photographer
                                            {/* set max len 32 */}
                                        </span>
                                    </h1>
                                </div>
                            </div>
                            <p
                                className="text-stone-700 font-boskaLight font-bold md:font-normal
                                text-lg md:text-2xl leading-tight tracking-normal
                                max-w-xl pointer-events-none md:pointer-events-auto"
                            >
                                &quot; Capturing moments, crafting stories, and
                                creating visual poetry. Based in Amsterdam,
                                working worldwide. &quot;
                            </p>
                        </div>

                        {/* Right Column - Quick Stats */}
                        <div className="space-y-3 pt-4">
                            {userStats.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center border-b border-gray-200 py-3 pr-4"
                                >
                                    <span className="text-gray-500 text-sm md:text-md">
                                        {item.name}
                                    </span>
                                    <span>{item.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Collections Carousel */}
                    <div className="mb-24">
                        <h2 className="text-2xl font-semibold tracking-tight mb-8">
                            <span className="bg-inherit hover:bg-lime-100 rounded-md box-content px-2 py-1">
                                Featured Collections
                            </span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {collections.map((collection) => (
                                <div
                                    key={collection.id}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative aspect-square overflow-hidden mb-4">
                                        <img
                                            src={collection.cover}
                                            alt={collection.title}
                                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {/* dark inset on hover */}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            {/* <Share2 className="w-6 h-6 text-white" /> */}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-medium mb-1 flex justify-between">
                                        {collection.title}
                                        <Share2 className="w-6 h-6 text-black rounded-lg p-1 hover:bg-yellow-200" />
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {collection.items}{" "}
                                        {collection.type === "album"
                                            ? "photos"
                                            : "pieces"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content Tabs & View Toggle */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`pb-2 ${activeTab === "all" ? "border-b-2 border-black" : ""}`}
                            >
                                All Works
                            </button>
                            <button
                                onClick={() => setActiveTab("photos")}
                                className={`pb-2 ${activeTab === "photos" ? "border-b-2 border-black" : ""}`}
                            >
                                Photos
                            </button>
                            <button
                                onClick={() => setActiveTab("stories")}
                                className={`pb-2 ${activeTab === "stories" ? "border-b-2 border-black" : ""}`}
                            >
                                Stories
                            </button>
                        </div>
                        <div className="hidden md:flex space-x-4">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 ${viewMode === "grid" ? "bg-black text-white" : "text-gray-400"}`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode("rows")}
                                className={`p-2 ${viewMode === "rows" ? "bg-black text-white" : "text-gray-400"}`}
                            >
                                <Rows className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div
                        className={`grid gap-8 mb-24 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
                    >
                        {posts.map((post) => (
                            <div key={post.id} className="group cursor-pointer">
                                {post.type === "photo" ? (
                                    // Photo Post
                                    <div className="space-y-4">
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <Share2 className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-medium">
                                                {post.title}
                                            </h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                <div className="flex items-center">
                                                    <Heart className="w-4 h-4 mr-1" />
                                                    {post.likes}
                                                </div>
                                                <div className="flex items-center">
                                                    <MessageCircle className="w-4 h-4 mr-1" />
                                                    {post.comments}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Text Post
                                    <div className="p-6 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-medium">
                                                {post.title}
                                            </h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                <div className="flex items-center">
                                                    <Heart className="w-4 h-4 mr-1" />
                                                    {post.likes}
                                                </div>
                                                <div className="flex items-center">
                                                    <MessageCircle className="w-4 h-4 mr-1" />
                                                    {post.comments}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            {post.preview}
                                        </p>
                                        <div className="flex items-center text-sm">
                                            Read more
                                            <ArrowUpRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 w-full bg-white border-t border-gray-100">
                <div className="max-w-[1400px] mx-auto px-8 py-6 flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                        © 2025 All rights reserved
                    </div>
                    <button
                        onClick={() => {
                            window.scrollTo({
                                top: 0,
                                behavior: "smooth",
                            });
                        }}
                        className="flex items-center space-x-2 text-sm hover:opacity-70"
                    >
                        Back to top
                        <ArrowUpRight className="w-4 h-4 ml-0.5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Profile;
