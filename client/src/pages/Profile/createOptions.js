import { Book, BookOpen, Images, Library, Files, Camera } from "lucide-react";

const createOptions = [
    {
        id: "poem",
        href: "/new/poem",
        icon: Book,
        label: "New Poem",
        color: "bg-purple-500",
    },
    {
        id: "story",
        href: "/new/story",
        icon: BookOpen,
        label: "New Story",
        color: "bg-blue-500",
    },
    {
        id: "picture",
        href: "/new/picture",
        icon: Camera,
        label: "Upload Picture",
        color: "bg-emerald-500",
    },
    {
        id: "album",
        href: "#",
        icon: Images,
        label: "Create Album",
        color: "bg-amber-500",
    },
    {
        id: "collection",
        href: "#",
        icon: Files,
        label: "New Collection",
        color: "bg-rose-500",
    },
    {
        id: "mybook",
        href: "#",
        icon: Library,
        label: "Create Book",
        color: "bg-indigo-500",
    },
];

export default createOptions;
