import { createContext, useContext, useEffect, useState } from "react";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(false);

    // Apply class to <html>
    const applyDarkMode = (isDark) => {
        if (isDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    useEffect(() => {
        const savedDarkMode = localStorage.getItem("darkThemeChoice");

        const initialDarkMode = savedDarkMode
            ? JSON.parse(savedDarkMode)
            : window.matchMedia("(prefers-color-scheme: dark)").matches;

        setDarkMode(initialDarkMode);
        applyDarkMode(initialDarkMode);
    }, []);

    const toggleDarkMode = (value) => {
        setDarkMode(value);
        localStorage.setItem("darkThemeChoice", JSON.stringify(value));
        applyDarkMode(value);
    };

    return (
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
}

// its not used once
export function useDarkModeContext() {
    return useContext(DarkModeContext);
}

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
