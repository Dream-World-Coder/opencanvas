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

// Loaded with the main bundle - pages users hit immediately on arrival
import LandingPage from "./pages/LandingPage/LandingPage";
import ArticleFeed from "./pages/Feed/ArticlesPage";

import "./services/fingerprintService";

// Everything else is lazy - loaded only when the route is first visited
const LoginPage = lazy(() => import("./pages/Auth/Login"));
const AuthSuccess = lazy(() => import("./pages/Auth/AuthSuccess"));

const Profile = lazy(() => import("./pages/Profile/Personal"));
const ProfileSettings = lazy(() => import("./pages/Profile/Settings"));
const PublicProfile = lazy(() => import("./pages/Profile/Public"));
const FollowersPage = lazy(() => import("./pages/Profile/Followers"));
const FollowingPage = lazy(() => import("./pages/Profile/Following"));
const SavedPosts = lazy(() => import("./pages/Profile/SavedPosts"));

const ViewPost = lazy(() => import("./pages/PostView/PostPage"));
const PrivatePostView = lazy(() => import("./pages/PostView/PrivatePostPage"));

// const CollectionView = lazy(() => import("./pages/Collection/CollectionPage"));

const AboutPage = lazy(() => import("./pages/About/About"));
const ContactPage = lazy(() => import("./pages/Contact/Contact"));

// WritingPad     → requires auth, saves to backend
// WritingPadMd   → public, frontend-only markdown editor / md2pdf tool
const WritingPad = lazy(() => import("./pages/Create/Editor/WritingPad"));
const WritingPadMd = lazy(
  () => import("./pages/Create/Editor/WritingPadFrontend"),
);

const SearchPage = lazy(() => import("./pages/Search/SearchPage"));

const Thanks = lazy(() => import("./pages/Others/Thanks"));
const NotFoundPage = lazy(() => import("./pages/Others/404"));

// Must live outside the component so the cache survives re-renders
const queryClient = new QueryClient();

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <DarkModeProvider>
            <AuthProvider>
              <CollectionContextProvider>
                <Suspense fallback={<LoadingPage />}>
                  <Routes>
                    {/* ── Static ──────────────────────────────────────── */}
                    <Route path="/" element={<LandingPage />} />
                    <Route
                      path="/about"
                      element={<AboutPage bgClr="bg-white" />}
                    />
                    <Route
                      path="/contact"
                      element={<ContactPage bgClr="bg-white" />}
                    />
                    <Route
                      path="/thanks"
                      element={<Thanks bgClr="bg-white" />}
                    />
                    <Route
                      path="/loading"
                      element={<LoadingPage bgClr="bg-white" />}
                    />

                    {/* ── Auth ────────────────────────────────────────── */}
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

                    {/* ── Feed ────────────────────────────────────────── */}
                    <Route path="/articles" element={<ArticleFeed />} />
                    <Route path="/home" element={<ArticleFeed />} />
                    {/* alias */}

                    {/* ── Public profiles ─────────────────────────────── */}
                    <Route
                      path="/u/:username"
                      element={<PublicProfile bgClr="bg-white" />}
                    />
                    <Route
                      path="/u/:username/followers"
                      element={<FollowersPage />}
                    />

                    <Route path="/search" element={<SearchPage />} />

                    {/* ── Public posts & collections ───────────────────── */}
                    <Route path="/p/:slug" element={<ViewPost />} />
                    {/* <Route path="/c/:id" element={<CollectionView />} />*/}

                    {/* ── Public editor (markdown preview / md→pdf tool) ── */}
                    <Route path="/editor/markdown" element={<WritingPadMd />} />
                    {/* Short aliases for the md→pdf tool */}
                    <Route path="/markdown2pdf" element={<WritingPadMd />} />
                    <Route path="/md2pdf" element={<WritingPadMd />} />
                    <Route path="/m2p" element={<WritingPadMd />} />

                    {/* ── Protected ───────────────────────────────────── */}
                    <Route element={<ProtectedRoute />}>
                      <Route
                        path="/profile"
                        element={<Profile bgClr="bg-white" />}
                      />
                      <Route
                        path="/profile/settings"
                        element={<ProfileSettings />}
                      />
                      <Route path="/saved" element={<SavedPosts />} />

                      <Route
                        path="/u/:username/following"
                        element={<FollowingPage />}
                      />

                      <Route
                        path="/private/p/:slug"
                        element={<PrivatePostView />}
                      />

                      {/*
                        Editor - create or edit a post.
                        artType is not passed as a prop, post ID comes from
                        ?id= query param (pre-fetched via /get-new-post-id).
                        /editor/markdown/create?type=article&id=...
                      */}
                      <Route
                        path="/editor/markdown/create"
                        element={<WritingPad />}
                      />
                    </Route>

                    {/* ── Catch-all ────────────────────────────────────── */}
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
