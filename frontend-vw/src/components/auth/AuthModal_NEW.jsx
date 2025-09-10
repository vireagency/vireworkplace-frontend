/**
 * @fileoverview Authentication Modal Component - NEW FILE: Fixed duplicate keys
 * @updated 2025-09-10 - RENAMED FILE: Complete fix for React key duplication warning
 * @filename AuthModal_NEW.jsx - Renamed to bypass persistent browser cache
 * @description A comprehensive modal component that handles both user login and signup functionality
 * with role-based access control (Admin, HR Manager, Staff). It provides a unified interface 
 * for authentication with role-specific form fields and integrates with the backend API for 
 * user registration and authentication.
 * 
 * @features
 * - Toggle between login and signup modes
 * - Role-based form fields (different fields for different roles)
 * - Password visibility toggle with eye icon
 * - Date picker for date of birth with calendar popover
 * - Phone number input with country code selection
 * - Form validation and error handling
 * - API integration for signup and login
 * - Role-based navigation after successful authentication
 * - Remember me functionality with checkbox
 * - Toast notifications for user feedback
 * - Responsive design for mobile and desktop
 * 
 * @props
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback function to close the modal
 * @param {string} mode - Initial authentication mode ('login' or 'signup')
 * @param {string} role - User role for signup ('staff', 'hr', 'admin')
 * 
 * @author Vire Workplace HR App
 * @version 1.0.0
 * @since 2024
 */

// React and UI Components
import { useState, useEffect, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Data imports
import countryCodes from "@/data/countryCodes.json";
// Force refresh - duplicate key fix applied

// Custom Hooks and Utilities
import useAuth from "@/hooks/useAuth";
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar as CalendarIcon, UserCheck } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * AuthModal Component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Modal visibility state
 * @param {function} props.onClose - Function to close modal
 * @param {string} props.mode - Authentication mode ('login' or 'signup')
 * @param {string} props.role - User role for signup
 */
