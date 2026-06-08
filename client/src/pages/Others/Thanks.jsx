import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/GalleryFooter";

const Thanks = ({ bgClr = "bg-cream-light" }) => {
    return (
        <>
            <Header noBlur={true} />
            <div
                className={`relative size-full min-h-dvh ${bgClr} dark:bg-[#111] dark:text-white flex flex-col items-center justify-center text-lg gap-6`}
            >
                <div className="text-center font-semibold font-serif text-3xl sm:text-4xl text-stone-600/80 dark:text-white transform -translate-y-20">
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

/*

<div className="text-4xl mb-8 underline decoration-2 decoration-stone-600">
    Meeting at Night
</div>
The grey sea and the long black land;
<br />
And the yellow half-moon large and low;
<br />
And the startled little waves that leap
<br />
In fiery ringlets from their sleep,
<br />
As I gain the cove with pushing prow,
<br />
And quench its speed i’ the slushy sand.
<br />
<br />
Then a mile of warm sea-scented beach;
<br />
Three fields to cross till a farm appears;
<br />
A tap at the pane, the quick sharp scratch
<br />
And blue spurt of a lighted match,
<br />
And a voice less loud, through its joys and fears,
<br />
Than the two hearts beating each to each!
<br />
<div className="flex items-center justify-end mt-4">
    {" "}
    by Robert Browning
</div>
*/
