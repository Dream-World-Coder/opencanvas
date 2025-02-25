import { ChevronRight } from "lucide-react";
import BlueFlowerImg from "./images/blue-flower.png";
import Poem from "./images/poem.png";
import Butterfly from "./images/butterfly.png";
import { SlidingButton, Navbar, Footer } from "./components";
import { Analytics } from "@vercel/analytics/react";

const LandingPage = () => {
    return (
        <div className="min-h-auto md:min-h-screen min-w-screen h-[100dvh] md:h-auto bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative h-screen">
                <Navbar />

                {/* container */}
                <div className="relative pt-[60%] sm:pt-[40%] md:pt-[20%] desktop-xl flex items-start justify-center w-full h-full">
                    {/* texts */}
                    <div className="flex flex-col gap-3 items-start justify-between">
                        <h1 className="relative font-['Six_Caps'] text-7xl md:text-8xl text-[#1a1a1a] leading-tight tracking-wide md:tracking-normal">
                            <span className="font-[Smooch] italic text-5xl md:text-6xl">
                                my
                            </span>
                            OPENCANVAS
                            <div className="absolute right-0 top-0 size-6 z-10">
                                <img
                                    className="object-cover size-full"
                                    src={Butterfly}
                                    alt=""
                                />
                            </div>
                        </h1>
                        <SlidingButton href="/profile">
                            Start Exploring{" "}
                            <ChevronRight className="text-[#4d4d4d]" />
                        </SlidingButton>
                    </div>
                </div>

                <Footer />
            </div>
            {/* poem hidden md:block */}
            <div className="size-[65%] md:size-[35%] top-[50%] md:top-0 left-[-125px] absolute opacity-80">
                <img className="object-cover" src={Poem} alt="" />
            </div>
            {/* flower */}
            <div className="size-[50%] md:size-[45%] bottom-[40%] md:bottom-[110px] right-[-100px] md:right-[-280px] absolute opacity-80 z-20">
                <img className="object-cover" src={BlueFlowerImg} alt="" />
            </div>

            <Analytics />
        </div>
    );
};

export default LandingPage;
