import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [favorites, setFavorites] = useState([]); // Store favorite hall IDs

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Add response interceptor to handle blocked users
      const interceptor = axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.data?.isBlocked) {
            // User is blocked, logout immediately
            logout();
            alert("Your account has been blocked. Please contact support for assistance.");
          }
          return Promise.reject(error);
        }
      );
      
      fetchUser();
      
      // Cleanup interceptor on unmount
      return () => {
        axios.interceptors.response.eject(interceptor);
      };
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setLoading(false);
    }
  }, [token]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get("/api/favourites");
      const favoriteIds = response.data.favourites.map(fav => fav.hall._id || fav.hall);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      setFavorites([]);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      setUser(response.data.user);
      
      // Fetch favorites only for regular users
      if (response.data.user.role === "user") {
        await fetchFavorites();
      }
    } catch (error) {
      console.error(error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "/api/auth/login",
        { email, password },
      );
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      // Fetch favorites for regular users
      if (userData.role === "user") {
        await fetchFavorites();
      }

      return { success: true, user: userData };
    } catch (error) {
      // Check if user is blocked
      if (error.response?.data?.isBlocked) {
        return {
          success: false,
          message: error.response.data.message || "Your account has been blocked. Please contact support.",
          isBlocked: true
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // ADMIN registration needs adminSecret key
  // inside register in AuthContext
  const register = async (userData) => {
    try {
      const response = await axios.post(
        "/api/auth/register",
        userData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Fetch favorites for regular users
      if (user.role === "user") {
        await fetchFavorites();
      }

      return { success: true, user };
    } catch (error) {
      console.error(error);
      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        const errorMessages = error.response.data.errors
          .map((err) => {
            // Handle different error formats from express-validator
            if (typeof err === "string") return err;
            // express-validator uses 'msg' property
            if (err.msg) return err.msg;
            if (err.message) return err.message;
            // If it's an object, try to get a meaningful message
            if (typeof err === "object") {
              return `${err.path || "Field"}: ${
                err.msg || err.message || "Invalid value"
              }`;
            }
            return JSON.stringify(err);
          })
          .filter(Boolean) // Remove any undefined/null values
          .join(", ");

        return {
          success: false,
          message:
            errorMessages || "Validation failed. Please check your input.",
        };
      }

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setFavorites([]);
    delete axios.defaults.headers.common["Authorization"];
  };

  const toggleFavorite = async (hallId) => {
    if (!user)
      return { success: false, message: "Please login to add favorites" };

    try {
      const response = await axios.post(
        `/api/favourites/toggle/${hallId}`,
      );
      const { favorited } = response.data;

      // Update local favorites state
      if (favorited) {
        setFavorites(prev => [...prev, hallId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== hallId));
      }

      return { success: true, isFavorite: favorited };
    } catch (error) {
      console.error(error);
      return { success: false, message: error.response?.data?.message || "Failed to toggle favorite" };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(
        "/api/auth/profile",
        profileData,
      );
      const updatedUser = response.data.user;
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update profile",
      };
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const verifyEmailExists = async (email) => {
    try {
      const response = await axios.post(
        "/api/auth/verify-email",
        { email }
      );
      return { success: true, exists: response.data.exists };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to verify email",
      };
    }
  };

  const resetPassword = async (email, newPassword) => {
    try {
      const response = await axios.post(
        "/api/auth/reset-password",
        { email, newPassword }
      );
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reset password",
      };
    }
  };

  const googleLogin = async (credential, role = "user", sessionId = null) => {
    try {
      const response = await axios.post(
        "/api/auth/google",
        { credential, role, sessionId }
      );
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      
      return { success: true, user: userData };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.response?.data?.message || "Google login failed",
      };
    }
  };

  const appleLogin = async (identityToken, user, role = "user") => {
    try {
      const response = await axios.post(
        "/api/auth/apple",
        { identityToken, user, role }
      );
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      
      return { success: true, user: userData };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.response?.data?.message || "Apple login failed",
      };
    }
  };

  const facebookLogin = async (accessToken, role = "user", sessionId = null) => {
    try {
      const response = await axios.post(
        "/api/auth/facebook",
        { accessToken, role, sessionId }
      );
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      
      return { success: true, user: userData };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.response?.data?.message || "Facebook login failed",
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    toggleFavorite,
    updateProfile,
    updateUser,
    verifyEmailExists,
    resetPassword,
    googleLogin,
    appleLogin,
    facebookLogin,
    isAuthenticated: !!user,
    favorites, // Expose favorites array
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
