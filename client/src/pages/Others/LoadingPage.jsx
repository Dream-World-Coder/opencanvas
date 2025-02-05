const LoadingPage = ({ bgClr = "bg-white" }) => {
    return (
        <div
            className={`relative size-full min-h-dvh ${bgClr} flex flex-col items-center justify-center text-lg gap-6`}
        >
            <div className="text-center font-semibold font-[scribe] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-stone-600/80">
                &quot;Loading,
                <br />
                please wait...&quot;
            </div>
        </div>
    );
};

export default LoadingPage;
