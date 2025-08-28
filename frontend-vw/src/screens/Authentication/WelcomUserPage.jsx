import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const WelcomeUserPage = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // Debug: Log user data to understand structure
  useEffect(() => {
    if (user) {
      console.log('User data in WelcomeUserPage:', user);
      console.log('User firstName:', user.firstName);
      console.log('User email:', user.email);
    }
  }, [user]);

  // Clean up signup firstName from localStorage after displaying welcome message
  useEffect(() => {
    const signupFirstName = localStorage.getItem('signup_firstName');
    if (signupFirstName) {
      // Remove the signup firstName from localStorage after a short delay
      const timer = setTimeout(() => {
        localStorage.removeItem('signup_firstName');
      }, 1000); // Remove after 1 second
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Force dark theme for authentication pages
  useEffect(() => {
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  // 5-second countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

//   useEffect(() => {
//     // If user is not authenticated, redirect to landing page
//     if (!loading && !user) {
//       navigate("/");
//     }
//   }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

//   if (!user) {
//     return null; // Will redirect in useEffect
//   }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Green Ellipse Background - same as landing page */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 scale-x-200 scale-y-160 w-96 h-96 bg-primary/30 rounded-t blur-3xl contrast-100 brightness-70"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center space-y-8justify-start px-6 pt-32">
        {/* Vire Workplace Badge */}
        <div className="mb-8 animate-fade-in">
        <Badge className="mb-22 bg-primary/20 text-primary border-primary/30">
            Vire Workplace
          </Badge>
        </div>

        {/* Welcome Message */}
        <div className="text-center max-w-5xl mx-auto animate-slide-up" >
          <h1 className="text-3xl md:text-3xl lg:text-3xl font-bold text-foreground mb-8 leading-tight">
            👋 Hi, {user?.firstName || localStorage.getItem('signup_firstName') || user?.email?.split('@')[0] || 'User'}! Welcome to Vire Workplace
          </h1>
          
          {/* Security Information */}
          <div className="space-y-4 text-center w-full max-w-5xl mx-auto">
            <div className="flex items-start space-x-3">
              {/* <span className="text-primary mt-1">▶</span> */}
              <div className="flex-1">
                <p className="text-white text-base leading-relaxed">
                  🎉 Your account is all set! For your security, we've sent your unique Work ID to your email. You'll need this Work ID anytime you log in.
                </p>
              </div>
            </div>
            <div className="ml-6">
              <p className="text-white text-base">
                It helps keep your account safe and secure.
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="mt-8 text-center">
            <p className="text-primary text-lg font-semibold">
              Redirecting to login page in {countdown} seconds...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeUserPage;
