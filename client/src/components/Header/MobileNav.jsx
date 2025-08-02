import { Menu, Plus, Search, X } from "lucide-react";
import PropTypes from "prop-types";

import { CreateMenuMobile } from "./CreateMenu";

export const MobileNav = ({
  loading,
  handlePostCreate,
  setCreateMenuOpen,
  createMenuOpen,
  setIsMenuOpen,
  isMenuOpen,
}) => {
  return (
    <div className="md:hidden flex items-center justify-center gap-0">
      {/* mobile search btn */}
      <button className="flex items-center justify-center p-2 rounded-md">
        <Search className="size-5 text-black dark:text-gray-200" />
      </button>

      {/* mobile create button */}
      <button
        onClick={() => setCreateMenuOpen(!createMenuOpen)}
        className="w-fit p-2 flex items-center justify-center bg-black text-white rounded-full hover:bg-stone-800/90
    transition-colors dark:invert fixed bottom-10 right-6 shadow-lg"
      >
        {createMenuOpen ? (
          <X className="size-5" />
        ) : (
          <Plus className="size-5" />
        )}
      </button>

      {/* mobile menu button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden p-2 hover:bg-white/50 rounded-sm transition-colors dark:hover:bg-[#222]/50"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? (
          <X className="size-5 text-black dark:text-gray-200" />
        ) : (
          <Menu className="size-5 text-black dark:text-gray-200" />
        )}
      </button>

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
};
