import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthSuccess() {
    const { handleGoogleAuthSuccess } = useAuth();

    useEffect(() => {
        handleGoogleAuthSuccess();
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-xl font-semibold">
                    Completing authentication...
                </h2>
                <p className="mt-2">Please wait while we log you in.</p>
            </div>
        </div>
    );
}
