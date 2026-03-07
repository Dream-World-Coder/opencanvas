import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Search, Loader2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import Header from "../../components/Header/Header";
import { slugify } from "@/pages/Create/Editor/hooks/useWritingPad";
import PropTypes from "prop-types";

// ::::: Search Results Page :::::
//
// Route: /search?q=...&type=users|posts|all
//
// Fetches from GET /search on mount and whenever the query changes.
// Tab switching (All / Users / Posts) is purely client-side - no extra requests.

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authAxios } = useAuth();

  const query = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(query);

  // { users: [], posts: [] }
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // "all" | "users" | "posts"
  const [activeTab, setActiveTab] = useState("all");

  // Fetch whenever the URL query changes
  useEffect(() => {
    if (!query) return;
    setInputValue(query); // Keep input in sync with URL
    fetchResults(query);
  }, [query]);

  const fetchResults = async (q) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAxios.get(
        `/search?q=${encodeURIComponent(q)}&type=all`,
      );
      setResults(res.data.data); // { users, posts }
    } catch (err) {
      console.log("search error", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submitting the inline search bar updates the URL, which triggers the effect above
  const handleSearch = (e) => {
    e.preventDefault();
    const q = inputValue.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  // Derived lists based on active tab
  const users = results?.users || [];
  const posts = results?.posts || [];

  const tabs = [
    { key: "all", label: "All" },
    { key: "users", label: `People (${users.length})` },
    { key: "posts", label: `Posts (${posts.length})` },
  ];

  return (
    <>
      <Header
        noBlur={true}
        ballClr="text-gray-300"
        exclude={["/about", "/contact", "/photo-gallery", "/articles"]}
        noShadow={true}
        borderClrLight="border-gray-100"
        abs={true}
        searchBarHidden={true}
      />

      <div className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 px-4 py-10 max-w-2xl mx-auto">
        {/* ── Search bar ────────────────────────────────────────────────────── */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search people or posts..."
              className="pl-9 shadow-none border-gray-200 dark:border-[#333]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-md bg-lime-400 text-black hover:bg-lime-300 transition-colors"
          >
            Search
          </button>
        </form>

        {/* ── Query heading ─────────────────────────────────────────────────── */}
        {query && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Results for{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              &quot;{query}&quot;
            </span>
          </p>
        )}

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        {results && (
          <div className="flex gap-1 mb-6 border-b border-gray-100 dark:border-[#222]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-lime-400 text-lime-500"
                    : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Loading ───────────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-gray-400 w-6 h-6" />
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────────────── */}
        {error && (
          <p className="text-center text-red-500 py-10 text-sm">{error}</p>
        )}

        {/* ── Empty query prompt ────────────────────────────────────────────── */}
        {!query && !loading && (
          <p className="text-center text-gray-400 py-16 text-sm">
            Type something to search for people or posts.
          </p>
        )}

        {/* ── Results ───────────────────────────────────────────────────────── */}
        {!loading && results && (
          <>
            {/* Users section */}
            {(activeTab === "all" || activeTab === "users") && (
              <section className="mb-8">
                {activeTab === "all" && (
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    People
                  </h2>
                )}
                {users.length === 0 ? (
                  <p className="text-sm text-gray-400">No people found.</p>
                ) : (
                  <ul className="space-y-3">
                    {users.map((user) => (
                      <UserCard key={user._id} user={user} />
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* Posts section */}
            {(activeTab === "all" || activeTab === "posts") && (
              <section>
                {activeTab === "all" && (
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    Posts
                  </h2>
                )}
                {posts.length === 0 ? (
                  <p className="text-sm text-gray-400">No posts found.</p>
                ) : (
                  <ul className="space-y-3">
                    {posts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </ul>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ::::: User Card :::::

function UserCard({ user }) {
  return (
    <li>
      <Link
        to={`/u/${user.username}`}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
      >
        {/* Avatar */}
        <img
          src={user.profilePicture}
          alt={user.fullName || user.username}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />

        {/* Info */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {user.fullName || user.username}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            @{user.username}
            {user.designation ? ` · ${user.designation}` : ""}
          </p>
        </div>
      </Link>
    </li>
  );
}
UserCard.propTypes = {
  user: PropTypes.object,
};

// ::::: Post Card :::::

function PostCard({ post }) {
  return (
    <li>
      <Link
        to={`/p/${slugify(post.title)}-${post._id}`}
        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
      >
        {/* Thumbnail or fallback icon */}
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-14 h-14 rounded-md object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-md bg-gray-100 dark:bg-[#222] flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
        )}

        {/* Info */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
            {post.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {post.authorSnapshot?.fullName || post.authorSnapshot?.username}
            {post.readTime ? ` · ${post.readTime}` : ""}
          </p>
        </div>
      </Link>
    </li>
  );
}
PostCard.propTypes = {
  post: PropTypes.object,
};
