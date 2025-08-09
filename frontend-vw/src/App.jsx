/**
 * Main Application Component
 * 
 * This is the root component of the Vire Workplace HR Application.
 * It sets up all the necessary providers and defines the application routing.
 * 
 * Features:
 * - React Query for data fetching and caching
 * - Dark theme by default with theme management
 * - Authentication context and protected routes
 * - Toast notifications and tooltips
 * - Role-based access control for different dashboards
 */

// UI Components and Providers
import { Toaster } from "@/components/ui/sonner";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// Authentication and Authorization
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Authentication Screens
import LandingPage from "./screens/Authentication/LandingPage";
import OTPConfirmationPage from "./screens/Authentication/OTPConfirmationPage";
import OTPRequestPage from "./screens/Authentication/OTPRequestPage";
import WelcomeUserPage from "./screens/Authentication/WelcomUserPage";
import PasswordResetPage from "./screens/Authentication/PasswordResetPage";
import ForgotPasswordPage from "./screens/Authentication/ForgotPasswordPage";

// Dashboard Screens
import HRDashboardPage from "./screens/UserDashboards/HRDashboard/HRDashboardPage";
import AdminDashboardPage from "./screens/UserDashboards/AdminDashboard/AdminDashboard";
import StaffDashboardPage from "./screens/UserDashboards/StaffDashboard/StaffDashboard";

// Initialize React Query client for data fetching and caching
const queryClient = new QueryClient();

/**
 * App Component
 * 
 * The main application component that wraps the entire app with necessary providers
 * and defines the routing structure for authentication and role-based dashboards.
 * 
 * Provider Hierarchy:
 * 1. QueryClientProvider - For data fetching and caching
 * 2. ThemeProvider - For dark/light theme management
 * 3. AuthProvider - For authentication state management
 * 4. TooltipProvider - For tooltip functionality
 * 5. BrowserRouter - For client-side routing
 * 
 * Route Structure:
 * - Public routes: Landing, OTP flows, Password reset
 * - Protected routes: Role-based dashboards (HR, Admin, Staff)
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <TooltipProvider>
          {/* Toast notifications for user feedback */}
          <Toaster />
          <Sonner />
          
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/" element={<LandingPage/>} />
              <Route path="/otp-confirmation" element={<OTPConfirmationPage />} />
              <Route path="/otp-request" element={<OTPRequestPage />} />
              <Route path="/reset-password" element={<PasswordResetPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/welcome-user" element={<WelcomeUserPage />} />

              {/* Protected Role-Based Dashboard Routes */}
              <Route 
                path="/human-resource-manager" 
                element={
                  <ProtectedRoute requiredRole="Human Resource Manager">
                    <HRDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="Admin">
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/staff" 
                element={
                  <ProtectedRoute requiredRole="Staff">
                    <StaffDashboardPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* TODO: Add 404 Not Found page */}
              {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
