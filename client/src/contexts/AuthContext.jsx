import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const API_URL = import.meta.env.BACKEND_API_URL || "http://localhost:3000";

    // Setup axios instance with auth headers
    const authAxios = axios.create({
        baseURL: API_URL,
    });

    // Add auth token to requests
    authAxios.interceptors.request.use((config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Check if token is expired
    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp < Date.now() / 1000;
        } catch (error) {
            return true;
        }
    };

    // Load user from token on initial load
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem("authToken");

            if (!token || isTokenExpired(token)) {
                localStorage.removeItem("authToken");
                setCurrentUser(null);
                setLoading(false);
                return;
            }

            try {
                const response = await authAxios.get("/auth/user");
                setCurrentUser(response.data.user);
            } catch (error) {
                console.error("Failed to load user:", error);
                localStorage.removeItem("authToken");
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    // not needed now
    /*
    // Register with email/password
    const register = async (userData) => {
        setError(null);
        try {
            const response = await axios.post(
                `${API_URL}/auth/register`,
                userData,
            );

            if (response.data.success) {
                localStorage.setItem("authToken", response.data.token);
                setCurrentUser(response.data.user);
                navigate("/profile");
                return true;
            }
        } catch (error) {
            setError(error.response?.data?.message || "Registration failed");
            return false;
        }
    };

    // Login with email/password
    const login = async (email, password) => {
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });

            if (response.data.success) {
                localStorage.setItem("authToken", response.data.token);
                setCurrentUser(response.data.user);
                navigate("/profile");
                return true;
            }
        } catch (error) {
            setError(error.response?.data?.message || "Login failed");
            return false;
        }
    };
    */

    // hangle google-auth success
    const handleGoogleAuthSuccess = async () => {
        const token = searchParams.get("token");

        if (token) {
            localStorage.setItem("authToken", token);
            try {
                await loadUserData(token);
                navigate("/profile");
            } catch (error) {
                console.error("Failed during Google auth:", error);
                alert("Authentication failed, redirecting to login");
                setTimeout(() => {
                    navigate("/login");
                }, 400);
            }
        } else {
            alert("token not found, redirecting to login");
            setTimeout(() => {
                navigate("/login");
            }, 400);
        }
    };

    // load user data from /auth/user route of backend
    const loadUserData = async (token) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.get(`${API_URL}/auth/user`, config);
            setCurrentUser(response.data.user);
        } catch (error) {
            console.error("Failed to load user data:", error);
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        setCurrentUser(null);
        navigate("/login");
    };

    const value = {
        currentUser,
        loading,
        error,
        // register,
        // login,
        logout,
        handleGoogleAuthSuccess,
        authAxios,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
