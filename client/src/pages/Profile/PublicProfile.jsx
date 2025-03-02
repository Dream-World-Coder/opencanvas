import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowUpRight,
    Share2,
    Grid,
    Rows,
    Heart,
    MessageCircle,
} from "lucide-react";
import ProfileHeader from "../../components/Header/ProfileHeader";
// import ProfileFooter from "../../components/Footer/ProfileFooter";
import PropTypes from "prop-types";
// import { useAuth } from "../../contexts/AuthContext";

const Profile = ({ bgClr = "bg-cream-light" }) => {
    const [currentProfile, setCurrentProfile] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const { username } = useParams();
    const navigate = useNavigate();

    const [viewMode, setViewMode] = useState("grid");
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        async function fetchCurrentProfile(username) {
            if (!username) {
                navigate("/404");
                return;
            }

            const apiUrl = `http://127.0.0.1:3000/auth/u/${username}`;
            setIsLoading(true);

            try {
                const res = await fetch(apiUrl);

                if (!res.ok) {
                    navigate("/404");
                    return;
                }

                const data = await res.json();
                setCurrentProfile(data.user);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCurrentProfile(username);
    }, [username, navigate]);

    if (isLoading) return <div>Loading...</div>;
    if (!currentProfile) return null;

    const userStats = [
        { name: "POSTS", amount: currentProfile.posts.length },
        { name: "TOTAL LIKES", amount: currentProfile.totalLikes },
        { name: "FOLLOWERS", amount: currentProfile.noOfFollowers },
        { name: "FOLLOWING", amount: currentProfile.noOfFollowing },
    ];

    let collections = [];
    let posts = [];

    if (currentProfile) {
        collections = currentProfile.collections || [];
        posts = currentProfile.posts || [];
    }

    return (
        <div className={`min-h-screen ${bgClr} font-sans`}>
            {/* Navigation */}
            <ProfileHeader />

            {/* Profile Header */}
            <main className="pt-32 px-8">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid md:grid-cols-[1.6fr,1fr] gap-16 mb-24">
                        {/* Left Column with Profile Pic */}
                        <div className="space-y-8">
                            <div className="flex items-center space-x-8">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                                        <img
                                            src={`/defaults/profile.jpeg`} // currentProfile.profilePicture
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h1
                                        className="text-5xl md:text-7xl font-boska leading-[0.95] tracking-tighter
                                        pointer-events-none md:pointer-events-auto uppercase"
                                    >
                                        {currentProfile.fullName}
                                        <span className="block text-2xl md:text-5xl font-bold md:font-normal tracking-normal md:tracking-tighter italic capitalize leading-[1.7rem]">
                                            {currentProfile.tagline}
                                        </span>
                                    </h1>
                                </div>
                            </div>
                            {currentProfile.aboutMe && (
                                <p
                                    className="text-stone-700 font-boskaLight font-bold md:font-normal
                                text-lg md:text-2xl leading-tight tracking-normal
                                max-w-xl pointer-events-none md:pointer-events-auto"
                                >
                                    &quot; {currentProfile.aboutMe} &quot;
                                </p>
                            )}
                        </div>

                        {/* Right Column - Quick Stats */}
                        <div className="space-y-3 pt-4">
                            {userStats.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center border-b border-gray-200 py-3 pr-4"
                                >
                                    <span className="text-gray-500 text-sm md:text-md">
                                        {item.name}
                                    </span>
                                    <span>{item.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Collections Carousel */}
                    {collections.length > 0 && (
                        <div className="mb-24">
                            <h2 className="text-2xl font-semibold tracking-tight mb-8">
                                <span className="bg-inherit hover:bg-lime-100 rounded-md box-content px-2 py-1">
                                    Featured Works
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {collections.map((collection) => (
                                    <div
                                        key={collection.id}
                                        className="group cursor-pointer"
                                    >
                                        <div className="relative aspect-square overflow-hidden mb-4">
                                            <img
                                                src={collection.cover}
                                                alt={collection.title}
                                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                            />
                                            {/* dark inset on hover */}
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                {/* <Share2 className="w-6 h-6 text-white" /> */}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-medium mb-1 flex justify-between">
                                            {collection.title}
                                            <Share2 className="w-6 h-6 text-black rounded-lg p-1 hover:bg-yellow-200" />
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {collection.items}{" "}
                                            {collection.type === "album"
                                                ? "photos"
                                                : "pieces"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* post viewing options */}
                    {posts.length > 0 && (
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex space-x-8">
                                <button
                                    onClick={() => setActiveTab("all")}
                                    className={`pb-2 ${activeTab === "all" ? "border-b-2 border-black" : ""}`}
                                >
                                    All Works
                                </button>
                                <button
                                    onClick={() => setActiveTab("photos")}
                                    className={`pb-2 ${activeTab === "photos" ? "border-b-2 border-black" : ""}`}
                                >
                                    Photos
                                </button>
                                <button
                                    onClick={() => setActiveTab("stories")}
                                    className={`pb-2 ${activeTab === "stories" ? "border-b-2 border-black" : ""}`}
                                >
                                    Stories
                                </button>
                            </div>
                            <div className="hidden md:flex space-x-4">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 ${viewMode === "grid" ? "bg-black text-white" : "text-gray-400"}`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode("rows")}
                                    className={`p-2 ${viewMode === "rows" ? "bg-black text-white" : "text-gray-400"}`}
                                >
                                    <Rows className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* posts */}
                    <div
                        className={`grid gap-8 mb-24 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
                    >
                        {posts.map((post) => (
                            <div key={post.id} className="group cursor-pointer">
                                {post.type === "photo" ? (
                                    // Photo Post
                                    <div className="space-y-4">
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <Share2 className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-medium">
                                                {post.title}
                                            </h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                <div className="flex items-center">
                                                    <Heart className="w-4 h-4 mr-1" />
                                                    {post.likes}
                                                </div>
                                                <div className="flex items-center">
                                                    <MessageCircle className="w-4 h-4 mr-1" />
                                                    {post.comments}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Text Post
                                    <div className="p-6 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-medium">
                                                {post.title}
                                            </h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                <div className="flex items-center">
                                                    <Heart className="w-4 h-4 mr-1" />
                                                    {post.likes}
                                                </div>
                                                <div className="flex items-center">
                                                    <MessageCircle className="w-4 h-4 mr-1" />
                                                    {post.comments}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            {post.preview}
                                        </p>
                                        <div className="flex items-center text-sm">
                                            Read more
                                            <ArrowUpRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* <ProfileFooter /> */}
        </div>
    );
};

Profile.propTypes = {
    bgClr: PropTypes.string,
};

export default Profile;
