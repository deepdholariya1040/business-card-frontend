import axios from "axios";
import { API_BASE_URL } from "../config/env.js";

// The backend authenticates mutating cookie-based endpoints
// (/auth/refresh, /auth/logout) with a double-submit CSRF token: a
// readable cookie plus the same value echoed back in the
// `x-csrf-token` header (see csrf.middleware.js). Every other
// endpoint is Bearer-token authenticated and is not CSRF-relevant.

let accessToken = null;
let onUnauthorized = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Registered once by AuthContext so the interceptor can clear auth
// state / redirect to login when a refresh ultimately fails.
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send/receive the httpOnly refreshToken + csrfToken cookies
});

// Separate, interceptor-free client to avoid infinite loops while
// refreshing.
const rawClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const fetchCsrfToken = async () => {
  const res = await rawClient.get("/auth/csrf-token");
  return res.data?.data?.csrfToken;
};

export const refreshAccessToken = async () => {
  const csrfToken = await fetchCsrfToken();
  const res = await rawClient.post(
    "/auth/refresh",
    {},
    { headers: { "x-csrf-token": csrfToken } }
  );
  const token = res.data?.data?.accessToken;
  setAccessToken(token);
  return token;
};

export const logoutRequest = async () => {
  const csrfToken = await fetchCsrfToken();

  return api.post(
    "/auth/logout",
    {},
    {
      headers: {
        "x-csrf-token": csrfToken,
      },
    }
  );
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    const isAuthEndpoint =
      config?.url?.includes("/auth/otp") ||
      config?.url?.includes("/auth/google") ||
      config?.url?.includes("/auth/refresh") ||
      config?.url?.includes("/auth/logout");

    if (response?.status === 401 && !config._retry && !isAuthEndpoint) {
      config._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const token = await refreshPromise;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return api(config);
        }
      } catch (refreshError) {
        setAccessToken(null);
        onUnauthorized?.();
        return Promise.reject(refreshError);
      }

      setAccessToken(null);
      onUnauthorized?.();
    }

    return Promise.reject(error);
  }
);

// Normalizes the backend's error shape ({success, statusCode, message})
// into a plain, displayable message string. Used by service/mutation
// callers so backend validation text is shown verbatim, per spec.
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

export default api;
