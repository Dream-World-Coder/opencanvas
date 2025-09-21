const LoadingPage = ({ bgClr = "bg-white" }) => {
  return (
    <div
      className={`relative size-full min-h-dvh ${bgClr} dark:bg-[#111] dark:text-white flex flex-col items-center justify-center gap-6 pointer-events-none`}
      style={{ minHeight: "100dvh" }}
    >
      <div
        className="relative text-center"
        style={{ transform: "translateY(-6rem)" }}
      >
        {/* Spinner */}
        <div className="h-12 w-12 border-4 border-stone-300 border-t-stone-800 dark:border-stone-700 dark:border-t-white rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
};

export default LoadingPage;
