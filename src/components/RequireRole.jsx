import { Navigate, useLocation } from "react-router-dom";
import * as jwt_decode from "jwt-decode";

const RequireRole = ({ allowedRoles = [], children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  console.log("=== RequireRole Debug ===");
  console.log("Token exists:", !!token);
  console.log("Allowed roles:", allowedRoles);
  console.log("Current location:", location.pathname);

  if (!token) {
    console.log("No token found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwt_decode(token);
    console.log("Decoded token:", decoded);

    const userRole =
      decoded.role ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    console.log("User role:", userRole);
    console.log("Role check:", allowedRoles.includes(userRole));

    if (!allowedRoles.includes(userRole)) {
      console.log("Role not allowed, redirecting to unauthorized");
      return <Navigate to="/unauthorized" replace />;
    }

    console.log("Role allowed, rendering children");
    return children;
  } catch (err) {
    console.error("Token decoding failed:", err);
    console.log("Token decode failed, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }
};

export default RequireRole;