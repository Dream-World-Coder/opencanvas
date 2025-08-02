import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown, Settings } from "lucide-react";
import { toast } from "sonner";

import { useDataService } from "../../services/dataService";
import { useAuth } from "../../contexts/AuthContext";
import AppLogo from "../AppLogo";
import { CreateMenuDesktop } from "./CreateMenu";
import { MobileNav } from "./MobileNav";

export default function ProfileHeader() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const { getNewPostId } = useDataService();
  const [loading, setLoading] = useState(false);

  const navLinks = [
    { href: "/articles", label: "Articles" },
    { href: "/social", label: "Social" },
    { href: "/saved-posts", label: "Saved" },
    { href: "/profile", label: "Profile" },
  ];

  async function handlePostCreate(option) {
    setLoading(true);

    if (!currentUser) {
      toast.error("you need to Log In first");
      localStorage.setItem("urlToRedirectAfterLogin", window.location.pathname);
      setLoading(false);

      setTimeout(() => {
        navigate("/login-needed");
      }, 500);

      return;
    }

    localStorage.removeItem("blogPost");
    localStorage.removeItem("newPostId");
    setCreateMenuOpen(false);

    try {
      let newPostId = await getNewPostId();
      localStorage.setItem("newPostId", newPostId);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }

    navigate(option.href);

    setLoading(false);
  }

  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-[#222] dark:text-white border-b border-gray-100 dark:border-[#333] shadow-sm dark:shadow-none z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-0 py-3">
        <AppLogo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2 text-sm">
          {navLinks.map((link, index) => (
            <React.Fragment key={index}>
              <button
                onClick={() => {
                  navigate(link.href);
                }}
                className={`px-3 py-1 box-content rounded-md hover:bg-lime-200 dark:hover:bg-[#333] transition-all duration-200`}
              >
                {link.label}
              </button>
              {index !== navLinks.length - 1 && (
                <span className={`text-lime-300 flex items-center`}>•</span>
              )}
            </React.Fragment>
          ))}

          <button
            onClick={() => navigate("/profile/settings")}
            className="p-2 !mr-2 text-gray-600 dark:text-neutral-300 hover:bg-lime-300 dark:hover:bg-neutral-800 rounded-full transition-all duration-200 border border-lime-300 dark:border-neutral-800"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Create Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCreateMenuOpen(!createMenuOpen)}
              className="flex items-center space-x-2 bg-black dark:bg-[#333] text-white px-4 py-2 rounded-full hover:bg-stone-800/90 dark:hover:bg-[#333] transition-colors"
            >
              <span>Create</span>
              {!createMenuOpen && <ChevronDown className="w-4 h-4" />}
              {createMenuOpen && <ChevronUp className="w-4 h-4" />}
            </button>

            {/* Create Menu Dropdown -- desktop */}
            {createMenuOpen && (
              <CreateMenuDesktop
                loading={loading}
                handlePostCreate={handlePostCreate}
              />
            )}
          </div>
        </div>

        <MobileNav
          loading={loading}
          handlePostCreate={handlePostCreate}
          setCreateMenuOpen={setCreateMenuOpen}
          createMenuOpen={createMenuOpen}
          setIsMenuOpen={setMobileMenuOpen}
          isMenuOpen={mobileMenuOpen}
        />
      </div>

      {/* mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#111] border-t border-gray-100 dark:border-[#333]">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => {
                  navigate(link.href);
                  setMobileMenuOpen(false);
                }}
                className="block px-4 py-2 hover:bg-lime-300/60 rounded-md text-left w-full"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => navigate("/profile/settings")}
              className="block px-4 py-2 hover:bg-lime-300/60 rounded-md text-left w-full"
            >
              Settings
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
