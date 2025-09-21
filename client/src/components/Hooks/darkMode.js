import { useEffect, useState } from "react";

// don't use this
export function useDarkMode() {
  const getDarkMode = () => document.documentElement.classList.contains("dark");

  const [isDark, setIsDark] = useState(getDarkMode());

  useEffect(() => {
    const targetNode = document.documentElement;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const dark = getDarkMode();
          setIsDark(dark);
          // console.log("Class attribute changed!");
        }
      });
    });

    // Add observer
    observer.observe(targetNode, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  return isDark;
}

// theme based
/*
export function useDarkMode() {
    const getDarkMode = () =>
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    const [isDark, setIsDark] = useState(getDarkMode());

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (e) => setIsDark(e.matches);

        // Add event listener
        mediaQuery.addEventListener("change", handleChange);

        // Cleanup event listener on component unmount
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return isDark;
}
*/

/*client  (git)-[main]- ➤ rg useDarkModeContext
src/contexts/ThemeContext.jsx
41:export function useDarkModeContext() {
client  (git)-[main]- ➤ rg useDarkMode
src/contexts/ThemeContext.jsx
42:export function useDarkModeContext() {

src/components/Hooks/darkMode.js
4:export function useDarkMode() {
40:export function useDarkMode() {

src/pages/Post/ViewPost.jsx
14:import { useDarkMode } from "../../components/Hooks/darkMode";
39:    const isDark = useDarkMode();

src/pages/Feeds/feed-article.jsx
13:import { useDarkMode } from "../../components/Hooks/darkMode";
19:    const isDark = useDarkMode();
417:import { useDarkMode } from "../../components/Hooks/darkMode";
433:    const isDark = useDarkMode();

src/pages/Feeds/Articles.jsx
9:import { useDarkMode } from "../../components/Hooks/darkMode";
25:    const isDark = useDarkMode();

src/pages/Profile/Profile.jsx
19:import { useDarkMode } from "../../components/Hooks/darkMode";
24:    const isDark = useDarkMode();

src/pages/Profile/backup.jsx
21:import { useDarkMode } from "../../components/Hooks/darkMode";
26:    const isDark = useDarkMode();

src/pages/Profile/PublicProfile.jsx
21:import { useDarkMode } from "../../components/Hooks/darkMode";
24:    const isDark = useDarkMode(); */
