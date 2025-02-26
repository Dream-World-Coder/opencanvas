// src/contexts/AuthContext.js

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // API URL
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    // Setup axios instance with auth headers
    const authAxios = axios.create({
        baseURL: API_URL,
    });

    // Add auth token to requests
    authAxios.interceptors.request.use((config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Check if token is expired
    const isTokenExpired = (token) => {
        try {
            const decoded = jwt_decode(token);
            return decoded.exp < Date.now() / 1000;
        } catch (error) {
            return true;
        }
    };

    // Load user from token on initial load
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem("token");

            if (!token || isTokenExpired(token)) {
                localStorage.removeItem("token");
                setCurrentUser(null);
                setLoading(false);
                return;
            }

            try {
                const response = await authAxios.get("/auth/me");
                setCurrentUser(response.data.user);
            } catch (error) {
                console.error("Failed to load user:", error);
                localStorage.removeItem("token");
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    // Register with email/password
    const register = async (userData) => {
        setError(null);
        try {
            const response = await axios.post(
                `${API_URL}/auth/register`,
                userData,
            );

            if (response.data.success) {
                localStorage.setItem("token", response.data.token);
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
                localStorage.setItem("token", response.data.token);
                setCurrentUser(response.data.user);
                navigate("/profile");
                return true;
            }
        } catch (error) {
            setError(error.response?.data?.message || "Login failed");
            return false;
        }
    };

    // Handle Google Auth success
    const handleGoogleAuthSuccess = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (token) {
            localStorage.setItem("token", token);
            loadUserData(token);
            navigate("/profile");
        }
    };

    // Load user data using token
    const loadUserData = async (token) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.get(`${API_URL}/auth/me`, config);
            setCurrentUser(response.data.user);
        } catch (error) {
            console.error("Failed to load user data:", error);
            logout();
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem("token");
        setCurrentUser(null);
        navigate("/login");
    };

    // Value object to provide through context
    const value = {
        currentUser,
        loading,
        error,
        register,
        login,
        logout,
        handleGoogleAuthSuccess,
        authAxios,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
