import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

import { AuthProvider } from "./contexts/AuthContext";
import { DarkModeProvider } from "./contexts/ThemeContext";
import { CollectionContextProvider } from "./contexts/CollectionContext";

import ProtectedRoute from "./components/ProtectedRoute";
import LoadingPage from "./pages/Others/LoadingPage";

// loaded with main bundle
import LandingPage from "./pages/LandingPage/LandingPage";
import ArticleFeed from "./pages/Feed/ArticlesPage";
import SocialFeed from "./pages/Feed/SocialPage";
import "./services/fingerprintService";
// import Editor from "./pages/Editor/Editor";

// lazy
const LoginPage = lazy(() => import("./pages/Auth/Login"));
const AuthSuccess = lazy(() => import("./pages/Auth/AuthSuccess"));

const Profile = lazy(() => import("./pages/Profile/Profile"));
const ProfileSettings = lazy(() => import("./pages/Profile/ProfileSettings"));
const PublicProfile = lazy(() => import("./pages/Profile/PublicProfile"));
const FollowersPage = lazy(() => import("./pages/Profile/FollowersPage"));
const FollowingPage = lazy(() => import("./pages/Profile/FollowingPage"));
const SavedPosts = lazy(() => import("./pages/Profile/SavedPosts"));

const ViewPost = lazy(() => import("./pages/PostView/PostPage"));
const PrivatePostView = lazy(() => import("./pages/PostView/PrivatePostPage"));

const AboutPage = lazy(() => import("./pages/About/About"));
const ContactPage = lazy(() => import("./pages/Contact/Contact"));

const WritingPad = lazy(() => import("./pages/Create/Editor/WritingPad"));
const WritingPadFrontendOnly = lazy(
  () => import("./pages/Create/Editor/WritingPadFrontend"),
);

const ImageUploadPage = lazy(() => import("./pages/Create/UploadImage"));

const Thanks = lazy(() => import("./pages/Others/Thanks"));
const NotFoundPage = lazy(() => import("./pages/Others/404"));

export default function App() {
  const queryClient = new QueryClient();

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <DarkModeProvider>
            <AuthProvider>
              <CollectionContextProvider>
                <Suspense fallback={<LoadingPage />}>
                  <Routes>
                    {/* public
                    ----------- */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<ArticleFeed />} />
                    <Route path="/articles" element={<ArticleFeed />} />
                    <Route path="/social" element={<SocialFeed />} />
                    {/* <Route path="/editor" element={<Editor />} />*/}
                    {/* --------------- */}

                    {/* Auth
                    --------- */}
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
                    {/* --------------- */}

                    {/* About & contact
                    ------------------- */}
                    <Route
                      path="/about"
                      element={<AboutPage bgClr="bg-white" />}
                    />
                    <Route
                      path="/contact"
                      element={<ContactPage bgClr="bg-white" />}
                    />
                    {/* --------------- */}

                    <Route path="/upload-image" element={<ImageUploadPage />} />
                    <Route
                      path="/thanks"
                      element={<Thanks bgClr="bg-white" />}
                    />
                    <Route
                      path="/loading"
                      element={<LoadingPage bgClr="bg-white" />}
                    />

                    {/* --------------- */}
                    <Route path="/p/:postId" element={<ViewPost />} />
                    {/* <Route path="/c/:collectionId" element={<ViewPost />} />*/}
                    <Route
                      path="/u/:username"
                      element={<PublicProfile bgClr="bg-white" />}
                    />

                    <Route
                      path="/u/:username/followers"
                      element={<FollowersPage />} //followers public but following login needed
                    />

                    <Route
                      path="/markdown2pdf"
                      element={<WritingPadFrontendOnly />}
                    />
                    <Route
                      path="/md2pdf"
                      element={<WritingPadFrontendOnly />}
                    />
                    <Route path="/m/2/p" element={<WritingPadFrontendOnly />} />
                    <Route path="/m2p" element={<WritingPadFrontendOnly />} />
                    {/* --------------- */}

                    {/* protected
                    ------------ */}
                    <Route element={<ProtectedRoute />}>
                      {/* test routes */}
                      {/* end test */}

                      <Route
                        path="/profile"
                        element={<Profile bgClr="bg-white" />}
                      />
                      <Route
                        path="/profile/settings"
                        element={<ProfileSettings />}
                      />
                      <Route path="/saved-posts" element={<SavedPosts />} />
                      <Route
                        path="/u/:username/following"
                        element={<FollowingPage />}
                      />
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
                      <Route
                        path="/edit-post"
                        element={<WritingPad artType={"edit"} />}
                      />
                    </Route>

                    <Route
                      path="*"
                      element={<NotFoundPage bgClr="bg-white" />}
                    />
                  </Routes>
                </Suspense>

                <Toaster />
                <Analytics />
              </CollectionContextProvider>
            </AuthProvider>
          </DarkModeProvider>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

/*
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
*/
