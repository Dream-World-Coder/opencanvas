import { Helmet } from "react-helmet-async";
import { Globe, Send } from "lucide-react";
import GitHubIcon from "@/components/CustomIcons/Github";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import PropTypes from "prop-types";

const DiscordIcon = ({ className }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.034.055a19.904 19.904 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
);

DiscordIcon.propTypes = { className: PropTypes.string };

const ContactPage = ({ bgClr = "bg-cream-light" }) => {
    const connectLinks = [
        {
            name: "GitHub",
            href: "https://github.com/Dream-World-Coder/opencanvas",
            icon: (
                <GitHubIcon className="size-4 p-1 box-content rounded bg-zinc-300" />
            ),
        },
        {
            name: "Discord",
            href: "https://discord.gg/wkhEh9QRM5",
            icon: (
                <DiscordIcon className="size-4 p-1 box-content rounded bg-indigo-300 text-indigo-900" />
            ),
        },
        {
            name: "Blog",
            href: "https://dream-world-coder.vercel.app",
            icon: (
                <Globe className="size-4 p-1 box-content rounded bg-yellow-300 text-black" />
            ),
        },
    ];

    return (
        <>
            <Helmet>
                <title>Contact | OpenCanvas</title>
                <meta
                    name="description"
                    content="Get in touch with the OpenCanvas team. Suggest ideas, report issues, or connect with contributors via GitHub, Discord, or email."
                />
                <meta name="robots" content="index, follow" />
                <meta name="author" content="Subhajit Gorai" />

                <meta property="og:type" content="website" />
                <meta property="og:title" content="Contact | OpenCanvas" />
                <meta
                    property="og:description"
                    content="Reach out to the OpenCanvas team for collaborations, suggestions, or inquiries."
                />
                <meta
                    property="og:url"
                    content="https://www.opencanvas.institute/contact"
                />
                <meta
                    property="og:image"
                    content="https://www.opencanvas.institute/social-preview.png"
                />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Contact | OpenCanvas" />
                <meta
                    name="twitter:description"
                    content="Reach out to the OpenCanvas team for collaborations, suggestions, or inquiries."
                />
                <meta
                    name="twitter:image"
                    content="https://www.opencanvas.institute/social-preview.png"
                />

                <link
                    rel="canonical"
                    href="https://www.opencanvas.institute/contact"
                />

                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        name: "Contact | OpenCanvas",
                        url: "https://www.opencanvas.institute/contact",
                        description:
                            "Get in touch with the OpenCanvas team. Suggest ideas, report issues, or connect with contributors via GitHub, Discord, or email.",
                        publisher: {
                            "@type": "Person",
                            name: "Subhajit Gorai",
                            url: "https://www.opencanvas.institute/u/subhajit",
                        },
                        mainEntity: {
                            "@type": "ContactPage",
                            contactPoint: {
                                "@type": "ContactPoint",
                                email: "mailto:blog.opencanvas@gmail.com",
                                contactType: "Customer Service",
                                url: "https://www.opencanvas.institute/contact",
                            },
                        },
                        sameAs: [
                            "https://github.com/Dream-World-Coder/opencanvas",
                            "https://discord.gg/wkhEh9QRM5",
                            "https://subhajit.pages.dev",
                        ],
                    })}
                </script>
            </Helmet>

            <div
                className={`min-h-screen ${bgClr} dark:bg-[#111] dark:text-gray-100 pt-8`}
            >
                <Header
                    noBlur={true}
                    exclude={["/contact", "/photo-gallery"]}
                />

                <main className="max-w-2xl mx-auto px-6 py-16">
                    {/* Header Section */}
                    <div className="mb-24 text-center space-y-3">
                        <h1 className="font-serif text-4xl text-stone-900 pointer-events-none md:pointer-events-auto dark:text-gray-50">
                            OpenCanvas
                        </h1>
                        <p className="font-serif text-lg text-stone-700 italic pointer-events-none md:pointer-events-auto dark:text-gray-300">
                            Open source &middot; Built by contributors
                        </p>
                    </div>

                    {/* Connect Links */}
                    <div className="mb-24">
                        <div className="border-t border-b border-stone-300 dark:border-gray-700 py-8">
                            <div className="flex flex-col items-center space-y-6">
                                {connectLinks.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 text-stone-800 dark:text-gray-200 hover:text-stone-950 transition-colors dark:hover:text-white"
                                    >
                                        {item.icon}
                                        <span className="font-serif text-lg">
                                            {item.name}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="relative max-w-xl mx-auto">
                        <h2 className="font-serif text-2xl text-stone-900 text-center mb-12 pointer-events-none md:pointer-events-auto dark:text-gray-50">
                            Feel free to suggest any thoughts
                        </h2>
                        <form
                            action="https://api.web3forms.com/submit"
                            method="post"
                            className="space-y-8"
                        >
                            <input
                                type="hidden"
                                name="access_key"
                                value="0d68234c-653f-49f3-b87d-5f09b35e72c3"
                            />
                            <input
                                type="hidden"
                                name="redirect"
                                value="https://www.opencanvas.institute/thanks"
                            />
                            <div>
                                <input
                                    required
                                    type="text"
                                    placeholder="Your name"
                                    name="name"
                                    className="w-full bg-transparent border-b border-stone-300 dark:border-gray-600 py-2 font-serif text-lg placeholder:text-stone-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-stone-600 dark:focus:border-gray-300 transition-colors"
                                />
                            </div>
                            <div>
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    placeholder="Your email"
                                    className="w-full bg-transparent border-b border-stone-300 dark:border-gray-600 py-2 font-serif text-lg placeholder:text-stone-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-stone-600 dark:focus:border-gray-300 transition-colors"
                                />
                            </div>
                            <div>
                                <textarea
                                    required
                                    name="message"
                                    placeholder="Your message"
                                    rows={2}
                                    className="w-full bg-transparent border-b border-stone-300 dark:border-gray-600 py-2 font-serif text-lg placeholder:text-stone-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-stone-600 dark:focus:border-gray-300 transition-colors resize-none"
                                />
                            </div>
                            <input
                                type="checkbox"
                                name="botcheck"
                                className="hidden"
                                style={{ display: "none" }}
                            />
                            <div className="text-center pt-8">
                                <button
                                    type="submit"
                                    className="font-serif text-lg text-stone-800 dark:text-gray-100
                                    hover:text-stone-950 dark:hover:text-white transition-colors inline-flex
                                    items-center gap-2 bg-lime-400/40 dark:bg-lime-400/20
                                    border border-lime-500 dark:border-lime-600 rounded-full box-content px-4 py-1"
                                >
                                    <span>Send</span>
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
};

ContactPage.propTypes = {
    bgClr: PropTypes.string,
};

export default ContactPage;
/*
    |-----+----------+----------•<•>•----------+----------+------|
    |-----+----------+----------•<•>•----------+----------+------|
    |-----+----------+----------•<•>•----------+----------+------|
    |-----+----------+----------•<•>•----------+----------+------|
    |-----+----------+----------•<•>•----------+----------+------|
    |-----+----------+----------•<•>•----------+----------+------|
    |-----+----------+----------•<•>•----------+----------+------|
    |-----+----------+----------•<•>•----------+----------+------|
    |-----+----------+----------•<•>•----------+----------+------|
    |-----+----------+----------•<•>•----------+----------+------|
    |-----+----------+----------•<•>•----------+----------+------|
*/
