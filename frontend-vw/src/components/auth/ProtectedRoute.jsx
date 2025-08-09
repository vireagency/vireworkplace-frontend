import useAuth from "@/hooks/useAuth";
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

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

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Debug: Log user role for troubleshooting
  console.log('🔍 ProtectedRoute Debug:');
  console.log('  - User object:', user);
  console.log('  - User role:', user?.role);
  console.log('  - Required role:', requiredRole);
  console.log('  - Role comparison:', user?.role === requiredRole);
  console.log('  - Role type (user):', typeof user?.role);
  console.log('  - Role type (required):', typeof requiredRole);

  // Check if user has the required role
  if (requiredRole && user.role !== requiredRole) {
    console.log('❌ Role mismatch detected:');
    console.log('  - User role:', user.role);
    console.log('  - Required role:', requiredRole);
    console.log('  - Redirecting to landing page');
    return <Navigate to="/" replace />;
  }

  console.log('✅ Role check passed - Rendering protected component');

  return <>{children}</>;
};

export default ProtectedRoute;
