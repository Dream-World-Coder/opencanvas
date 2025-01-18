import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import CreativeProfile from "./pages/Profile/Profile";
import PhotoGalleryPage from "./pages/Gallery/PhotoGallery/PhotoGallery";
// import PhotoGalleryPage2 from "./pages/Gallery/PhotoGallery/PhotoGallery2";
import LiteratureGalleryPage from "./pages/Gallery/LiteratureGallery/LiteratureGallery";
import Gallery2 from "./pages/Gallery/LiteratureGallery/old-literaturegallery";
import WritingPad from "./pages/create-post/WritingPad";
import PoemPad from "./pages/create-post/PoemPad";
import StoryPad from "./pages/create-post/StoryPad";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/Auth/Login";
import AboutPage from "./pages/About/About";
import ContactPage from "./pages/Contact/Contact";

function App() {
    return (
        <Router>
            <div>
                {/* Navbar */}
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/gallery/photos"
                        element={<PhotoGalleryPage />}
                    />
                    {/* <Route
                        path="/gallery/photos2"
                        element={<PhotoGalleryPage2 />}
                    /> */}
                    <Route
                        path="/gallery/literature"
                        element={<LiteratureGalleryPage />}
                    />
                    <Route path="/gallery/writing2" element={<Gallery2 />} />
                    <Route path="/profile" element={<CreativeProfile />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/new/poem" element={<PoemPad />} />
                    <Route path="/new/story" element={<StoryPad />} />
                    <Route path="/new-post/writing" element={<WritingPad />} />
                    {/* <Route path="/new-post/picture" element={<CreativeProfile />} /> */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
