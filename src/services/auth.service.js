import api from "../lib/axios.js";

// GET /auth/me — requires Bearer token, returns the current user
// (auth.controller.js -> me)
export const fetchCurrentUser = () => api.get("/auth/me").then((r) => r.data.data);

// ---- Email OTP: Registration ----
// POST /auth/otp/register/send { name, email }
export const sendRegisterOtp = (payload) =>
  api.post("/auth/otp/register/send", payload).then((r) => r.data);

// POST /auth/otp/register/verify { email, otp }
// Returns { user, accessToken } and sets the refreshToken cookie.
export const verifyRegisterOtp = (payload) =>
  api.post("/auth/otp/register/verify", payload).then((r) => r.data);

// ---- Email OTP: Login ----
// POST /auth/otp/login/send { email }
export const sendLoginOtp = (payload) =>
  api.post("/auth/otp/login/send", payload).then((r) => r.data);

// POST /auth/otp/login/verify { email, otp }
export const verifyLoginOtp = (payload) =>
  api.post("/auth/otp/login/verify", payload).then((r) => r.data);
