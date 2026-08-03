import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  setAccessToken,
  getAccessToken,
  refreshAccessToken,
  logoutRequest,
  setUnauthorizedHandler,
} from "../lib/axios.js";
import { fetchCurrentUser } from "../services/auth.service.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | unauthenticated
  const bootstrapped = useRef(false);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
    setStatus("authenticated");
    return currentUser;
  }, []);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const bootstrap = async () => {
      const hash = window.location.hash;

      // Google OAuth callback
      if (hash?.startsWith("#token=")) {
        const token = decodeURIComponent(hash.replace("#token=", ""));

        setAccessToken(token);
        localStorage.setItem("accessToken", token);

        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );

        try {
          await loadCurrentUser();
          return;
        } catch {
          clearAuth();
          return;
        }
      }

      // Try localStorage first
      const storedToken = localStorage.getItem("accessToken");

      if (storedToken) {
        try {
          setAccessToken(storedToken);
          await loadCurrentUser();
          return;
        } catch {
          localStorage.removeItem("accessToken");
          setAccessToken(null);
        }
      }

      // Fallback to refresh cookie
      try {
        const token = await refreshAccessToken();

        setAccessToken(token);
        localStorage.setItem("accessToken", token);

        await loadCurrentUser();
      } catch (error) {
        console.log(
          "AUTH BOOTSTRAP FAILED",
          error?.response?.data || error.message,
        );

        clearAuth();
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth();
    });
  }, [clearAuth]);

  const applySession = useCallback((sessionUser, accessToken) => {
    setAccessToken(accessToken);
    localStorage.setItem("accessToken", accessToken);

    setUser(sessionUser);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Ignore network errors
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) return null;
    return loadCurrentUser();
  }, [loadCurrentUser]);

  const value = {
    user,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    applySession,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuthContext must be used within AuthProvider",
    );
  }

  return ctx;
};