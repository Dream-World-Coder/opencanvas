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

export function useDarkModeContext() {
    return useContext(DarkModeContext);
}
