import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isTokenValid } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isTokenValid()) {
    console.log("ProtectedRoute: User not authenticated or token invalid", {
      user: !!user,
      tokenValid: isTokenValid(),
      userRole: user?.role,
      accessToken: !!localStorage.getItem("access_token"),
      requiredRole: requiredRole,
    });
    return <Navigate to="/" replace />;
  }

  // In production, avoid logging user details

  // Check if user has the required role
  if (requiredRole) {
    const userRole = user.role?.toLowerCase();
    const requiredRoleLower = requiredRole.toLowerCase();

    // Handle multiple role variations
    let hasRequiredRole = false;

    if (requiredRoleLower === "human resource manager") {
      hasRequiredRole =
        userRole === "hr" || userRole === "human resource manager";
    } else if (requiredRoleLower === "staff") {
      hasRequiredRole = userRole === "staff";
    } else if (requiredRoleLower === "admin") {
      hasRequiredRole = userRole === "admin";
    } else {
      // Fallback to exact match
      hasRequiredRole = userRole === requiredRoleLower;
    }

    if (!hasRequiredRole) {
      console.log("Role mismatch:", {
        userRole,
        requiredRole,
        hasRequiredRole,
      });
      return <Navigate to="/" replace />;
    } else {
      console.log("Role check passed:", {
        userRole,
        requiredRole,
        hasRequiredRole,
      });
    }
  }

  console.log("=== PROTECTED ROUTE SUCCESS ===");
  console.log("ProtectedRoute: Access granted, rendering children", {
    userRole: user?.role,
    requiredRole: requiredRole,
    path: window.location.pathname,
    timestamp: new Date().toISOString(),
  });
  console.log("=== PROTECTED ROUTE SUCCESS END ===");
  return <>{children}</>;
};

export default ProtectedRoute;
