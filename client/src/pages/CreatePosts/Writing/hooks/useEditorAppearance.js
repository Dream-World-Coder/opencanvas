import { useState, useEffect } from "react";

export function useEditorAppearance() {
    const [isSerif, setIsSerif] = useState(false);
    const [documentScroll, setDocumentScroll] = useState(false);
    const [sepia, setSepia] = useState(false);
    const [lightModeBg, setLightModeBg] = useState("bg-white");
    const [isDark, setIsDark] = useState(false);
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
        isSerif,
        setIsSerif,
        documentScroll,
        setDocumentScroll,
        sepia,
        setSepia,
        lightModeBg,
        isDark,
        setIsDark,
        helpOpen,
        setHelpOpen,
        optionsDropdownOpen,
        setOptionsDropdownOpen,
    };
}
