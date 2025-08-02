const LoadingPage = ({ bgClr = "bg-white" }) => {
  return (
    <div
      className={`relative size-full min-h-dvh ${bgClr} dark:bg-[#111] dark:text-white flex flex-col items-center justify-center text-lg gap-6 pointer-events-none`}
      style={{ minHeight: "100dvh" }}
    >
      <div
        className="relative text-center font-normal font-sans text-2xl sm:text-4xl text-stone-800/80 dark:text-white"
        style={{ transform: "translateY(-6rem)" }}
      >
        <span style={{ position: "relative", zIndex: 10 }}>
          Loading...
          <br />
          please wait
        </span>
      </div>
    </div>
  );
};

export default LoadingPage;
