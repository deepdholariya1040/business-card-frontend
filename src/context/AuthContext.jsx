import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

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
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
    setStatus("authenticated");
    return currentUser;
  }, []);

  // Called once, on first mount:
  // 1. If the Google OAuth callback just redirected here with
  //    `#token=<accessToken>` in the URL (see auth.controller.js's
  //    googleCallback, which always redirects to
  //    http://localhost:5173/#token=... after setting the refresh
  //    cookie), consume it immediately.
  // 2. Otherwise, attempt a silent refresh using the httpOnly
  //    refreshToken cookie (if the user has a still-valid session
  //    from a previous visit).
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const bootstrap = async () => {
      const hash = window.location.hash;

      if (hash?.startsWith("#token=")) {
        const token = decodeURIComponent(hash.replace("#token=", ""));
        setAccessToken(token);
        // Remove the token from the URL bar immediately.
        window.history.replaceState(null, "", window.location.pathname + window.location.search);

        try {
          await loadCurrentUser();
          return;
        } catch {
          clearAuth();
          return;
        }
      }

      try {
        await refreshAccessToken();
        await loadCurrentUser();
      } catch {
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

  // Used after Email OTP register/login verify, which return
  // { user, accessToken } directly in the response body.
  const applySession = useCallback((sessionUser, accessToken) => {
    setAccessToken(accessToken);
    setUser(sessionUser);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Even if the network call fails, clear local state so the UI
      // is never stuck showing a logged-in shell.
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};
