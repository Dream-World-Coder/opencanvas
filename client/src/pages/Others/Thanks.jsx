import Header from "../../components/Header/Header";
import Footer from "../Gallery/Components/GalleryFooter";

const Thanks = ({ bgClr = "bg-cream-light" }) => {
    return (
        <>
            <Header />
            <div
                className={`relative size-full min-h-dvh ${bgClr} flex flex-col items-center justify-center text-lg gap-6`}
            >
                <div className="text-center font-semibold font-[scribe] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-stone-600/80">
                    &quot;Thank you for contacting,
                    <br />
                    I&apos;ll get in touch as soon as possible.&quot;
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Thanks;
