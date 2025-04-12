import { useEffect, useState } from "react";

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

// class based
export function useDarkMode() {
    const getDarkMode = () =>
        document.documentElement.classList.contains("dark");

    const [isDark, setIsDark] = useState(getDarkMode());

    useEffect(() => {
        const targetNode = document.documentElement;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    const dark = getDarkMode();
                    setIsDark(dark);
                    // console.log("Class attribute changed!");
                    // console.log("New class:", targetNode.className);
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