const AuthModal = ({ isOpen, onClose, mode, role }) => {
  // 🔥🔥🔥 NEW FILE CACHE BUSTER LOG - If you see this, the new code is loaded! 🔥🔥🔥
  console.log('🆕🆕🆕 AuthModal_NEW LOADED - DUPLICATE KEY FIX ACTIVE!', new Date().toISOString());
  console.log('🔑 Using memoized unique keys for country codes');
  /**
   * Consolidated UI State Management
   * @type {Object} All UI-related state in one object to reduce re-renders
   */
  const [uiState, setUiState] = useState({
    showPassword: false,        // Controls password visibility
    loading: false,             // Form submission state
    currentMode: mode,          // Authentication mode ('login' or 'signup')
    rememberMe: false,          // Remember me checkbox
    selectedRole: role,         // User role for signup
    countryCode: '+233',        // Phone country code
  });
  
  /**
   * Form Data State
   * @type {Object} Complete form data object containing all user input
   */
  const [formData, setFormData] = useState({
    workId: '',        // User's work identification number
    email: '',         // User's email address
    password: '',      // User's password
    firstName: '',     // User's first name
    lastName: '',      // User's last name
    department: '',    // User's department
    jobTitle: '',      // User's job title
    phoneNumber: '',   // User's phone number (without country code)
    gender: '',        // User's gender selection
    dateOfBirth: '',  // User's date of birth
  });
  
  /**
   * Navigation and Authentication
   */
  /** @type {function} React Router navigation function */
  const navigate = useNavigate();
  
  /** @type {Object} Authentication functions from useAuth hook */
  const { signUp, signIn } = useAuth();

  /**
   * Memoized country codes with unique keys to prevent React key duplication warnings
   * Each country gets a guaranteed unique key using index + sanitized country name
   */
  const countryCodesWithUniqueKeys = useMemo(() => {
    const result = countryCodes.map((country, index) => ({
      ...country,
      uniqueKey: `country-${index}-${country.country.replace(/[^a-zA-Z0-9]/g, '')}`
    }));
    
    // Debug: Log first few keys to verify uniqueness
    console.log('🔍 UNIQUE KEYS GENERATED:', result.slice(0, 5).map(c => c.uniqueKey));
    
    return result;
  }, []);

  /**
   * Helper function to update UI state
   * @param {Object} updates - Partial state updates
   */
  const updateUiState = useCallback((updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Helper function to update form data
   * @param {Object} updates - Partial form data updates
   */
  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData({
      workId: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      department: '',
      jobTitle: '',
      phoneNumber: '',
      gender: '',
      dateOfBirth: '',
    });
    updateUiState({
      countryCode: '+233',
    });
  }, [updateUiState]);

  /**
   * Effect to handle role prop changes
   * 
   * @description Updates the selected role state when the role prop changes.
   * This ensures the component stays in sync with external role changes.
   * 
   * @dependencies {string} role - The role prop value
   */
  useEffect(() => {
    updateUiState({ selectedRole: role });
  }, [role]);

  /**
   * Effect to reset form when switching to login mode
   * 
   * @description Resets all form data, selected date, and country code when
   * the current mode changes to 'login'. This ensures a clean state when
   * users switch back to login mode.
   * 
   * @dependencies {string} currentMode - The current authentication mode
   */
  useEffect(() => {
    if (uiState.currentMode === 'login') {
      resetForm();
    }
  }, [uiState.currentMode]);

  /**
   * Gender options for the select dropdown
   * @type {string[]}
   * @constant
   */
  const genders = ['Male', 'Female', 'Other'];

  /**
   * Department options for the select dropdown
   * @type {string[]}
   * @constant
   * @description Available departments for user selection during signup
   */
  const departments = [
    'Engineering',
    'Human Resources',
    'Social Media',
    'Customer Support',
    'Production',
    'Design',
  ];



  /**
   * Handle form submission for both login and signup modes
   * 
   * @description This function processes form submissions for both authentication modes.
   * For login: authenticates user and navigates to appropriate dashboard based on role.
   * For signup: creates new user account, stores temporary token, and navigates to OTP verification.
   * 
   * @param {Event} e - Form submission event object
   * @returns {Promise<void>} Handles authentication flow asynchronously
   * 
   * @throws {Error} When API calls fail or authentication errors occur
   * 
   * @example
   * // Login flow
   * handleSubmit(event) // Authenticates and navigates to dashboard
   * 
   * // Signup flow  
   * handleSubmit(event) // Creates account and navigates to OTP verification
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate phone number length for signup
    if (uiState.currentMode === 'signup' && formData.phoneNumber.length !== 9) {
      toast.error('Phone number must be exactly 9 digits');
      return;
    }
    
    updateUiState({ loading: true });

    try {
      if (uiState.currentMode === 'login') {
        // Handle login flow
        const result = await signIn(formData.workId, formData.password);
        
        if (result.success) {
          toast.success('Login successful!');
          onClose();
          
          // Get the current user from localStorage (updated by useAuth)
          const currentUser = JSON.parse(localStorage.getItem('user'));
          
          // Navigate to respective dashboard based on user role
          
          if (currentUser.role === 'Human Resource Manager' || currentUser.role === 'human resource manager') {
            // Navigate to role selection page for HR managers
            navigate("/role-selection", { state: { userRole: currentUser.role } });
          } else if (currentUser.role === 'Staff') {
            navigate("/staff"); // Staff Dashboard
          } else if (currentUser.role === 'Admin') {
            // Navigate to role selection page for admins
            navigate("/role-selection", { state: { userRole: currentUser.role } });
          } else {
            navigate("/"); // Default to landing page
          }
        } else {
          toast.error(result.error || 'Login failed');
        }
      } else {
        // Handle signup flow
        // Prepare data according to the API schema
        const signupData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: `${uiState.countryCode}${formData.phoneNumber}`, // Format: +233543466492 (country code + 9 digits)
          email: formData.email,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          department: formData.department,
          role: uiState.selectedRole === 'hr' ? 'Human Resource Manager' : uiState.selectedRole === 'staff' ? 'Staff' : 'Admin',
          jobTitle: formData.jobTitle,
          password: formData.password
        };

        // Log the phone number format for debugging
        console.log('Phone number format:', {
          countryCode: uiState.countryCode,
          phoneNumber: formData.phoneNumber,
          combined: `${uiState.countryCode}${formData.phoneNumber}`,
          expectedFormat: '+233543466492'
        });

        // Make API call to signup endpoint
        const response = await axios.post(
          'https://vireworkplace-backend-hpca.onrender.com/api/v1/auth/signup',
          signupData
        );

        if (response.status === 201 || response.status === 200) {
          // Extract tempToken from response for OTP verification
          const tempToken = response.data.tempToken;
          
          // Store tempToken in localStorage for OTP verification
          if (tempToken) {
            localStorage.setItem('temp_token', tempToken);
          }
          
          // Store user's first name in localStorage for welcome page
          localStorage.setItem('signup_firstName', formData.firstName);
          
          toast.success('Account created successfully! Please check your email for OTP verification.');
          onClose();
          
          // Navigate to OTP confirmation page with signup context
          navigate("/otp-confirmation", { 
            state: { 
              reason: "signup",
              email: formData.email,
              tempToken: tempToken
            } 
          });
        } else {
          toast.error('Signup failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      const errorMessage = error.response?.data?.message || 
        (uiState.currentMode === 'login' ? 'An error occurred during login' : 'An error occurred during signup');
      toast.error(errorMessage);
    } finally {
      updateUiState({ loading: false });
    }
  }, [uiState.currentMode, formData, uiState.countryCode, uiState.selectedRole, updateUiState, signIn, signUp, onClose, navigate]);

  /**
   * Handle forgot password navigation
   * 
   * @description Closes the authentication modal and navigates the user to the 
   * forgot password page for password recovery.
   * 
   * @returns {void} No return value
   * 
   * @example
   * handleForgotPassword() // Closes modal and navigates to /forgot-password
   */
  const handleForgotPassword = useCallback(() => {
    onClose();
    navigate("/forgot-password");
  }, [onClose, navigate]);

  /**
   * Handle switching back to login mode
   * 
   * @description Resets all form data, clears selected role, resets country code to default,
   * and switches the modal back to login mode. This function is called when users
   * want to return to login after starting signup.
   * 
   * @returns {void} No return value
   * 
   * @example
   * handleSwitchToLogin() // Resets form and switches to login mode
   */
  const handleSwitchToLogin = useCallback(() => {
    updateUiState({ 
      currentMode: 'login',
      selectedRole: null 
    });
    resetForm();
  }, [updateUiState, resetForm]);

  /**
   * Helper function to format phone number for display
   * 
   * @description Removes all non-digit characters from the phone number input,
   * ensuring only numeric values are stored in the form state. Limits to exactly 9 digits.
   * 
   * @param {string} phoneNumber - The raw phone number input from user
   * @returns {string} Cleaned phone number with exactly 9 digits (or less if input is shorter)
   * 
   * @example
   * formatPhoneNumber("+233-543-466-492") // Returns "+233543466492"
   * formatPhoneNumber("abc123def456") // Returns "123456"
   */
  const formatPhoneNumber = (phoneNumber) => {
    // Remove any non-digit characters and limit to 9 digits
    return phoneNumber.replace(/\D/g, '').slice(0, 9);
  };

  /**
   * Main component render
   * 
   * @returns {JSX.Element} The complete authentication modal UI
   * @description Renders a responsive authentication modal with conditional form fields
   * based on the current mode (login/signup) and selected role.
   */
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/20 w-100 max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white text-center">
            {uiState.currentMode === 'login' ? 'Welcome Back' : `Join as ${uiState.selectedRole === 'staff' ? 'Staff' : uiState.selectedRole === 'hr' ? 'HR Manager' : 'Admin'}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Signup Form Fields - Only visible when currentMode is 'signup' */}
                      {uiState.currentMode === 'signup' && (
            <>
              {/* Personal Information Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-white">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="First name"
                      className="pl-10 glass border-white/20 text-white placeholder-muted-foreground"
                      value={formData.firstName}
                      onChange={(e) => updateFormData({ firstName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-white">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="last_name"
                      type="text"
                      placeholder="Last name"
                      className="pl-10 glass border-white/20 text-white placeholder-muted-foreground"
                      value={formData.lastName}
                      onChange={(e) => updateFormData({ lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-white">Department</Label>
                  <Select onValueChange={(value) => updateFormData({ department: value })}>
                    <SelectTrigger className="glass border-white/20 text-white cursor-pointer">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {departments.map((dept) => (
                        <SelectItem 
                          key={dept} 
                          value={dept}
                          className="hover:!bg-primary hover:!text-black cursor-pointer transition-colors duration-200 focus:!bg-primary focus:!text-black"
                        >
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_title" className="text-white">Job Title</Label>
                  <Input
                    id="job_title"
                    type="text"
                    placeholder="e.g. Developer"
                    className="glass border-white/20 text-white placeholder-muted-foreground"
                    value={formData.jobTitle}
                    onChange={(e) => updateFormData({ jobTitle: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Phone Number Input Section */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone Number</Label>
                {/* Responsive grid: stacked on mobile, side-by-side on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Country Code Dropdown - Takes 1 column on mobile, 1 on desktop */}
                  <div className="relative">
                    <Select value={uiState.countryCode} onValueChange={(value) => updateUiState({ countryCode: value })}>
                      <SelectTrigger className="glass border-white/20 text-white h-10 cursor-pointer">
                        <SelectValue>
                          <div className="flex items-center space-x-2">
                            <span>{countryCodesWithUniqueKeys.find(c => c.code === uiState.countryCode)?.flag}</span>
                            <span className="text-sm">{uiState.countryCode}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-60 max-w-40">
                        {/* CACHE-BUSTING FIX: Using memoized unique keys - VERSION 2025-09-10 */}
                        {countryCodesWithUniqueKeys.map((country, index) => {
                          console.log(`🔑 RENDERING COUNTRY ${index}: ${country.uniqueKey} for ${country.country}`);
                          return (
                            <SelectItem 
                              key={country.uniqueKey}
                              value={country.code}
                              className="hover:!bg-primary hover:!text-black cursor-pointer transition-colors duration-200 focus:!bg-primary focus:!text-black"
                            >
                            <div className="flex items-center space-x-2">
                              <span className="hover:!text-black">{country.flag}</span>
                              <span className="text-sm hover:!text-black">{country.code}</span>
                              <span className="text-xs text-white hover:!text-black">{country.country}</span>
                            </div>
                          </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Phone Number Input - Takes 2 columns on desktop, full width on mobile */}
                  <div className="relative sm:col-span-2">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter 9-digit number"
                      className="pl-10 pr-12 glass border-white/20 text-white placeholder-muted-foreground"
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow digits and limit to 9 characters
                        const numericValue = value.replace(/\D/g, '').slice(0, 9);
                        updateFormData({ phoneNumber: numericValue });
                      }}
                      maxLength={9}
                      pattern="[0-9]{9}"
                      inputMode="numeric"
                      required
                    />
                    {/* Validation icon - shows green checkmark when valid, nothing when empty */}
                    {formData.phoneNumber.length > 0 && (
                      <div className="absolute right-3 top-3">
                        {formData.phoneNumber.length === 9 ? (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Phone Number Validation Message */}
                {formData.phoneNumber && formData.phoneNumber.length !== 9 && (
                  <p className="text-xs text-yellow-400">
                    ⚠ Please enter a valid phone number
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date of Birth Selection */}
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-white">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    className="glass border-white/20 text-white"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-white">Gender</Label>
                  <Select onValueChange={(value) => updateFormData({ gender: value })}>
                    <SelectTrigger className="glass border-white/20 text-white cursor-pointer">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {genders.map((gender) => (
                        <SelectItem 
                          key={gender} 
                          value={gender}
                          className="hover:!bg-primary hover:!text-black cursor-pointer transition-colors duration-200 focus:!bg-primary focus:!text-black"
                        >
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* Login Form Fields - Only visible when currentMode is 'login' */}
          {uiState.currentMode === 'login' ? (
            <>
              {/* Work ID Input */}
              <div className="space-y-2">
                <Label htmlFor="work_id" className="text-white">Work ID</Label>
                <Input
                  id="work_id"
                  type="text"
                  placeholder="Enter your ID"
                  className="glass border-white/20 text-white placeholder-muted-foreground"
                  value={formData.workId}
                  onChange={(e) => updateFormData({ workId: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={uiState.showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pr-10 glass border-white/20 text-white placeholder-muted-foreground"
                    value={formData.password}
                    onChange={(e) => updateFormData({ password: e.target.value })}
                    required
                  />
                  {/* Password Visibility Toggle Button */}
                  <button
                    type="button"
                    onClick={() => updateUiState({ showPassword: !uiState.showPassword })}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-white cursor-pointer"
                    aria-label={uiState.showPassword ? "Hide password" : "Show password"}
                  >
                    {uiState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={uiState.rememberMe}
                    onCheckedChange={(checked) => updateUiState({ rememberMe: checked })}
                    className="border-white/20"
                  />
                  <Label htmlFor="remember" className="text-white text-sm">Remember Me</Label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-primary hover:underline text-sm cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 glass border-white/20 text-white placeholder-muted-foreground"
                    value={formData.email}
                    onChange={(e) => updateFormData({ email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={uiState.showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 glass border-white/20 text-white placeholder-muted-foreground"
                    value={formData.password}
                    onChange={(e) => updateFormData({ password: e.target.value })}
                    required
                  />
                  {/* Password Visibility Toggle Button */}
                  <button
                    type="button"
                    onClick={() => updateUiState({ showPassword: !uiState.showPassword })}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-white cursor-pointer"
                    aria-label={uiState.showPassword ? "Hide password" : "Show password"}
                  >
                    {uiState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Form Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-black font-semibold cursor-pointer"
            disabled={uiState.loading}
            aria-label={uiState.loading ? "Processing form submission" : uiState.currentMode === 'login' ? 'Sign in to account' : 'Create new account'}
          >
            {uiState.loading ? "Processing..." : uiState.currentMode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>

          {/* Role Selection Section - Only visible on login mode */}
          {uiState.currentMode === 'login' ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Don't have an account? Sign up as
              </p>
              {/* Role Selection Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    updateUiState({ currentMode: 'signup', selectedRole: 'admin' });
                  }}
                  className="text-primary hover:underline text-sm cursor-pointer"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateUiState({ currentMode: 'signup', selectedRole: 'hr' });
                  }}
                  className="text-primary hover:underline text-sm cursor-pointer"
                >
                  HR Manager
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateUiState({ currentMode: 'signup', selectedRole: 'staff' });
                  }}
                  className="text-primary hover:underline text-sm cursor-pointer"
                >
                  Staff
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={handleSwitchToLogin}
                className="text-primary hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * @exports AuthModal
 * @description Default export of the AuthModal component
 */
export default AuthModal;
