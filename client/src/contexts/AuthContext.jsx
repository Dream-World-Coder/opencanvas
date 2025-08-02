import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";
import { toast } from "sonner";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const authAxios = axios.create({
    baseURL: API_URL,
  });

  // auth token added to requests
  authAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  };

  async function fetchCurrentUser() {
    return await authAxios.get("/auth/user");
  }

  // Load user on initial load
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
        const response = await fetchCurrentUser();
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error("Failed to load user:", error);
        localStorage.removeItem("authToken");
        setError(error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // hangle google-auth success
  const handleGoogleAuthSuccess = async () => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("authToken", token);
      navigate(location.pathname, { replace: true }); // remove token from browser history, not needed though
      try {
        const redirectUrl = localStorage.getItem(
          "urlToRedirectAfterLogin",
          null,
        );

        await loadUserData();
        // navigate("/profile");

        if (redirectUrl) {
          localStorage.removeItem("urlToRedirectAfterLogin");
          navigate(redirectUrl);
        } else {
          navigate("/profile");
        }
      } catch (error) {
        console.error("Failed during Google auth:", error);
        toast.error("Authentication failed, redirected to login");
        setError(error);
        navigate("/login");
      }
    } else {
      toast.error("Authorisation Token not found, redirected to login");
      navigate("/login");
    }
  };

  // load user from /auth/user of backend
  const loadUserData = async () => {
    try {
      const response = await fetchCurrentUser();
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error("Failed to load user data:", error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setCurrentUser(null);
    // set active false,
    // when logging in, store the id of the lastLoginsSchema of current session in a user attribute,
    // i.e. activeSessionIds = []. hide it from sending to others
    // remove when logout
    // match the ids & set active in profile settings
    navigate("/login");
  };

  const value = {
    currentUser,
    setCurrentUser,
    loading,
    error,
    logout,
    handleGoogleAuthSuccess,
    authAxios,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
AuthProvider.propTypes = { children: PropTypes.node.isRequired };

export const useAuth = () => {
  return useContext(AuthContext);
};
