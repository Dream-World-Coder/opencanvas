import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
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
  ShieldIcon,
  GlobeIcon,
  Loader2,
  Copy,
  Trash2,
  PlusCircle,
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

import Header from "../../components/Header/Header";
import AppLogo from "../../components/AppLogo";
import { useAuth } from "../../contexts/AuthContext";
import { useDataService } from "../../services/dataService";
import { formatDateDetails } from "../../services/formatDate";
import { useDarkModeContext } from "../../contexts/ThemeContext";

const ProfileSettings = () => {
  const { currentUser, setCurrentUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkModeContext();

  const [activeTab, setActiveTab] = useState("general");
  const [formValues, setFormValues] = useState({
    username: currentUser.username.toLowerCase() ?? "null",
    fullName: currentUser.fullName ?? "",
    designation: currentUser.designation ?? "Learner",
    aboutMe: currentUser.aboutMe ?? "",
    notifications: {
      email: currentUser.notifications.emailNotification,
      push: currentUser.notifications.pushNotification,
      mentions: currentUser.notifications.mentionNotification,
      follows: currentUser.notifications.followNotification,
      comments: currentUser.notifications.commentNotification,
      messages: currentUser.notifications.messageNotification,
    },
    contactInformation: currentUser.contactInformation ?? [
      {
        title: "Opencanvas",
        url: `${baseUrl}/u/${currentUser.username.toLowerCase()}`,
      },
    ],
  });
  const baseUrl = window.location.origin;

  function getDeviceInfo() {
    const parser = new UAParser();
    const result = parser.getResult();

    return {
      browser: `${result.browser.name} ${result.browser.version}`,
      os: `${result.os.name} ${result.os.version}`,
      device: result.device.type
        ? `${result.device.vendor || ""} ${result.device.model}`.trim()
        : "Desktop",
    };
  }

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

  // if #pro in url, open pro tab
  useEffect(() => {
    const hash = window.location.href.split("#")[1];
    if (hash && hash.toLowerCase() === "pro") {
      setActiveTab("pro");
    }
  }, []);

  const { updateUserProfile } = useDataService();
  const [loading, setLoading] = useState(false);

  async function updateUser() {
    setLoading(true);
    try {
      if (!/^(?!\d+$)[a-z0-9_]+$/.test(formValues.username)) {
        toast.error(
          "Username can only contain letters, numbers, underscores and at least one letter is mandatory.",
        );
        return;
      }

      if (formValues.username?.length > 16 || formValues.username?.length < 4) {
        toast.error("Username should be 4-16 characters");
        return;
      }

      if (formValues.designation?.length > 40) {
        toast.error("Designation can be max 40 characters");
        return;
      }

      if (formValues.fullName?.length > 32 || formValues.fullName?.length < 4) {
        toast.error("Full name should be 4-32 characters");
        return;
      }

      if (formValues.aboutMe?.length > 300) {
        toast.error("About should be max 300 characters");
        return;
      }

      await updateUserProfile(formValues);

      setFormValues((prevValues) => ({
        ...prevValues,
        contactInformation: [
          ...formValues.contactInformation.map((item) =>
            item.title.toLowerCase() === "opencanvas"
              ? {
                  ...item,
                  url: `${baseUrl}/u/${formValues.username.trim().toLowerCase()}`,
                }
              : item,
          ),
        ],
      }));
      setCurrentUser((oldCurrentUser) => ({
        ...oldCurrentUser,
        username: formValues.username.trim().toLowerCase(),
        fullName: formValues.fullName.trim().toLowerCase(),
        designation: formValues.designation.trim().toLowerCase(),
        aboutMe: formValues.aboutMe.trim().toLowerCase(),
      }));
      toast.success("Your profile information has been updated successfully.", {
        action: {
          label: "Close",
          onClick: () => console.log("Close"),
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong while updating your profile.",
      );
    } finally {
      setLoading(false);
    }
  }

  const handleContactInfoChange = (index, field, value) => {
    // not only url can be ph no also
    const updatedContactInfo = [...formValues.contactInformation];
    updatedContactInfo[index] = {
      ...updatedContactInfo[index],
      [field]: value,
    };

    setFormValues({
      ...formValues,
      contactInformation: updatedContactInfo,
    });
  };

  // Add new contact information field
  const addContactInfoField = () => {
    setFormValues({
      ...formValues,
      contactInformation: [
        ...formValues.contactInformation,
        { title: "", url: "" },
      ],
    });
  };

  // Remove contact information field
  const removeContactInfoField = (index) => {
    const updatedContactInfo = [...formValues.contactInformation];
    updatedContactInfo.splice(index, 1);

    setFormValues({
      ...formValues,
      contactInformation: updatedContactInfo,
    });
  };

  const general = {
    id: "general",
    label: "General",
    icon: <UserIcon className="h-4 w-4" />,
    content: (
      <>
        <CardHeader className="pb-2 p-0 md:p-6 sm:hidden mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="">
              <CardTitle className="dark:text-white flex items-center justify-between mb-1">
                Public Profile Link
                <Copy
                  className="size-4 cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${baseUrl}/u/${formValues.username}`,
                    );
                    toast.success("copied!", {
                      action: {
                        label: "Close",
                        onClick: () => console.log("Close"),
                      },
                    });
                  }}
                />
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                {baseUrl.replace(/^https?:\/\//, "")}
                /u/
                {formValues.username.toLowerCase()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <div className="space-y-6 dark:text-white">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24 _dark:text-black">
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
                className="mt-2 dark:text-white cursor-not-allowed"
              >
                Change Photo
              </Button>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formValues.username.toLowerCase()}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        username: e.target.value?.toLowerCase(),
                      })
                    }
                    className="dark:bg-[#171717] dark:text-white dark:border-[#333]"
                  />
                </div>

                {/* full name */}
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
                    className="dark:bg-[#171717] dark:text-white dark:border-[#333]"
                  />
                </div>
              </div>

              {/* Designation */}
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

              {/* About */}
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
                  className="dark:bg-[#171717] dark:text-white dark:border-[#333]"
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information</Label>

                {formValues.contactInformation.map((contact, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                  >
                    <Input
                      // id={`contact-title-${index}`}
                      placeholder="Title, eg: GitHub"
                      className="dark:border-[#333]"
                      value={contact.title}
                      onChange={(e) =>
                        handleContactInfoChange(index, "title", e.target.value)
                      }
                    />

                    <div className="space-y-0 flex items-end gap-2">
                      {/* const isValidURL = (url) => {
                        try {
                            new URL(url);
                            return true;
                        } catch (e) {
                            return false;
                        }
                    }; */}
                      <Input
                        // id={`contact-url-${index}`}
                        placeholder="eg: https://github.com/username"
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
                          className="mb-2"
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

          {/* Interested fields & topics -- for articles */}

          <div className="flex items-center justify-between dark:text-white">
            <div className="flex items-center space-x-2">
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
      </>
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
                        className="dark:bg-[#171717] dark:text-white dark:border-[#333]"
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
                            className="dark:bg-[#171717] dark:text-white dark:border-[#333]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                            Confirm Password
                        </Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            className="dark:bg-[#171717] dark:text-white dark:border-[#333]"
                        />
                    </div>
                </div>
            </div>
        </div> */}
        {/* sessions / lastFiveLogin */}
        {/* ------------- */}
        <div className="space-y-4 mb-6">
          <div className="text-sm font-thin">
            Joined:{" "}
            {new Date(currentUser.createdAt).toLocaleDateString("en-GB")}
          </div>
          <h3 className="text-lg font-medium">
            Last Five Logins
            {/* Sessions */}
          </h3>

          {[currentUser?.lastFiveLogin[0]]?.map((item) => (
            <div
              key={"index--0"}
              className="rounded-lg border p-4 dark:border-[#333] dark:bg-[#222]"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    <strong>Device</strong>:{" "}
                    {getDeviceInfo(item.deviceInfo).device}
                  </p>
                  <p className="text-sm font-medium">
                    <strong>Operating System</strong>:{" "}
                    {getDeviceInfo(item.deviceInfo).os}
                  </p>
                  <p className="text-sm font-medium">
                    <strong>Browser</strong>:{" "}
                    {getDeviceInfo(item.deviceInfo).browser}
                  </p>
                  <p className="text-sm font-medium">
                    <strong>ip Address</strong>: {item.ipAddress || "N/A"}
                  </p>
                  <p className="text-sm font-medium">
                    <strong>Date</strong>: {formatDateDetails(item.loginTime)}
                  </p>
                </div>

                <Badge className="bg-green-600 text-white">Active</Badge>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentUser.lastFiveLogin?.slice(1)?.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border p-4 dark:border-[#333] dark:bg-[#222]"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      <strong>Device</strong>:{" "}
                      {getDeviceInfo(item.deviceInfo).device}
                    </p>
                    <p className="text-sm font-medium">
                      <strong>Operating System</strong>:{" "}
                      {getDeviceInfo(item.deviceInfo).os}
                    </p>
                    <p className="text-sm font-medium">
                      <strong>Browser</strong>:{" "}
                      {getDeviceInfo(item.deviceInfo).browser}
                    </p>
                    <p className="text-sm font-medium">
                      <strong>ip Address</strong>: {item.ipAddress || "N/A"}
                    </p>
                    <p className="text-sm font-medium">
                      <strong>Date</strong>: {formatDateDetails(item.loginTime)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        Log out from account:{" "}
        <AlertDialog>
          <AlertDialogTrigger className="hover:bg-red-300/80 dark:hover:bg-red-800/80 border border-red-300/80 dark:border-red-600/80 rounded-md px-3 py-1 box-content">
            Logout
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure to logout?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will remove your current session. You can login
                later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-500"
                onClick={() => {
                  logout();
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* save-cancel buttons */}
        {/* <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="dark:bg-[#222] dark:hover:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white"
          >
            Cancel
          </Button>
          <Button className="bg-lime-600 hover:bg-lime-700 dark:bg-lime-700 dark:hover:bg-lime-800 text-white">
            Save Changes
          </Button>
        </div>*/}
        <Card className="border-none shadow-none dark:bg-[#171717] dark:text-white pt-6">
          <CardHeader className="p-0 pb-4">
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
          <CardContent className="p-0">
            <div className="space-y-6">
              <div className="rounded-lg border-none border-red-200 dark:border-red-900 Xp-4 dark:bg-[#222]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-medium dark:text-white">
                      Deactivate Account
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Temporarily disable your account. You can reactivate
                      anytime.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Deactivate
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border-none border-red-200 dark:border-red-900 Xp-4 dark:bg-[#222]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-medium dark:text-white">
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Permanently delete your account and all your data. This
                      action cannot be undone.
                    </p>
                  </div>
                  <Button variant="destructive">Delete</Button>
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
          {["email", "push"].map((type) => {
            const label = type.charAt(0).toUpperCase() + type.slice(1);
            return (
              <div key={type} className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium">
                    {label} Notifications
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {type === "email" && "Receive updates via email"}
                    {type === "push" && "Get notifications on your device"}
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
          <h3 className="text-lg font-medium">Notification Categories</h3>

          {["mentions", "follows", "messages", "comments"].map((category) => {
            const label = category.charAt(0).toUpperCase() + category.slice(1);
            return (
              <div
                key={category}
                className="flex items-center justify-between rounded-lg border p-4 dark:border-[#333] dark:bg-[#222]"
              >
                <div>
                  <h3 className="text-sm font-medium">{label}</h3>
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
                  // defaultChecked={true}
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
            );
          })}
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

  /*
    const privacy = {
      id: "privacy",
      label: "Privacy",
      icon: <ShieldIcon className="h-4 w-4" />,
      "Allow us to collect usage data to improve your experience",
    }
  */

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
          <div>
            {/* <h3 className="text-xl font-medium">Upgrade to Pro</h3> */}
            <p className="text-sm text-black dark:text-gray-100 mt-1">
              Opencanvas is an open source project, you can use it for absolute
              free from the code in github. <br /> However please support the
              maintaince and deployment cost if you can.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            {[
              {
                feature: "Ad-free experience",
                description: "bla bla bla",
                icon: <ShieldIcon className="h-4 w-4" />,
              },
              {
                feature: "Personal Subdomain",
                description: "{your username}.opencanvas.blog",
                icon: <GlobeIcon className="h-4 w-4" />,
              },
              {
                feature: "Analytics dashboard",
                description: "bla bla bla",
                icon: <CreditCardIcon className="h-4 w-4" />,
              },
              {
                feature: "Bla Bla",
                description: "bla bla bla",
                icon: <UserIcon className="h-4 w-4" />,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col _justify-between items-start space-x-2 rounded-lg border p-3 dark:border-[#333] dark:bg-[#222]"
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

          {/*
            4.99 / month -> for a month
            2.99 / month -> for yearly
            137.00 -> Permanent ~~> Be an early supporter, special perks on later stages
          */}
          {/* <div className="space-y-3 pt-4">
            <div className="text-center">
              <span className="text-3xl font-bold">$2.99</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {" "}
                / month
              </span>
            </div>
            <Button className="w-full bg-lime-600 hover:bg-lime-700 dark:bg-lime-700 dark:hover:bg-lime-800 text-white">
              Upgrade Now
            </Button>
          </div> */}

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
                <Button className="mt-4 w-full bg-lime-600 hover:bg-lime-700 dark:bg-lime-700 dark:hover:bg-lime-800 text-white">
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
      <Header
        noBlur={true}
        exclude={["/about", "/contact", "/photo-gallery"]}
      />
      <div className="w-full h-full bg-white dark:bg-[#171717] dark:text-white">
        <div className="mx-auto max-w-4xl pt-24 px-6 md:px-4 pb-4 dark:bg-[#171717]">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">
            Profile Settings
            <div className="text-sm font-thin">{currentUser.email}</div>
          </h1>

          <div className="mb-6 block sm:hidden">
            <Select
              value={activeTab}
              onValueChange={(value) => setActiveTab(value)}
            >
              <SelectTrigger className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-[#171717] dark:text-white focus:ring-lime-500 focus:border-lime-500">
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
                  <div className="">
                    <CardTitle className="dark:text-white flex items-center justify-between mb-1">
                      Public Profile Link
                      <Copy
                        className="size-4 cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${baseUrl}/u/${formValues.username}`,
                          );
                          toast.success("copied!", {
                            action: {
                              label: "Close",
                              onClick: () => console.log("Close"),
                            },
                          });
                        }}
                      />
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      {baseUrl.replace(/^https?:\/\//, "")}
                      /u/
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
          <div className="h-[3dvh] w-full"></div>
        </div>
      </div>
    </>
  );
};

export default ProfileSettings;
