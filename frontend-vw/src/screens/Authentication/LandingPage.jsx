
/**
 * Landing Page Component
 * 
 * The main landing page for the Vire Workplace HR Application.
 * This is the first page users see when they visit the application.
 * It provides an overview of the platform and allows users to choose their role
 * for signup or access the login functionality.
 * 
 * Features:
 * - Role-based signup selection (Staff, HR, Admin)
 * - Login modal integration
 * - Responsive design with glassmorphism effects
 * - Dark theme with green accent colors
 * - Feature highlights and benefits
 * - Loading state management
 * - Authentication state integration
 * 
 * Components:
 * - Navigation header with login button
 * - Hero section with main value proposition
 * - Feature cards highlighting key benefits
 * - Role selection cards for signup
 * - Authentication modal integration
 */

// React and UI Components
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCog, ArrowRight, CheckCircle, Clock, BarChart3, ShieldCheck } from "lucide-react";

// Custom Components and Hooks
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/useAuth";

/**
 * LandingPage Component
 * 
 * The main landing page that serves as the entry point for the application.
 * Handles role selection, authentication modal display, and provides
 * an overview of the platform's features and benefits.
 */
const LandingPage = () => {
  // Authentication Modal State
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Authentication Context
  const { user, profile, loading } = useAuth();

  /**
   * Force dark theme for authentication pages
   * Ensures consistent dark theme across all authentication-related pages
   */
  useEffect(() => {
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  // Loading state while authentication is being checked
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

  /**
   * Handle role selection for signup
   * Validates the selected role and opens the signup modal
   * 
   * @param {string} role - The selected role ('staff', 'admin', 'hr')
   */
  const handleRoleSelect = (role) => {
    const allowedRoles = ["staff", "admin", "hr"];
    if (!allowedRoles.includes(role)) {
      console.error("Invalid role selected:", role);
      return;
    }

    setSelectedRole(role);
    setAuthMode("signup");
    setShowAuth(true);
  };

  /**
   * Handle login button click
   * Opens the login modal without a specific role
   */
  const handleLogin = () => {
    setAuthMode("login");
    setSelectedRole(null);
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Green Ellipse Background */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 scale-x-200 scale-y-160 w-96 h-96 bg-primary/30 rounded-t blur-3xl contrast-100 brightness-70"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
      
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-8">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vire Workplace</h1>
            <p className="text-muted-foreground text-sm">Enterprise HR Management</p>
          </div>
        </div>
        <Button 
          onClick={handleLogin}
          variant="outline" 
          className=" bg-black border-white/20 text-white hover:bg-white/10"
        >
          Login
        </Button>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-24">
        <div className="text-center mb-16 animate-fade-in">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
            Enterprise HR Management
          </Badge>
          <h1 className="text-6xl lg:text-8xl font-bold text-foreground mb-6 leading-tight">
            Modern
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {" "}Workplace
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
           Simplify employee management and office workflows with our automation platform.
           Track attendance, manage tasks, and automate recurring processes effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-slide-up">
          <Card className="glass-card group hover:scale-105 transition-all duration-300">
            <Clock className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Smart Attendance</h3>
            <p className="text-muted-foreground">
              Track check-ins, breaks, and work hours with intelligent automation
            </p>
          </Card>
          <Card className="glass-card group hover:scale-105 transition-all duration-300">
            <BarChart3 className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground">
              Get insights into productivity, performance, and team metrics
            </p>
          </Card>
          <Card className="glass-card group hover:scale-105 transition-all duration-300">
            <CheckCircle className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Task Management</h3>
            <p className="text-muted-foreground">
              Assign, track, and complete tasks with seamless collaboration
            </p>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto animate-scale-in">
          <h2 className="text-4xl font-bold text-foreground text-center mb-12">
            Choose Your Role
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Staff */}
            <Card onClick={() => handleRoleSelect("staff")} className="glass-card group cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden min-h-[500px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16"></div>
              <Users className="w-16 h-16 text-primary mb-6 relative z-10" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Staff Member</h3>
              <p className="text-muted-foreground mb-6">
                Check in/out, log tasks, view assignments, and track your performance
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  Time tracking & attendance
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  Task management
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  Document access
                </li>
              </ul>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Join as Staff
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>

            {/* HR Manager */}
            <Card onClick={() => handleRoleSelect("hr")} className="glass-card group cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden border-primary/30 min-h-[500px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16"></div>
              <ShieldCheck className="w-16 h-16 text-primary mb-6 relative z-10" />
              <h3 className="text-2xl font-bold text-foreground mb-4">HR Manager</h3>
              <p className="text-muted-foreground mb-6">
                Manage onboarding, employee records, leave approvals, and evaluations
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  Approve leave & reviews
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  Employee onboarding
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  Record management
                </li>
              </ul>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Join as HR
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>

            {/* Admin */}
            <Card onClick={() => handleRoleSelect("admin")} className="glass-card group cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden border-primary/30 min-h-[500px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16"></div>
              <UserCog className="w-16 h-16 text-primary mb-6 relative z-10" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Admin</h3>
              <p className="text-muted-foreground mb-6">
                Manage settings, permissions, analytics, and platform-wide controls
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  Role & access control
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  Platform settings
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  System monitoring
                </li>
              </ul>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Manage Workplace
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {showAuth && (
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          mode={authMode}
          role={selectedRole}
        />
      )}
    </div>
  );
};

export default LandingPage;
