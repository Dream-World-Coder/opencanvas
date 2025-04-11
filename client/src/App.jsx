import { useEffect, Suspense, lazy } from "react";
import Lenis from "lenis";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";

import { AuthProvider } from "./contexts/AuthContext";
import { DarkModeProvider } from "./contexts/ThemeContext";

import ProtectedRoute from "./components/ProtectedRoute";
import LoadingPage from "./pages/Others/LoadingPage";
import { HelmetProvider } from "react-helmet-async";

// loaded with main bundle
import LandingPage from "./pages/LandingPage/LandingPage";
import ArticleFeed from "./pages/Feeds/Articles";
import LiteratureFeed from "./pages/Feeds/Arts";
import "./services/fingerprintService";

// lazy loaded
const LoginPage = lazy(() => import("./pages/Auth/Login"));
const LogoutPage = lazy(() => import("./pages/Auth/Logout"));
const AuthSuccess = lazy(() => import("./pages/Auth/AuthSuccess"));

const Profile = lazy(() => import("./pages/Profile/Profile"));
const ProfileSettings = lazy(() => import("./pages/Profile/ProfileSettings"));
const PublicProfile = lazy(() => import("./pages/Profile/PublicProfile"));
const FollowersPage = lazy(() => import("./pages/Profile/FollowersPage"));
const FollowingPage = lazy(() => import("./pages/Profile/FollowingPage"));

const ViewPost = lazy(() => import("./pages/Post/ViewPost"));

const AboutPage = lazy(() => import("./pages/About/About"));
const ContactPage = lazy(() => import("./pages/Contact/Contact"));

const WritingPad = lazy(() => import("./pages/CreatePosts/Writing/WritingPad"));
const Md2Pdf = lazy(() => import("./pages/CreatePosts/Writing/Md2pdf"));

const ImageUploadPage = lazy(() => import("./pages/CreatePosts/UploadImage"));
const PhotoGalleryPage = lazy(
    () => import("./pages/Galleries/PhotoGallery/PhotoGallery"),
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
                <DarkModeProvider>
                    <AuthProvider>
                        <Suspense fallback={<LoadingPage bgClr="bg-white" />}>
                            <Routes>
                                {/* public */}
                                {/* *************** */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/home" element={<ArticleFeed />} />
                                <Route
                                    path="/articles"
                                    element={<ArticleFeed />}
                                />
                                <Route
                                    path="/literature"
                                    element={
                                        <LiteratureFeed bgClr="bg-white" />
                                    }
                                />
                                {/* *************** */}

                                {/* *************** */}
                                <Route
                                    path="/login"
                                    element={
                                        <LoginPage bgClr="bg-cream-light" />
                                    }
                                />
                                <Route
                                    path="/register"
                                    element={<LoginPage />}
                                />
                                <Route
                                    path="/auth/success"
                                    element={<AuthSuccess />}
                                />
                                <Route
                                    path="/logout"
                                    element={<LogoutPage />}
                                />
                                {/* *************** */}

                                {/* *************** */}
                                <Route
                                    path="/about"
                                    element={<AboutPage bgClr="bg-white" />}
                                />
                                <Route
                                    path="/contact"
                                    element={<ContactPage bgClr="bg-white" />}
                                />
                                {/* *************** */}

                                {/* *************** */}
                                <Route
                                    path="/photo-gallery"
                                    element={
                                        <PhotoGalleryPage bgClr="bg-white" />
                                    }
                                />
                                <Route
                                    path="/markdown2pdf"
                                    element={<Md2Pdf />}
                                />
                                <Route path="/md2pdf" element={<Md2Pdf />} />
                                <Route path="/m/2/p" element={<Md2Pdf />} />
                                <Route path="/m-2-p" element={<Md2Pdf />} />
                                <Route path="/m2p" element={<Md2Pdf />} />
                                {/* *************** */}

                                {/* *************** */}
                                <Route
                                    path="/p/:postId"
                                    element={<ViewPost />}
                                />
                                <Route
                                    path="/u/:username"
                                    element={<PublicProfile bgClr="bg-white" />}
                                />
                                {/* *************** */}

                                {/* protected */}
                                <Route element={<ProtectedRoute />}>
                                    <Route
                                        path="/profile"
                                        element={<Profile bgClr="bg-white" />}
                                    />
                                    <Route
                                        path="/u/:username/followers"
                                        element={<FollowersPage />}
                                    />
                                    <Route
                                        path="/u/:username/following"
                                        element={<FollowingPage />}
                                    />
                                    <Route
                                        path="/profile/settings"
                                        element={<ProfileSettings />}
                                    />
                                    <Route
                                        path="/createpost/poem"
                                        element={
                                            <WritingPad artType={"poem"} />
                                        }
                                    />
                                    <Route
                                        path="/createpost/story"
                                        element={
                                            <WritingPad artType={"story"} />
                                        }
                                    />
                                    <Route
                                        path="/createpost/article"
                                        element={
                                            <WritingPad artType={"article"} />
                                        }
                                    />

                                    <Route
                                        path="/upload-image"
                                        element={<ImageUploadPage />}
                                    />

                                    <Route
                                        path="/edit-post"
                                        element={
                                            <WritingPad artType={"edit"} />
                                        }
                                    />
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
                </DarkModeProvider>
                <Toaster />
            </Router>
        </HelmetProvider>
    );
}
