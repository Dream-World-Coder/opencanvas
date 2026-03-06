import { Menu, Plus, Search, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { CreateMenuMobile } from "./CreateMenu";
import { useAuth } from "../../contexts/AuthContext";

export const MobileNav = ({
  loading,
  handlePostCreate,
  setCreateMenuOpen,
  createMenuOpen,
  setIsMenuOpen,
  isMenuOpen,
  filteredNavLinks,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="md:hidden flex items-center justify-center gap-0">
      {/* mobile search btn */}
      <NavLink
        to={"/search"}
        className="flex items-center justify-center p-1 pr-2 rounded-md"
      >
        <Search className="size-6 text-black dark:text-gray-200" />
      </NavLink>

      {currentUser ? (
        <button
          onClick={() => navigate("/profile")}
          className="p-1 rounded-full"
        >
          <Avatar className="size-8 dark:bg-[#333]">
            <AvatarImage
              src={currentUser.profilePicture}
              alt={currentUser.username}
            />
            <AvatarFallback className="dark:bg-[#333]">
              {currentUser.fullName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="text-sm text-stone-600 dark:text-[#f8f8f8] hover:bg-lime-300/50 dark:hover:bg-lime-700/50 px-3 py-1 rounded-lg transition-all"
        >
          Login
        </button>
      )}

      {/* mobile create button */}
      {currentUser && (
        <button
          onClick={() => setCreateMenuOpen(!createMenuOpen)}
          className="w-fit p-2 flex items-center justify-center bg-black text-white rounded-full hover:bg-stone-800/90 transition-colors dark:invert fixed bottom-10 right-6 shadow-lg"
        >
          {createMenuOpen ? (
            <X className="size-5" />
          ) : (
            <Plus className="size-5" />
          )}
        </button>
      )}

      {/* mobile menu button */}
      {filteredNavLinks?.length > 0 && (
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 hover:bg-white/50 rounded-sm transition-colors dark:hover:bg-[#222]/50"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="size-6 text-black dark:text-gray-200" />
          ) : (
            <Menu className="size-6 text-black dark:text-gray-200" />
          )}
        </button>
      )}

      {/* mobile phones create options dropdown */}
      {createMenuOpen && (
        <CreateMenuMobile
          loading={loading}
          handlePostCreate={handlePostCreate}
        />
      )}
    </div>
  );
};
MobileNav.propTypes = {
  loading: PropTypes.bool,
  handlePostCreate: PropTypes.func,
  setCreateMenuOpen: PropTypes.func,
  createMenuOpen: PropTypes.bool,
  setIsMenuOpen: PropTypes.func,
  isMenuOpen: PropTypes.bool,
  filteredNavLinks: PropTypes.array,
};
