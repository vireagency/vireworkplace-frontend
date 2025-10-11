import { useState, useEffect, useCallback, useMemo } from "react";
// HRSettingsPage - Unified settings page for HR Manager with horizontal tab navigation
import HRDashboardLayout from "@/components/dashboard/HRDashboardLayout";
import { hrDashboardConfig } from "@/config/dashboardConfigs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import {
  IconPlus,
  IconUser,
  IconMail,
  IconId,
  IconCertificate,
  IconFileText,
  IconShield,
  IconSchool,
  IconBuilding,
  IconAward,
  IconBrain,
  IconChevronRight,
  IconChevronDown,
  IconEdit,
  IconTrash,
  IconX,
  IconMapPin,
} from "@tabler/icons-react";
import { Eye, EyeOff } from "lucide-react";

// StatusBadge component moved outside to prevent recreation on every render
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Active: {
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      dotColor: "bg-green-500",
      text: "Active",
    },
    "In-active": {
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      dotColor: "bg-orange-500",
      text: "In-active",
    },
    Closed: {
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      dotColor: "bg-red-500",
      text: "Closed",
    },
  };

  const config = statusConfig[status] || statusConfig["Active"];

  return (
    <div
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}
    >
      <div className={`w-2 h-2 ${config.dotColor} rounded-full`}></div>
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.text}
      </span>
    </div>
  );
};

