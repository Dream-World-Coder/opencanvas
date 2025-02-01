import { useEffect } from "react";
import Lenis from "lenis";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/Auth/Login";
import Profile from "./pages/Profile/Profile";
import AboutPage from "./pages/About/About";
import ContactPage from "./pages/Contact/Contact";

import WritingPad from "./pages/CreatePosts/WritingPad";
import PoemPad from "./pages/CreatePosts/WritePoem";
import StoryPad from "./pages/CreatePosts/WriteStory";

import PhotoGalleryPage from "./pages/Galleries/PhotoGallery/PhotoGallery";
// import PhotoGalleryPage2 from "./pages/Galleries/PhotoGallery/PhotoGallery2";
import LiteratureGallery from "./pages/Galleries/LiteratureGallery/LiteratureGallery";
// import Gallery2 from "./pages/Galleries/LiteratureGallery/old-literaturegallery";

import Thanks from "./pages/Others/Thanks";
import NotFoundPage from "./pages/Others/404";

function App() {
    // { bgClr = "bg-cream-light" }
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
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
                <Route path="/profile" element={<Profile bgClr="bg-white" />} />
                <Route path="/about" element={<AboutPage bgClr="bg-white" />} />
                <Route
                    path="/contact"
                    element={<ContactPage bgClr="bg-white" />}
                />

                {/* gallery */}
                <Route
                    path="/gallery/photos"
                    element={<PhotoGalleryPage bgClr="bg-white" />}
                />
                <Route
                    path="/gallery/literature"
                    element={<LiteratureGallery bgClr="bg-white" />}
                />

                {/* new post */}
                <Route path="/new/poem" element={<PoemPad />} />
                <Route path="/new/story" element={<StoryPad />} />
                <Route path="/new-post/writing" element={<WritingPad />} />

                {/* others */}
                <Route path="/thanks" element={<Thanks bgClr="bg-white" />} />
                <Route path="*" element={<NotFoundPage bgClr="bg-white" />} />
            </Routes>
        </Router>
    );
}

export default App;
