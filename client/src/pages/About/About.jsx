import { Palette } from "lucide-react";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import PropTypes from "prop-types";
import AboutMeta from "./Meta";

const AboutPage = ({ bgClr = "bg-cream-light" }) => {
  const featureData = [
    {
      heading: "Unleash",
      data: "Write without limits—poems, articles, stories, or raw thoughts. Let your words breathe in an open space.",
    },
    {
      heading: "Flow",
      data: "Express without constraints. Whether it's a fleeting emotion or a lifelong philosophy, let your creativity roam free.",
    },
    {
      heading: "Curate",
      data: "Weave your thoughts into meaningful collections. Organize your art into albums that define your journey.",
    },
    {
      heading: "Discover",
      data: "Step into a world of boundless creativity. Explore diverse voices, unique perspectives, and untold stories.",
    },
    {
      heading: "Connect",
      data: "Engage with a like-minded community. Share inspirations, exchange ideas, and celebrate the art of expression.",
    },
  ];

  return (
    <>
      <AboutMeta />
      <div
        className={`min-h-screen ${bgClr} dark:bg-[#111] dark:text-white relative overflow-hidden pt-8`}
      >
        <Header exclude={["/about", "/photo-gallery"]} />

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 relative z-10">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-16 pointer-events-none md:pointer-events-auto">
            <h1 className="font-boskaBold text-6xl sm:text-7xl text-stone-800 dark:text-white leading-tight pb-2 md:pb-20">
              A Place for
              <span className="block font-scribe text-lime-600 dark:text-lime-400 transform translate-y-[-18px] md:translate-y-[-4px]">
                Dreamers
              </span>
            </h1>
            <p
              className="text-lg sm:text-xl font-[montserrat] text-stone-700 md:text-stone-800 dark:text-[#f8f8f8]
                pointer-events-none md:pointer-events-auto md:font-normal
                leading-tight tracking-normal max-w-2xl mx-auto"
            >
              OpenCanvas is an open canvas for your creativity. It’s a platform
              where you can share any form of written art—poems, narrations,
              stories, articles, journals, and more. Express the philosophy and
              emotions behind your work, giving your words deeper meaning.
              Organize your creations into albums and collections to showcase a
              specific journey or theme. Explore a world of artistic expression,
              connect with like-minded dreamers, and discover inspiring works
              from fellow artists.
            </p>
          </div>

          {/* Features Section */}
          <div className="space-y-16 pl-6 max-w-2xl mx-auto font-bold md:font-normal">
            {featureData.map((item, index) => (
              <div key={index} className="space-y-2 group">
                <h2
                  className="font-boska text-2xl sm:text-3xl text-stone-700 dark:text-[#f6f6f6] italic
                                underline decoration-1 decoration-stone-700 pointer-events-none md:pointer-events-auto"
                >
                  <span className="box-content p-1 pt-0 group-hover:bg-lime-100 dark:group-hover:bg-lime-600 rounded-md">
                    &gt; {item.heading}
                  </span>
                </h2>
                <div className="flex justify-between pr-[15%] md:pr-[20%] pointer-events-none md:pointer-events-auto">
                  <p className="font-[montserrat] font-normal text-lg md:text-xl text-stone-700 dark:text-[#f8f8f8] md:text-stone-800 leading-tight max-w-md pl-4">
                    {item.data}
                  </p>
                  <span className="block font-scribe text-7xl text-stone-600/30 dark:text-stone-400/30 font-normal">
                    {item.heading[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-32 text-center">
            <div className="inline-flex flex-col items-center space-y-2">
              <Palette className="w-8 h-8 text-stone-700 dark:text-stone-300 font-thin fill-lime-200/50 dark:fill-lime-600/50" />
              <p className="font-scribe text-3xl sm:text-4xl text-stone-800 dark:text-[#f5f5f5] italic pointer-events-none md:pointer-events-auto">
                Your canvas awaits
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

AboutPage.propTypes = {
  bgClr: PropTypes.string,
};

export default AboutPage;
