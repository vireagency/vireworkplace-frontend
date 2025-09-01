import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const navigate = useNavigate();

  // Force dark theme for authentication pages
  useEffect(() => {
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsRequesting(true);
    
    try {
      const response = await axios.post(
        "https://vireworkplace-backend-hpca.onrender.com/api/v1/auth/forgot-password",
        { email }
      );
      
      if (response.status === 200) {
        
        // Extract any temporary token if provided by the API
        const tempToken = response.data.tempToken || response.data.token;
        if (tempToken) {
          localStorage.setItem('forgot_password_token', tempToken);
        }
        
        toast.success("OTP has been sent to your email for password reset");
        // Navigate to OTP confirmation with forgot-password context and email
        navigate("/otp-confirmation", { 
          state: { 
            reason: "forgot-password",
            email: email,
            tempToken: tempToken // Pass token if available
          } 
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsRequesting(false);
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
            <p className="text-muted-foreground text-sm">Enterprise Management Platform</p>
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
            Forgot Password? We've got you
          </h1>

          {/* Instructions */}
          <p className="text-muted-foreground mb-16 md:whitespace-nowrap">
            Please enter your email address, we will send an OTP to your email for verification.
          </p>

          {/* Email Input Form */}
          <form onSubmit={handleRequestSubmit} className="space-y-6 mx-auto w-full max-w-xs">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-foreground placeholder-muted-foreground"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={isRequesting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
            >
              {isRequesting ? "Sending..." : "Request OTP"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;