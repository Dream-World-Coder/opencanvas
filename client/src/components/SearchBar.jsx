import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useState } from "react";

export default function SearchBar() {
    const [loading, setLoading] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => setLoading(false), 2000); // Simulate loading process
    };

    return (
        <form
            onSubmit={handleSearch}
            className="flex w-[150px] md:w-full max-w-sm items-center space-x-2"
        >
            <Input
                type="text"
                placeholder="Search"
                className={`shadow-none dark:border-[#333]
                    ${
                        loading
                            ? "opacity-60 pointer-events-none cursor-wait"
                            : "opacity-100"
                    }`}
            />
            {/* have changed the component for lime ring on focus, focus-visible:ring-lime-400 */}
            <button
                type="submit"
                disabled={loading}
                className="flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed dark:text-[#f7f7f7]"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
            </button>
        </form>
    );
}
