import { Palette } from "lucide-react";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";

const AboutPage = ({ bgClr = "bg-cream-light" }) => {
    const featureData = [
        {
            heading: "Express",
            data: "Share your drawings, photographs, poems, and stories. Let your emotions flow through your art.",
        },
        {
            heading: "Curate",
            data: "Create collections that tell your story. Organize your journey in beautiful albums.",
        },
        {
            heading: "Connect",
            data: "Find kindred spirits. Share inspirations. Be part of a community that understands.",
        },
    ];

    return (
        <div className={`min-h-screen ${bgClr} relative overflow-hidden pt-8`}>
            <Header />

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-24 relative z-10 border- border-gray-500">
                {/* Hero Section */}
                <div className="text-center space-y-6 mb-16">
                    <h1 className="font-serif text-6xl sm:text-7xl text-stone-800 leading-tight pb-20 border- border-gray-500">
                        A Place for
                        <span className="block font-[scribe] text-[#5789ba]">
                            Dreamers
                        </span>
                    </h1>
                    <p className="text-xl sm:text-lg font-serif text-stone-600 leading-tight max6-w-2xl mx-auto">
                        OpenCanvas is an open - canvas for you to fill. Its a
                        platform for art lovers. Any type of art like drawing,
                        photography, writing, narrating etc you can publish in
                        here also describe the philosopy and emotion of your
                        piece alongside. Create albums and collections for
                        organising your art or to express a spcific journey.
                        Discover various artworks and many other dreamy artists
                        like you.
                    </p>
                </div>

                {/* Features Section */}
                <div className="space-y-16 pl-6">
                    {featureData.map((item, index) => (
                        <div key={index} className="space-y-2">
                            <h2 className="font-serif text-2xl sm:text-3xl text-stone-800 italic underline underline-offset-1">
                                •{item.heading}
                            </h2>
                            <div className="flex justify-between pr-[10%] md:pr-[30%]">
                                <p className="text-lg font-serif text-stone-600 leading-tight max-w-md pl-4">
                                    {item.data}
                                </p>
                                <span className="block font-[scribe] text-7xl text-stone-600/60">
                                    {item.heading[0]}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-32 text-center">
                    <div className="inline-flex flex-col items-center space-y-2">
                        <Palette className="w-8 h-8 text-stone-600 font-thin" />
                        <p className="font-[scribe] text-3xl sm:text-4xl text-stone-800 italic">
                            Your canvas awaits
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default AboutPage;
