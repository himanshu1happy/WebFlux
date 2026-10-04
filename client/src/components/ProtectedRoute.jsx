import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getToken, logout, authFetch } from "../auth";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ role }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const verifySession = async () => {
      const token = getToken();
      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        // Secure backend check to prevent localStorage manipulation
        const response = await authFetch("/api/auth/me");
        
        if (response && response.user) {
          // Update local storage with verified data
          localStorage.setItem("user", JSON.stringify(response.user));
          
          if (role && response.user.role !== role) {
            setIsAuthorized(false);
          } else {
            setIsAuthorized(true);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Session verification failed:", error);
        logout();
        setIsAuthorized(false);
      }
    };

    verifySession();
  }, [role]);

  if (isAuthorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7F8]">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Loader2 size={24} className="animate-spin text-[#164a63]" />
          <p className="text-sm">Verifying secure session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;