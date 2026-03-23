import { useState } from "react";
import PropTypes from "prop-types";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

export const RelatedPostsDropdown = ({ darkTheme }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`mb-8`}>
      <div
        className={`flex items-center justify-between cursor-pointer mb-2 bg-gray-50
                    ${darkTheme.colors.headerBg} p-4 rounded-lg hover:bg-gray-100
                    dark:hover:bg-[#313026] transition-colors`}
        onClick={toggleDropdown}
      >
        <h3 className={`text-xl font-bold ${darkTheme.colors.primaryText}`}>
          Related Posts
        </h3>
        {isOpen ? (
          <ChevronUp
            className={`h-5 w-5 text-gray-500 ${darkTheme.colors.primaryText}`}
          />
        ) : (
          <ChevronDown
            className={`h-5 w-5 text-gray-500 ${darkTheme.colors.primaryText}`}
          />
        )}
      </div>
      {isOpen && (
        <div className={`grid gap-4 mt-4 transition-all duration-300`}>
          <p className={`text-center text-gray-500 ${darkTheme.colors.secondaryText} py-8`}>
            No Recommended Posts Found
          </p>
        </div>
      )}
    </div>
  );
};
RelatedPostsDropdown.propTypes = { darkTheme: PropTypes.object };
