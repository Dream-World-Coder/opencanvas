import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/GalleryFooter";
import { ChevronLeft } from "lucide-react";

const NotFoundPage = ({ bgClr = "bg-cream-light" }) => {
    return (
        <>
            <Header noBlur={true} />
            <div
                className={`relative size-full min-h-dvh ${bgClr} dark:bg-[#111] dark:text-white flex flex-col items-center justify-center text-lg gap-6`}
            >
                <div className="text-center font-semibold text-3xl text-stone-600/80 dark:text-white">
                    Page not found.
                    <br />
                    Error 404
                </div>
                <button
                    className="rounded-md bg-cream hover:bg-cream-dark box-content px-4 py-2 text-stone-600/80 flex items-center justify-center gap-2"
                    onClick={() => {
                        window.history.back();
                    }}
                >
                    <ChevronLeft className="size-6" />
                    Go Back
                </button>
            </div>
            <Footer />
        </>
    );
};

export default NotFoundPage;
