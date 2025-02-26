// src/components/ProtectedRoute.js

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = () => {
    const { currentUser, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading...
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // Render child routes if authenticated
    return <Outlet />;
};

export default ProtectedRoute;
