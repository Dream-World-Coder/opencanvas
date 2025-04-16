// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { FlowerIcon } from "./Flower";
// import PropTypes from "prop-types";
// // import { useNavigate } from "react-router-dom";
// // import { LoginForm } from "@/components/ui/login-form";

// const LogoutPage = ({ bgClr = "bg-cream-light" }) => {
//     // const navigate = useNavigate();
//     return (
//         <div
//             className={`min-h-auto md:min-h-screen h-[100dvh] md:h-auto ${bgClr} flex items-center justify-center p-4`}
//         >
//             <Card className="w-full max-w-md p-12 space-y-8 relative overflow-hidden">
//                 <div className="absolute top-0 right-0 -mr-18 -mt-18 opacity-10">
//                     <FlowerIcon />
//                 </div>
//                 <div className="absolute bottom-0 left-0 -ml-18 -mb-18 opacity-10 transform rotate-180">
//                     <FlowerIcon />
//                 </div>

//                 <div className="space-y-4 text-center relative">
//                     <h2 className="text-2xl font-[stardom] font-medium text-gray-400">
//                         {/* OpenCanvas */}
//                         <span className="font-['Six_Caps'] text-2xl tracking-wide">
//                             {/* <span className="font-[Smooch]">my</span> */}
//                             opencanvas
//                         </span>{" "}
//                     </h2>
//                     <h1 className="text-4xl font-serif">Welcome Back</h1>
//                 </div>

//                 <div className="space-y-6 relative">
//                     <div className="flex items-center justify-center space-x-4">
//                         <span className="w-12 h-px bg-gray-300"></span>
//                         <span className="text-gray-500 text-sm font-medium">
//                             Sign in with
//                         </span>
//                         <span className="w-12 h-px bg-gray-300"></span>
//                     </div>

//                     <div className="space-y-2">
//                         <Button
//                             className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 p-6"
//                             variant="outline"
//                             onClick={() => {
//                                 // navigate("/auth/google");
//                                 window.location.href =
//                                     "http://localhost:3000/auth/google";
//                             }}
//                         >
//                             <svg className="w-6 h-12" viewBox="0 0 24 24">
//                                 <path
//                                     d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                                     fill="#4285F4"
//                                 />
//                                 <path
//                                     d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                                     fill="#34A853"
//                                 />
//                                 <path
//                                     d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//                                     fill="#FBBC05"
//                                 />
//                                 <path
//                                     d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//                                     fill="#EA4335"
//                                 />
//                             </svg>
//                             <span className="text-lg">Google</span>
//                         </Button>
//                     </div>
//                 </div>
//             </Card>
//         </div>
//     );
// };

// LogoutPage.propTypes = {
//     bgClr: PropTypes.string,
// };

// export default LogoutPage;

import { useAuth } from "../../contexts/AuthContext";

export default function LogoutPage() {
    const { logout } = useAuth();
    logout();
}
