/**
 * Authentication Modal Component
 * 
 * A comprehensive modal component that handles both user login and signup functionality.
 * It provides a unified interface for authentication with role-based form fields and
 * integrates with the backend API for user registration and authentication.
 * 
 * Features:
 * - Toggle between login and signup modes
 * - Role-based form fields (different fields for different roles)
 * - Password visibility toggle
 * - Date picker for date of birth
 * - Form validation and error handling
 * - API integration for signup and login
 * - Role-based navigation after successful authentication
 * - Remember me functionality
 * - Toast notifications for user feedback
 * 
 * Props:
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback to close the modal
 * @param {string} mode - Initial mode ('login' or 'signup')
 * @param {string} role - User role for signup ('staff', 'hr', 'admin')
 */

// React and UI Components
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  // UI State Management
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Form Data State
  const [formData, setFormData] = useState({
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
  
  // Date Picker State
  const [dateOpen, setDateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Navigation and Authentication
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();

  // Gender options for the select dropdown
  const genders = ['Male', 'Female', 'Other'];

  // Department options for the select dropdown
  const departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'Human Resources',
    'Finance',
    'Operations',
    'Customer Support',
    'Product Management',
    'Design',
    'Legal',
    'IT Support',
    'Research & Development'
  ];

  /**
   * Handle form submission for both login and signup
   * 
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
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
            navigate("/human-resource-manager"); // HR Dashboard
          } else if (currentUser.role === 'Staff') {
            navigate("/staff"); // Staff Dashboard
          } else if (currentUser.role === 'Admin') {
            navigate("/admin"); // Admin Dashboard
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
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          dateOfBirth: selectedDate ? selectedDate.toISOString().split('T')[0] : formData.dateOfBirth,
          gender: formData.gender,
          department: formData.department,
          role: role === 'staff' ? 'Staff' : role === 'hr' ? 'Human Resource Manager' : 'Admin',
          jobTitle: formData.jobTitle,
          password: formData.password
        };

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
   * Closes the modal and navigates to the forgot password page
   */
  const handleForgotPassword = () => {
    onClose();
    navigate("/forgot-password");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/20 w-100 max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white text-center">
            {currentMode === 'login' ? 'Welcome Back' : `Join as ${role === 'staff' ? 'Staff' : role === 'hr' ? 'HR' : 'Admin'}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {currentMode === 'signup' && (
            <>
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
                    <SelectTrigger className="glass border-white/20 text-white">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="pl-10 glass border-white/20 text-white placeholder-muted-foreground"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-white">Date of Birth</Label>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date_of_birth"
                        className="w-full justify-between font-normal glass border-white/20 text-white hover:bg-white/10"
                      >
                        {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setFormData({ ...formData, dateOfBirth: date ? date.toISOString().split('T')[0] : '' });
                          setDateOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-white">Gender</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger className="glass border-white/20 text-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {currentMode === 'login' ? (
            <>
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
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-white"
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
                  className="text-primary hover:underline text-sm"
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
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-black font-semibold"
            disabled={loading}
          >
            {loading ? "Processing..." : currentMode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {currentMode === 'login' ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setCurrentMode(currentMode === 'login' ? 'signup' : 'login')}
              className="text-primary hover:underline"
            >
              {currentMode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
