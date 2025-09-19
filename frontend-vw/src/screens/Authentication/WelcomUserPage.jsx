/**
 * @fileoverview Welcome User Page Component
 * @description A welcome page displayed after successful user registration that shows a personalized
 * greeting message and automatically redirects users to the login page after a countdown timer.
 * This page provides a smooth transition from signup completion to the login flow.
 * 
 * @features
 * - Personalized welcome message with user's name
 * - 30-second countdown timer with automatic redirect
 * - Stable username display that doesn't flicker during redirect
 * - Multiple fallback mechanisms for displaying user names
 * - Dark theme styling consistent with authentication pages
 * - Automatic cleanup of temporary signup data from localStorage
 * - Comprehensive debugging for user data structure analysis
 * 
 * @state
 * @param {number} countdown - Countdown timer value (starts at 30 seconds)
 * @param {string} displayName - Stable display name for the user (prevents flickering)
 * 
 * @dependencies
 * @param {Object} user - User data from useAuth hook
 * @param {boolean} loading - Loading state from useAuth hook
 * @param {function} navigate - React Router navigation function
 * 
 * @userDataFallbacks
 * The component uses multiple fallback mechanisms to display the user's name:
 * 1. user.firstName - Primary user data property
 * 2. user.first_name - Alternative user data property (snake_case)
 * 3. localStorage.getItem('signup_firstName') - Temporary signup data
 * 4. user.email.split('@')[0] - Extract name from email address
 * 5. 'User' - Default fallback value
 * 
 * @lifecycle
 * 1. Component mounts and initializes with 30-second countdown
 * 2. Sets display name using available user data or fallbacks
 * 3. Starts countdown timer that decrements every second
 * 4. Cleans up temporary signup data from localStorage
 * 5. Redirects to login page when countdown reaches 0
 * 
 * @styling
 * - Dark theme with green accent colors
 * - Responsive design for mobile and desktop
 * - Animated elements with fade-in and slide-up effects
 * - Glass morphism design elements
 * 
 * @author Vire Workplace HR App
 * @version 2.0.0
 * @since 2024
 * @updated 2025-09-19 - Added stable username display and improved fallback logic
 */

import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * WelcomeUserPage Component
 * 
 * @description Main welcome page component that displays a personalized greeting
 * and handles automatic redirection to the login page after a 30-second countdown.
 * 
 * @returns {JSX.Element} The complete welcome page UI with countdown timer
 * 
 * @example
 * // Rendered after successful user registration
 * <WelcomeUserPage />
 */
const WelcomeUserPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30);
  const [displayName, setDisplayName] = useState('User');

  /**
   * Set display name once and keep it stable
   * 
   * @description Establishes the user's display name using multiple fallback mechanisms
   * and ensures it remains stable throughout the component lifecycle to prevent flickering
   * during the redirect process.
   * 
   * @dependencies {Object} user - User data from authentication context
   * 
   * @fallbackChain
   * 1. user.firstName - Primary user data property
   * 2. user.first_name - Alternative user data property (snake_case)
   * 3. localStorage.getItem('signup_firstName') - Temporary signup data
   * 4. user.email.split('@')[0] - Extract name from email address
   * 5. 'User' - Default fallback value
   */
  useEffect(() => {
    if (user) {
      console.log('User data in WelcomeUserPage:', user);
      console.log('User firstName:', user.firstName);
      console.log('User first_name:', user.first_name);
      console.log('User email:', user.email);
      console.log('All user keys:', Object.keys(user));
      
      // Set the display name once and don't change it
      const name = user?.firstName || user?.first_name || localStorage.getItem('signup_firstName') || user?.email?.split('@')[0] || 'User';
      setDisplayName(name);
    } else {
      // Fallback to localStorage or email if user is not available
      const signupName = localStorage.getItem('signup_firstName');
      if (signupName) {
        setDisplayName(signupName);
      }
    }
  }, [user]);

  /**
   * Set display name from localStorage if user data is not available yet
   * 
   * @description Provides an additional fallback mechanism to set the display name
   * from localStorage when user data is not immediately available, ensuring the
   * welcome message shows the correct name even during loading states.
   * 
   * @dependencies {string} displayName - Current display name state
   */
  useEffect(() => {
    const signupFirstName = localStorage.getItem('signup_firstName');
    if (signupFirstName && displayName === 'User') {
      setDisplayName(signupFirstName);
    }
  }, [displayName]);

  /**
   * Clean up signup firstName from localStorage after displaying welcome message
   * 
   * @description Removes temporary signup data from localStorage after a short delay
   * to prevent data persistence beyond the welcome page. This ensures clean state
   * management and prevents potential data conflicts in future sessions.
   * 
   * @cleanupDelay {number} 1000ms - Delay before removing localStorage data
   */
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

  /**
   * Force dark theme for authentication pages
   * 
   * @description Applies dark theme styling to the document root to ensure
   * consistent visual appearance across all authentication-related pages.
   * This creates a cohesive user experience during the signup/login flow.
   */
  useEffect(() => {
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  /**
   * 30-second countdown timer with automatic redirect
   * 
   * @description Implements a countdown timer that decrements every second and
   * automatically redirects the user to the login page when it reaches zero.
   * This provides a smooth transition from the welcome page to the login flow.
   * 
   * @countdownDuration {number} 30 - Countdown duration in seconds
   * @redirectTarget {string} "/" - Target route for redirection (login page)
   * 
   * @dependencies {function} navigate - React Router navigation function
   */
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
            👋 Hi, {displayName}! Welcome to Vire Workplace
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

/**
 * @exports WelcomeUserPage
 * @description Default export of the WelcomeUserPage component with comprehensive
 * JSDoc documentation for improved code maintainability and developer experience.
 */
export default WelcomeUserPage;
