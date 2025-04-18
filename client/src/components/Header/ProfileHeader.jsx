import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown, Plus, Menu, X, Settings } from "lucide-react";
import { createOptions } from "./createOptions";
import { useDataService } from "../../services/dataService";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

const navLinks = [
    { href: "/literature", label: "Literature" },
    { href: "/articles", label: "Articles" },
    { href: "/saved-posts", label: "Saved" },
    { href: "/profile", label: "Profile" },
];

export default function ProfileHeader() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [createMenuOpen, setCreateMenuOpen] = useState(false);
    const { getNewPostId } = useDataService();
    const [loading, setLoading] = useState(false);

    async function handlePostCreate(option) {
        setLoading(true);

        if (!currentUser) {
            toast.error("You need to log in first");

            setTimeout(() => {
                navigate("/login");
            }, 500);
        } else {
            localStorage.removeItem("blogPost");
            localStorage.removeItem("newPostId");
            setCreateMenuOpen(false);
            let newPostId = await getNewPostId();
            localStorage.setItem("newPostId", newPostId);
            navigate(option.href);
        }

        setLoading(false);
    }

    return (
        <nav className="fixed top-0 w-full bg-white dark:bg-gray-900 z-50 shadow-sm dark:shadow-none backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-4">
                {/* Logo */}
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center space-x-2 focus:outline-none"
                >
                    <span className="font-['Six_Caps'] bg-lime-400 text-lg md:text-2xl tracking-wide">
                        opencanvas
                    </span>
                </button>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1">
                    <div className="flex items-center mr-2 border border-gray-100 dark:border-gray-800 rounded-full px-1">
                        {navLinks.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => navigate(link.href)}
                                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-full hover:bg-lime-100 dark:hover:bg-gray-700 transition-all duration-200"
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => navigate("/profile/settings")}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
                    >
                        <Settings className="w-5 h-5" />
                    </button>

                    {/* Create Button with Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setCreateMenuOpen(!createMenuOpen)}
                            className="flex items-center space-x-2 bg-black dark:bg-lime-500 text-white dark:text-gray-900 px-4 py-2 rounded-full hover:opacity-90 transition-all duration-200 font-medium"
                        >
                            <span>Create</span>
                            {createMenuOpen ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </button>

                        {/* Create Menu Dropdown */}
                        {createMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-lg py-2 z-50 border border-gray-100 dark:border-gray-800 overflow-hidden">
                                {createOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                                        onClick={() => handlePostCreate(option)}
                                        disabled={loading}
                                    >
                                        <div
                                            className={`p-2 rounded-full ${option.color} mr-3`}
                                        >
                                            {loading ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <option.icon className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <span className="text-gray-800 dark:text-gray-200">
                                            {loading
                                                ? "Loading..."
                                                : option.label}
                                        </span>
                                        {!loading && (
                                            <Plus className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 text-gray-500 dark:text-gray-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Controls */}
                <div className="md:hidden flex items-center space-x-2">
                    {/* Mobile Create Button */}
                    <button
                        onClick={() => setCreateMenuOpen(!createMenuOpen)}
                        className="p-2 bg-lime-400 dark:bg-lime-500 text-black rounded-full hover:bg-lime-500 dark:hover:bg-lime-600 transition-all duration-200"
                    >
                        {createMenuOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>

                    {/* Mobile Create Menu */}
                    {createMenuOpen && (
                        <div className="absolute top-16 right-4 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-lg py-2 z-50 border border-gray-100 dark:border-gray-800 overflow-hidden">
                            {createOptions.map((option) => (
                                <button
                                    key={option.id}
                                    className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                                    onClick={() => handlePostCreate(option)}
                                    disabled={loading}
                                >
                                    <div
                                        className={`p-2 rounded-full ${option.color} mr-3`}
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <option.icon className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                    <span className="text-gray-800 dark:text-gray-200">
                                        {loading ? "Loading..." : option.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    <div className="p-4 space-y-1">
                        {navLinks.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    navigate(link.href);
                                    setMobileMenuOpen(false);
                                }}
                                className="block w-full px-4 py-3 text-left rounded-lg hover:bg-lime-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all duration-200"
                            >
                                {link.label}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                navigate("/profile/settings");
                                setMobileMenuOpen(false);
                            }}
                            className="block w-full px-4 py-3 text-left rounded-lg hover:bg-lime-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all duration-200"
                        >
                            Settings
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { ChevronUp, ChevronDown, Plus, Menu, X, Settings } from "lucide-react";
// import { createOptions } from "./createOptions";
// import { useDataService } from "../../services/dataService";
// import { useAuth } from "../../contexts/AuthContext";
// import { toast } from "sonner";

// const navLinks = [
//     { href: "/literature", label: "Literature" },
//     { href: "/articles", label: "Articles" },
//     { href: "/saved-posts", label: "Saved" },
//     { href: "/profile", label: "Profile" },
// ];

// export default function ProfileHeader() {
//     const { currentUser } = useAuth();
//     const navigate = useNavigate();
//     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//     const [createMenuOpen, setCreateMenuOpen] = useState(false);
//     const { getNewPostId } = useDataService();
//     const [loading, setLoading] = useState(false);

//     async function handlePostCreate(option) {
//         setLoading(true);

//         if (!currentUser) {
//             toast.error("you need to Log In first");

//             setTimeout(() => {
//                 navigate("/login");
//             }, 500);
//         } else {
//             localStorage.removeItem("blogPost");
//             localStorage.removeItem("newPostId");
//             setCreateMenuOpen(false);
//             let newPostId = await getNewPostId();
//             localStorage.setItem("newPostId", newPostId);
//             // console.log(`newPostId writingPad: ${newPostId}`);

//             navigate(option.href);
//         }

//         setLoading(false);
//     }

//     return (
//         <nav className="fixed top-0 w-full bg-white dark:bg-[#111] dark:text-white z-50 border-b border-gray-100 dark:border-[#333]">
//             <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-6">
//                 <button
//                     onClick={() => {
//                         navigate("/");
//                     }}
//                     className="text-base md:text-2xl text-stone-950 bg-lime-400 tracking-normal font-thin rounded-md box-content px-1 py-0 md:px-1 md:py-1"
//                 >
//                     <span className="font-['Six_Caps'] text-lg md:text-2xl tracking-wide">
//                         opencanvas
//                     </span>
//                 </button>
//                 <div className="hidden md:flex items-center space-x-5 text-[15px]">
//                     {navLinks.map((link, index) => (
//                         <button
//                             key={index}
//                             onClick={() => {
//                                 navigate(link.href);
//                             }}
//                             className={`px-3 py-1 box-content rounded-md hover:opacity-70 dark:hover:opacity-100 hover:bg-lime-300 dark:hover:bg-[#333]`}
//                         >
//                             {link.label}
//                         </button>
//                     ))}

//                     <button
//                         className="size-6"
//                         onClick={() => {
//                             navigate("/profile/settings");
//                         }}
//                     >
//                         <Settings />
//                     </button>

//                     {/* Create Button with Dropdown */}
//                     <div className="relative">
//                         <button
//                             onClick={() => setCreateMenuOpen(!createMenuOpen)}
//                             className="flex items-center space-x-2 bg-black dark:bg-[#333] text-white px-4 py-2 rounded-full hover:bg-stone-800/90 dark:hover:bg-[#333] transition-colors"
//                         >
//                             <span>Create</span>
//                             {!createMenuOpen && (
//                                 <ChevronDown className="w-4 h-4" />
//                             )}
//                             {createMenuOpen && (
//                                 <ChevronUp className="w-4 h-4" />
//                             )}
//                         </button>

//                         {/* Create Menu Dropdown --desktop */}
//                         {createMenuOpen && (
//                             <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111] border border-gray-100 dark:border-[#333] rounded-lg shadow-lg py-2 z-50">
//                                 {createOptions.map((option) => (
//                                     <button
//                                         key={option.id}
//                                         className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors group
//                                             ${loading ? "pointer-events-none opacity-70" : ""}`}
//                                         onClick={() => {
//                                             handlePostCreate(option);
//                                         }}
//                                         disabled={loading}
//                                     >
//                                         <div
//                                             className={`p-2 rounded-full ${option.color}`}
//                                         >
//                                             {loading ? (
//                                                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                                             ) : (
//                                                 <option.icon className="w-4 h-4 text-white" />
//                                             )}
//                                         </div>
//                                         <span className="flex items-center justify-center gap-3">
//                                             {loading
//                                                 ? "Loading..."
//                                                 : option.label}{" "}
//                                             {!loading && (
//                                                 <Plus className="w-4 h-4 opacity-0 group-hover:opacity-[100] transition-all duration-150 text-stone-700 dark:text-stone-200" />
//                                             )}
//                                         </span>
//                                     </button>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <div className="md:hidden flex items-center justify-center gap-2">
//                     {/* Mobile Create Button */}
//                     <button
//                         onClick={() => setCreateMenuOpen(!createMenuOpen)}
//                         className="w-fit p-1 flex items-center justify-center bg-black text-white dark:bg-white dark:text-black rounded-full hover:bg-stone-800/90 transition-colors"
//                     >
//                         {createMenuOpen ? (
//                             <X className="w-4 h-4" />
//                         ) : (
//                             <Plus className="w-4 h-4" />
//                         )}
//                     </button>

//                     {/* Mobile Menu Button */}
//                     <button
//                         onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                         className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
//                     >
//                         {mobileMenuOpen ? (
//                             <X className="w-6 h-6" />
//                         ) : (
//                             <Menu className="w-6 h-6" />
//                         )}
//                     </button>

//                     {/* mobile */}
//                     {createMenuOpen && (
//                         <div
//                             className="absolute top-20 right-0 w-64 bg-white border border-gray-100
//                             rounded-lg shadow-lg py-2 z-50 dark:bg-[#111] dark:border-[#333]"
//                         >
//                             {createOptions.map((option) => (
//                                 <button
//                                     key={option.id}
//                                     className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50
//                                     dark:hover:bg-[#333] transition-colors group ${loading ? "pointer-events-none opacity-70" : ""}`}
//                                     onClick={() => {
//                                         handlePostCreate(option);
//                                     }}
//                                     disabled={loading}
//                                 >
//                                     <div
//                                         className={`p-2 rounded-full ${option.color}`}
//                                     >
//                                         {loading ? (
//                                             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                                         ) : (
//                                             <option.icon className="w-4 h-4 text-white" />
//                                         )}
//                                     </div>
//                                     <span className="flex items-center justify-center gap-3">
//                                         {loading ? "Loading..." : option.label}{" "}
//                                         {!loading && (
//                                             <Plus className="w-4 h-4 opacity-0 group-hover:opacity-[100] transition-all duration-150 text-stone-700 dark:text-stone-200" />
//                                         )}
//                                     </span>
//                                 </button>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>
//             {/* mobile menu */}
//             {mobileMenuOpen && (
//                 <div className="md:hidden bg-white dark:bg-[#111] border-t border-gray-100 dark:border-[#333]">
//                     <div className="px-4 py-2 space-y-1">
//                         {navLinks.map((link, index) => (
//                             <button
//                                 key={index}
//                                 onClick={() => {
//                                     navigate(link.href);
//                                     setMobileMenuOpen(false);
//                                 }}
//                                 className="block px-4 py-2 hover:bg-lime-300/60 rounded-md text-left w-full"
//                             >
//                                 {link.label}
//                             </button>
//                         ))}
//                         <button
//                             onClick={() => navigate("/profile/settings")}
//                             className="block px-4 py-2 hover:bg-lime-300/60 rounded-md text-left w-full"
//                         >
//                             Settings
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </nav>
//     );
// }
