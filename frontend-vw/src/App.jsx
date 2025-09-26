/**
 * @fileoverview Main Application Component for Vire Workplace HR Application
 * @description This is the root component that sets up all necessary providers and defines the application routing structure
 * @author Vire Development Team
 * @version 1.0.2
 * @since 2024
 *
 * Features:
 * - React Query for data fetching and caching
 * - Dark theme by default with theme management
 * - Authentication context and protected routes
 * - Toast notifications and tooltips
 * - Role-based access control for different dashboards
 */

// ============================================================================
// UI Components and Providers
// ============================================================================

// Toast notification components for user feedback
import { Toaster } from "@/components/ui/sonner";

// Tooltip provider for enhanced user experience
import { TooltipProvider } from "@/components/ui/tooltip";

// React Query for data fetching, caching, and state management
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// React Router for client-side navigation and routing
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy loading for better performance
import { lazy, Suspense } from "react";

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 animate-spin border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-foreground">Loading...</p>
    </div>
  </div>
);

// Theme management with dark/light mode support
import { ThemeProvider } from "next-themes";

// ============================================================================
// Authentication and Authorization
// ============================================================================

// Custom authentication hook and context provider
import { AuthProvider } from "@/hooks/useAuth";

// Notification context provider for real-time notifications
import { NotificationProvider } from "@/contexts/NotificationProvider";

// Staff sidebar context provider for staff dashboard
import { StaffSidebarProvider } from "@/contexts/StaffSidebarContext";

// Route protection component for authenticated users
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// ============================================================================
// Authentication Screens
// ============================================================================

// Landing page for initial user interaction
import LandingPage from "./screens/Authentication/LandingPage";

// OTP (One-Time Password) flow components
import OTPConfirmationPage from "./screens/Authentication/OTPConfirmationPage";
import OTPRequestPage from "./screens/Authentication/OTPRequestPage";

// User onboarding and welcome flow
import WelcomeUserPage from "./screens/Authentication/WelcomUserPage";

// Password management screens
import PasswordResetPage from "./screens/Authentication/PasswordResetPage";
import ForgotPasswordPage from "./screens/Authentication/ForgotPasswordPage";

// Role selection for multi-role users
import RoleSelectionPageForAdminandHR from "./screens/Authentication/RoleSelectionPageForAdminandHR";

// ============================================================================
// Dashboard Screens
// ============================================================================

// Staff Dashboard Components

// HR Dashboard Components
import HRDashboardMainPage from "./screens/UserDashboards/HRDashboard/HRDashboardMainPage";
import HREvaluationsPage from "./screens/UserDashboards/HRDashboard/HREvaluationsPage";
import EvaluationCreator from "./screens/UserDashboards/HRDashboard/EvaluationCreator";
import HRPerformancePage from "./screens/UserDashboards/HRDashboard/HRPerformancePage";
import HRHiringPage from "./screens/UserDashboards/HRDashboard/HRHiringPage";
import EmployeesPage from "./screens/UserDashboards/HRDashboard/EmployeesPage";
import HRMessagesPage from "./screens/UserDashboards/HRDashboard/HRMessagesPage";
import HRReportsPage from "./screens/UserDashboards/HRDashboard/HRReportsPage";

// HR Settings and Configuration
import HRSettingsPage from "./screens/UserDashboards/HRDashboard/HRSettingsPage";
import HRProfileSettings from "./screens/UserDashboards/HRDashboard/HRProfileSettings";
import HRPasswordSettings from "./screens/UserDashboards/HRDashboard/HRPasswordSettings";
import HRNotificationSettings from "./screens/UserDashboards/HRDashboard/HRNotificationSettings";

// Other Role Dashboards
import AdminDashboardPage from "./screens/UserDashboards/AdminDashboard/AdminDashboard";
import StaffDashboardMainPage from "./screens/UserDashboards/StaffDashboard/StaffDashboardMainPage";

// Staff Dashboard Components - Lazy loaded for better performance
const StaffLandingPage = lazy(() =>
  import("./screens/UserDashboards/StaffDashboard/pages/StaffLandingPage")
);
const CheckIn = lazy(() =>
  import("./screens/UserDashboards/StaffDashboard/pages/CheckIn")
);
const CheckOut = lazy(() =>
  import("./screens/UserDashboards/StaffDashboard/pages/CheckOut")
);

const Evaluation = lazy(() =>
  import("./screens/UserDashboards/StaffDashboard/pages/StaffEvaluationPage")
);

// New Staff Dashboard Pages - Lazy loaded
const StaffPerformancePage = lazy(() =>
  import("./screens/UserDashboards/StaffDashboard/pages/StaffPerformancePage")
);

