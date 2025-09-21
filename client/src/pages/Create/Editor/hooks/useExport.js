import { useState } from "react";
import html2pdf from "html2pdf.js";

export function useExport(title, content) {
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePdfExport = async () => {
    try {
      setLoading(true);
      setIsPreview(true);
      // waiting a bit for the html to be compiled, no need ig, cuz i have used await
      new Promise((resolve) => {
        setTimeout(resolve, 500);
      }).then(() => console.log("HTML compiled"));

      const element = document.getElementById("export");
      const safeTitle = title
        // Replace one or more non-alphanumeric characters with a hyphen
        .replace(/[^a-zA-Z0-9]+/g, "-")
        // Remove any leading or trailing hyphens
        .replace(/^-|-$/g, "");

      // Configuration options for html2pdf
      const options = {
        margin: 0.5,
        filename: `${safeTitle}.pdf`,
        image: { type: "jpeg", quality: 1.0 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: "in",
          format: "letter",
          orientation: "portrait",
        },
      };

      await html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("PDF export failed, Set Preview Mode on when exporting.", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTxtExport = async (extension) => {
    if (!extension) {
      extension = "txt";
    }
    try {
      setLoading(true);
      const safeTitle = title
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const filename = `${safeTitle}.${extension}`;
      const txtFileContent = `# ${title}\n\n${content}\n`;

      const blob = new Blob([txtFileContent], {
        type: "text/plain;charset=utf-8",
      });
      // temporary URL for the Blob
      const url = URL.createObjectURL(blob);

      // temporary anchor element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Clean up: remove the anchor element and revoke the Blob URL
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("txt export failed:", error);
      alert("txt export failed", error);
    } finally {
      setLoading(false);
    }
  };

  function handleCopy(rawText) {
    navigator.clipboard.writeText(rawText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return {
    isPreview,
    setIsPreview,
    loading,
    copied,
    handlePdfExport,
    handleTxtExport,
    handleCopy,
  };
}
