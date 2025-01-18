import { useState } from "react";
import { Grid, Columns, Share2, Heart, Layout, Menu, X } from "lucide-react";
import PropTypes from "prop-types";
import galleryItems from "./Photos";

// good but doesnot match the rtheme iguess,
// use: 2 column design, small galleryitems, and description pannel,
// not too many photoes in a page, use max 2 or 4 per page, with description underneath
// current is overwhelming, that does not fit the theme

const GalleryPage = () => {
    const [layout, setLayout] = useState("masonry");
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const filters = ["all", "photography", "art", "digital", "collections"];

    const layouts = [
        { name: "masonry", icon: <Layout className="w-4 h-4" /> },
        { name: "grid", icon: <Grid className="w-4 h-4" /> },
        { name: "columns", icon: <Columns className="w-4 h-4" /> },
    ];

    const FilterButtons = () => (
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            {filters.map((filter) => (
                <button
                    key={filter}
                    onClick={() => {
                        setSelectedFilter(filter);
                        setIsMobileMenuOpen(false);
                    }}
                    className={`px-4 py-1 rounded-full text-sm capitalize transition-all whitespace-nowrap
                        ${
                            selectedFilter === filter
                                ? "bg-black text-white"
                                : "text-gray-400 hover:bg-gray-100"
                        }`}
                >
                    {filter}
                </button>
            ))}
        </div>
    );

    const LayoutToggle = () => (
        <div className="flex items-center gap-2">
            {layouts.map((layoutType) => (
                <button
                    key={layoutType.name}
                    onClick={() => {
                        setLayout(layoutType.name);
                        setIsMobileMenuOpen(false);
                    }}
                    // highlighting the selected layout
                    className={`p-2 rounded-lg transition-colors
                        ${
                            layout === layoutType.name
                                ? "bg-black text-white"
                                : "text-gray-400 hover:bg-gray-50"
                        }`}
                >
                    {layoutType.icon}
                </button>
            ))}
        </div>
    );

    const MobileMenu = () => (
        <div
            className={`
            fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
            <div className="flex flex-col h-full p-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-serif">Menu</h2>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm text-gray-500 mb-2">Filters</p>
                        <div className="flex flex-col gap-2">
                            {filters.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => {
                                        setSelectedFilter(filter);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-left text-sm capitalize transition-all
                                        ${
                                            selectedFilter === filter
                                                ? "bg-black text-white"
                                                : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-500 mb-2">Layout</p>
                        <LayoutToggle />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-40 border-b border-gray-100">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-4 sm:py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-serif">Gallery</h1>
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-8">
                            <FilterButtons />
                            <LayoutToggle />
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <MobileMenu />

            {/* Gallery Layout */}
            <main className="pt-20 sm:pt-28 px-4 sm:px-8 pb-24">
                <div className="max-w-[1600px] mx-auto">
                    <div
                        className={`
                            ${
                                layout === "masonry"
                                    ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6"
                                    : layout === "grid"
                                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                                      : "columns-1 md:columns-2 gap-4 sm:gap-6"
                            }
                            transition-all duration-500 ease-in-out
                        `}
                    >
                        {galleryItems
                            .filter(
                                (item) =>
                                    selectedFilter === "all" ||
                                    item.type === selectedFilter,
                            )
                            .map((item) => (
                                <GalleryItem
                                    key={item.id}
                                    item={item}
                                    layout={layout}
                                    isHovered={hoveredItem === item.id}
                                    onHover={() => setHoveredItem(item.id)}
                                    onLeave={() => setHoveredItem(null)}
                                />
                            ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

// its the photo container code
const GalleryItem = ({ item, layout, onHover, onLeave }) => {
    const getAspectRatio = () => {
        switch (item.size) {
            case "large":
                return "aspect-square";
            case "tall":
                return "aspect-[3/4]";
            case "wide":
                return "aspect-[4/3]";
            default:
                return "aspect-[5/6]";
        }
    };

    return (
        <div
            className={`
                    group relative
                    ${layout === "masonry" ? "mt-4 sm:mt-6 [&:nth-child(1)]:mt-0 break-inside-avoid" : ""}
                    transform transition-all duration-500 ease-out hover:z-10
                `}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
        >
            <div
                className={`
                    relative overflow-hidden rounded-lg
                    ${getAspectRatio()}
                    ${layout === "masonry" ? "w-full" : ""}
                    transition-transform duration-500 ease-out
                `}
            >
                <img
                    src={item.src}
                    alt={item.title}
                    className="object-cover w-full h-full transition-all duration-700 ease-out"
                />

                {/* Improved Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 ease-out">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out">
                        {/* Content Container with Backdrop Blur */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-[2px]">
                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                <h3 className="text-lg font-medium text-white mb-1">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-white/80">
                                    {item.artist}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                            <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transform -translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                <Heart className="w-4 h-4 text-white" />
                            </button>
                            <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transform -translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-200">
                                <Share2 className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

GalleryItem.propTypes = {
    item: PropTypes.object,
    layout: PropTypes.string,
    onHover: PropTypes.func,
    onLeave: PropTypes.func,
};

export default GalleryPage;
