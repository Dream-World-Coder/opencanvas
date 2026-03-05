import { useState, useEffect } from "react";
import PropTypes from "prop-types";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  BellIcon,
  LockIcon,
  UserIcon,
  CreditCardIcon,
  MoonIcon,
  SunIcon,
  ShieldIcon,
  GlobeIcon,
  Loader2,
  Copy,
  Trash2,
  PlusCircle,
  BookOpenIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UAParser } from "ua-parser-js";

import Header from "@/components/Header/Header";
import AppLogo from "@/components/AppLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useDataService } from "@/services/dataService";
import { formatDateDetails } from "@/services/formatDate";
import { useDarkModeContext } from "@/contexts/ThemeContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDeviceInfo(deviceInfo) {
  const parser = new UAParser(deviceInfo);
  const result = parser.getResult();
  return {
    browser: `${result.browser.name} ${result.browser.version}`,
    os: `${result.os.name} ${result.os.version}`,
    device: result.device.type
      ? `${result.device.vendor || ""} ${result.device.model}`.trim()
      : "Desktop",
  };
}

// Single login session card — shared between the "active" and "past" renders
function LoginSessionCard({ item, isActive = false }) {
  if (!item) return null;
  const { ipAddress: ip, deviceInfo, loginTime } = item;
  const info = getDeviceInfo(deviceInfo);
  return (
    <div className="rounded-lg border p-4 dark:border-[#333] dark:bg-[#222]">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            <strong>Device</strong>: {info.device}
          </p>
          <p className="text-sm font-medium">
            <strong>Operating System</strong>: {info.os}
          </p>
          <p className="text-sm font-medium">
            <strong>Browser</strong>: {info.browser}
          </p>
          <p className="text-sm font-medium">
            <strong>IP Address</strong>: {ip || "N/A"}
          </p>
          <p className="text-sm font-medium">
            <strong>Date</strong>: {formatDateDetails(loginTime)}
          </p>
        </div>
        {isActive && <Badge className="bg-green-600 text-white">Active</Badge>}
      </div>
    </div>
  );
}
LoginSessionCard.propTypes = {
  item: PropTypes.object,
  isActive: PropTypes.bool,
};

// ─── Main Component ────────────────────────────────────────────────────────────

