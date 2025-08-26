/**
 * Role Selection Page for Admin and HR Manager
 * 
 * This page serves as an intermediary between login and dashboard access.
 * It provides an extra layer of security by requiring users to confirm their role
 * before accessing their respective dashboard.
 * 
 * Features:
 * - Role validation against stored user role
 * - Navigation to appropriate dashboard based on selection
 * - Error handling for invalid role selection
 * - Same UI design as landing page with glass cards
 * - Security layer for admin and HR manager access
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users, UserCog, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

/**
 * RoleSelectionPageForAdminandHR Component
 * 
 * Displays role selection cards for admin and HR manager users.
 * Validates the selected role against the user's actual role from login.
 * Navigates to appropriate dashboard upon successful validation.
 */
const RoleSelectionPageForAdminandHR = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user role from location state (passed from login)
  const userRole = location.state?.userRole;
  
  // State for selected role
  const [selectedRole, setSelectedRole] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Force dark theme for consistency with landing page
   */
  useEffect(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }, []);

  /**
   * Handle role selection and validation
   * @param {string} role - The selected role ('admin' or 'hr')
   */
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsValidating(true);

    // Simulate validation delay for better UX
    setTimeout(() => {
      validateAndNavigate(role);
    }, 500);
  };

  /**
   * Validate selected role against user's actual role and navigate accordingly
   * @param {string} selectedRole - The role selected by the user
   */
  const validateAndNavigate = (selectedRole) => {
    let isValid = false;
    let dashboardPath = "";

    // Check if selected role matches user's actual role
    if (selectedRole === 'admin' && userRole === 'Admin') {
      isValid = true;
      dashboardPath = "/admin";
    } else if (selectedRole === 'hr' && userRole === 'Human Resource Manager') {
      isValid = true;
      dashboardPath = "/human-resource-manager/dashboard";
    }

    if (isValid) {
      // Role is valid, navigate to dashboard
      toast.success("Role validated successfully!");
      navigate(dashboardPath);
    } else {
      // Role is invalid, show error
      toast.error("Please choose a valid role that matches your account");
      setSelectedRole(null);
    }
    
    setIsValidating(false);
  };

  /**
   * Redirect to landing page if no user role is provided
   */
  useEffect(() => {
    if (!userRole) {
      toast.error("No user role found. Please login again.");
      navigate("/");
    }
  }, [userRole, navigate]);

  // Show loading if no user role
  if (!userRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
       {/* Green Ellipse Background */}
       <div className="absolute top-0 left-1/2 transform -translate-x-1/2 scale-x-200 scale-y-160 w-96 h-96 bg-primary/30 rounded-t blur-3xl contrast-100 brightness-70"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
      
      {/* Navigation header */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-8">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vire Workplace</h1>
            <p className="text-muted-foreground text-sm">Enterprise Management Platform</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate("/")}
          className="bg-black border border-white/20 text-white hover:bg-primary hover:text-black cursor-pointer transition-colors duration-200"
        >
          Back to Home
        </Button>
      </nav>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-24">
        <div className="text-center mb-16 animate-fade-in">
          {/* Badge */}
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
            Vire Workplace
          </Badge>
          
          {/* Main heading */}
          <h1 className="text-4xl lg:text-6xl font-semibold text-foreground mb-6 leading-tight whitespace-nowrap">
            Get started at{" "}
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Vire Workplace
            </span>
          </h1>
          
          {/* Sub-heading */}
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed whitespace-nowrap">
            Choose whether you're a chief/operations officer or human resource manager to continue
          </p>
        </div>

        {/* Role selection cards */}
        <div className="max-w-4xl mx-auto animate-scale-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Operations Management Card */}
            <Card 
              onClick={() => handleRoleSelect("admin")}
              className={`glass-card group cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden min-h-[400px] ${
                selectedRole === 'admin' ? 'border-2 border-primary' : 'border border-primary/30'
              } ${isValidating && selectedRole === 'admin' ? 'animate-pulse' : ''}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16"></div>
              <UserCog className="w-16 h-16 text-primary mb-6 relative z-10" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Operations Management</h3>
              <p className="text-muted-foreground mb-6">
                Oversee and coordinate service requests from clients, assign tasks to the right team members, and track the progress of ongoing projects
              </p>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
                disabled={isValidating}
              >
                {isValidating && selectedRole === 'admin' ? 'Validating...' : 'Continue as Admin'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>

            {/* Human Resource Management Card */}
            <Card 
              onClick={() => handleRoleSelect("hr")}
              className={`glass-card group cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden min-h-[400px] ${
                selectedRole === 'hr' ? 'border-primary' : 'border-primary/30'
              } ${isValidating && selectedRole === 'hr' ? 'animate-pulse' : ''}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16"></div>
              <ShieldCheck className="w-16 h-16 text-primary mb-6 relative z-10" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Human Resource Management</h3>
              <p className="text-muted-foreground mb-6">
                Create and manage job postings, review applications, and coordinate interviews with candidates
              </p>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
                disabled={isValidating}
              >
                {isValidating && selectedRole === 'hr' ? 'Validating...' : 'Continue as HR Manager'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPageForAdminandHR;
