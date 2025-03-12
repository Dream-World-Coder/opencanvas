import { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    BellIcon,
    LockIcon,
    UserIcon,
    CreditCardIcon,
    MoonIcon,
    SunIcon,
    LogOutIcon,
    UserPlusIcon,
    ShieldIcon,
    GlobeIcon,
    Loader2,
    Copy,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useDataService } from "../../services/dataService";

const ProfileSettings = () => {
    const { currentUser } = useAuth();
    const [darkMode, setDarkMode] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [formValues, setFormValues] = useState({
        username: currentUser.username || "",
        fullName: currentUser.fullName || "",
        role: currentUser.role || "user",
        aboutMe: currentUser.aboutMe || "",
        notifications: {
            aboutYou: true,
            push: true,
            sms: false,
        },
        privacy: "friends",
        twoFactorEnabled: true,
    });

    const { updateUserProfile } = useDataService();
    const [loading, setLoading] = useState(false);

    async function updateUser() {
        setLoading(true);
        try {
            const result = await updateUserProfile(formValues);
            toast.success(
                "Your profile information has been updated successfully.",
            );
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Something went wrong while updating your profile.",
            );
        } finally {
            setLoading(false);
        }
    }
    /*
        // Effect to initialize dark mode from localStorage
        useEffect(() => {
            // Check localStorage for dark mode preference
            const savedDarkMode = localStorage.getItem("darkMode");
            const initialDarkMode = savedDarkMode
                ? JSON.parse(savedDarkMode)
                : window.matchMedia("(prefers-color-scheme: dark)").matches;

            setDarkMode(initialDarkMode);
            setFormValues((prevValues) => ({
                ...prevValues,
                darkMode: initialDarkMode,
            }));
            applyDarkMode(initialDarkMode);
        }, []);

        // Function to toggle dark mode
        const toggleDarkMode = (value) => {
            setDarkMode(value);
            setFormValues((prevValues) => ({
                ...prevValues,
                darkMode: value,
            }));

            // Save to localStorage
            localStorage.setItem("darkMode", JSON.stringify(value));

            // Apply dark mode to document
            applyDarkMode(value);
        };

        // Apply dark mode to HTML element
        const applyDarkMode = (isDark) => {
            if (isDark) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        };
    */

    const general = {
        id: "general",
        label: "General",
        icon: <UserIcon className="h-4 w-4" />,
        content: (
            <div className="space-y-6 dark:text-white">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="flex flex-col items-center gap-2">
                        <Avatar className="h-24 w-24  dark:text-black">
                            <AvatarImage
                                src={currentUser.profilePicture}
                                alt="Profile picture"
                            />
                            <AvatarFallback>
                                {currentUser.fullName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 dark:text-black cursor-not-allowed"
                        >
                            Change Photo
                        </Button>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={formValues.username}
                                    onChange={(e) =>
                                        setFormValues({
                                            ...formValues,
                                            username: e.target.value,
                                        })
                                    }
                                    className="dark:bg-black dark:text-white dark:border-gray-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    value={formValues.fullName}
                                    onChange={(e) =>
                                        setFormValues({
                                            ...formValues,
                                            fullName: e.target.value,
                                        })
                                    }
                                    className="dark:bg-black dark:text-white dark:border-gray-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                value={formValues.role}
                                onChange={(e) =>
                                    setFormValues({
                                        ...formValues,
                                        role: e.target.value,
                                    })
                                }
                                className="dark:bg-black dark:text-white dark:border-gray-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="aboutMe">About</Label>
                            <Input
                                id="aboutMe"
                                type="aboutMe"
                                value={formValues.aboutMe}
                                onChange={(e) =>
                                    setFormValues({
                                        ...formValues,
                                        aboutMe: e.target.value,
                                    })
                                }
                                className="dark:bg-black dark:text-white dark:border-gray-800"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between dark:text-white">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="darkMode"
                            checked={darkMode}
                            // onCheckedChange={toggleDarkMode}
                            className="cursor-not-allowed"
                        />
                        <Label
                            htmlFor="darkMode"
                            className="cursor-not-allowed"
                        >
                            Dark Mode
                        </Label>
                        {darkMode ? (
                            <MoonIcon className="h-4 w-4 ml-2" />
                        ) : (
                            <SunIcon className="h-4 w-4 ml-2" />
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        onClick={updateUser}
                        disabled={loading}
                        className="bg-lime-600 hover:bg-lime-700 dark:bg-lime-700 dark:hover:bg-lime-800 text-white"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </div>
        ),
    };

    const account = {
        id: "account",
        label: "Account",
        icon: <LockIcon className="h-4 w-4" />,
        content: (
            <div className="space-y-6 dark:text-white">
                {/* password */}
                {/* ------------ */}
                {/* <div className="space-y-4 dark:text-white">
                    <h3 className="text-lg font-medium dark:text-white">
                        Password &amp; Security
                    </h3>
                    <div className="grid gap-4 dark:text-white">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">
                                Current Password
                            </Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value="************"
                                className="dark:bg-black dark:text-white dark:border-gray-800"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">
                                    New Password
                                </Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    className="dark:bg-black dark:text-white dark:border-gray-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    className="dark:bg-black dark:text-white dark:border-gray-800"
                                />
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* 2FA */}
                {/* ------------- */}
                {/* <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium">
                                Two-Factor Authentication
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                        <Switch
                            id="twoFactorEnabled"
                            checked={formValues.twoFactorEnabled}
                            onCheckedChange={(checked) =>
                                setFormValues({
                                    ...formValues,
                                    twoFactorEnabled: checked,
                                })
                            }
                        />
                    </div>

                    {formValues.twoFactorEnabled && (
                        <div className="rounded-lg border p-4 mt-2 dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Authenticator App
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Using Google Authenticator or Authy
                                    </p>
                                </div>
                                <Badge className="bg-lime-600 dark:bg-lime-700 text-white">
                                    Active
                                </Badge>
                            </div>
                        </div>
                    )}
                </div> */}

                {/* sessions */}
                {/* ------------- */}
                {/* <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sessions</h3>
                    <div className="rounded-lg border p-4 dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">
                                    Current Device • Chrome on macOS
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Last active: Just now
                                </p>
                            </div>
                            <Badge className="bg-green-600 text-white">
                                Active
                            </Badge>
                        </div>
                    </div>
                </div> */}

                {/* save-cancel buttons */}
                {/* <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        className="dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button className="bg-lime-600 hover:bg-lime-700 dark:bg-lime-700 dark:hover:bg-lime-800 text-white">
                        Save Changes
                    </Button>
                </div> */}

                <Card className="border border-red-200 dark:border-red-900 dark:bg-black dark:text-white">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-red-600 dark:text-red-400">
                                    Danger Zone
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    Irreversible account actions
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="rounded-lg border border-red-200 dark:border-red-900 p-4 dark:bg-gray-900">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-base font-medium dark:text-white">
                                            Deactivate Account
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Temporarily disable your account.
                                            You can reactivate anytime.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                                    >
                                        <LockIcon className="mr-2 h-4 w-4" />
                                        Deactivate
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-lg border border-red-200 dark:border-red-900 p-4 dark:bg-gray-900">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-base font-medium dark:text-white">
                                            Delete Account
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Permanently delete your account and
                                            all your data. This action cannot be
                                            undone.
                                        </p>
                                    </div>
                                    <Button variant="destructive">
                                        <LogOutIcon className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        ),
    };

    const notifications = {
        id: "notifications",
        label: "Notifications",
        icon: <BellIcon className="h-4 w-4" />,
        content: (
            <div className="space-y-6 dark:text-white">
                <div className="space-y-4">
                    {["email", "push", "sms"].map((type) => {
                        const label =
                            type.charAt(0).toUpperCase() + type.slice(1);
                        return (
                            <div
                                key={type}
                                className="flex items-center justify-between"
                            >
                                <div>
                                    <h3 className="text-base font-medium">
                                        {label} Notifications
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {type === "email" &&
                                            "Receive updates via email"}
                                        {type === "push" &&
                                            "Get notifications on your device"}
                                        {type === "sms" &&
                                            "Receive text messages for important updates"}
                                    </p>
                                </div>
                                <Switch
                                    id={`${type}Notifications`}
                                    checked={formValues.notifications[type]}
                                    onCheckedChange={(checked) =>
                                        setFormValues({
                                            ...formValues,
                                            notifications: {
                                                ...formValues.notifications,
                                                [type]: checked,
                                            },
                                        })
                                    }
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                        Notification Categories
                    </h3>

                    {["mentions", "comments", "follows", "messages"].map(
                        (category) => {
                            const label =
                                category.charAt(0).toUpperCase() +
                                category.slice(1);
                            return (
                                <div
                                    key={category}
                                    className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-800 dark:bg-gray-900"
                                >
                                    <div>
                                        <h3 className="text-sm font-medium">
                                            {label}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Notifications when someone{" "}
                                            {category === "follows"
                                                ? "follows you"
                                                : category === "messages"
                                                  ? "sends you a message"
                                                  : `${category} you in a post`}
                                        </p>
                                    </div>
                                    <Switch
                                        id={`${category}Notifications`}
                                        defaultChecked={true}
                                    />
                                </div>
                            );
                        },
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        className="dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white"
                    >
                        Reset to Default
                    </Button>
                    <Button className="bg-lime-600 hover:bg-lime-700 dark:bg-lime-700 dark:hover:bg-lime-800 text-white">
                        Save Changes
                    </Button>
                </div>
            </div>
        ),
    };

    /*
    const privacy = {
        id: "privacy",
        label: "Privacy",
        icon: <ShieldIcon className="h-4 w-4" />,
        content: (
            <div className="space-y-6 dark:text-white">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Profile Visibility</h3>
                    <RadioGroup
                        value={formValues.privacy}
                        onValueChange={(value) =>
                            setFormValues({ ...formValues, privacy: value })
                        }
                        className="space-y-2"
                    >
                        {[
                            {
                                value: "public",
                                label: "Public",
                                description:
                                    "Anyone can see your profile and posts",
                            },
                            {
                                value: "friends",
                                label: "Friends Only",
                                description:
                                    "Only people you follow can see your posts",
                            },
                            {
                                value: "private",
                                label: "Private",
                                description: "Only you can see your posts",
                            },
                        ].map((option) => (
                            <div
                                key={option.value}
                                className="flex items-center space-x-2 rounded-lg border p-4 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                            >
                                <RadioGroupItem
                                    value={option.value}
                                    id={option.value}
                                    className="dark:text-white dark:fill-white dark:bg-black"
                                />
                                <div className="flex-1">
                                    <Label
                                        htmlFor={option.value}
                                        className="text-sm font-medium cursor-pointer"
                                    >
                                        {option.label}
                                    </Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {option.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Data & Privacy</h3>

                    <div className="space-y-2">
                        {[
                            {
                                id: "activityStatus",
                                label: "Show Activity Status",
                                description:
                                    "Let others see when you were last active",
                            },
                            {
                                id: "readReceipts",
                                label: "Read Receipts",
                                description:
                                    "Let others know when you've seen their messages",
                            },
                            {
                                id: "dataCollection",
                                label: "Data Collection",
                                description:
                                    "Allow us to collect usage data to improve your experience",
                            },
                        ].map((setting) => (
                            <div
                                key={setting.id}
                                className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-800 dark:bg-gray-900"
                            >
                                <div>
                                    <Label
                                        htmlFor={setting.id}
                                        className="text-sm font-medium cursor-pointer"
                                    >
                                        {setting.label}
                                    </Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {setting.description}
                                    </p>
                                </div>
                                <Switch
                                    id={setting.id}
                                    defaultChecked={
                                        setting.id !== "dataCollection"
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        className="dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button className="bg-lime-600 hover:bg-lime-700 dark:bg-lime-700 dark:hover:bg-lime-800 text-white">
                        Save Changes
                    </Button>
                </div>
            </div>
        ),
        };
        */

    const pro = {
        id: "pro",
        label: "Pro",
        icon: <CreditCardIcon className="h-4 w-4" />,
        content: (
            <div className="space-y-6 dark:text-white">
                <div className="rounded-lg border p-6 text-center space-y-4 dark:border-gray-800 dark:bg-gray-900">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900">
                        <UserPlusIcon className="h-8 w-8 text-lime-600 dark:text-lime-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-medium">Upgrade to Pro</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Unlock premium features and enjoy an ad-free
                            experience
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                feature: "Ad-free experience",
                                icon: <ShieldIcon className="h-4 w-4" />,
                            },
                            {
                                feature: "Unlimited posts",
                                icon: <GlobeIcon className="h-4 w-4" />,
                            },
                            {
                                feature: "Priority support",
                                icon: <BellIcon className="h-4 w-4" />,
                            },
                            {
                                feature: "Custom themes",
                                icon: <MoonIcon className="h-4 w-4" />,
                            },
                            {
                                feature: "Analytics dashboard",
                                icon: <CreditCardIcon className="h-4 w-4" />,
                            },
                            {
                                feature: "Exclusive content",
                                icon: <UserIcon className="h-4 w-4" />,
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center space-x-2 rounded-lg border p-3 dark:border-gray-800 dark:bg-gray-900"
                            >
                                <div className="text-lime-600 dark:text-lime-400">
                                    {item.icon}
                                </div>
                                <span className="text-sm">{item.feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 pt-4">
                        <div className="text-center">
                            <span className="text-3xl font-bold">$5.99</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {" "}
                                / month
                            </span>
                        </div>
                        <Button className="w-full bg-lime-600 hover:bg-lime-700 dark:bg-lime-700 dark:hover:bg-lime-800 text-white">
                            Upgrade Now
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border p-4 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium">
                                Current Plan
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Free tier • Limited features
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className="dark:border-gray-700 dark:text-white dark:hover:text-white"
                        >
                            Free
                        </Badge>
                    </div>
                </div>
            </div>
        ),
    };

    const settingsSections = [general, account, notifications, pro];

    return (
        <>
            <Header noBlur={true} />
            <div className="w-full h-full bg-white dark:bg-black dark:text-white">
                <div className="mx-auto max-w-4xl mt-20 px-4 py-8 dark:bg-black">
                    <h1 className="text-3xl font-bold mb-6 dark:text-white">
                        Profile Settings
                        <div className="text-sm font-thin">
                            {currentUser.email}
                        </div>
                    </h1>

                    <div className="mb-4 block sm:hidden">
                        <select
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-black dark:text-white focus:ring-lime-500 focus:border-lime-500"
                        >
                            {settingsSections.map((section) => (
                                <option key={section.id} value={section.id}>
                                    {section.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="space-y-6"
                    >
                        <Card className="dark:bg-black dark:border-gray-800">
                            <CardHeader className="pb-2">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <CardTitle className="dark:text-white flex items-center justify-between">
                                            Public Profile Link
                                            <Copy
                                                className="size-4 cursor-pointer"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        `https://www.opencanvas.blog/u/${formValues.username}`,
                                                    );
                                                    toast.success("copied!");
                                                }}
                                            />
                                        </CardTitle>
                                        <CardDescription className="dark:text-gray-400">
                                            opencanvas.blog/u/
                                            {formValues.username}
                                        </CardDescription>
                                    </div>
                                    <TabsList
                                        className={`hidden sm:grid grid-cols-${settingsSections.length} gap-1 dark:bg-gray-900`}
                                    >
                                        {settingsSections.map((section) => (
                                            <TabsTrigger
                                                key={section.id}
                                                value={section.id}
                                                className="data-[state=active]:bg-lime-50 data-[state=active]:text-lime-900 dark:data-[state=active]:bg-lime-950 dark:data-[state=active]:text-lime-300 dark:text-gray-200"
                                            >
                                                <div className="flex items-center gap-1">
                                                    {section.icon}
                                                    <span className="hidden sm:inline">
                                                        {section.label}
                                                    </span>
                                                </div>
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-4">
                                {settingsSections.map((section) => (
                                    <TabsContent
                                        key={section.id}
                                        value={section.id}
                                    >
                                        {section.content}
                                    </TabsContent>
                                ))}
                            </CardContent>
                        </Card>
                    </Tabs>
                    <div className="h-[30vh] w-full"></div>
                </div>
            </div>
        </>
    );
};

export default ProfileSettings;