const ProfileSettings = () => {
  const { currentUser, setCurrentUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkModeContext();
  const { updateUserProfile } = useDataService();

  const baseUrl = window.location.origin;

  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    username: currentUser.username?.toLowerCase() ?? "",
    fullName: currentUser.fullName ?? "",
    designation: currentUser.designation ?? "Learner",
    aboutMe: currentUser.aboutMe ?? "",
    notifications: {
      emailNotification: currentUser.notifications?.emailNotification,
      pushNotification: currentUser.notifications?.pushNotification,
      mentionNotification: currentUser.notifications?.mentionNotification,
      followNotification: currentUser.notifications?.followNotification,
      commentNotification: currentUser.notifications?.commentNotification,
      messageNotification: currentUser.notifications?.messageNotification,
    },
    contactInformation: currentUser.contactInformation ?? [
      {
        title: "Opencanvas",
        url: `${baseUrl}/u/${currentUser.username?.toLowerCase()}`,
      },
    ],
  });

  // Open the Pro tab when URL hash is #pro
  useEffect(() => {
    const hash = window.location.href.split("#")[1];
    if (hash?.toLowerCase() === "pro") setActiveTab("pro");
  }, []);

  // ─── Form handlers ──────────────────────────────────────────────────────────

  const handleContactInfoChange = (index, field, value) => {
    const updated = [...formValues.contactInformation];
    updated[index] = { ...updated[index], [field]: value };
    setFormValues({ ...formValues, contactInformation: updated });
  };

  const addContactInfoField = () => {
    setFormValues({
      ...formValues,
      contactInformation: [
        ...formValues.contactInformation,
        { title: "", url: "" },
      ],
    });
  };

  const removeContactInfoField = (index) => {
    const updated = [...formValues.contactInformation];
    updated.splice(index, 1);
    setFormValues({ ...formValues, contactInformation: updated });
  };

  async function updateUser() {
    setLoading(true);
    try {
      if (formValues.designation?.length > 40) {
        toast.error("Designation can be max 40 characters");
        return;
      }
      if (formValues.fullName?.length > 32 || formValues.fullName?.length < 4) {
        toast.error("Full name should be 4–32 characters");
        return;
      }
      if (formValues.aboutMe?.length > 300) {
        toast.error("About me can be max 300 characters");
        return;
      }

      await updateUserProfile(formValues);

      // Keep the Opencanvas contact link in sync with the username (read-only, but kept for consistency)
      setFormValues((prev) => ({
        ...prev,
        contactInformation: prev.contactInformation.map((item) =>
          item.title.toLowerCase() === "opencanvas"
            ? { ...item, url: `${baseUrl}/u/${currentUser.username}` }
            : item,
        ),
      }));

      setCurrentUser((prev) => ({
        ...prev,
        fullName: formValues.fullName.trim().toLowerCase(),
        designation: formValues.designation.trim().toLowerCase(),
        aboutMe: formValues.aboutMe.trim().toLowerCase(),
      }));

      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong while updating your profile.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ─── Tab: General ───────────────────────────────────────────────────────────

  const general = {
    id: "general",
    label: "General",
    icon: <UserIcon className="h-4 w-4" />,
    content: (
      <>
        {/* Mobile-only profile link header */}
        <CardHeader className="pb-2 p-0 md:p-6 sm:hidden mb-4">
          <CardTitle className="dark:text-white flex items-center justify-between mb-1">
            Public Profile Link
            <Copy
              className="size-4 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${baseUrl}/u/${formValues.username}`,
                );
                toast.success("Copied!");
              }}
            />
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            {baseUrl.replace(/^https?:\/\//, "")}/u/
            {formValues.username.toLowerCase()}
          </CardDescription>
        </CardHeader>

        <div className="space-y-6 dark:text-white">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={currentUser.profilePicture}
                  alt="Profile picture"
                />
                <AvatarFallback>
                  {currentUser.fullName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 dark:text-white cursor-not-allowed"
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
                    value={formValues.username.toLowerCase()}
                    readOnly
                    disabled
                    title="Username cannot be changed"
                    className="dark:bg-[#171717] dark:text-white dark:border-[#333] opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400">
                    Username cannot be changed.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formValues.fullName}
                    onChange={(e) =>
                      setFormValues({ ...formValues, fullName: e.target.value })
                    }
                    className="dark:bg-[#171717] dark:text-white dark:border-[#333]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formValues.designation}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      designation: e.target.value,
                    })
                  }
                  className="dark:bg-[#171717] dark:text-white dark:border-[#333]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aboutMe">About</Label>
                <Input
                  id="aboutMe"
                  value={formValues.aboutMe}
                  onChange={(e) =>
                    setFormValues({ ...formValues, aboutMe: e.target.value })
                  }
                  className="dark:bg-[#171717] dark:text-white dark:border-[#333]"
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label>Contact Information</Label>
                {formValues.contactInformation.map((contact, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                  >
                    <Input
                      placeholder="Title, e.g. GitHub"
                      className="dark:border-[#333]"
                      value={contact.title}
                      onChange={(e) =>
                        handleContactInfoChange(index, "title", e.target.value)
                      }
                    />
                    <div className="flex items-end gap-2">
                      <Input
                        placeholder="e.g. https://github.com/username"
                        className="dark:border-[#333]"
                        value={contact.url}
                        onChange={(e) =>
                          handleContactInfoChange(index, "url", e.target.value)
                        }
                      />
                      {formValues.contactInformation.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeContactInfoField(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 dark:bg-white dark:text-black"
                  onClick={addContactInfoField}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add More
                </Button>
              </div>
            </div>
          </div>

          {/* Dark mode toggle */}
          <div className="flex items-center space-x-2 dark:text-white">
            <Switch
              id="darkMode"
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
            />
            <Label htmlFor="darkMode">Dark Mode</Label>
            {darkMode ? (
              <MoonIcon className="h-4 w-4 ml-2" />
            ) : (
              <SunIcon className="h-4 w-4 ml-2" />
            )}
          </div>

          <div className="flex justify-end">
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
      </>
    ),
  };

  // ─── Tab: Account ───────────────────────────────────────────────────────────

  // lastFiveLogin may be undefined if the server hasn't sent it yet — guard everywhere
  const recentLogin = currentUser?.lastFiveLogin?.slice(0, 1);
  const pastLogins = currentUser?.lastFiveLogin?.slice(1) ?? [];

  const account = {
    id: "account",
    label: "Account",
    icon: <LockIcon className="h-4 w-4" />,
    content: (
      <div className="space-y-6 dark:text-white">
        <div className="space-y-4 mb-6">
          <div className="text-sm font-thin">
            Joined:{" "}
            {new Date(currentUser.createdAt).toLocaleDateString("en-GB")}
          </div>

          <h3 className="text-lg font-medium">Last Five Logins</h3>

          {/* Most recent session shown as "Active" */}
          <LoginSessionCard item={recentLogin} isActive={true} />

          {/* Remaining past sessions in a 2-col grid */}
          {pastLogins.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastLogins.map((item, index) => (
                <LoginSessionCard key={index} item={item} />
              ))}
            </div>
          )}
        </div>
        Log out from account:{" "}
        <AlertDialog>
          <AlertDialogTrigger className="hover:bg-red-300/80 dark:hover:bg-red-800/80 border border-red-300/80 dark:border-red-600/80 rounded-md px-3 py-1 box-content">
            Logout
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to logout?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will remove your current session. You can log in again
                anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-500"
                onClick={logout}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* Danger zone */}
        <Card className="border-none shadow-none dark:bg-[#171717] dark:text-white pt-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-red-600 dark:text-red-400">
              Danger Zone
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Irreversible account actions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-medium dark:text-white">
                  Deactivate Account
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Temporarily disable your account. You can reactivate anytime.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              >
                Deactivate
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-medium dark:text-white">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Permanently delete your account and all your data. This cannot
                  be undone.
                </p>
              </div>
              <Button variant="destructive">Delete</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    ),
  };

  // ─── Tab: Notifications ─────────────────────────────────────────────────────

  const notifications = {
    id: "notifications",
    label: "Notifications",
    icon: <BellIcon className="h-4 w-4" />,
    content: (
      <div className="space-y-6 dark:text-white">
        <div className="space-y-4">
          {["emailNotification", "pushNotification"].map((type) => (
            <div key={type} className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium">
                  {type.charAt(0).toUpperCase() + type.slice(1)} Notifications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {type === "emailNotification"
                    ? "Receive updates via email"
                    : "Get notifications on your device"}
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
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Categories</h3>
          {[
            "mentionNotification",
            "followNotification",
            "messageNotification",
            "commentNotification",
          ].map((category) => (
            <div
              key={category}
              className="flex items-center justify-between rounded-lg border p-4 dark:border-[#333] dark:bg-[#222]"
            >
              <div>
                <h3 className="text-sm font-medium">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Notifications when someone{" "}
                  {category === "followNotification"
                    ? "follows you"
                    : category === "messageNotification"
                      ? "sends you a message"
                      : `${category} you in a post`}
                </p>
              </div>
              <Switch
                id={`${category}Notifications`}
                checked={formValues.notifications[category]}
                onCheckedChange={(checked) =>
                  setFormValues({
                    ...formValues,
                    notifications: {
                      ...formValues.notifications,
                      [category]: checked,
                    },
                  })
                }
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={updateUser}
            className="bg-lime-600 hover:bg-lime-700 dark:bg-lime-700 dark:hover:bg-lime-800 text-white"
          >
            Save Changes
          </Button>
        </div>
      </div>
    ),
  };

  // ─── Tab: Pro ───────────────────────────────────────────────────────────────

  const plans = [
    {
      title: "Monthly Plan",
      price: "$4.99",
      subtext: "/ month",
      description: "Great if you just want to try it out.",
      buttonText: "Subscribe Monthly",
    },
    {
      title: "Yearly Plan",
      price: "$2.99",
      subtext: "/ month",
      description: "Billed annually. Save 40% compared to monthly.",
      buttonText: "Subscribe Yearly",
    },
    {
      title: "Lifetime Access",
      price: "$149.99",
      subtext: "",
      description:
        "Be an early supporter. Includes future premium perks at no extra cost.",
      buttonText: "Get Lifetime Access",
    },
  ];

  const proFeatures = [
    {
      feature: "Ad-free experience",
      description: "Read without interruptions or distractions.",
      icon: <ShieldIcon className="h-4 w-4" />,
    },
    {
      feature: "Personal Subdomain",
      description: "Host content at {username}.opencanvas.blog.",
      icon: <GlobeIcon className="h-4 w-4" />,
    },
    {
      feature: "Analytics dashboard",
      description: "Track readership and engagement metrics.",
      icon: <CreditCardIcon className="h-4 w-4" />,
    },
    {
      feature: "Advanced Publishing",
      description: "Publish digital books and web-based research papers.",
      icon: <BookOpenIcon className="h-4 w-4" />,
    },
  ];

  const pro = {
    id: "pro",
    label: "Pro",
    icon: <CreditCardIcon className="h-4 w-4" />,
    content: (
      <div className="space-y-6 dark:text-white">
        <div className="rounded-lg border p-6 text-center space-y-4 dark:border-[#333] dark:bg-[#222]">
          <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900">
            <AppLogo size={64} fontSize="text-3xl md:text-4xl" />
          </div>
          <p className="text-sm text-black dark:text-gray-100 mt-1">
            Opencanvas is an open source project, free to use from GitHub.
            <br />
            However, please support the maintenance and deployment cost if you
            can.
          </p>

          <div className="grid gap-4 md:grid-cols-1">
            {proFeatures.map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-start space-x-2 rounded-lg border p-3 dark:border-[#333] dark:bg-[#222]"
              >
                <div className="flex justify-center items-center gap-2">
                  <div className="text-lime-600 dark:text-lime-400">
                    {item.icon}
                  </div>
                  <div className="text-lg">{item.feature}</div>
                </div>
                <div className="text-sm">{item.description}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3 pt-4">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between border rounded-xl p-4 text-center shadow-sm h-full bg-lime-50 dark:bg-lime-900"
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{plan.title}</h3>
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.subtext && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {plan.subtext}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    window.location.href = "https://ko-fi.com/myopencanvas";
                  }}
                  className="mt-4 w-full bg-lime-600 hover:bg-lime-700 dark:bg-lime-700 dark:hover:bg-lime-800 text-white"
                >
                  {plan.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-4 dark:border-[#333] dark:bg-[#222]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Current Plan</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Free tier • Limited features
              </p>
            </div>
            <Badge
              variant="outline"
              className="dark:border-gray-700 dark:text-white"
            >
              Free
            </Badge>
          </div>
        </div>
      </div>
    ),
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  const settingsSections = [general, account, notifications, pro];

  return (
    <>
      <Header
        noBlur={true}
        exclude={["/about", "/contact", "/photo-gallery"]}
      />
      <div className="w-full h-full min-h-screen bg-white dark:bg-[#171717] dark:text-white">
        <div className="mx-auto max-w-4xl pt-24 px-6 md:px-4 pb-4 dark:bg-[#171717]">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">
            Profile Settings
            <div className="text-sm font-thin">{currentUser.email}</div>
          </h1>

          {/* Mobile tab selector */}
          <div className="mb-6 block sm:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-[#171717] dark:text-white">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {settingsSections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <Card className="dark:bg-[#171717] dark:border-[#333] shadow-none md:shadow-sm border-0 md:border">
              <CardHeader className="pb-2 p-0 sm:p-6 hidden sm:block">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="dark:text-white flex items-center justify-between mb-1">
                      Public Profile Link
                      <Copy
                        className="size-4 cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${baseUrl}/u/${formValues.username}`,
                          );
                          toast.success("Copied!");
                        }}
                      />
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      {baseUrl.replace(/^https?:\/\//, "")}/u/
                      {formValues.username.toLowerCase()}
                    </CardDescription>
                  </div>

                  <TabsList
                    className={`hidden sm:grid grid-cols-${settingsSections.length} gap-1 dark:bg-[#222]`}
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

              <CardContent className="pt-4 p-0 sm:p-6">
                {settingsSections.map((section) => (
                  <TabsContent key={section.id} value={section.id}>
                    {section.content}
                  </TabsContent>
                ))}
              </CardContent>
            </Card>
          </Tabs>

          <div className="h-[3dvh] w-full" />
        </div>
      </div>
    </>
  );
};

export default ProfileSettings;
