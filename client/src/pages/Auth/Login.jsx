import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlowerIcon } from "./Flower";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
// import { LoginForm } from "@/components/ui/login-form";

const LoginPage = ({ bgClr = "bg-cream-light" }) => {
    const navigate = useNavigate();
    return (
        <div
            className={`min-h-auto md:min-h-screen h-[100dvh] md:h-auto ${bgClr} flex items-center justify-center p-4`}
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
                        {/* OpenCanvas */}
                        <span className="font-['Six_Caps'] text-2xl tracking-wide">
                            <span className="font-[Smooch]">my</span>
                            opencanvas
                        </span>{" "}
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

                    <div className="space-y-2">
                        <Button
                            className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 p-6"
                            variant="outline"
                            onClick={() => {
                                navigate("/auth/google");
                            }}
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
                            onClick={() => {
                                alert("will be available soon");
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                                    fill="currentColor"
                                />
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

                    {/* <div className="text-sm text-gray-500">
                        New to{" "}
                        <span className="font-['Six_Caps'] tracking-wide">
                            <span className="font-[Smooch]">my</span>
                            opencanvas
                        </span>
                        ?{" "}
                        <a href="#" className="text-gray-800 hover:underline">
                            Create an account
                        </a>
                    </div> */}
                </div>
            </Card>
        </div>
    );
};

LoginPage.propTypes = {
    bgClr: PropTypes.string,
};

export default LoginPage;

// export default function LoginPage() {
//     return (
//         <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
//             <div className="w-full max-w-sm md:max-w-3xl">
//                 <LoginForm />
//             </div>
//         </div>
//     );
// }
