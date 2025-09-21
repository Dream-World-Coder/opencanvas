import {
  Book,
  FilePenLine,
  NotebookPen,
  Pen,
  Microscope,
  // Camera,
} from "lucide-react";

export const createOptions = [
  // {
  //     id: "picture",
  //     href: "/createpost/image",
  //     icon: Camera,
  //     label: "Upload Picture",
  //     color: "bg-emerald-500",
  // },
  {
    id: "story",
    href: "/createpost/story",
    icon: FilePenLine,
    label: "New Story",
    color: "bg-lime-500",
  },
  {
    id: "poem",
    href: "/createpost/poem",
    icon: Pen,
    label: "New Poem",
    color: "bg-green-500",
  },
  {
    id: "article",
    href: "/createpost/article",
    icon: NotebookPen,
    label: "New Article",
    color: "bg-emerald-500",
  },
  {
    id: "research-paper",
    href: "/createpost/research-paper",
    icon: Microscope,
    label: "Research Paper",
    color: "bg-teal-500",
  },
  {
    id: "mybook",
    href: "/createpost/book", // article + rp -> most complex
    icon: Book,
    label: "New Book",
    color: "bg-cyan-500",
  },
];
