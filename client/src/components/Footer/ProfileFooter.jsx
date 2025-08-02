import { ArrowUpRight } from "lucide-react";

export default function ProfileFooter() {
  const now = new Date();
  const year = now.getFullYear();
  return (
    <footer className="hidden md:block relative w-full bg-white border-t border-gray-100 dark:bg-[#222] dark:border-[#333]">
      <div className="max-w-7xl mx-auto py-4 flex justify-between items-center">
        <div className="text-sm text-gray-400">
          © OPENCANVAS {year} All rights reserved
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
  );
}
