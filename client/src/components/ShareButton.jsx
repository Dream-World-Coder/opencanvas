import React, { useState } from "react";
import {
    Whatsapp,
    FacebookMessenger,
    Twitter,
    Linkedin,
    Clipboard,
    ClipboardCheck,
    Share2,
} from "lucide-react";

const ShareButton = ({ text, url }) => {
    const [shareNow, setShareNow] = useState(false);
    const message = encodeURIComponent(`${text} ${url}`);

    // Social media share handlers
    const handleWhatsAppShare = () => {
        window.open(`https://wa.me/?text=${message}`, "_blank");
    };

    const handleMessengerShare = () => {
        window.open(
            `fb-messenger://share/?link=${encodeURIComponent(url)}&app_id=YOUR_APP_ID`,
            "_blank",
        );
    };

    const handleTwitterShare = () => {
        window.open(
            `https://twitter.com/intent/tweet?text=${message}`,
            "_blank",
        );
    };

    const handleLinkedInShare = () => {
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                url,
            )}`,
            "_blank",
        );
    };

    // Clipboard functionality
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div>
            {/* Main Share Button */}
            <button
                className="px-3 py-1 text-white rounded-md flex gap-1 bg-blue-400 font-semibold mx-auto"
                onClick={() => setShareNow(!shareNow)}
            >
                <span> Share {!shareNow && <span> Now </span>} </span>
                <Share2 size={24} />
            </button>

            {/* Share Options Section */}
            {shareNow && (
                <section className="my-2">
                    <div className="flex flex-col items-center justify-center bg-gray-100 py-2 ">
                        <h1 className="text-2xl font-bold mb-4">
                            Share this content
                        </h1>
                        <div className="flex space-x-4 py-3">
                            <button
                                onClick={handleWhatsAppShare}
                                className="flex items-center justify-center p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                            >
                                <Whatsapp size={24} />
                            </button>
                            <button
                                onClick={handleMessengerShare}
                                className="flex items-center justify-center p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                            >
                                <FacebookMessenger size={24} />
                            </button>
                            <button
                                onClick={handleTwitterShare}
                                className="flex items-center justify-center p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500"
                            >
                                <Twitter size={24} />
                            </button>
                            <button
                                onClick={handleLinkedInShare}
                                className="flex items-center justify-center p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800"
                            >
                                <Linkedin size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Copy URL Section */}
                    <div className="flex flex-col items-center justify-center bg-gray-100 mb-2 py-2">
                        <h1 className="text-xl font-bold mb-4">
                            Copy this URL
                        </h1>
                        <div className="flex items-center justify-center">
                            <button
                                onClick={handleCopy}
                                className={`flex items-center justify-center p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 ${
                                    copied
                                        ? "bg-green-600 hover:bg-green-700"
                                        : ""
                                }`}
                            >
                                {copied ? (
                                    <ClipboardCheck size={24} />
                                ) : (
                                    <Clipboard size={16} />
                                )}
                                <span className="ml-2">
                                    {copied ? "Copied!" : "Copy URL"}
                                </span>
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default ShareButton;
