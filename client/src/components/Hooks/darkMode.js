import { useEffect, useState } from "react";

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
