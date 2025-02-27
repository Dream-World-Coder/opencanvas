import { useEffect, Suspense, lazy } from "react";
import Lenis from "lenis";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingPage from "./pages/Others/LoadingPage";
import { HelmetProvider } from "react-helmet-async";

// Loaded with main bundle
import LandingPage from "./pages/LandingPage/LandingPage";

// Lazy loaded components
const LoginPage = lazy(() => import("./pages/Auth/Login"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const AboutPage = lazy(() => import("./pages/About/About"));
const ContactPage = lazy(() => import("./pages/Contact/Contact"));
const WritingPad = lazy(() => import("./pages/CreatePosts/Writing/WritingPad"));
const PoemPad = lazy(() => import("./pages/CreatePosts/WritePoem"));
const StoryPad = lazy(() => import("./pages/CreatePosts/WriteStory"));
const PhotoGalleryPage = lazy(
    () => import("./pages/Galleries/PhotoGallery/PhotoGallery"),
);
const LiteratureGallery = lazy(
    () => import("./pages/Galleries/LiteratureGallery/LiteratureGallery"),
);
const Thanks = lazy(() => import("./pages/Others/Thanks"));
const NotFoundPage = lazy(() => import("./pages/Others/404"));

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
        <HelmetProvider>
            <Router>
                <AuthProvider>
                    <Suspense fallback={<LoadingPage bgClr="bg-white" />}>
                        <Routes>
                            {/* public */}
                            <Route path="/" element={<LandingPage />} />
                            <Route
                                path="/login"
                                element={<LoginPage bgClr="bg-cream-light" />}
                            />
                            <Route path="/register" element={<LoginPage />} />
                            {/* <Route path="/auth/success" element={<AuthSuccess />} /> */}
                            {/* <Route path="/post/:id" element={<PostDetail />} /> */}
                            <Route
                                path="/about"
                                element={<AboutPage bgClr="bg-white" />}
                            />
                            <Route
                                path="/contact"
                                element={<ContactPage bgClr="bg-white" />}
                            />
                            <Route
                                path="/gallery/photos"
                                element={<PhotoGalleryPage bgClr="bg-white" />}
                            />
                            <Route
                                path="/gallery/literature"
                                element={<LiteratureGallery bgClr="bg-white" />}
                            />
                            <Route
                                path="/markdown2pdf"
                                element={<WritingPad />}
                            />
                            {/* protected */}
                            <Route element={<ProtectedRoute />}>
                                <Route
                                    path="/profile"
                                    element={<Profile bgClr="bg-white" />}
                                />
                                <Route path="/new/poem" element={<PoemPad />} />
                                <Route
                                    path="/new/story"
                                    element={<StoryPad />}
                                />
                                {/* <Route path="/my-posts" element={<UserPosts />} /> */}
                            </Route>
                            {/* others */}
                            <Route
                                path="/thanks"
                                element={<Thanks bgClr="bg-white" />}
                            />
                            <Route
                                path="/loading"
                                element={<LoadingPage bgClr="bg-white" />}
                            />
                            <Route
                                path="*"
                                element={<NotFoundPage bgClr="bg-white" />}
                            />
                        </Routes>
                    </Suspense>
                </AuthProvider>
            </Router>
        </HelmetProvider>
    );
}
