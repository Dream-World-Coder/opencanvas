import { Mail, Globe, BookOpen, Send } from "lucide-react";
import LinkedinIcon from "../../components/CustomIcons/LinkedIn";
import GitHubIcon from "../../components/CustomIcons/Github";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const ContactPage = () => {
    const connectLinks = [
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
        // { name: "Email", href: "mailto@lumifeed101@gmail.com", icon: Mail },
    ];

    return (
        <div className="min-h-screen bg-cream pt-8">
            <Header />

            <main className="max-w-2xl mx-auto px-6 py-16">
                {/* Header Section */}
                <div className="mb-24 text-center space-y-3">
                    <h1 className="font-serif text-4xl text-stone-800">
                        Subhajit Gorai
                    </h1>
                    <p className="font-serif text-lg text-stone-500 italic">
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
                                    className="flex items-center justify-center gap-3 text-stone-600 hover:text-stone-900 transition-colors"
                                >
                                    <item.icon className="w-4 h-4" />
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
                    <h2 className="font-serif text-2xl text-stone-800 text-center mb-12">
                        Feel free to suggest any thoughts
                    </h2>
                    <form className="space-y-8">
                        <div>
                            <input
                                type="text"
                                placeholder="Your name"
                                className="w-full bg-transparent border-b border-stone-200 py-2 font-serif text-lg placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                placeholder="Your email"
                                className="w-full bg-transparent border-b border-stone-200 py-2 font-serif text-lg placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                            />
                        </div>
                        <div>
                            <textarea
                                placeholder="Your message"
                                rows={1}
                                className="w-full bg-transparent border-b border-stone-200 py-2 font-serif text-lg placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors resize-none"
                            />
                        </div>
                        <div className="text-center pt-8">
                            <button
                                type="submit"
                                className="font-serif text-lg text-stone-600 hover:text-stone-900 transition-colors inline-flex items-center gap-2 border border-stone-300 rounded-full box-content px-4 py-1"
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
    );
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
