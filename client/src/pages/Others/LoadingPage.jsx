const LoadingPage = ({ bgClr = "bg-white" }) => {
    return (
        <div
            className={`relative size-full min-h-dvh ${bgClr} flex flex-col items-center justify-center text-lg gap-6 pointer-events-none`}
            style={{ minHeight: "100dvh" }}
        >
            <div
                className="relative text-center font-semibold font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-stone-700/80"
                style={{ transform: "translateY(-6rem)" }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "400%",
                        height: "0.5rem",
                        background:
                            "radial-gradient(circle, #d9f99d 20%, rgba(217,249,157,0.0) 0%, transparent 100%)",
                    }}
                ></div>
                <span style={{ position: "relative", zIndex: 10 }}>
                    Loading,
                    <br />
                    please wait...
                </span>
            </div>
        </div>
    );
};

export default LoadingPage;
