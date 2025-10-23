import React, { useState } from "react";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { adminDashboardConfig } from "@/config/dashboardConfigs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  IconLock,
  IconEye,
  IconEyeOff,
  IconShield,
  IconCheck,
  IconX,
  IconKey,
  IconAlertTriangle,
} from "@tabler/icons-react";

export default function AdminPasswordSettings() {
  const { user, accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "newPassword") {
      checkPasswordRequirements(value);
      calculatePasswordStrength(value);
    }
  };

  const checkPasswordRequirements = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordRequirements(requirements);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
    setPasswordStrength(strength);
  };

  const getStrengthColor = (strength) => {
    if (strength < 40) return "bg-red-500";
    if (strength < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength) => {
    if (strength < 40) return "Weak";
    if (strength < 80) return "Medium";
    return "Strong";
  };

  const handleChangePassword = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    if (passwordStrength < 80) {
      toast.error("Password does not meet security requirements");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
      setPasswordStrength(0);
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Password reset email sent");
    } catch (error) {
      toast.error("Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminDashboardLayout
      sidebarConfig={adminDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Password Settings
            </h1>
            <p className="text-gray-600">
              Manage your account password and security
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IconLock className="w-5 h-5 mr-2" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your account password for better security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      handleInputChange("currentPassword", e.target.value)
                    }
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <IconEyeOff className="h-4 w-4" />
                    ) : (
                      <IconEye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <IconEyeOff className="h-4 w-4" />
                    ) : (
                      <IconEye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <IconEyeOff className="h-4 w-4" />
                    ) : (
                      <IconEye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password Requirements */}
              {passwordData.newPassword && (
                <div className="space-y-2">
                  <Label>Password Requirements</Label>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      {passwordRequirements.length ? (
                        <IconCheck className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <IconX className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span
                        className={
                          passwordRequirements.length
                            ? "text-green-700"
                            : "text-red-700"
                        }
                      >
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      {passwordRequirements.uppercase ? (
                        <IconCheck className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <IconX className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span
                        className={
                          passwordRequirements.uppercase
                            ? "text-green-700"
                            : "text-red-700"
                        }
                      >
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      {passwordRequirements.lowercase ? (
                        <IconCheck className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <IconX className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span
                        className={
                          passwordRequirements.lowercase
                            ? "text-green-700"
                            : "text-red-700"
                        }
                      >
                        One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      {passwordRequirements.number ? (
                        <IconCheck className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <IconX className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span
                        className={
                          passwordRequirements.number
                            ? "text-green-700"
                            : "text-red-700"
                        }
                      >
                        One number
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      {passwordRequirements.special ? (
                        <IconCheck className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <IconX className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span
                        className={
                          passwordRequirements.special
                            ? "text-green-700"
                            : "text-red-700"
                        }
                      >
                        One special character
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Strength */}
              {passwordData.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Password Strength</Label>
                    <span
                      className={`text-sm font-medium ${
                        passwordStrength < 40
                          ? "text-red-600"
                          : passwordStrength < 80
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(
                        passwordStrength
                      )}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleChangePassword}
                disabled={isLoading || passwordStrength < 80}
                className="w-full"
              >
                {isLoading ? "Changing Password..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>

          {/* Security Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IconShield className="w-5 h-5 mr-2" />
                Security Information
              </CardTitle>
              <CardDescription>
                Your account security status and options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <IconCheck className="w-5 h-5 mr-3 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Password Protected</p>
                      <p className="text-xs text-gray-500">
                        Your account is secured with a password
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <IconCheck className="w-5 h-5 mr-3 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">
                        Two-Factor Authentication
                      </p>
                      <p className="text-xs text-gray-500">
                        2FA is enabled for your account
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <IconAlertTriangle className="w-5 h-5 mr-3 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">
                        Last Password Change
                      </p>
                      <p className="text-xs text-gray-500">
                        90 days ago - Consider updating
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Security Actions</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleResetPassword}
                    disabled={isLoading}
                  >
                    <IconKey className="w-4 h-4 mr-2" />
                    Send Password Reset Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <IconShield className="w-5 h-5 mr-2" />
              Password Security Tips
            </CardTitle>
            <CardDescription>
              Best practices for keeping your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-green-700">Do:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <IconCheck className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    Use a unique password for this account
                  </li>
                  <li className="flex items-start">
                    <IconCheck className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    Include a mix of letters, numbers, and symbols
                  </li>
                  <li className="flex items-start">
                    <IconCheck className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    Make it at least 8 characters long
                  </li>
                  <li className="flex items-start">
                    <IconCheck className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    Change your password regularly
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-red-700">Don't:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <IconX className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                    Use personal information like your name
                  </li>
                  <li className="flex items-start">
                    <IconX className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                    Share your password with others
                  </li>
                  <li className="flex items-start">
                    <IconX className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                    Use the same password for multiple accounts
                  </li>
                  <li className="flex items-start">
                    <IconX className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                    Write your password down in plain text
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
