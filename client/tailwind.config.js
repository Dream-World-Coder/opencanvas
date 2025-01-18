/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                cream: {
                    DEFAULT: "#FFF5E9",
                    light: "#FFFAF2",
                    dark: "#E6D4C4",
                },
            },
            fontFamily: {
                stardom: ["stardom", "sans-serif"],
            },
        },
    },
    plugins: [],
};
