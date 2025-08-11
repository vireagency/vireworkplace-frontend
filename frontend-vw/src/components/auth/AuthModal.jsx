/**
 * @fileoverview Authentication Modal Component
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
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Data imports
import countryCodes from "@/data/countryCodes.json";

// Custom Hooks and Utilities
import useAuth from "@/hooks/useAuth";
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar as CalendarIcon, UserCheck, ChevronDownIcon } from "lucide-react";
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
  /**
   * UI State Management
   */
  /** @type {boolean} Controls password visibility in password input fields */
  const [showPassword, setShowPassword] = useState(false);
  
  /** @type {boolean} Indicates if form submission is in progress */
  const [loading, setLoading] = useState(false);
  
  /** @type {string} Current authentication mode ('login' or 'signup') */
  const [currentMode, setCurrentMode] = useState(mode);
  
  /** @type {boolean} Controls "Remember Me" checkbox state */
  const [rememberMe, setRememberMe] = useState(false);
  
  /** @type {string} Selected user role for signup ('admin', 'hr', 'staff') */
  const [selectedRole, setSelectedRole] = useState(role);
  
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
   * Phone Number State
   * @type {string} Country code for phone number (defaults to Ghana +233)
   */
  const [countryCode, setCountryCode] = useState('+233');
  
  /**
   * Date Picker State
   */
  /** @type {boolean} Controls date picker popover visibility */
  const [dateOpen, setDateOpen] = useState(false);
  
  /** @type {Date|null} Selected date from the calendar picker */
  const [selectedDate, setSelectedDate] = useState(null);
  
  /**
   * Navigation and Authentication
   */
  /** @type {function} React Router navigation function */
  const navigate = useNavigate();
  
  /** @type {Object} Authentication functions from useAuth hook */
  const { signUp, signIn } = useAuth();

  /**
   * Effect to handle role prop changes
   * 
   * @description Updates the selected role state when the role prop changes.
   * This ensures the component stays in sync with external role changes.
   * 
   * @dependencies {string} role - The role prop value
   */
  useEffect(() => {
    setSelectedRole(role);
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
    if (currentMode === 'login') {
      // Reset form data when switching to login mode
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
      setSelectedDate(null);
      setCountryCode('+233'); // Reset to default Ghana code
    }
  }, [currentMode]);

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
            // Validate phone number length for signup
        if (currentMode === 'signup' && formData.phoneNumber.length !== 9) {
          toast.error('Phone number must be exactly 9 digits');
          return;
        }
    
    setLoading(true);

    try {
      if (currentMode === 'login') {
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
          phoneNumber: `${countryCode}${formData.phoneNumber}`, // Format: +233543466492 (country code + 9 digits)
          email: formData.email,
          dateOfBirth: selectedDate ? selectedDate.toISOString().split('T')[0] : formData.dateOfBirth,
          gender: formData.gender,
          department: formData.department,
          role: selectedRole === 'hr' ? 'Human Resource Manager' : selectedRole === 'staff' ? 'Staff' : 'Admin',
          jobTitle: formData.jobTitle,
          password: formData.password
        };

        // Log the phone number format for debugging
        console.log('Phone number format:', {
          countryCode,
          phoneNumber: formData.phoneNumber,
          combined: `${countryCode}${formData.phoneNumber}`,
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
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      const errorMessage = error.response?.data?.message || 
        (currentMode === 'login' ? 'An error occurred during login' : 'An error occurred during signup');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
  const handleForgotPassword = () => {
    onClose();
    navigate("/forgot-password");
  };

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
  const handleSwitchToLogin = () => {
    setCurrentMode('login');
    setSelectedRole(null);
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
    setSelectedDate(null);
    setCountryCode('+233'); // Reset to default Ghana code
  };

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
            {currentMode === 'login' ? 'Welcome Back' : `Join as ${selectedRole === 'staff' ? 'Staff' : selectedRole === 'hr' ? 'HR Manager' : 'Admin'}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Signup Form Fields - Only visible when currentMode is 'signup' */}
          {currentMode === 'signup' && (
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
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-white">Department</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, department: value })}>
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
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
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
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="glass border-white/20 text-white h-10">
                        <SelectValue>
                          <div className="flex items-center space-x-2">
                            <span>{countryCodes.find(c => c.code === countryCode)?.flag}</span>
                            <span className="text-sm">{countryCode}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-60 max-w-40">
                        {countryCodes.map((country) => (
                          <SelectItem 
                            key={country.code} 
                            value={country.code}
                            className="hover:!bg-primary hover:!text-black cursor-pointer transition-colors duration-200 focus:!bg-primary focus:!text-black"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="hover:!text-black">{country.flag}</span>
                              <span className="text-sm hover:!text-black">{country.code}</span>
                              <span className="text-xs text-white hover:!text-black">{country.country}</span>
                            </div>
                          </SelectItem>
                        ))}
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
                        setFormData({ ...formData, phoneNumber: numericValue });
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
                  {/* Calendar Popover for Date Selection */}
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date_of_birth"
                        className="w-full justify-between font-normal glass border-white/20 text-white hover:bg-white/10 cursor-pointer"
                      >
                        {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0 bg-popover border border-border rounded-md shadow-md" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setFormData({ ...formData, dateOfBirth: date ? date.toISOString().split('T')[0] : '' });
                          setDateOpen(false);
                        }}
                        className="[&_button]:hover:!bg-primary [&_button]:hover:!text-black [&_button]:cursor-pointer [&_button]:transition-colors [&_button]:duration-200 [&_button]:focus:!bg-primary [&_button]:focus:!text-black [&_button]:text-white [&_button]:rounded-md [&_button]:p-2 [&_button]:text-sm [&_button]:font-medium [&_button]:hover:!scale-105 [&_button]:transition-transform [&_button]:duration-200"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-white">Gender</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, gender: value })}>
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
          {currentMode === 'login' ? (
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
                  onChange={(e) => setFormData({ ...formData, workId: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pr-10 glass border-white/20 text-white placeholder-muted-foreground"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  {/* Password Visibility Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-white cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 glass border-white/20 text-white placeholder-muted-foreground"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  {/* Password Visibility Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-white cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Form Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-black font-semibold cursor-pointer"
            disabled={loading}
            aria-label={loading ? "Processing form submission" : currentMode === 'login' ? 'Sign in to account' : 'Create new account'}
          >
            {loading ? "Processing..." : currentMode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>

          {/* Role Selection Section - Only visible on login mode */}
          {currentMode === 'login' ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Don't have an account? Sign up as
              </p>
              {/* Role Selection Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMode('signup');
                    setSelectedRole('admin');
                  }}
                  className="text-primary hover:underline text-sm cursor-pointer"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMode('signup');
                    setSelectedRole('hr');
                  }}
                  className="text-primary hover:underline text-sm cursor-pointer"
                >
                  HR Manager
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMode('signup');
                    setSelectedRole('staff');
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
