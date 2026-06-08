import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function HashScroll() {
    const { hash } = useLocation();

    useEffect(() => {
        if (!hash) return;

        const timer = setTimeout(() => {
            const id = decodeURIComponent(hash.slice(1));
            const element = document.getElementById(id);

            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [hash]);

    return null;
}
