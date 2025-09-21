import { useState, useEffect } from "react";
import { useDarkModeContext } from "@/contexts/ThemeContext";

export function useEditorAppearance() {
  const [sepia, setSepia] = useState(false);
  const [lightModeBg, setLightModeBg] = useState("bg-white");
  const { darkMode: isDark, toggleDarkMode } = useDarkModeContext();
  const [helpOpen, setHelpOpen] = useState(false);
  const [optionsDropdownOpen, setOptionsDropdownOpen] = useState(false);

  // Handle document appearance based on theme settings
  useEffect(() => {
    if (isDark && sepia) {
      document.body.style.backgroundColor = "#222";
    } else if (isDark && !sepia) {
      document.body.style.backgroundColor = "#222";
    } else if (!isDark && sepia) {
      document.body.style.backgroundColor = "#FCF5E6";
    } else {
      document.body.style.backgroundColor = "#fff";
    }
  }, [isDark, sepia]);

  // Update background color based on sepia setting
  useEffect(() => {
    if (sepia) {
      setLightModeBg("bg-[#FCF5E6]");
    } else {
      setLightModeBg("bg-white");
    }
  }, [sepia]);

  return {
    sepia,
    setSepia,
    lightModeBg,
    isDark,
    toggleDarkMode,
    helpOpen,
    setHelpOpen,
    optionsDropdownOpen,
    setOptionsDropdownOpen,
  };
}
