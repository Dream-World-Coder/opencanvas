import React, { useState } from "react";
import { X, Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Circle = ({
    radius = "300px",
    top = "top-0",
    left = "left-0",
    bg = "bg-[var(--coffee-dark)]/20",
    border = "border border-[#b1b1b1]",
    blur = "blur(8px)",
}) => {
    return (
        <div
            className={`absolute ${top} ${left} rounded-full z-40 ${bg} ${border} transform`}
            style={{
                width: radius,
                height: radius,
                backdropFilter: blur,
            }}
        />
    );
};

export const SlidingButton = ({ href, children }) => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => {
                navigate(href);
            }}
            className="relative font-[Handlee] italic text-xl md:text-xl py-1 px-3 md:py-2 rounded-md
                 border border-[#d2d4d0] overflow-hidden bg-sky-200/20 md:bg-sky-100/20 group
                 text-[#4d4d4d] group z-30 cursor-pointer transition-colors duration-300 ease-out
                 before:absolute before:inset-0 before:bg-[#d2d4d0] before:translate-x-[-100%]
                 before:transition-transform before:duration-300 hover:before:translate-x-0 before:z-[-1]"
        >
            <span className="relative z-[1] flex items-center justify-center gap-2">
                {children}
            </span>
        </button>
    );
};

export const Navbar = ({ bg }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { currentUser } = useAuth();

    let navLinks = [
        { name: "Articles", href: "/articles" },
        { name: "Literature", href: "/literature" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];
    if (!currentUser) {
        navLinks.push({ name: "Login", href: "/login" });
    }
    if (currentUser) {
        navLinks.push({ name: "Profile", href: "/profile" });
    }

    return (
        <>
            <nav className="flex justify-end items-center h-16 fixed top-4 right-8 z-40">
                {/* Desktop Navigation */}
                <div className="hidden md:flex space-x-2 border border-[#c2c4c0] bg-[#c2c4c0]/10 rounded-full pl-2">
                    {navLinks.map((link, index) => (
                        <React.Fragment key={index}>
                            <a
                                href={link.href}
                                className={`text-stone-600 hover:text-stone-800 flex items-center
                                    ${link.href !== "/profile" ? "hover:bg-[#d2d4d0]" : ""}
                                    rounded-full text-sm transition-all duration-300 box-content px-3 py-1`}
                            >
                                {link.href !== "/profile" ? (
                                    link.name
                                ) : (
                                    <img
                                        src={currentUser.profilePicture}
                                        className="size-6 md:size-8 rounded-full overflow-hidden object-cover block cursor-pointer"
                                        alt=""
                                    />
                                )}
                            </a>
                            {index !== navLinks.length - 1 && (
                                <span className="text-[#c2c4c0] flex items-center">
                                    •
                                </span>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? (
                        <X className="h-6 w-6 text-stone-600" />
                    ) : (
                        <Menu className="h-6 w-6 text-stone-600" />
                    )}
                </button>
            </nav>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div
                    className={`md:hidden absolute top-20 left-0 right-0 ${bg} backdrop-blur-sm z-50 border-b border-stone-200 shadow-sm`}
                >
                    <div className="flex flex-col p-6">
                        {navLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                className="text-stone-600 hover:text-stone-800 hover:bg-[#d2d4d0]/90 py-2 pl-4 rounded-lg text-lg transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export const Footer = () => {
    return (
        <footer className="absolute bottom-0 w-full bg-transparent">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-center">
                <p className="font-sans text-xs sm:text-sm text-gray-400/80 hover:text-gray-500 transition-colors">
                    Copyright &copy; 2025{" "}
                    {/* <span className="font-stardom">OpenCanvas.</span> */}
                    <span className="font-['Six_Caps'] text-lg tracking-wide">
                        {/* <span className="font-[Smooch] text-base">my</span> */}
                        opencanvas
                    </span>{" "}
                    All rights reserved.
                </p>
            </div>
        </footer>
    );
};
