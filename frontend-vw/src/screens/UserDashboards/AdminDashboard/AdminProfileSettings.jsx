import React, { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { adminDashboardConfig } from "@/config/dashboardConfigs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconBuilding,
  IconCalendar,
  IconShield,
  IconEdit,
  IconSave,
  IconX,
  IconCamera,
  IconId,
  IconCertificate,
  IconAward,
} from "@tabler/icons-react";
import ProfileImageUpload from "@/components/ProfileImageUpload";

export default function AdminProfileSettings() {
  const { user, accessToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    title: user?.title || "System Administrator",
    department: user?.department || "IT",
    location: user?.location || "",
    bio: user?.bio || "",
    avatar: user?.avatar || null,
    role: user?.role || "Admin",
    joinDate: user?.joinDate || "2022-01-15",
    lastLogin: user?.lastLogin || "2024-01-15 10:30",
    status: user?.status || "Active",
  });

  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    setOriginalData(profileData);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setOriginalData(profileData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (imageFile) => {
    setIsUploading(true);
    try {
      // Simulate image upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const imageUrl = URL.createObjectURL(imageFile);
      setProfileData((prev) => ({
        ...prev,
        avatar: imageUrl,
      }));
      toast.success("Profile image updated successfully");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Active: "bg-green-100 text-green-800",
      Inactive: "bg-red-100 text-red-800",
      Pending: "bg-yellow-100 text-yellow-800",
    };

    return (
      <Badge className={variants[status] || variants.Active}>{status}</Badge>
    );
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
              Profile Settings
            </h1>
            <p className="text-gray-600">
              Manage your personal information and preferences
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <IconX className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  <IconSave className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit}>
                <IconEdit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
                <CardDescription>
                  Your current profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileData.avatar} />
                      <AvatarFallback className="text-2xl">
                        {profileData.firstName[0]}
                        {profileData.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="absolute bottom-0 right-0">
                        <ProfileImageUpload
                          onImageUpload={handleImageUpload}
                          isUploading={isUploading}
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">
                      {profileData.firstName} {profileData.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{profileData.title}</p>
                    <p className="text-sm text-gray-500">
                      {profileData.department}
                    </p>
                    <div className="mt-2">
                      {getStatusBadge(profileData.status)}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Role</span>
                    <Badge variant="secondary">{profileData.role}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Join Date</span>
                    <span className="text-sm font-medium">
                      {profileData.joinDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Login</span>
                    <span className="text-sm font-medium">
                      {profileData.lastLogin}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium flex items-center">
                    <IconUser className="w-5 h-5 mr-2" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium flex items-center">
                    <IconBuilding className="w-5 h-5 mr-2" />
                    Professional Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={profileData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={profileData.department}
                        onChange={(e) =>
                          handleInputChange("department", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium flex items-center">
                    <IconCertificate className="w-5 h-5 mr-2" />
                    Additional Information
                  </h4>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <IconShield className="w-5 h-5 mr-2" />
                  Security Information
                </CardTitle>
                <CardDescription>
                  Your account security and access information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <IconId className="w-5 h-5 mr-3 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">User ID</p>
                        <p className="text-xs text-gray-500">
                          #{user?.id || "ADM001"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <IconAward className="w-5 h-5 mr-3 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Access Level</p>
                        <p className="text-xs text-gray-500">
                          Full Admin Access
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <IconCalendar className="w-5 h-5 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Account Created</p>
                      <p className="text-xs text-gray-500">
                        {profileData.joinDate}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
