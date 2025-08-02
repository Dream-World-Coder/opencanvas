import { useEffect, Suspense, lazy } from "react";
import Lenis from "lenis";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import SocialFeed from "./pages/Feeds/Social";
import "./services/fingerprintService";

// lazy loaded
const LoginPage = lazy(() => import("./pages/Auth/Login"));
const AuthSuccess = lazy(() => import("./pages/Auth/AuthSuccess"));

const Profile = lazy(() => import("./pages/Profile/Profile"));
const ProfileSettings = lazy(() => import("./pages/Profile/ProfileSettings"));
const PublicProfile = lazy(() => import("./pages/Profile/PublicProfile"));
const FollowersPage = lazy(() => import("./pages/Profile/FollowersPage"));
const FollowingPage = lazy(() => import("./pages/Profile/FollowingPage"));
const SavedPosts = lazy(() => import("./pages/Profile/SavedPosts"));

const ViewPost = lazy(() => import("./pages/Post/ViewPost"));
const PrivatePostView = lazy(() => import("./pages/Post/PrivatePostView"));

const AboutPage = lazy(() => import("./pages/About/About"));
const ContactPage = lazy(() => import("./pages/Contact/Contact"));
// ----
// const TuringMachineVisualizer = lazy(() => import("./pages/turing/Index"));

const WritingPad = lazy(() => import("./pages/CreatePosts/Writing/WritingPad"));
const Md2Pdf = lazy(() => import("./pages/CreatePosts/Writing/Md2pdf"));

const ImageUploadPage = lazy(() => import("./pages/CreatePosts/UploadImage"));
const PhotoGalleryPage = lazy(
  () => import("./pages/Galleries/PhotoGallery/PhotoGallery"),
);

const Thanks = lazy(() => import("./pages/Others/Thanks"));
const NotFoundPage = lazy(() => import("./pages/Others/404"));

const queryClient = new QueryClient();

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
      <QueryClientProvider client={queryClient}>
        <Router>
          <DarkModeProvider>
            <AuthProvider>
              <Suspense fallback={<LoadingPage bgClr="bg-white" />}>
                <Routes>
                  {/* <Route
                      path="/turing"
                      element={<TuringMachineVisualizer />}
                    /> */}
                  {/* public */}
                  {/* *************** */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/home" element={<ArticleFeed />} />
                  <Route path="/articles" element={<ArticleFeed />} />
                  <Route path="/social" element={<SocialFeed />} />
                  {/* *************** */}

                  {/* *************** */}
                  <Route
                    path="/login"
                    element={<LoginPage bgClr="bg-cream-light" />}
                  />
                  <Route path="/register" element={<LoginPage />} />
                  <Route path="/signup" element={<LoginPage />} />
                  <Route
                    path="/login-needed"
                    element={<LoginPage backBtn={true} />}
                  />

                  <Route path="/auth/success" element={<AuthSuccess />} />
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
                    element={<PhotoGalleryPage bgClr="bg-white" />}
                  />
                  {/* *************** */}

                  <Route path="/upload-image" element={<ImageUploadPage />} />

                  {/* *************** */}
                  <Route path="/p/:postId" element={<ViewPost />} />
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
                    <Route path="/saved-posts" element={<SavedPosts />} />
                    <Route
                      path="/private/p/:postId"
                      element={<PrivatePostView />}
                    />
                    <Route
                      path="/createpost/poem"
                      element={<WritingPad artType={"poem"} />}
                    />
                    <Route
                      path="/createpost/story"
                      element={<WritingPad artType={"story"} />}
                    />
                    <Route
                      path="/createpost/article"
                      element={<WritingPad artType={"article"} />}
                    />
                    <Route path="/markdown2pdf" element={<Md2Pdf />} />
                    <Route path="/md2pdf" element={<Md2Pdf />} />
                    <Route path="/m/2/p" element={<Md2Pdf />} />
                    <Route path="/m-2-p" element={<Md2Pdf />} />
                    <Route path="/m2p" element={<Md2Pdf />} />

                    {/* <Route
                          path="/upload-image"
                          element={<ImageUploadPage />}
                      /> */}

                    <Route
                      path="/edit-post"
                      element={<WritingPad artType={"edit"} />}
                    />
                  </Route>

                  {/* others */}
                  <Route path="/thanks" element={<Thanks bgClr="bg-white" />} />
                  <Route
                    path="/loading"
                    element={<LoadingPage bgClr="bg-white" />}
                  />
                  <Route path="*" element={<NotFoundPage bgClr="bg-white" />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </DarkModeProvider>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
