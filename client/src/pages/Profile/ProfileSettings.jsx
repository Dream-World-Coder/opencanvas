import { useState, useEffect } from "react";
import {
    Moon,
    Sun,
    User,
    Shield,
    Zap,
    ChevronRight,
    Trash2,
} from "lucide-react";

export default function ProfileSettings() {
    const [selectedTab, setSelectedTab] = useState("general");
    const [activeSection, setActiveSection] = useState("general");
    const [theme, setTheme] = useState("light");
    const [font, setFont] = useState("inter");

    useEffect(() => {
        let darkMode = localStorage.getItem("darkMode");
        if (darkMode === "true") {
            setTheme("dark");
        }
    }, []);

    const sections = [
        { id: "general", label: "General", icon: User },
        { id: "account", label: "Account", icon: Shield },
        { id: "pro", label: "Pro Features", icon: Zap },
    ];

    function handleDarkMode() {
        let dm = localStorage.getItem("darkMode");
        if (!dm) {
            localStorage.setItem("darkMode", "true");
        }
        if (dm === "false") {
            localStorage.setItem("darkMode", "true");
        } else {
            localStorage.setItem("darkMode", "false");
        }
        setTheme(theme === "light" ? "dark" : "light");
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <nav className="space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                        activeSection === section.id
                                            ? "bg-lime-100 dark:bg-lime-900 text-lime-700 dark:text-lime-300"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    <section.icon className="w-5 h-5 mr-3" />
                                    {section.label}
                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 max-w-3xl">
                        {activeSection === "general" && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    General Settings
                                </h2>

                                {/* Profile Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                                        <button className="px-4 py-2 text-sm font-medium text-lime-600 border border-lime-600 rounded-lg hover:bg-lime-50 dark:text-lime-400 dark:border-lime-400 dark:hover:bg-lime-900/30">
                                            Change Photo
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:border-lime-500 dark:focus:border-lime-500"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Bio
                                            </label>
                                            <textarea
                                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:border-lime-500 dark:focus:border-lime-500"
                                                rows={3}
                                                placeholder="Tell us about yourself"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Appearance */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Appearance
                                    </h3>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {theme === "light" ? (
                                                <Sun className="w-5 h-5" />
                                            ) : (
                                                <Moon className="w-5 h-5" />
                                            )}
                                            <span className="text-sm font-medium">
                                                Theme
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleDarkMode}
                                            className="px-3 py-1 text-sm bg-white dark:bg-gray-700 rounded-md shadow"
                                        >
                                            {theme === "light"
                                                ? "Light"
                                                : "Dark"}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <span className="text-sm font-medium">
                                            Font Family
                                        </span>
                                        <select
                                            value={font}
                                            onChange={(e) =>
                                                setFont(e.target.value)
                                            }
                                            className="px-3 py-1 text-sm bg-white dark:bg-gray-700 rounded-md shadow"
                                        >
                                            <option value="inter">Inter</option>
                                            <option value="roboto">
                                                Roboto
                                            </option>
                                            <option value="system">
                                                System
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === "account" && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Account Settings
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:border-lime-500 dark:focus:border-lime-500"
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:border-lime-500 dark:focus:border-lime-500"
                                            placeholder="@johndoe"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium text-red-600 dark:text-red-400">
                                        Danger Zone
                                    </h3>
                                    <div className="mt-4">
                                        <button className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === "pro" && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Pro Features
                                </h2>

                                <div className="p-6 bg-gradient-to-r from-lime-50 to-lime-100 dark:from-lime-900/30 dark:to-lime-800/30 rounded-xl">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Upgrade to Pro
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        Get access to advanced features,
                                        priority support, and more.
                                    </p>
                                    <button className="mt-4 px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700">
                                        Upgrade Now
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
