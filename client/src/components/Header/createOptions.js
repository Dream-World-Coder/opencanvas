import {
  Book,
  FilePenLine,
  NotebookPen,
  Library,
  Pen,
  // Camera,
} from "lucide-react";

export const createOptions = [
  //social, type:social
  {
    id: "article",
    href: "/createpost/article",
    icon: NotebookPen,
    label: "New Article",
    color: "bg-amber-500",
  },
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
  // {
  //     id: "picture",
  //     href: "/createpost/image",
  //     icon: Camera,
  //     label: "Upload Picture",
  //     color: "bg-emerald-500",
  // },
  {
    id: "collection",
    href: "/createpost/collection",
    icon: Library,
    label: "Create Collection",
    color: "bg-rose-500",
  },
  {
    id: "mybook",
    href: "/createpost/book",
    icon: Book,
    label: "Create Book",
    color: "bg-indigo-500",
  },
];
