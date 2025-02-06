/*
import { useState, useEffect } from "react";

const Hooks = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log("Count updated:", count);
    }, [count]);

    return { count, setCount };
};

export default Hooks;
*/

/**
 * export to pdf functionality
 * activates when export to pdf button is clicked
 * finds the div#export -> so the preview must be on when exporting
 * and makes pdf from the html using: html2pdf, jsPDF & html2canvas
 */

import html2pdf from "html2pdf.js";

export const handleExport = async () => {
    try {
        const element = document.getElementById("export");

        // Configuration options for html2pdf
        const options = {
            margin: 0.5,
            filename: `${window.crypto.randomUUID()}-myOpenCanvas.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
            },
            jsPDF: {
                unit: "in",
                format: "letter",
                orientation: "portrait",
            },
        };

        // Generate and download PDF
        await html2pdf().set(options).from(element).save();
    } catch (error) {
        console.error("PDF export failed:", error);
        alert("PDF export failed, Set Preview Mode on when exporting.", error);
        // toast.error();
    }
};