const StaffTasksPage = lazy(() =>
  import("./screens/UserDashboards/StaffDashboard/pages/StaffTasksPage")
);
const StaffAttendancePage = lazy(() =>
  import("./screens/UserDashboards/StaffDashboard/pages/StaffAttendancePage")
);
const StaffMessagesPage = lazy(() =>
  import("./screens/UserDashboards/StaffDashboard/pages/StaffMessagesPage")
);
const StaffReportsPage = lazy(() =>
  import("./screens/UserDashboards/StaffDashboard/pages/StaffReportsPage")
);

// Staff Settings Pages - Lazy loaded
const StaffSettingsPage = lazy(() =>
  import("./screens/UserDashboards/StaffDashboard/StaffSettingsPage")
);
const StaffProfileSettings = lazy(() =>
  import("./screens/UserDashboards/StaffDashboard/StaffProfileSettings")
);
const StaffPasswordSettings = lazy(() =>
  import("./screens/UserDashboards/StaffDashboard/StaffPasswordSettings")
);
const StaffNotificationSettings = lazy(() =>
  import("./screens/UserDashboards/StaffDashboard/StaffNotificationSettings")
);

// Error and fallback pages
import NotFound from "./screens/NotFound";

// ============================================================================
// React Query Configuration
// ============================================================================

/**
 * React Query client instance for data fetching and caching
 * @description Handles server state management, caching, and synchronization
 * @type {QueryClient}
 */
const queryClient = new QueryClient();

// ============================================================================
// Main App Component
// ============================================================================

/**
 * App Component - Root Application Wrapper
 *
 * @description The main application component that wraps the entire app with necessary providers
 * and defines the routing structure for authentication and role-based dashboards.
 *
 * @component
 * @returns {JSX.Element} The complete application with providers and routing
 *
 * Provider Hierarchy (from outermost to innermost):
 * 1. QueryClientProvider - For data fetching, caching, and server state management
 * 2. ThemeProvider - For dark/light theme management and persistence
 * 3. AuthProvider - For authentication state management and user context
 * 4. TooltipProvider - For tooltip functionality and accessibility
 * 5. BrowserRouter - For client-side routing and navigation
 *
 * Route Structure:
 * - Public routes: Landing, OTP flows, Password reset (accessible without authentication)
 * - Protected routes: Role-based dashboards (HR, Admin, Staff) requiring authentication
 * - Fallback: 404 Not Found page for unmatched routes
 */
