import { Book, FilePenLine, NotebookPen, Pen, Microscope } from "lucide-react";

// Each option maps to a post type the user can create.
// The `type` query param is passed to the editor so it can tailor the UI.
// Note: post-type behaviour in the editor is not implemented yet — leave `type` in the URL for now.
export const createOptions = [
  {
    id: "story",
    type: "story",
    icon: FilePenLine,
    label: "New Story",
    color: "bg-lime-500",
  },
  {
    id: "poem",
    type: "poem",
    icon: Pen,
    label: "New Poem",
    color: "bg-green-500",
  },
  {
    id: "article",
    type: "article",
    icon: NotebookPen,
    label: "New Article",
    color: "bg-emerald-500",
  },
  {
    id: "research-paper",
    type: "research-paper",
    icon: Microscope,
    label: "Research Paper",
    color: "bg-teal-500",
  },
  {
    id: "mybook",
    type: "book",
    icon: Book,
    label: "New Book",
    color: "bg-cyan-500",
  },
];
