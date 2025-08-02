import { ArrowUpRight } from "lucide-react";

const Footer = () => {
  const now = new Date();
  const year = now.getFullYear();

  return (
    <footer className="fixed bottom-0 w-full bg-white border-t border-gray-100 dark:invert">
      <div className="max-w-[1400px] mx-auto px-8 py-6 flex justify-between items-center">
        <div className="text-sm text-gray-400 hidden md:block">
          Copyright &copy; {year}{" "}
          {/* <span className="font-stardom">OpenCanvas.</span> */}
          <span className="font-['Six_Caps'] text-lg tracking-wide">
            {/* <span className="font-[Smooch] text-base">my</span> */}
            opencanvas
          </span>{" "}
          All rights reserved.
        </div>
        <button
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
          className="flex items-center space-x-2 text-sm hover:opacity-70"
        >
          Back to top
          <ArrowUpRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