export default function HRSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileSubTab, setProfileSubTab] = useState("personal");
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [isExperienceEditMode, setIsExperienceEditMode] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState(null);
  const [isLicensesOpen, setIsLicensesOpen] = useState(false);
  const [showLicensesModal, setShowLicensesModal] = useState(false);
  const [isLicensesEditMode, setIsLicensesEditMode] = useState(false);
  const [editingLicensesId, setEditingLicensesId] = useState(null);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [educationForm, setEducationForm] = useState({
    institution: "",
    description: "",
    duration: "",
  });
  const [experienceForm, setExperienceForm] = useState({
    jobTitle: "",
    organization: "",
    description: "",
    location: "",
    skills: "",
    duration: "",
  });
  const [licensesForm, setLicensesForm] = useState({
    certificationName: "",
    organization: "",
    description: "",
    issueDate: "",
  });
  const [skillsForm, setSkillsForm] = useState({
    skillName: "",
  });
  const [educationEntries, setEducationEntries] = useState([
    {
      id: 1,
      institution: "University of Ghana, Legon",
      description: "Mathematics",
      duration: "2018-2022",
    },
    {
      id: 2,
      institution: "University of Hong-Kong",
      description: "Associate Diploma (Software Engineering)",
      duration: "2020-2021",
    },
  ]);
  const [experienceEntries, setExperienceEntries] = useState([
    {
      id: 1,
      jobTitle: "Engineering Lead",
      organization: "VIRE Workplace",
      employmentType: "Full-Time",
      location: "Accra, Ghana",
      duration: "2025 - present",
      skills:
        "User-centered Design · Motion Design · UX Research · Figma (Software) · User Experience (UX) · Mobile Design",
    },
    {
      id: 2,
      jobTitle: "Senior Software Engineer",
      organization: "Tech Solutions Ltd",
      employmentType: "Contract",
      location: "Accra, Ghana",
      duration: "2023 - 2025",
      skills: "React · JavaScript · Node.js · TypeScript · MongoDB · AWS",
    },
    {
      id: 3,
      jobTitle: "Senior Software Engineer",
      organization: "Digital Innovations",
      employmentType: "Contract",
      location: "Abuja, Nigeria",
      duration: "2024 - 2025",
      skills: "Python · Django · PostgreSQL · Docker · Kubernetes · CI/CD",
    },
  ]);
  const [licensesEntries, setLicensesEntries] = useState([
    {
      id: 1,
      organization: "Andela",
      certificationName: "Nodejs Developer Course, Reactjs and Redux",
      issueDate: "Issued July, 2022",
    },
    {
      id: 2,
      organization: "ALX",
      certificationName: "Backend Web Development Specialization",
      issueDate: "Issued January, 2023",
    },
  ]);
  const [skillsEntries, setSkillsEntries] = useState([
    "UX research",
    "UI design",
    "Prototyping",
    "Wireframing",
    "User-centered design",
    "Figma",
    "Mobile design",
  ]);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    username: user?.email?.split("@")[0] ? `@${user.email.split("@")[0]}` : "",
    dateOfBirth: user?.dateOfBirth || "",
    maritalStatus: user?.maritalStatus || "",
    lastName: user?.lastName || "",
    nationality: user?.nationality || "Ghanaian",
    gender: user?.gender || "",
    personalPronouns: user?.personalPronouns || "",
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      // Parse date of birth if it exists
      let parsedDate = null;
      if (user.dateOfBirth) {
        // Handle both ISO string format and simple date format
        if (user.dateOfBirth.includes("T")) {
          // ISO format: "2002-03-27T00:00:00.000Z"
          parsedDate = new Date(user.dateOfBirth);
        } else {
          // Simple format: "2002-03-27"
          parsedDate = new Date(user.dateOfBirth);
        }
      }

      setSelectedDate(parsedDate);
      setFormData({
        firstName: user.firstName || "",
        username: user.email?.split("@")[0]
          ? `@${user.email.split("@")[0]}`
          : "",
        dateOfBirth: user.dateOfBirth || "",
        maritalStatus: user.maritalStatus || "",
        lastName: user.lastName || "",
        nationality: user.nationality || "Ghanaian",
        gender: user.gender || "",
        personalPronouns: user.personalPronouns || "",
      });
    }
  }, [user]);

  // Password state (from HRPasswordSettings)
  const [passwordState, setPasswordState] = useState({
    isLoading: false,
    error: null,
    success: false,
    passwordVisibility: {
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    },
    formData: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification state (from HRNotificationSettings)
  const [notificationState, setNotificationState] = useState({
    expandedCategories: {},
    isLoading: false,
    error: null,
    notificationSettings: {
      performanceManagement: {
        toggles: {
          reviewReminders: false,
          reviewDueDate: false,
          feedbackReceived: false,
          goalUpdates: false,
        },
        enabled: 0,
        total: 4,
      },
      taskManagement: {
        toggles: {
          taskAssignments: false,
          taskUpdates: false,
          taskDeadlines: false,
          taskCompletions: false,
        },
        enabled: 0,
        total: 4,
      },
      employeeInformation: {
        toggles: {
          profileUpdates: false,
          newEmployeeOnboarding: false,
          employeeStatusChanges: false,
        },
        enabled: 0,
        total: 3,
      },
      systemAlerts: {
        toggles: {
          systemMaintenance: false,
          systemUpdates: false,
          applicationAnnouncements: false,
        },
        enabled: 0,
        total: 3,
      },
      deliveryMethods: {
        toggles: {
          inAppNotifications: false,
          emailNotifications: false,
          desktopNotifications: false,
          platformIntegrations: false,
        },
        enabled: 0,
        total: 4,
      },
      globalSettings: {
        toggles: {
          masterNotificationToggle: false,
        },
        enabled: 0,
        total: 1,
      },
    },
  });

  // Password handlers (from HRPasswordSettings)
  const togglePasswordVisibility = useCallback((field) => {
    setPasswordState((prev) => ({
      ...prev,
      passwordVisibility: {
        ...prev.passwordVisibility,
        [field]: !prev.passwordVisibility[field],
      },
    }));
  }, []);

  const handlePasswordInputChange = useCallback((field, value) => {
    setPasswordState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  }, []);

  const handlePasswordSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setPasswordState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        success: false,
      }));

      try {
        // Validate passwords match
        if (
          passwordState.formData.newPassword !==
          passwordState.formData.confirmPassword
        ) {
          throw new Error("New password and confirm password do not match");
        }

        // Validate password strength (basic validation)
        if (passwordState.formData.newPassword.length < 8) {
          throw new Error("New password must be at least 8 characters long");
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Password change submitted:", passwordState.formData);

        // Clear form and show success
        setPasswordState((prev) => ({
          ...prev,
          formData: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          },
          success: true,
          isLoading: false,
        }));
      } catch (error) {
        setPasswordState((prev) => ({
          ...prev,
          error: error.message,
          isLoading: false,
        }));
      }
    },
    [passwordState.formData]
  );

  // Notification handlers (from HRNotificationSettings)
  const toggleCategory = useCallback((category) => {
    setNotificationState((prev) => ({
      ...prev,
      expandedCategories: {
        ...prev.expandedCategories,
        [category]: !prev.expandedCategories[category],
      },
    }));
  }, []);

  const toggleIndividualSetting = useCallback((category, setting) => {
    setNotificationState((prev) => {
      const categorySettings = prev.notificationSettings[category];
      const updatedToggles = {
        ...categorySettings.toggles,
        [setting]: !categorySettings.toggles[setting],
      };

      // Calculate enabled count
      const enabledCount = Object.values(updatedToggles).filter(Boolean).length;

      return {
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          [category]: {
            ...categorySettings,
            toggles: updatedToggles,
            enabled: enabledCount,
          },
        },
      };
    });
  }, []);

  const enableAll = useCallback((category) => {
    setNotificationState((prev) => {
      const categorySettings = prev.notificationSettings[category];
      const updatedToggles = Object.keys(categorySettings.toggles).reduce(
        (acc, key) => {
          acc[key] = true;
          return acc;
        },
        {}
      );

      return {
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          [category]: {
            ...categorySettings,
            toggles: updatedToggles,
            enabled: categorySettings.total,
          },
        },
      };
    });
  }, []);

  const disableAll = useCallback((category) => {
    setNotificationState((prev) => {
      const categorySettings = prev.notificationSettings[category];
      const updatedToggles = Object.keys(categorySettings.toggles).reduce(
        (acc, key) => {
          acc[key] = false;
          return acc;
        },
        {}
      );

      return {
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          [category]: {
            ...categorySettings,
            toggles: updatedToggles,
            enabled: 0,
          },
        },
      };
    });
  }, []);

  const handleSavePreferences = useCallback(async () => {
    setNotificationState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(
        "Saving notification preferences:",
        notificationState.notificationSettings
      );
    } catch (error) {
      setNotificationState((prev) => ({ ...prev, error: error.message }));
    } finally {
      setNotificationState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [notificationState.notificationSettings]);

  // Memoized notification categories
  const notificationCategories = useMemo(
    () => [
      { key: "performanceManagement", name: "Performance Management" },
      { key: "taskManagement", name: "Task Management" },
      { key: "employeeInformation", name: "Employee Information" },
      { key: "systemAlerts", name: "System Alerts" },
      { key: "deliveryMethods", name: "Delivery Methods" },
      { key: "globalSettings", name: "Global Settings" },
    ],
    []
  );

  const tabs = [
    // These are sub-tabs for profile
    { id: "personal", label: "Personal Information", icon: IconUser },
    { id: "contact", label: "Contact Information", icon: IconMail },
    { id: "emergency", label: "Emergency Contact", icon: IconShield },
    { id: "employment", label: "Employment Details", icon: IconId },
    { id: "qualifications", label: "Qualifications", icon: IconCertificate },
    { id: "documents", label: "Documents", icon: IconFileText },
    // { id: "health", label: "Health Info", icon: IconShield },
  ];

  return (
    <HRDashboardLayout
      sidebarConfig={hrDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb Navigation */}
        <div className="px-6 py-4">
          <p className="text-lg">
            <span className="font-bold text-black">Account Settings</span>
            <span className="text-gray-500"> / </span>
            <span className="text-gray-500">
              {activeTab === "profile" &&
                profileSubTab === "personal" &&
                "Profile"}
              {activeTab === "profile" &&
                profileSubTab === "contact" &&
                "Contact Information"}
              {activeTab === "profile" &&
                profileSubTab === "emergency" &&
                "Emergency Contact"}
              {activeTab === "profile" &&
                profileSubTab === "employment" &&
                "Employment Details"}
              {activeTab === "profile" &&
                profileSubTab === "qualifications" &&
                "Qualifications"}
              {activeTab === "profile" &&
                profileSubTab === "documents" &&
                "Documents"}
              {/* {activeTab === "profile" &&
                profileSubTab === "health" &&
                "Health Info"} */}
              {activeTab === "password" && "Password"}
              {activeTab === "notification" && "Notifications"}
            </span>
          </p>
        </div>

        {/* Profile Section (common to all tabs) */}
        <div className="px-6 py-6 bg-white border-b border-gray-200">
          <div className="flex items-start space-x-6">
            {/* Profile Picture Upload */}
            <ProfileImageUpload
              size="w-24 h-24"
              currentImageUrl={user?.avatar}
              userName={user ? `${user.firstName} ${user.lastName}` : ""}
              showActions={true}
              showSizeHint={true}
            />

            {/* Profile Details */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
              </h3>
              <p className="text-gray-600 mb-3">
                {user?.jobRole || user?.role || "Loading..."}
              </p>
              <div className="flex items-center space-x-6">
                <StatusBadge status={user?.attendanceStatus || "Active"} />
                <div className="flex items-center space-x-1">
                  <span className="text-gray-700 text-sm">
                    Work ID: {user?.workId || "N/A"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-700 text-sm">
                    Arrival: {user?.isLate ? "Late" : "On Time"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Horizontal Tabs */}
        <div className="px-6 py-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === "profile"
                  ? "border-green-500 text-green-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === "password"
                  ? "border-green-500 text-green-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setActiveTab("notification")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === "notification"
                  ? "border-green-500 text-green-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Notification
            </button>
          </div>
        </div>

        {/* Profile Sub Navigation Tabs */}
        {activeTab === "profile" && (
          <div className="px-6 py-4">
            <div className="bg-gray-100 rounded-lg p-1 inline-flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setProfileSubTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    profileSubTab === tab.id
                      ? "bg-green-500 text-white shadow-sm"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {tab.icon ? <tab.icon size={16} /> : null}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="px-6 py-8 bg-white">
          {/* Profile Tab Content */}
          {activeTab === "profile" && (
            <>
              {/* Personal Information Section */}
              {profileSubTab === "personal" && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">
                    Personal Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="firstName"
                          className="text-sm font-semibold text-gray-800"
                        >
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="username"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Username
                        </Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              username: e.target.value,
                            })
                          }
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="dateOfBirth"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Date of Birth
                        </Label>
                        <Popover open={dateOpen} onOpenChange={setDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              id="dateOfBirth"
                              className="w-full justify-between font-normal bg-white border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                              {selectedDate
                                ? selectedDate.toLocaleDateString()
                                : "Select date"}
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0 bg-popover border border-border rounded-md shadow-md"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                setSelectedDate(date);
                                setFormData({
                                  ...formData,
                                  dateOfBirth: date
                                    ? date.toISOString().split("T")[0]
                                    : "",
                                });
                                setDateOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="maritalStatus"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Marital Status
                        </Label>
                        <Select
                          value={formData.maritalStatus}
                          onValueChange={(value) =>
                            setFormData({ ...formData, maritalStatus: value })
                          }
                        >
                          <SelectTrigger className="bg-white border-gray-300 rounded-md text-gray-600 cursor-pointer">
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="Single"
                              className="cursor-pointer"
                            >
                              Single
                            </SelectItem>
                            <SelectItem
                              value="Married"
                              className="cursor-pointer"
                            >
                              Married
                            </SelectItem>
                            <SelectItem
                              value="Divorced"
                              className="cursor-pointer"
                            >
                              Divorced
                            </SelectItem>
                            <SelectItem
                              value="Widowed"
                              className="cursor-pointer"
                            >
                              Widowed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="lastName"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="nationality"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Nationality
                        </Label>
                        <Input
                          id="nationality"
                          value={formData.nationality}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nationality: e.target.value,
                            })
                          }
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="gender"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Gender
                        </Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) =>
                            setFormData({ ...formData, gender: value })
                          }
                        >
                          <SelectTrigger className="bg-white border-gray-300 rounded-md text-gray-600 cursor-pointer">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male" className="cursor-pointer">
                              Male
                            </SelectItem>
                            <SelectItem
                              value="Female"
                              className="cursor-pointer"
                            >
                              Female
                            </SelectItem>
                            <SelectItem
                              value="Other"
                              className="cursor-pointer"
                            >
                              Other
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="personalPronouns"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Personal Pronouns
                        </Label>
                        <Select
                          value={formData.personalPronouns}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              personalPronouns: value,
                            })
                          }
                        >
                          <SelectTrigger className="bg-white border-gray-300 rounded-md text-gray-600 cursor-pointer">
                            <SelectValue placeholder="Select pronouns" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="he/him"
                              className="cursor-pointer"
                            >
                              he/him
                            </SelectItem>
                            <SelectItem
                              value="she/her"
                              className="cursor-pointer"
                            >
                              she/her
                            </SelectItem>
                            <SelectItem
                              value="they/them"
                              className="cursor-pointer"
                            >
                              they/them
                            </SelectItem>
                            <SelectItem
                              value="other"
                              className="cursor-pointer"
                            >
                              other
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium">
                      Save
                    </Button>
                  </div>
                </div>
              )}

              {/* Contact Information Tab */}
              {profileSubTab === "contact" && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Email
                        </Label>
                        <Input
                          id="email"
                          value="nana@gmail.com"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="address"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Address
                        </Label>
                        <Input
                          id="address"
                          value="New site, Adenta"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="region"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Region/State
                        </Label>
                        <Input
                          id="region"
                          value="Greater Accra"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value="(+233) 0248940734"
                          className="bg-white border-blue-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="city"
                          className="text-sm font-semibold text-gray-800"
                        >
                          City
                        </Label>
                        <Input
                          id="city"
                          value="Accra"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="postalCode"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Postal Code
                        </Label>
                        <Input
                          id="postalCode"
                          value="GP-2448"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end mt-6">
                    <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium">
                      Save
                    </Button>
                  </div>
                </div>
              )}

              {/* Emergency Contact Tab */}
              {profileSubTab === "emergency" && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">
                    Emergency Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="ec_fullName"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Full Name
                        </Label>
                        <Input
                          id="ec_fullName"
                          value="Michael Gyamfi"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="ec_altPhone"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Alt Phone Number (Optional)
                        </Label>
                        <Input
                          id="ec_altPhone"
                          placeholder="Enter optional phone number"
                          className="bg-white border-gray-300 rounded-md text-gray-600 placeholder:text-gray-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="ec_region"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Region/State
                        </Label>
                        <Input
                          id="ec_region"
                          value="Greater Accra"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="ec_address"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Address
                        </Label>
                        <Input
                          id="ec_address"
                          value="Ecomog, Hasto"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="ec_phone"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Phone Number
                        </Label>
                        <Input
                          id="ec_phone"
                          value="(+233) 0245678901"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="ec_city"
                          className="text-sm font-semibold text-gray-800"
                        >
                          City
                        </Label>
                        <Input
                          id="ec_city"
                          value="Accra"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="ec_relationship"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Relationship
                        </Label>
                        <Input
                          id="ec_relationship"
                          value="Father"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end mt-6">
                    <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium">
                      Save
                    </Button>
                  </div>
                </div>
              )}

              {/* Employment Details Tab */}
              {profileSubTab === "employment" && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">
                    Employment Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="emp_employeeId"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Employee ID
                        </Label>
                        <Input
                          id="emp_employeeId"
                          value="VIRE-12345"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="emp_department"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Department
                        </Label>
                        <Input
                          id="emp_department"
                          value="Engineering"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="emp_type"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Employment Type
                        </Label>
                        <Select defaultValue="Full Time">
                          <SelectTrigger
                            id="emp_type"
                            className="bg-white border-gray-300 rounded-md text-gray-600 cursor-pointer"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="Full Time"
                              className="cursor-pointer"
                            >
                              Full Time
                            </SelectItem>
                            <SelectItem
                              value="Part Time"
                              className="cursor-pointer"
                            >
                              Part Time
                            </SelectItem>
                            <SelectItem
                              value="Contract"
                              className="cursor-pointer"
                            >
                              Contract
                            </SelectItem>
                            <SelectItem
                              value="Internship"
                              className="cursor-pointer"
                            >
                              Internship
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="emp_location"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Location/Branch
                        </Label>
                        <Input
                          id="emp_location"
                          placeholder="(Optional)"
                          className="bg-white border-gray-300 rounded-md text-gray-600 placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="emp_jobTitle"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Job Title
                        </Label>
                        <Input
                          id="emp_jobTitle"
                          value="Engineering Lead"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="emp_dateHired"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Date Hired
                        </Label>
                        <Input
                          id="emp_dateHired"
                          value="23 - 09 - 23"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="emp_supervisor"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Supervisor
                        </Label>
                        <Input
                          id="emp_supervisor"
                          value="Nana Gyamfi Addae"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="emp_status"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Status
                        </Label>
                        <Select defaultValue="Active">
                          <SelectTrigger
                            id="emp_status"
                            className="bg-white border-gray-300 rounded-md text-gray-600 cursor-pointer"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="Active"
                              className="cursor-pointer"
                            >
                              Active
                            </SelectItem>
                            <SelectItem
                              value="Inactive"
                              className="cursor-pointer"
                            >
                              Inactive
                            </SelectItem>
                            <SelectItem
                              value="On Leave"
                              className="cursor-pointer"
                            >
                              On Leave
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end mt-6">
                    <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium cursor-pointer">
                      Save
                    </Button>
                  </div>
                </div>
              )}

              {/* Qualifications Tab */}
              {profileSubTab === "qualifications" && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">
                    Qualifications
                  </h2>

                  {/* Qualification Cards */}
                  <div className="space-y-4">
                    {/* Education Card */}
                    <Collapsible
                      open={isEducationOpen}
                      onOpenChange={setIsEducationOpen}
                    >
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {/* Education Header */}
                        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <IconSchool className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                Education
                              </h3>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {isEducationOpen ? (
                              <IconChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <IconChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                            <button
                              className="text-green-500 text-sm font-medium hover:text-green-600 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isEducationOpen) {
                                  setIsEducationOpen(true);
                                }
                                setIsEditMode(false);
                                setEditingEducationId(null);
                                setEducationForm({
                                  institution: "",
                                  description: "",
                                  duration: "",
                                });
                                setShowEducationModal(true);
                              }}
                            >
                              + Add
                            </button>
                          </div>
                        </CollapsibleTrigger>

                        {/* Expanded Education Content */}
                        <CollapsibleContent>
                          <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <div className="space-y-3">
                              {educationEntries.map((entry) => (
                                <div
                                  key={entry.id}
                                  className="bg-white border border-gray-200 rounded-lg p-4"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-bold text-gray-800 text-base mb-2">
                                        {entry.institution}
                                      </h4>
                                      <div className="flex items-center space-x-2 mb-1">
                                        <IconSchool className="w-4 h-4 text-gray-600" />
                                        <span className="text-gray-700 text-sm">
                                          {entry.description}
                                        </span>
                                      </div>
                                      <p className="text-gray-500 text-sm">
                                        {entry.duration}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                      <button
                                        className="p-1 hover:bg-blue-50 rounded transition-colors"
                                        onClick={() => {
                                          setIsEditMode(true);
                                          setEditingEducationId(entry.id);
                                          setEducationForm({
                                            institution: entry.institution,
                                            description: entry.description,
                                            duration: entry.duration,
                                          });
                                          setShowEducationModal(true);
                                        }}
                                      >
                                        <IconEdit className="w-4 h-4 text-blue-600" />
                                      </button>
                                      <button
                                        className="p-1 hover:bg-red-50 rounded transition-colors"
                                        onClick={() => {
                                          setEducationEntries((prev) =>
                                            prev.filter(
                                              (item) => item.id !== entry.id
                                            )
                                          );
                                        }}
                                      >
                                        <IconTrash className="w-4 h-4 text-red-600" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end mt-8">
                    <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium">
                      Save
                    </Button>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {profileSubTab === "documents" && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Employment Documents
                    </h2>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="23 4 23 10 17 10"></polyline>
                          <polyline points="1 20 1 14 7 14"></polyline>
                          <path d="M3.51 9a9 9 0 0114.13-3.36L23 10"></path>
                          <path d="M20.49 15A9 9 0 016.36 18.36L1 14"></path>
                        </svg>
                        Reset
                      </Button>
                      <Button className="bg-green-500 hover:bg-green-600 text-white cursor-pointer">
                        Save Changes
                      </Button>
                    </div>
                  </div>

                  {/* CV/Resume */}
                  <div className="mb-8">
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      CV/Resume
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-10 text-center">
                      <svg
                        className="w-10 h-10 mx-auto text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p className="mt-3 text-gray-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PDF,DOC,DOCX files up to 10MB
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>

                  {/* National ID */}
                  <div className="mb-8">
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      National ID
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-10 text-center">
                      <svg
                        className="w-10 h-10 mx-auto text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p className="mt-3 text-gray-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PDF,JPG,JPEG,PNG files up to 5MB
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>

                  {/* Certificate */}
                  <div className="mb-2">
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      Certificate
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-10 text-center">
                      <svg
                        className="w-10 h-10 mx-auto text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p className="mt-3 text-gray-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PDF,JPG,JPEG,PNG files up to 10MB
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Health Info Tab */}
              {/* {profileSubTab === "health" && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">
                    Health Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="bloodType"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Blood Type
                        </Label>
                        <Select defaultValue="O+">
                          <SelectTrigger className="bg-white border-gray-300 rounded-md text-gray-600 cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+" className="cursor-pointer">
                              A+
                            </SelectItem>
                            <SelectItem value="A-" className="cursor-pointer">
                              A-
                            </SelectItem>
                            <SelectItem value="B+" className="cursor-pointer">
                              B+
                            </SelectItem>
                            <SelectItem value="B-" className="cursor-pointer">
                              B-
                            </SelectItem>
                            <SelectItem value="AB+" className="cursor-pointer">
                              AB+
                            </SelectItem>
                            <SelectItem value="AB-" className="cursor-pointer">
                              AB-
                            </SelectItem>
                            <SelectItem value="O+" className="cursor-pointer">
                              O+
                            </SelectItem>
                            <SelectItem value="O-" className="cursor-pointer">
                              O-
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="allergies"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Allergies
                        </Label>
                        <Input
                          id="allergies"
                          placeholder="List any allergies"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="emergencyContact"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Emergency Contact
                        </Label>
                        <Input
                          id="emergencyContact"
                          value="Michael Gyamfi - (+233) 0245678901"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="medicalNotes"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Medical Notes
                        </Label>
                        <Input
                          id="medicalNotes"
                          placeholder="Any additional medical information"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium">
                      Save
                    </Button>
                  </div>
                </div>
              )} */}
            </>
          )}

          {/* Password Tab Content */}
          {activeTab === "password" && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Change password
              </h2>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="currentPassword"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={
                        passwordState.passwordVisibility.currentPassword
                          ? "text"
                          : "password"
                      }
                      value={passwordState.formData.currentPassword}
                      onChange={(e) =>
                        handlePasswordInputChange(
                          "currentPassword",
                          e.target.value
                        )
                      }
                      className="pr-10 bg-white border-gray-300 rounded-md text-gray-600"
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        togglePasswordVisibility("currentPassword")
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {passwordState.passwordVisibility.currentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-sm font-semibold text-gray-800"
                  >
                    New password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={
                        passwordState.passwordVisibility.newPassword
                          ? "text"
                          : "password"
                      }
                      value={passwordState.formData.newPassword}
                      onChange={(e) =>
                        handlePasswordInputChange("newPassword", e.target.value)
                      }
                      className="pr-10 bg-white border-gray-300 rounded-md text-gray-600"
                      placeholder="Enter your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("newPassword")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {passwordState.passwordVisibility.newPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {passwordState.formData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs text-gray-500">
                          Password strength:
                        </span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 w-8 rounded ${
                                level <=
                                Math.min(
                                  4,
                                  Math.max(
                                    1,
                                    Math.floor(
                                      passwordState.formData.newPassword
                                        .length / 2
                                    )
                                  )
                                )
                                  ? "bg-green-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {passwordState.formData.newPassword.length < 8
                          ? "Password must be at least 8 characters long"
                          : passwordState.formData.newPassword.length >= 12
                          ? "Strong password"
                          : "Good password"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={
                        passwordState.passwordVisibility.confirmPassword
                          ? "text"
                          : "password"
                      }
                      value={passwordState.formData.confirmPassword}
                      onChange={(e) =>
                        handlePasswordInputChange(
                          "confirmPassword",
                          e.target.value
                        )
                      }
                      className="pr-10 bg-white border-gray-300 rounded-md text-gray-600"
                      placeholder="Confirm your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        togglePasswordVisibility("confirmPassword")
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {passwordState.passwordVisibility.confirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {passwordState.formData.newPassword &&
                    passwordState.formData.confirmPassword && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          {passwordState.formData.newPassword ===
                          passwordState.formData.confirmPassword ? (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600">
                                Passwords match
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-xs text-red-600">
                                Passwords do not match
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* Error Display */}
                {passwordState.error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">
                      {passwordState.error}
                    </p>
                  </div>
                )}

                {/* Success Display */}
                {passwordState.success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-sm">
                      Password changed successfully!
                    </p>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={passwordState.isLoading}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordState.isLoading ? "Changing..." : "Change"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Notification Tab Content */}
          {activeTab === "notification" && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Notification Settings
              </h2>
              <p className="text-gray-600 mb-8">
                Manage your notification preferences for various events and
                activities within the system.
              </p>

              {/* Notification Categories */}
              <div className="space-y-4 mb-8">
                {notificationCategories.map((category) => {
                  const isExpanded =
                    notificationState.expandedCategories[category.key];
                  const settings =
                    notificationState.notificationSettings[category.key];

                  return (
                    <div
                      key={category.key}
                      className="bg-white border border-gray-200 rounded-lg"
                    >
                      {/* Category Header */}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleCategory(category.key)}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
                          >
                            {isExpanded ? (
                              <IconChevronDown className="w-4 h-4" />
                            ) : (
                              <IconChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <span className="font-medium text-gray-800">
                            {category.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {settings.enabled}/{settings.total} enabled
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => enableAll(category.key)}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded cursor-pointer"
                          >
                            Enable All
                          </Button>
                          <Button
                            onClick={() => disableAll(category.key)}
                            size="sm"
                            variant="outline"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded cursor-pointer"
                          >
                            Disable All
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-gray-100">
                          <div className="pt-4">
                            {/* Performance Management specific notifications */}
                            {category.key === "performanceManagement" && (
                              <div className="space-y-3">
                                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 mb-1">
                                      New Review Assigned
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      Receive notifications when a new
                                      performance review is assigned to you.
                                    </p>
                                  </div>
                                  <div className="ml-4">
                                    <Switch
                                      checked={
                                        notificationState.notificationSettings
                                          .performanceManagement.toggles
                                          .reviewReminders
                                      }
                                      onCheckedChange={() =>
                                        toggleIndividualSetting(
                                          "performanceManagement",
                                          "reviewReminders"
                                        )
                                      }
                                      className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Error Display */}
              {notificationState.error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">
                    Error: {notificationState.error}
                  </p>
                </div>
              )}

              {/* Save Preferences Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSavePreferences}
                  disabled={notificationState.isLoading}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {notificationState.isLoading
                    ? "Saving..."
                    : "Save Preferences"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </HRDashboardLayout>
  );
}
