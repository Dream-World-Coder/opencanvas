import { ChevronRight } from "lucide-react";

import BlueFlowerImg from "./images/blue-flower.png";
import Poem from "./images/poem.png";
import Butterfly from "./images/butterfly.png";

import { useAuth } from "../../contexts/AuthContext";
import { SlidingButton, Navbar, Footer } from "./components";
import ArticleFeed from "../Feeds/Articles";

const LandingPage = () => {
  const { currentUser } = useAuth();

  return !currentUser ? (
    <div className="min-h-auto md:min-h-screen min-w-screen h-[100dvh] md:h-auto bg-[#e2e4e0] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative h-screen">
        <Navbar bg={"bg-[#e2e4e0]"} />

        {/* container */}
        <div className="relative pt-[60%] sm:pt-[40%] md:pt-[20%] desktop-xl flex items-start justify-center w-full h-full">
          {/* texts */}
          <div className="flex flex-col gap-3 items-start justify-between">
            <h1
              translate="no"
              className="relative font-stardom text-5xl md:text-6xl text-[#393b37] tracking-tight pointer-events-none"
            >
              OPENCANVAS
              <div className="absolute right-0 top-[-8px] size-6 z-10">
                <img
                  className="object-cover size-full"
                  src={Butterfly}
                  alt=""
                />
              </div>
            </h1>
            <SlidingButton href="/articles">
              Start Exploring{" "}
              <ChevronRight className="text-[#4d4d4d] transform transition-transform duration-200 size-4 group-hover:translate-x-2" />
            </SlidingButton>
          </div>
        </div>

        <Footer />
      </div>
      {/* poem */}
      <div className="hidden md:block size-[65%] md:size-[35%] top-[50%] md:top-0 left-[-125px] absolute opacity-70 mix-blend-multiply">
        <img className="object-cover" src={Poem} alt="" />
      </div>

      {/* flower */}
      <div
        className="size-[60%] bottom-[-237px] md:size-[45%] md:bottom-[110px] md:right-[-280px] absolute opacity-80 z-20 transform"
        style={{ transform: "rotateY(0deg)" }}
      >
        <img className="object-cover relative" src={BlueFlowerImg} alt="" />
      </div>
    </div>
  ) : (
    <ArticleFeed />
  );
};

export default LandingPage;
