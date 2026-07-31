import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

// Frontend-side gate only — every one of these roles is re-checked by
// the backend for every request. This just avoids showing a page the
// API would reject anyway.
export const RequireRole = ({ roles }) => {
  const { user } = useAuth();

  if (!roles.includes(user?.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default RequireRole;
