import { ArrowUpRight } from "lucide-react";

export default function ProfileFooter() {
    return (
        <footer className="hidden md:block relative w-full bg-white border-t border-gray-100 dark:invert">
            <div className="max-w-7xl mx-auto py-4 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                    © OPENCANVAS 2025 All rights reserved
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
