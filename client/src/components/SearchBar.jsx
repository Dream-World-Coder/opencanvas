import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useState } from "react";

export default function SearchBar({ round = false, hideSubmitBtn = false }) {
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="hidden md:flex w-[150px] md:w-auto max-w-[200px] items-center space-x-2"
    >
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search"
          className={`pl-9 shadow-none border-gray-200 dark:border-[#333] ${
            round ? "rounded-full" : ""
          } ${
            loading
              ? "opacity-60 pointer-events-none cursor-wait"
              : "opacity-90"
          }`}
        />
      </div>

      {/* have changed the component for lime ring on focus, focus-visible:ring-lime-400 */}
      {!hideSubmitBtn && (
        <button
          type="submit"
          disabled={loading}
          className="flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed dark:text-[#f7f7f7]"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
        </button>
      )}
    </form>
  );
}
