import React, { useState, useCallback, useMemo } from "react";
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Lock, Shield, Key } from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import { staffDashboardConfig } from "@/config/dashboardConfigs";

// StatusBadge component moved outside to prevent recreation on every render
const StatusBadge = React.memo(({ status }) => {
  const statusConfig = {
    "Active": { 
      bgColor: "bg-green-50", 
      borderColor: "border-green-200", 
      textColor: "text-green-700",
      dotColor: "bg-green-500",
      text: "Active" 
    },
    "In-active": { 
      bgColor: "bg-orange-50", 
      borderColor: "border-orange-200", 
      textColor: "text-orange-700",
      dotColor: "bg-orange-500",
      text: "In-active" 
    },
    "Closed": { 
      bgColor: "bg-red-50", 
      borderColor: "border-red-200", 
      textColor: "text-red-700",
      dotColor: "bg-red-500",
      text: "Closed" 
    }
  }
  
  const config = statusConfig[status] || statusConfig["Active"]
  
  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}>
      <div className={`w-2 h-2 ${config.dotColor} rounded-full`}></div>
      <span className={`text-sm font-medium ${config.textColor}`}>{config.text}</span>
    </div>
  )
});

export default function StaffPasswordSettings() {
  const { user } = useAuth();
  
  // Consolidated state object following React best practices
  const [state, setState] = useState({
    // UI state
    isLoading: false,
    error: null,
    success: false,
    
    // Password visibility states
    passwordVisibility: {
      currentPassword: false,
      newPassword: false,
      confirmPassword: false
    },
    
    // Form data
    formData: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Memoized event handlers to prevent unnecessary re-renders
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isLoading: true, error: null, success: false }));
    
    try {
      // Validate passwords match
      if (state.formData.newPassword !== state.formData.confirmPassword) {
        throw new Error('New password and confirm password do not match');
      }
      
      // Validate password strength (basic validation)
      if (state.formData.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Password change submitted:', state.formData);
      
      // Clear form and show success
      setState(prev => ({
        ...prev,
        formData: { currentPassword: '', newPassword: '', confirmPassword: '' },
        success: true,
        isLoading: false
      }));
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, success: false }));
      }, 3000);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  }, [state.formData]);

  const handleInputChange = useCallback((field, value) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value
      },
      error: null // Clear error when user starts typing
    }));
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    setState(prev => ({
      ...prev,
      passwordVisibility: {
        ...prev.passwordVisibility,
        [field]: !prev.passwordVisibility[field]
      }
    }));
  }, []);

  // Memoized password strength calculation
  const passwordStrength = useMemo(() => {
    const password = state.formData.newPassword;
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    const strengthLevels = [
      { score: 0, label: 'Very Weak', color: 'bg-red-500' },
      { score: 1, label: 'Weak', color: 'bg-red-400' },
      { score: 2, label: 'Fair', color: 'bg-yellow-400' },
      { score: 3, label: 'Good', color: 'bg-yellow-300' },
      { score: 4, label: 'Strong', color: 'bg-green-400' },
      { score: 5, label: 'Very Strong', color: 'bg-green-500' },
      { score: 6, label: 'Excellent', color: 'bg-green-600' }
    ];
    
    return strengthLevels[Math.min(score, 6)];
  }, [state.formData.newPassword]);

  return (
    <StaffDashboardLayout 
      sidebarConfig={staffDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="mb-8 ml-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 mb-2">Password Settings</h1>
              <p className="text-zinc-500">Manage your password and security preferences.</p>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={user?.firstName} />
                <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-500">Staff Member</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-6 mr-6 space-y-6">
          {/* Password Change Form */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={state.passwordVisibility.currentPassword ? "text" : "password"}
                    value={state.formData.currentPassword}
                    onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                    placeholder="Enter your current password"
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                  >
                    {state.passwordVisibility.currentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={state.passwordVisibility.newPassword ? "text" : "password"}
                    value={state.formData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    placeholder="Enter your new password"
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("newPassword")}
                  >
                    {state.passwordVisibility.newPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {state.formData.newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={state.passwordVisibility.confirmPassword ? "text" : "password"}
                    value={state.formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your new password"
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                  >
                    {state.passwordVisibility.confirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={state.isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {state.isLoading ? "Changing Password..." : "Change Password"}
                </Button>
              </div>
            </form>
          </div>

          {/* Security Information */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Security Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Not Enabled
                </Badge>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Last Password Change</h3>
                  <p className="text-xs text-gray-500">Your password was last changed 30 days ago</p>
                </div>
                <span className="text-xs text-gray-500">Dec 15, 2024</span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Account Security</h3>
                  <p className="text-xs text-gray-500">Your account security is good</p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Secure
                </Badge>
              </div>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Key className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-2">Password Requirements</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                  <li>• Contains at least one special character</li>
                  <li>• Different from your current password</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {state.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-green-700">Password changed successfully!</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
