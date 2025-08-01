const Footer = () => {
  const now = new Date();
  const year = now.getFullYear();

  return (
    <footer className="relative w-full">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-center">
        <p className="font-serif text-sm text-stone-600/80 hover:text-lime-600 transition-colors">
          Copyright &copy; {year}{" "}
          <span className="font-['Six_Caps'] text-xl tracking-wide">
            {/* <span className="font-[Smooch] text-lg">my</span> */}
            opencanvas
          </span>{" "}
          All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
