const generateGalleryItems = (count) => {
    const baseItems = [
        {
            type: "photography",
            title: "Urban Symmetry",
            artist: "Sarah Winters",
            likes: 234,
            comments: 12,
            size: "large",
        },
        {
            type: "art",
            title: "Abstract Dreams",
            artist: "James Lee",
            likes: 156,
            comments: 8,
            size: "tall",
        },
        {
            type: "digital",
            title: "Neon Nights",
            artist: "Elena Costa",
            likes: 189,
            comments: 15,
            size: "tall",
        },
        {
            type: "photography",
            title: "Natural Patterns",
            artist: "Mark Rivers",
            likes: 267,
            comments: 23,
            size: "large",
        },
        {
            type: "collections",
            title: "City Life",
            artist: "Sarah Winters",
            likes: 345,
            comments: 19,
            size: "wide",
        },
        {
            type: "art",
            title: "Color Theory",
            artist: "Ana White",
            likes: 198,
            comments: 27,
            size: "large",
        },
        {
            type: "photography",
            title: "Geometric Patterns",
            artist: "Lisa Chen",
            likes: 178,
            comments: 14,
            size: "wide",
        },
        {
            type: "digital",
            title: "Digital Waves",
            artist: "Mike Peterson",
            likes: 145,
            comments: 9,
            size: "default",
        },
    ];

    const galleryItems = [];
    for (let i = 1; i <= count; i++) {
        const baseItem = baseItems[(i - 1) % baseItems.length];
        galleryItems.push({
            id: i,
            src: `https://picsum.photos/800?random=${i}`,
            type: baseItem.type,
            title: `${baseItem.title} ${i}`,
            artist: baseItem.artist,
            likes: baseItem.likes + Math.floor(Math.random() * 50),
            comments: baseItem.comments + Math.floor(Math.random() * 10),
            size: baseItem.size,
            featured: i % 5 === 0, // Every 5th item is featured
        });
    }
    return galleryItems;
};

const galleryItems = generateGalleryItems(50);
console.log(galleryItems);

// Optionally, write this array to a file for use in your project.
// Example: Save to `GalleryItems.js` file.
