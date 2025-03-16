import { Helmet } from "react-helmet";
import { Mail, Globe, BookOpen, Send } from "lucide-react";
import LinkedinIcon from "../../components/CustomIcons/LinkedIn";
import GitHubIcon from "../../components/CustomIcons/Github";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import OpenCanvasIcon from "../../components/CustomIcons/OpenCanvas";
import PropTypes from "prop-types";

const ContactPage = ({ bgClr = "bg-cream-light" }) => {
    const connectLinks = [
        {
            name: "OpenCanvas",
            href: "https://opencanvas.blog/u/subhajit",
            icon: OpenCanvasIcon,
        },
        {
            name: "GitHub",
            href: "https://github.com/Dream-World-Coder",
            icon: GitHubIcon,
        },
        {
            name: "LinkedIn",
            href: "https://www.linkedin.com/in/subhajitgorai",
            icon: LinkedinIcon,
        },
        { name: "Portfolio", href: "https://subhajit.pages.dev", icon: Globe },
        {
            name: "Blog",
            href: "https://myopencanvas.pages.dev",
            icon: BookOpen,
        },
        { name: "Email", href: "mailto@blog.opencanvas@gmail.com", icon: Mail },
    ];

    return (
        <>
            <Helmet>
                <title>Contact | OpenCanvas</title>
                <meta
                    name="description"
                    content="Get in touch with Subhajit Gorai, the developer and maintainer of OpenCanvas. Feel free to suggest any thoughts or connect via email, LinkedIn, GitHub, or other platforms."
                />
                <meta name="robots" content="index, follow" />
                <meta name="author" content="Subhajit Gorai" />

                <meta property="og:type" content="website" />
                <meta property="og:title" content="Contact | OpenCanvas" />
                <meta
                    property="og:description"
                    content="Reach out to Subhajit Gorai for collaborations, suggestions, or inquiries regarding OpenCanvas."
                />
                <meta
                    property="og:url"
                    content="https://www.opencanvas.blog/contact"
                />
                <meta
                    property="og:image"
                    content="https://www.opencanvas.blog/social-preview.png"
                />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Contact | OpenCanvas" />
                <meta
                    name="twitter:description"
                    content="Reach out to Subhajit Gorai for collaborations, suggestions, or inquiries regarding OpenCanvas."
                />
                <meta
                    name="twitter:image"
                    content="https://www.opencanvas.blog/social-preview.png"
                />

                <link
                    rel="canonical"
                    href="https://www.opencanvas.blog/contact"
                />

                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        name: "Contact | OpenCanvas",
                        url: "https://www.opencanvas.blog/contact",
                        description:
                            "Get in touch with Subhajit Gorai, the developer and maintainer of OpenCanvas. Feel free to suggest any thoughts or connect via email, LinkedIn, GitHub, or other platforms.",
                        publisher: {
                            "@type": "Person",
                            name: "Subhajit Gorai",
                            url: "https://www.opencanvas.blog/u/subhajit",
                        },
                        mainEntity: {
                            "@type": "ContactPage",
                            contactPoint: {
                                "@type": "ContactPoint",
                                email: "mailto:blog.opencanvas@gmail.com",
                                contactType: "Customer Service",
                                url: "https://www.opencanvas.blog/contact",
                            },
                        },
                        sameAs: [
                            "https://opencanvas.blog/u/subhajit",
                            "https://github.com/Dream-World-Coder",
                            "https://www.linkedin.com/in/subhajitgorai",
                            "https://subhajit.pages.dev",
                            "https://myopencanvas.pages.dev",
                            "https://myopencanvas.in",
                        ],
                    })}
                </script>
            </Helmet>

            <div
                className={`min-h-screen ${bgClr} dark:bg-black dark:text-white pt-8`}
            >
                <Header exclude={["/contact", "/gallery/photos"]} />

                <main className="max-w-2xl mx-auto px-6 py-16">
                    {/* Header Section */}
                    <div className="mb-24 text-center space-y-3">
                        <h1 className="font-serif text-4xl text-stone-800 pointer-events-none md:pointer-events-auto dark:text-white">
                            Subhajit Gorai
                        </h1>
                        <p className="font-serif text-lg text-stone-500 italic pointer-events-none md:pointer-events-auto dark:text-white">
                            Developer &amp; Maintainer
                        </p>
                    </div>

                    {/* Connect Links */}
                    <div className="mb-24">
                        <div className="border-t border-b border-stone-200 py-8">
                            <div className="space-y-6 columns-2 items-start">
                                {connectLinks.map((item, index) => (
                                    <a
                                        key={index}
                                        href={item.href}
                                        target="_blank"
                                        className="flex items-center justify-center gap-3 text-stone-600 dark:text-white hover:text-stone-900 transition-colors dark:hover:text-white"
                                    >
                                        {index === 0 && (
                                            <span className="w-4 h-4 block">
                                                <OpenCanvasIcon />
                                            </span>
                                        )}
                                        {index !== 0 && (
                                            <item.icon className="w-4 h-4" />
                                        )}
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
                        <h2 className="font-serif text-2xl text-stone-800 text-center mb-12 pointer-events-none md:pointer-events-auto dark:text-white">
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
                                value="https://www.opencanvas.blog/thanks"
                            />
                            <div>
                                <input
                                    required
                                    type="text"
                                    placeholder="Your name"
                                    name="name"
                                    className="w-full bg-transparent border-b border-stone-200 py-2 font-serif text-lg placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                                />
                            </div>
                            <div>
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    placeholder="Your email"
                                    className="w-full bg-transparent border-b border-stone-200 py-2 font-serif text-lg placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                                />
                            </div>
                            <div>
                                <textarea
                                    required
                                    name="message"
                                    placeholder="Your message"
                                    rows={2}
                                    className="w-full bg-transparent border-b border-stone-200 py-2 font-serif text-lg placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors resize-none"
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
                                    className="font-serif text-lg text-stone-600
                                hover:text-stone-900 transition-colors inline-flex
                                items-center gap-2 bg-lime-300/30
                                border border-lime-300 rounded-full box-content px-4 py-1 dark:text-white"
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