const App = () => (
  // React Query provider for data management
  <QueryClientProvider client={queryClient}>
    {/* Theme management with dark mode default */}
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {/* Authentication context and user state management */}
      <AuthProvider>
        {/* Notification context for real-time notifications */}
        <NotificationProvider>
          {/* Tooltip functionality provider */}
          <TooltipProvider>
            {/* Toast notification system for user feedback */}
            <Toaster />

            {/* Client-side routing configuration */}
            <BrowserRouter>
              <Routes>
                {/* ========================================================================
                   PUBLIC AUTHENTICATION ROUTES
                   These routes are accessible without authentication
                   ======================================================================== */}

                {/* Landing page - Entry point for all users */}
                <Route path="/" element={<LandingPage />} />

                {/* OTP (One-Time Password) authentication flow */}
                <Route
                  path="/otp-confirmation"
                  element={<OTPConfirmationPage />}
                />
                <Route path="/otp-request" element={<OTPRequestPage />} />

                {/* Password management and recovery */}
                <Route path="/reset-password" element={<PasswordResetPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />

                {/* User onboarding and welcome */}
                <Route path="/welcome-user" element={<WelcomeUserPage />} />

                {/* Role selection for users with multiple roles */}
                <Route
                  path="/role-selection"
                  element={<RoleSelectionPageForAdminandHR />}
                />

                {/* ========================================================================
                   PROTECTED ROLE-BASED DASHBOARD ROUTES
                   These routes require authentication and specific role permissions
                   ======================================================================== */}

                {/* HR Manager Dashboard Routes */}
                <Route
                  path="/human-resource-manager"
                  element={
                    <ProtectedRoute requiredRole="Human Resource Manager">
                      <HRDashboardMainPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/human-resource-manager/dashboard"
                  element={
                    <ProtectedRoute requiredRole="Human Resource Manager">
                      <HRDashboardMainPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/human-resource-manager/evaluations"
                  element={
                    <ProtectedRoute requiredRole="Human Resource Manager">
                      <HREvaluationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/human-resource-manager/evaluations/create"
                  element={
                    <ProtectedRoute requiredRole="Human Resource Manager">
                      <EvaluationCreator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/human-resource-manager/performance"
                  element={
                    <ProtectedRoute requiredRole="Human Resource Manager">
                      <HRPerformancePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/human-resource-manager/hiring"
                  element={
                    <ProtectedRoute requiredRole="Human Resource Manager">
                      <HRHiringPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/human-resource-manager/employees"
                  element={
                    <ProtectedRoute requiredRole="Human Resource Manager">
                      <EmployeesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/human-resource-manager/messages"
                  element={
                    <ProtectedRoute requiredRole="Human Resource Manager">
                      <HRMessagesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/human-resource-manager/reports"
                  element={
                    <ProtectedRoute requiredRole="Human Resource Manager">
                      <HRReportsPage />
                    </ProtectedRoute>
                  }
                />

                {/* HR Settings and Configuration Routes */}
                <Route
                  path="/human-resource-manager/settings"
                  element={
                    <ProtectedRoute requiredRole="Human Resource Manager">
                      <HRSettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/human-resource-manager/settings/profile"
                  element={
                    <ProtectedRoute requiredRole="Human Resource Manager">
                      <HRProfileSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/human-resource-manager/settings/password"
                  element={
                    <ProtectedRoute requiredRole="Human Resource Manager">
                      <HRPasswordSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/human-resource-manager/settings/notifications"
                  element={
                    <ProtectedRoute requiredRole="Human Resource Manager">
                      <HRNotificationSettings />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Dashboard Route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="Admin">
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Staff Dashboard Routes - Wrapped with StaffSidebarProvider */}
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <StaffSidebarProvider>
                        <Suspense fallback={<LoadingSpinner />}>
                          <StaffLandingPage />
                        </Suspense>
                      </StaffSidebarProvider>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/staff/dashboard"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <StaffSidebarProvider>
                        <StaffDashboardMainPage />
                      </StaffSidebarProvider>
                    </ProtectedRoute>
                  }
                />

                {/* Staff Features */}
                <Route
                  path="/staff/check-in"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <StaffSidebarProvider>
                        <CheckIn />
                      </StaffSidebarProvider>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/staff/check-out"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <StaffSidebarProvider>
                        <CheckOut />
                      </StaffSidebarProvider>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/staff/tasks"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <StaffSidebarProvider>
                        <Suspense fallback={<LoadingSpinner />}>
                          <StaffTasksPage />
                        </Suspense>
                      </StaffSidebarProvider>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/staff/evaluation"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <StaffSidebarProvider>
                        <Suspense fallback={<LoadingSpinner />}>
                          <Evaluation />
                        </Suspense>
                      </StaffSidebarProvider>
                    </ProtectedRoute>
                  }
                />

                {/* New Staff Dashboard Pages */}
                <Route
                  path="/staff/performance"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <StaffSidebarProvider>
                        <Suspense fallback={<LoadingSpinner />}>
                          <StaffPerformancePage />
                        </Suspense>
                      </StaffSidebarProvider>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/staff/attendance"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <StaffSidebarProvider>
                        <Suspense fallback={<LoadingSpinner />}>
                          <StaffAttendancePage />
                        </Suspense>
                      </StaffSidebarProvider>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/staff/messages"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <StaffSidebarProvider>
                        <Suspense fallback={<LoadingSpinner />}>
                          <StaffMessagesPage />
                        </Suspense>
                      </StaffSidebarProvider>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/staff/reports"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <StaffSidebarProvider>
                        <Suspense fallback={<LoadingSpinner />}>
                          <StaffReportsPage />
                        </Suspense>
                      </StaffSidebarProvider>
                    </ProtectedRoute>
                  }
                />

                {/* Staff Settings Routes */}
                <Route
                  path="/staff/settings"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <StaffSidebarProvider>
                        <Suspense fallback={<LoadingSpinner />}>
                          <StaffSettingsPage />
                        </Suspense>
                      </StaffSidebarProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/settings/profile"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <StaffSidebarProvider>
                        <Suspense fallback={<LoadingSpinner />}>
                          <StaffProfileSettings />
                        </Suspense>
                      </StaffSidebarProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/settings/password"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <StaffSidebarProvider>
                        <Suspense fallback={<LoadingSpinner />}>
                          <StaffPasswordSettings />
                        </Suspense>
                      </StaffSidebarProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/settings/notifications"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <StaffSidebarProvider>
                        <Suspense fallback={<LoadingSpinner />}>
                          <StaffNotificationSettings />
                        </Suspense>
                      </StaffSidebarProvider>
                    </ProtectedRoute>
                  }
                />

                {/* ========================================================================
                   FALLBACK ROUTES
                   ======================================================================== */}

                {/* 404 Not Found page - Catch-all for unmatched routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

// Export the main App component as the default export
export default App;
