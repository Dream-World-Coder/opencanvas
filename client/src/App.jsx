import { useEffect } from "react";
import Lenis from "lenis";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/Auth/Login";
import Profile from "./pages/Profile/Profile";
import AboutPage from "./pages/About/About";
import ContactPage from "./pages/Contact/Contact";

import WritingPad from "./pages/CreatePosts/Writing/WritingPad";
import PoemPad from "./pages/CreatePosts/WritePoem";
import StoryPad from "./pages/CreatePosts/WriteStory";

import PhotoGalleryPage from "./pages/Galleries/PhotoGallery/PhotoGallery";
import LiteratureGallery from "./pages/Galleries/LiteratureGallery/LiteratureGallery";

import Thanks from "./pages/Others/Thanks";
import NotFoundPage from "./pages/Others/404";
import LoadingPage from "./pages/Others/LoadingPage";

export default function App() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 0.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return (
        <Router>
            <Routes>
                {/* basic */}
                <Route path="/" element={<LandingPage />} />
                <Route
                    path="/login"
                    element={<LoginPage bgClr="bg-cream-light" />}
                />
                <Route
                    path="/profile"
                    element={<Profile bgClr="bg-white" />}
                    // loader={<LoadingPage />}
                />
                <Route
                    path="/about"
                    element={<AboutPage bgClr="bg-white" />}
                    // loader={<LoadingPage />}
                />
                <Route
                    path="/contact"
                    element={<ContactPage bgClr="bg-white" />}
                    // loader={<LoadingPage />}
                />

                {/* gallery */}
                <Route
                    path="/gallery/photos"
                    element={<PhotoGalleryPage bgClr="bg-white" />}
                    // loader={<LoadingPage />}
                />
                <Route
                    path="/gallery/literature"
                    element={<LiteratureGallery bgClr="bg-white" />}
                    // loader={<LoadingPage />}
                />

                {/* new post */}
                <Route
                    path="/new/poem"
                    element={<PoemPad />}
                    // loader={<LoadingPage />}
                />
                <Route
                    path="/new/story"
                    element={<StoryPad />}
                    // loader={<LoadingPage />}
                />
                <Route
                    path="/markdown2pdf"
                    element={<WritingPad />}
                    // loader={<LoadingPage />}
                />

                {/* others */}
                <Route path="/thanks" element={<Thanks bgClr="bg-white" />} />
                <Route
                    path="/loading"
                    element={<LoadingPage bgClr="bg-white" />}
                />
                <Route path="*" element={<NotFoundPage bgClr="bg-white" />} />
            </Routes>
        </Router>
    );
}
