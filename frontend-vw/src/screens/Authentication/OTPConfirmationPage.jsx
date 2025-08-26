import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

const OTPConfirmationPage = () => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [reason, setReason] = useState(null);
  const [email, setEmail] = useState("");
  const [tempToken, setTempToken] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Force dark theme for authentication pages
  useEffect(() => {
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  // Initialize state from location.state or localStorage
  useEffect(() => {
    const stateData = location.state;
    
    if (stateData) {
      // Store in localStorage for fallback
      localStorage.setItem('otp_reason', stateData.reason);
      if (stateData.email) {
        localStorage.setItem('otp_email', stateData.email);
      }
      if (stateData.tempToken) {
        localStorage.setItem('temp_token', stateData.tempToken);
      }
      
      setReason(stateData.reason);
      setEmail(stateData.email || "");
      setTempToken(stateData.tempToken || "");
    } else {
      // Fallback to localStorage if page is refreshed
      const storedReason = localStorage.getItem('otp_reason');
      const storedEmail = localStorage.getItem('otp_email');
      const storedTempToken = localStorage.getItem('temp_token');
      
      if (storedReason) {
        setReason(storedReason);
        setEmail(storedEmail || "");
        setTempToken(storedTempToken || "");
      } else {
        // No context found, redirect to landing page
        toast.error("Invalid access. Please start over.");
        navigate("/");
      }
    }
  }, [location.state, navigate]);

  const validateOTP = (otp) => {
    return otp && otp.length === 6 && /^\d{6}$/.test(otp);
  };

  const handleVerify = async () => {
    if (!validateOTP(otp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!reason) {
      toast.error("Invalid verification context. Please try again.");
      navigate("/");
      return;
    }

    setIsVerifying(true);

    try {
      let response;
      
      if (reason === "signup") {
        // Verify account for signup
        if (!tempToken) {
          toast.error("Invalid verification token. Please try again.");
          navigate("/");
          return;
        }
        
        response = await axios.post(
          "https://vireworkplace-backend-hpca.onrender.com/api/v1/auth/otp/verify-account",
          { otp },
          {
            headers: {
              'Authorization': `Bearer ${tempToken}`
            }
          }
        );
        
        if (response.status === 200) {
          toast.success("Account verified successfully!");
          // Clear localStorage
          localStorage.removeItem('otp_reason');
          localStorage.removeItem('otp_email');
          localStorage.removeItem('temp_token');
          // Navigate to welcome user page
          navigate("/welcome-user");
        }
      } else if (reason === "forgot-password") {
        // Verify OTP for password reset
        if (!email) {
          toast.error("Email is required for password reset");
          return;
        }
        
        // Get temporary token for forgot password flow
        const forgotPasswordToken = localStorage.getItem('forgot_password_token');
        
        if (!forgotPasswordToken) {
          toast.error("Invalid access. Please request OTP again.");
          navigate("/forgot-password");
          return;
        }
        
        response = await axios.post(
          "https://vireworkplace-backend-hpca.onrender.com/api/v1/auth/forgot-password/verify-otp",
          { otp }, // Only send OTP in body, not email
          {
            headers: {
              'Authorization': `Bearer ${forgotPasswordToken}`
            }
          }
        );
        
        if (response.status === 200) {
          const resetToken = response.data.resetToken;
          
          // Store resetToken in localStorage
          if (resetToken) {
            localStorage.setItem('reset_token', resetToken);
          }
          
          toast.success("OTP verified successfully!");
          // Clear OTP-related localStorage items
          localStorage.removeItem('otp_reason');
          localStorage.removeItem('otp_email');
          localStorage.removeItem('temp_token');
          localStorage.removeItem('forgot_password_token'); // Clear forgot password token
          // Navigate to reset password page with token
          navigate("/reset-password", { state: { resetToken } });
        }
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      const errorMessage = error.response?.data?.message || "Failed to verify OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = () => {
    if (reason === "signup") {
      navigate("/otp-request");
    } else if (reason === "forgot-password") {
      navigate("/forgot-password");
    } else {
      navigate("/");
    }
  };

  const getTitle = () => {
    return reason === "forgot-password" 
      ? "Verify Password Reset" 
      : "Verify your identity";
  };

  const getInstructions = () => {
    return reason === "forgot-password"
      ? "Please enter the one-time password (OTP) sent to your email for password reset."
      : "Please enter the one-time password (OTP) sent to your email address.";
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
        <div className="text-center animate-fade-in">
          {/* Badge */}
          <Badge className="mb-22 bg-primary/20 text-primary border-primary/30">
            Vire Workplace
          </Badge>
          
          {/* Checkmark Icon */}
          <div className="flex justify-center mb-6">
            <img 
              src="/verification-icon-8 1.svg" 
              alt="Verification Icon" 
              className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {getTitle()}
          </h1>

          {/* Instructions */}
          <p className="text-muted-foreground mb-16 max-w-md mx-auto">
            {getInstructions()}
          </p>

          {/* OTP Input */}
          <div className="flex justify-center mb-8">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                // Filter out any non-numeric characters
                const numericValue = value.replace(/\D/g, '');
                setOtp(numericValue);
              }}
              className="gap-2"
              pattern="[0-9]*"
              inputMode="numeric"
              type="number"
            >
              <InputOTPGroup>
                <InputOTPSlot 
                  index={0} 
                  className="w-12 h-12 text-center text-lg font-semibold bg-white/10 border-white/20 text-white rounded-lg"
                />
                <InputOTPSlot 
                  index={1} 
                  className="w-12 h-12 text-center text-lg font-semibold bg-white/10 border-white/20 text-white rounded-lg"
                />
                <InputOTPSlot 
                  index={2} 
                  className="w-12 h-12 text-center text-lg font-semibold bg-white/10 border-white/20 text-white rounded-lg"
                />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot 
                  index={3} 
                  className="w-12 h-12 text-center text-lg font-semibold bg-white/10 border-white/20 text-white rounded-lg"
                />
                <InputOTPSlot 
                  index={4} 
                  className="w-12 h-12 text-center text-lg font-semibold bg-white/10 border-white/20 text-white rounded-lg"
                />
                <InputOTPSlot 
                  index={5} 
                  className="w-12 h-12 text-center text-lg font-semibold bg-white/10 border-white/20 text-white rounded-lg"
                />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={isVerifying || !validateOTP(otp)}
            className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mb-6"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>

          {/* Resend OTP Link */}
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            <button
              onClick={handleResendOTP}
              className="text-foreground text-green-500 hover:text-primary underline"
            >
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPConfirmationPage;