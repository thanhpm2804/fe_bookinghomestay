import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ sửa import ở đây

const RequireRole = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode(token); // ✅ dùng jwtDecode thay vì jwt_decode
    const userRole = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
    console.log(userRole);
    return children;
  } catch (err) {
    console.error("Invalid token", err);
    return <Navigate to="/login" replace />;
  }
};

export default RequireRole;
