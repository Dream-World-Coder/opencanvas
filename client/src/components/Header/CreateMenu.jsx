import { Plus } from "lucide-react";
import { createOptions } from "./createOptions";
import PropTypes from "prop-types";

export const CreateMenuMobile = ({ loading, handlePostCreate }) => {
  return (
    <div
      className="fixed bottom-24 right-4 w-64 bg-white border border-gray-100
                  rounded-lg shadow-lg py-2 z-50 dark:bg-[#111] dark:border-[#333]"
    >
      {createOptions.map((option) => (
        <button
          key={option.id}
          className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50
                          dark:hover:bg-[#333] transition-colors group ${loading ? "pointer-events-none opacity-70" : ""}`}
          onClick={() => {
            handlePostCreate(option);
          }}
          disabled={loading}
        >
          <div className={`p-2 rounded-full ${option.color}`}>
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <option.icon className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="flex items-center justify-center gap-3">
            {loading ? "Loading..." : option.label}{" "}
            {!loading && (
              <Plus className="w-4 h-4 opacity-0 group-hover:opacity-[100] transition-all duration-150 text-stone-700 dark:text-stone-200" />
            )}
          </span>
        </button>
      ))}
    </div>
  );
};
CreateMenuMobile.propTypes = {
  loading: PropTypes.bool,
  handlePostCreate: PropTypes.func,
};

export const CreateMenuDesktop = ({ loading, handlePostCreate }) => {
  return (
    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111] border border-gray-100 dark:border-[#333] rounded-lg shadow-lg py-2 z-50">
      {createOptions.map((option) => (
        <button
          key={option.id}
          className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors group
        ${loading ? "pointer-events-none opacity-70" : ""}`}
          onClick={() => {
            handlePostCreate(option);
          }}
          disabled={loading}
        >
          <div className={`p-2 rounded-full ${option.color}`}>
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <option.icon className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="flex items-center justify-center gap-3">
            {loading ? "Loading..." : option.label}{" "}
            {!loading && (
              <Plus className="w-4 h-4 opacity-0 group-hover:opacity-[100] transition-all duration-150 text-stone-700 dark:text-stone-200" />
            )}
          </span>
        </button>
      ))}
    </div>
  );
};
CreateMenuDesktop.propTypes = {
  loading: PropTypes.bool,
  handlePostCreate: PropTypes.func,
};
