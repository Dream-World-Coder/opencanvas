import Card from "@mui/material/Card";
import Button from "@mui/material/Button";

const FlowerIcon = () => (
    <svg viewBox="0 0 100 100" className="w-16 h-16">
        <path
            d="M50 20 C60 40 80 50 60 60 C80 70 60 80 50 80 C40 80 20 70 40 60 C20 50 40 40 50 20"
            fill="red"
            stroke="#FF9BAF"
            strokeWidth="2"
        />
        <circle cx="50" cy="50" r="8" fill="pink" />
    </svg>
);

const LoginPage = ({ bgClr = "bg-cream-light" }) => {
    return (
        <div
            className={`min-h-screen ${bgClr} flex items-center justify-center p-4`}
        >
            <Card className="w-full max-w-md p-12 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-18 -mt-18 opacity-10">
                    <FlowerIcon />
                </div>
                <div className="absolute bottom-0 left-0 -ml-18 -mb-18 opacity-10 transform rotate-180">
                    <FlowerIcon />
                </div>

                <div className="space-y-4 text-center relative">
                    <h2 className="text-2xl font-[stardom] font-medium text-gray-400">
                        OpenCanvas
                    </h2>
                    <h1 className="text-4xl font-serif">Welcome Back</h1>
                </div>

                <div className="space-y-6 relative">
                    <div className="flex items-center justify-center space-x-4">
                        <span className="w-12 h-px bg-gray-300"></span>
                        <span className="text-gray-500 text-sm font-medium">
                            Sign in with
                        </span>
                        <span className="w-12 h-px bg-gray-300"></span>
                    </div>

                    <div className="space-y-0">
                        <Button
                            className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 p-6"
                            variant="outline"
                        >
                            <svg className="w-6 h-12" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span className="text-lg">Google</span>
                        </Button>
                        <Button
                            className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 p-6"
                            variant="outline"
                        >
                            <svg
                                height="48"
                                viewBox="0 0 17 48"
                                width="17"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="m15.5752 19.0792a4.2055 4.2055 0 0 0 -2.01 3.5376 4.0931 4.0931 0 0 0 2.4908 3.7542 9.7779 9.7779 0 0 1 -1.2755 2.6351c-.7941 1.1431-1.6244 2.2862-2.8878 2.2862s-1.5883-.734-3.0443-.734c-1.42 0-1.9252.7581-3.08.7581s-1.9611-1.0589-2.8876-2.3584a11.3987 11.3987 0 0 1 -1.9373-6.1487c0-3.61 2.3464-5.523 4.6566-5.523 1.2274 0 2.25.8062 3.02.8062.734 0 1.8771-.8543 3.2729-.8543a4.3778 4.3778 0 0 1 3.6822 1.841zm-6.8586-2.0456a1.3865 1.3865 0 0 1 -.2527-.024 1.6557 1.6557 0 0 1 -.0361-.337 4.0341 4.0341 0 0 1 1.0228-2.5148 4.1571 4.1571 0 0 1 2.7314-1.4078 1.7815 1.7815 0 0 1 .0361.373 4.1487 4.1487 0 0 1 -.9867 2.587 3.6039 3.6039 0 0 1 -2.5148 1.3236z"></path>
                            </svg>
                            <span className="text-lg">Apple</span>
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 text-center relative">
                    <p className="text-sm text-gray-500">
                        By continuing, you agree to our{" "}
                        <a href="#" className="underline hover:text-gray-800">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="underline hover:text-gray-800">
                            Privacy Policy
                        </a>
                    </p>

                    <div className="text-sm text-gray-500">
                        New to{" "}
                        <span className="font-[stardom]">OpenCanvas</span>?{" "}
                        <a href="#" className="text-gray-800 hover:underline">
                            Create an account
                        </a>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
