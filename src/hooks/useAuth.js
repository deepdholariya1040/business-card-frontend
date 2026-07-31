import { useAuthContext } from "../context/AuthContext.jsx";

// Thin, ergonomic wrapper so pages import `useAuth` rather than reaching
// into the context module directly.
export const useAuth = () => useAuthContext();
