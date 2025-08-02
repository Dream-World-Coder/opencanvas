import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PropTypes from "prop-types";
import { toast } from "sonner";

import { useAuth } from "../../contexts/AuthContext";
import { useDataService } from "../../services/dataService";
import AppLogo from "../AppLogo";
import SearchBar from "../SearchBar";
import { CreateMenuDesktop } from "./CreateMenu";
import { MobileNav } from "./MobileNav";

const Header = ({
  noBlur = false,
  ballClr = "text-lime-300",
  exclude = [""],
  abs = false,
  darkBg = "dark:bg-[#222]",
  noShadow = false,
  borderClrLight = "border-gray-100",
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const { currentUser } = useAuth();
  const { getNewPostId } = useDataService();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handlePostCreate(option) {
    if (!currentUser) {
      toast.error("You need to login first");
      return;
    }

    setLoading(true);
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

    setTimeout(() => {
      // window.location.href = option.href;
      navigate(option.href);
    }, 300);
  }

  let navLinks = [
    { name: "Articles", href: "/articles" },
    { name: "Social", href: "/social" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  if (!currentUser) {
    navLinks.push({ name: "Login", href: "/login" });
  }
  if (currentUser) {
    navLinks.push({ name: "Profile", href: "/profile" });
  }

  return (
    <header
      className={`${abs ? "absolute" : "fixed"} w-full top-0 z-50
        ${noShadow ? "shadow-none" : "shadow-sm dark:shadow-none"}
        ${
          noBlur
            ? `bg-white ${darkBg} dark:text-white border-b ${borderClrLight} dark:border-[#333]`
            : `bg-white/20 ${darkBg}/20 backdrop-blur-md`
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-0 py-3">
        <nav className="flex items-center justify-between">
          <div className="flex items-center justify-center gap-2">
            <AppLogo />
            <SearchBar round={true} hideSubmitBtn={true} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link, index) => (
              <React.Fragment key={index}>
                {!exclude.includes(link.href) && (
                  <>
                    <button
                      onClick={() => navigate(link.href)}
                      className={`text-stone-600 hover:text-stone-800 dark:text-[#f8f8f8] dark:hover:text-[#fff]
                        ${link.href !== "/profile" ? "hover:bg-lime-300/50 dark:hover:bg-lime-700/50" : ""}
                        box-content px-3 py-1 rounded-lg transition-all text-sm`}
                    >
                      {link.href !== "/profile" ? (
                        link.name
                      ) : (
                        <Avatar className="size-6 md:size-8 dark:bg-[#333]">
                          <AvatarImage
                            src={currentUser.profilePicture}
                            alt={`${currentUser.username}`}
                          />
                          <AvatarFallback className="dark:bg-[#333]">
                            {currentUser.fullName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </button>
                    {index !== navLinks.length - 1 && (
                      <span className={`${ballClr} flex items-center`}>•</span>
                    )}
                  </>
                )}
              </React.Fragment>
            ))}
            {/* Create Button with Dropdown */}
            <div className="relative">
              {currentUser && (
                <button
                  onClick={() => setCreateMenuOpen(!createMenuOpen)}
                  className="flex items-center space-x-2 bg-black dark:bg-[#333] text-white px-4 py-2 rounded-full hover:bg-stone-800/90 transition-colors"
                >
                  <span className="text-sm">Create</span>
                  {!createMenuOpen && <ChevronDown className="w-4 h-4" />}
                  {createMenuOpen && <ChevronUp className="w-4 h-4" />}
                </button>
              )}

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
            setIsMenuOpen={setIsMenuOpen}
            isMenuOpen={isMenuOpen}
          />
        </nav>

        {/* mobile menu */}
        <div
          className={`md:hidden absolute left-0 right-0 bg-white dark:bg-[#111] backdrop-blur-md shadow-lg
            border-b border-stone-200/50 dark:border-stone-700/50 transition-all duration-300 ease-in-out ${
              isMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
        >
          <div className="px-4 py-6 space-y-6">
            {/* mobile nav links */}
            <div className="flex flex-col">
              {navLinks.map(
                (link, index) =>
                  !exclude.includes(link.href) && (
                    <button
                      key={index}
                      className="py-2 pl-4 rounded-lg text-stone-600 dark:text-gray-300 hover:text-stone-800
                  dark:hover:text-gray-200 hover:bg-lime-300/50 transition-colors flex items-center justify-start"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate(link.href);
                      }}
                    >
                      {link.name}
                    </button>
                  ),
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
Header.propTypes = {
  currentUser: PropTypes.object,
  noBlur: PropTypes.bool,
  abs: PropTypes.bool,
  noShadow: PropTypes.bool,
  ballClr: PropTypes.string,
  darkBg: PropTypes.string,
  borderClrLight: PropTypes.string,
  exclude: PropTypes.array,
};

export default Header;
