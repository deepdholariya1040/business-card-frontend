// Centralized frontend environment config.
// Mirrors the backend's API_PREFIX ("/api") exactly — do not change
// unless the backend's src/config/env.js API_PREFIX changes too.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Origin only (no /api) — used for the Google OAuth full-page redirect,
// which must hit the Express route directly (GET /api/auth/google),
// not go through axios/JSON.
export const SERVER_ORIGIN =
  import.meta.env.VITE_SERVER_ORIGIN || "http://localhost:5000";

export const GOOGLE_OAUTH_URL = `${API_BASE_URL}/auth/google`;
