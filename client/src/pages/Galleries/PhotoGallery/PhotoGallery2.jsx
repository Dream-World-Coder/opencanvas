import { useState } from "react";
import { Grid, Columns, Share2, Heart, MessageCircle } from "lucide-react";

const GalleryPage = () => {
    const [layout, setLayout] = useState("grid");
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [hoveredItem, setHoveredItem] = useState(null);

    const filters = ["all", "photography", "art", "digital", "collections"];

    const galleryItems = [
        {
            id: 1,
            type: "photography",
            title: "Urban Symmetry",
            artist: "Sarah Winters",
            likes: 234,
            comments: 12,
            featured: true,
        },
        {
            id: 2,
            type: "art",
            title: "Abstract Dreams",
            artist: "James Lee",
            likes: 156,
            comments: 8,
        },
        {
            id: 3,
            type: "digital",
            title: "Neon Nights",
            artist: "Elena Costa",
            likes: 189,
            comments: 15,
            featured: true,
        },
        {
            id: 4,
            type: "photography",
            title: "Natural Patterns",
            artist: "Mark Rivers",
            likes: 267,
            comments: 23,
        },
        {
            id: 5,
            type: "collections",
            title: "City Life",
            artist: "Sarah Winters",
            likes: 345,
            comments: 19,
        },
        {
            id: 6,
            type: "art",
            title: "Color Theory",
            artist: "Ana White",
            likes: 198,
            comments: 27,
            featured: true,
        },
        // Add more items as needed
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-50 border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Gallery
                        </h1>

                        {/* Filters */}
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-4">
                                {filters.map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() =>
                                            setSelectedFilter(filter)
                                        }
                                        className={`text-sm capitalize ${
                                            selectedFilter === filter
                                                ? "text-black font-medium"
                                                : "text-gray-400 hover:text-gray-600"
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>

                            {/* Layout Toggle */}
                            <div className="flex items-center space-x-2 border-l border-gray-200 pl-6">
                                <button
                                    onClick={() => setLayout("grid")}
                                    className={`p-2 rounded-lg transition-colors ${
                                        layout === "grid"
                                            ? "bg-black text-white"
                                            : "text-gray-400 hover:text-gray-600"
                                    }`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setLayout("columns")}
                                    className={`p-2 rounded-lg transition-colors ${
                                        layout === "columns"
                                            ? "bg-black text-white"
                                            : "text-gray-400 hover:text-gray-600"
                                    }`}
                                >
                                    <Columns className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Gallery Grid */}
            <main className="pt-32 px-6 pb-24">
                <div className="max-w-[1400px] mx-auto">
                    {/* Featured Items */}
                    {selectedFilter === "all" && (
                        <div className="mb-16">
                            <h2 className="text-lg font-medium mb-6">
                                Featured Works
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {galleryItems
                                    .filter((item) => item.featured)
                                    .map((item) => (
                                        <FeaturedItem
                                            key={item.id}
                                            item={item}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Main Gallery Grid */}
                    <div
                        className={`
            grid gap-8
            ${
                layout === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 md:grid-cols-2"
            }
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

const FeaturedItem = ({ item }) => (
    <div className="group cursor-pointer">
        <div className="relative aspect-square overflow-hidden mb-4">
            <img
                src={`https://picsum.photos/800/800`}
                alt={item.title}
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Share2 className="w-6 h-6 text-white" />
            </div>
        </div>
        <h3 className="text-lg font-medium mb-1">{item.title}</h3>
        <p className="text-sm text-gray-400 mb-2">by {item.artist}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {item.likes}
            </div>
            <div className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                {item.comments}
            </div>
        </div>
    </div>
);

const GalleryItem = ({ item, layout, isHovered, onHover, onLeave }) => (
    <div
        className="group cursor-pointer"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
    >
        <div
            className={`relative overflow-hidden mb-4 ${
                layout === "grid" ? "aspect-square" : "aspect-[3/4]"
            }`}
        >
            <img
                src={`https://picsum.photos/800/800`}
                alt={item.title}
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex items-center space-x-4">
                    <button className="p-2 bg-white rounded-full hover:bg-white/90 transition-colors">
                        <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-white rounded-full hover:bg-white/90 transition-colors">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
        <h3 className="text-lg font-medium mb-1">{item.title}</h3>
        <p className="text-sm text-gray-400">{item.artist}</p>
    </div>
);

export default GalleryPage;
