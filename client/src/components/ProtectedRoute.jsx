import { Navigate, Outlet } from "react-router-dom";
import { getUser, isLoggedIn } from "../auth";

function ProtectedRoute({ role }) {
  const user = getUser();

  // Not logged in
  if (!isLoggedIn() || !user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (role && user.role !== role) {
    return (
      <Navigate
        to={
          user.role === "OFFICER"
            ? "/officer/dashboard"
            : "/trader/dashboard"
        }
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;