import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const PasswordResetPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Force dark theme for authentication pages
  useEffect(() => {
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  // Get resetToken from location state or localStorage
  useEffect(() => {
    console.log('🔍 PasswordReset: Initializing reset token');
    const stateData = location.state;
    
    if (stateData && stateData.resetToken) {
      console.log('🔍 PasswordReset: Reset token from navigation state');
      // Store in localStorage for fallback
      localStorage.setItem('reset_token', stateData.resetToken);
      setResetToken(stateData.resetToken);
    } else {
      // Fallback to localStorage if page is refreshed
      const storedToken = localStorage.getItem('reset_token');
      if (storedToken) {
        console.log('🔍 PasswordReset: Reset token from localStorage fallback');
        setResetToken(storedToken);
      } else {
        console.log('❌ PasswordReset: No reset token found');
        // No token found, redirect to landing page
        toast.error("Invalid access. Please start over.");
        navigate("/");
      }
    }
  }, [location.state, navigate]);

  const validatePassword = (password) => {
    // Password must be at least 8 characters with at least one uppercase, one lowercase, one number
    // Allow any printable characters including special characters
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!validatePassword(newPassword)) {
      toast.error("Password must be at least 8 characters with uppercase, lowercase, and number");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!resetToken) {
      toast.error("Invalid reset token. Please try again.");
      navigate("/forgot-password");
      return;
    }

    setIsResetting(true);
    
    try {
      console.log('🔍 PasswordReset: Making API call with resetToken:', resetToken);
      const response = await axios.put(
        "https://vireworkplace-backend-hpca.onrender.com/api/v1/auth/otp/reset",
        { 
          newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${resetToken}`
          }
        }
      );
      
      if (response.status === 200) {
        toast.success("Password reset successfully!");
        // Clear localStorage
        localStorage.removeItem('reset_token');
        // Navigate to login page
        navigate("/");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      const errorMessage = error.response?.data?.message || "Failed to reset password. Please try again.";
      toast.error(errorMessage);
      
      // If token is invalid, redirect to forgot password
      if (error.response?.status === 401 || error.response?.status === 400) {
        localStorage.removeItem('reset_token');
        setTimeout(() => {
          navigate("/forgot-password");
        }, 2000);
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Green Ellipse Background */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 scale-x-200 scale-y-160 w-96 h-96 bg-primary/30 rounded-t blur-3xl contrast-100 brightness-70"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>

      {/* Header */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-8">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vire Workplace</h1>
            <p className="text-muted-foreground text-sm">Enterprise HR Management</p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-start justify-center min-h-[calc(100vh-120px)] px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center animate-fade-in w-full max-w-md md:max-w-3xl"
        >
          {/* Badge */}
          <Badge className="mb-22 bg-primary/20 text-primary border-primary/30">
            Vire Workplace
          </Badge>
          
          {/* Shield Icon */}
          <div className="flex justify-center mb-6">
            <img 
              src="/verification-icon-8 1.svg" 
              alt="Verification Icon" 
              className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Password Reset
          </h1>

          {/* Instructions */}
          <p className="text-muted-foreground mb-16">
            Please enter a new password
          </p>

          {/* Password Input Form */}
          <form onSubmit={handleResetSubmit} className="space-y-6 mx-auto w-full max-w-xs">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-foreground placeholder-muted-foreground pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-foreground placeholder-muted-foreground pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={isResetting || !newPassword || !confirmPassword}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isResetting ? "Resetting..." : "Reset"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
