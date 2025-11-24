import { useState, useEffect, useCallback } from "react";
// AdminProfileSettings - Profile settings for System Administrator
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { adminDashboardConfig } from "@/config/dashboardConfigs";
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
import { settingsApi } from "@/services/settingsApi";
import { toast } from "sonner";
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

export default function AdminProfileSettings() {
  const { user, accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
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
      description: "Computer Science",
      duration: "2018-2022",
    },
    {
      id: 2,
      institution: "MIT",
      description: "Master's in Information Technology",
      duration: "2022-2024",
    },
  ]);
  const [experienceEntries, setExperienceEntries] = useState([
    {
      id: 1,
      jobTitle: "System Administrator",
      organization: "VIRE Workplace",
      employmentType: "Full-Time",
      location: "Accra, Ghana",
      duration: "2024 - present",
      skills:
        "System Administration · Network Management · Security · Database Management · Cloud Computing",
    },
    {
      id: 2,
      jobTitle: "Senior IT Specialist",
      organization: "Tech Solutions Ltd",
      employmentType: "Full-Time",
      location: "Accra, Ghana",
      duration: "2022 - 2024",
      skills:
        "IT Infrastructure · System Security · User Management · Technical Support",
    },
  ]);
  const [licensesEntries, setLicensesEntries] = useState([
    {
      id: 1,
      organization: "Microsoft",
      certificationName: "Microsoft Certified: Azure Administrator Associate",
      issueDate: "Issued March, 2023",
    },
    {
      id: 2,
      organization: "AWS",
      certificationName: "AWS Certified Solutions Architect",
      issueDate: "Issued January, 2024",
    },
  ]);
  const [skillsEntries, setSkillsEntries] = useState([
    "System Administration",
    "Network Management",
    "Database Administration",
    "Cloud Computing",
    "Security Management",
    "IT Infrastructure",
    "User Management",
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

  // Contact information state
  const [contactData, setContactData] = useState({
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    city: user?.city || "",
    regionOrState: user?.regionOrState || "",
    postalCode: user?.postalCode || "",
  });

  // Emergency contact state
  const [emergencyData, setEmergencyData] = useState({
    fullName: user?.emergencyContact?.fullName || "",
    relationship: user?.emergencyContact?.relationship || "",
    phoneNumber: user?.emergencyContact?.phoneNumber || "",
    address: user?.emergencyContact?.address || "",
    city: user?.emergencyContact?.city || "",
    regionOrState: user?.emergencyContact?.regionOrState || "",
    altPhoneNumber: user?.emergencyContact?.altPhoneNumber || "",
  });

  // Employment details state
  const [employmentData, setEmploymentData] = useState({
    employeeId: user?.workId || "",
    jobTitle: user?.jobTitle || user?.role || "",
    department: user?.department || "",
    employmentType: user?.employmentType || "Full Time",
    location: user?.location || "",
    dateHired: user?.dateHired || "",
    supervisor: user?.supervisorName || "",
    status: user?.employmentStatus || "Active",
  });

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit mode state
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Function to enable edit mode and store original data
  const enableEditMode = useCallback(() => {
    setOriginalData({
      formData: { ...formData },
      contactData: { ...contactData },
      emergencyData: { ...emergencyData },
      employmentData: { ...employmentData },
      educationEntries: JSON.parse(JSON.stringify(educationEntries)),
      skillsEntries: [...skillsEntries],
    });
    setIsProfileEditing(true);
  }, [formData, contactData, emergencyData, employmentData, educationEntries, skillsEntries]);

  // Function to cancel edit mode and restore original data
  const cancelEditMode = useCallback(() => {
    if (originalData) {
      setFormData(originalData.formData);
      setContactData(originalData.contactData);
      setEmergencyData(originalData.emergencyData);
      setEmploymentData(originalData.employmentData);
      setEducationEntries(originalData.educationEntries);
      setSkillsEntries(originalData.skillsEntries);
    }
    setIsProfileEditing(false);
    setOriginalData(null);
  }, [originalData]);

  // Function to check if data has changed
  const hasChanges = useCallback(() => {
    if (!originalData || !isProfileEditing) return false;

    // Compare formData
    const formDataChanged = JSON.stringify(formData) !== JSON.stringify(originalData.formData);
    const contactDataChanged = JSON.stringify(contactData) !== JSON.stringify(originalData.contactData);
    const emergencyDataChanged = JSON.stringify(emergencyData) !== JSON.stringify(originalData.emergencyData);
    const employmentDataChanged = JSON.stringify(employmentData) !== JSON.stringify(originalData.employmentData);
    const educationChanged = JSON.stringify(educationEntries) !== JSON.stringify(originalData.educationEntries);
    const skillsChanged = JSON.stringify(skillsEntries) !== JSON.stringify(originalData.skillsEntries);

    return formDataChanged || contactDataChanged || emergencyDataChanged || 
           employmentDataChanged || educationChanged || skillsChanged;
  }, [formData, contactData, emergencyData, employmentData, educationEntries, skillsEntries, originalData, isProfileEditing]);

  // Profile update function
  const saveProfile = useCallback(async () => {
    if (!accessToken) {
      toast.error("Please log in to save your profile");
      return;
    }

    try {
      setIsSubmitting(true);

      // Helper function to clean values - return undefined for empty strings so they can be omitted
      const cleanValue = (value) => {
        if (value === "" || value === undefined || value === null) return undefined;
        return value;
      };

      // Format date of birth properly
      let formattedDateOfBirth = undefined;
      if (formData.dateOfBirth) {
        if (formData.dateOfBirth instanceof Date) {
          formattedDateOfBirth = formData.dateOfBirth.toISOString().split('T')[0];
        } else if (typeof formData.dateOfBirth === 'string' && formData.dateOfBirth.trim()) {
          formattedDateOfBirth = formData.dateOfBirth.split('T')[0];
        }
      }

      // Validate required fields
      if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
        toast.error("First name and last name are required");
        setIsSubmitting(false);
        return;
      }

      // Build profile data object, only including fields with values
      const profileData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      };

      // Add optional top-level fields only if they have values
      if (contactData.phoneNumber?.trim()) {
        profileData.phoneNumber = contactData.phoneNumber.trim();
      }
      if (formattedDateOfBirth) {
        profileData.dateOfBirth = formattedDateOfBirth;
      }
      if (employmentData.jobTitle?.trim()) {
        profileData.jobTitle = employmentData.jobTitle.trim();
        profileData.role = employmentData.jobTitle.trim();
      }
      if (employmentData.department?.trim()) {
        profileData.department = employmentData.department.trim();
      }

      // Build personalInfo object
      const personalInfo = {};
      if (formData.nationality?.trim()) {
        personalInfo.nationality = formData.nationality.trim();
      }
      if (formData.maritalStatus?.trim()) {
        personalInfo.maritalStatus = formData.maritalStatus.trim();
      }
      if (formData.gender?.trim()) {
        personalInfo.gender = formData.gender.trim();
      }
      if (formData.personalPronouns?.trim()) {
        personalInfo.personalPronouns = [formData.personalPronouns.trim()];
      }
      if (Object.keys(personalInfo).length > 0) {
        profileData.personalInfo = personalInfo;
      }

      // Build contactInfo object
      const contactInfo = {};
      if (contactData.email?.trim()) {
        contactInfo.email = contactData.email.trim();
      }
      if (contactData.phoneNumber?.trim()) {
        contactInfo.phoneNumber = contactData.phoneNumber.trim();
      }
      if (contactData.address?.trim()) {
        contactInfo.address = contactData.address.trim();
      }
      if (contactData.city?.trim()) {
        contactInfo.city = contactData.city.trim();
      }
      if (contactData.regionOrState?.trim()) {
        contactInfo.regionOrState = contactData.regionOrState.trim();
      }
      if (contactData.postalCode?.trim()) {
        contactInfo.postalCode = contactData.postalCode.trim();
      }
      if (Object.keys(contactInfo).length > 0) {
        profileData.contactInfo = contactInfo;
      }

      // Build emergencyContact object
      const emergencyContact = {};
      if (emergencyData.fullName?.trim()) {
        emergencyContact.fullName = emergencyData.fullName.trim();
      }
      if (emergencyData.relationship?.trim()) {
        emergencyContact.relationship = emergencyData.relationship.trim();
      }
      if (emergencyData.phoneNumber?.trim()) {
        emergencyContact.phoneNumber = emergencyData.phoneNumber.trim();
      }
      if (emergencyData.address?.trim()) {
        emergencyContact.address = emergencyData.address.trim();
      }
      if (Object.keys(emergencyContact).length > 0) {
        profileData.emergencyContact = emergencyContact;
      }

      // Build employmentDetails object
      const employmentDetails = {};
      if (employmentData.jobTitle?.trim()) {
        employmentDetails.jobTitle = employmentData.jobTitle.trim();
      }
      if (employmentData.department?.trim()) {
        employmentDetails.department = employmentData.department.trim();
      }
      if (employmentData.employmentType?.trim()) {
        // Convert "Full Time" or "Full-Time" to "Full-time" (API expects lowercase 't')
        let employmentType = employmentData.employmentType.trim();
        employmentType = employmentType.replace(/\s+/g, '-'); // Replace spaces with hyphens
        // Convert to lowercase except first letter: "Full-Time" -> "Full-time"
        employmentType = employmentType.charAt(0).toUpperCase() + employmentType.slice(1).toLowerCase();
        employmentDetails.employmentType = employmentType;
      }
      if (employmentData.supervisor?.trim()) {
        employmentDetails.supervisorName = employmentData.supervisor.trim();
      }
      if (employmentData.status?.trim()) {
        // Ensure employmentStatus is a valid status (not employmentType)
        const status = employmentData.status.trim();
        // Map common values to valid statuses
        const validStatuses = ['Active', 'Inactive', 'On Leave', 'Terminated', 'Suspended'];
        if (validStatuses.includes(status) || status === 'Full-time' || status === 'Part-time') {
          // If status is actually an employment type, use 'Active' as default
          employmentDetails.employmentStatus = status === 'Full-time' || status === 'Part-time' ? 'Active' : status;
        } else {
          employmentDetails.employmentStatus = status;
        }
      }
      if (Object.keys(employmentDetails).length > 0) {
        profileData.employmentDetails = employmentDetails;
      }

      // Build qualifications object
      const qualifications = {
        education: [],
        skills: []
      };

      if (educationEntries.length > 0) {
        qualifications.education = educationEntries
          .map((edu) => {
            const educationEntry = {};
            
            if (edu.level?.trim()) {
              educationEntry.level = edu.level.trim();
            } else {
              educationEntry.level = "Bachelor's"; // Default
            }
            
            if (edu.description?.trim() || edu.degree?.trim()) {
              educationEntry.degree = (edu.description || edu.degree).trim();
            }
            
            if (edu.institution?.trim()) {
              educationEntry.institution = edu.institution.trim();
            }
            
            if (edu.description?.trim()) {
              educationEntry.description = edu.description.trim();
            }

            // Parse duration to extract start and end dates
            // Note: API spec shows both month and year are expected, but we only have year from duration
            // Try sending with empty month string - server may accept it
            if (edu.duration?.trim()) {
              const parts = edu.duration.split('-').map(s => s.trim());
              if (parts.length === 2 && parts[0] && parts[1]) {
                // Include both month and year - use empty string for month since not available
                educationEntry.startDate = { month: "", year: parts[0] };
                educationEntry.endDate = { month: "", year: parts[1] };
              } else if (parts.length === 1 && parts[0]) {
                educationEntry.startDate = { month: "", year: parts[0] };
                educationEntry.endDate = { month: "", year: parts[0] };
              }
            }
            
            // Only return entry if it has at least level and institution
            if (!educationEntry.level || !educationEntry.institution) {
              return null;
            }

            return educationEntry;
          })
          .filter(entry => entry !== null); // Remove null entries
      }

      if (skillsEntries && skillsEntries.length > 0) {
        qualifications.skills = skillsEntries.filter(skill => skill?.trim());
      }

      // Only add qualifications if there's actual data
      if (qualifications.education.length > 0 || qualifications.skills.length > 0) {
        profileData.qualifications = qualifications;
      }

      console.log("Sending profile data:", JSON.stringify(profileData, null, 2));

      const result = await settingsApi.updateProfile(profileData, accessToken);

      if (result.success) {
        toast.success("Profile updated successfully!");
        // Exit edit mode after successful save
        setIsProfileEditing(false);
        setOriginalData(null);
      } else {
        const errorMsg = result.error || "Unknown error";
        console.error("Profile update error:", errorMsg);
        toast.error("Failed to update profile: " + errorMsg);
      }
    } catch (error) {
      console.error("Profile update exception:", error);
      toast.error("Error updating profile: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    accessToken,
    formData,
    contactData,
    emergencyData,
    employmentData,
    educationEntries,
    skillsEntries,
  ]);

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

      setContactData({
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        city: user.city || "",
        regionOrState: user.regionOrState || "",
        postalCode: user.postalCode || "",
      });

      setEmergencyData({
        fullName: user.emergencyContact?.fullName || "",
        relationship: user.emergencyContact?.relationship || "",
        phoneNumber: user.emergencyContact?.phoneNumber || "",
        address: user.emergencyContact?.address || "",
        city: user.emergencyContact?.city || "",
        regionOrState: user.emergencyContact?.regionOrState || "",
        altPhoneNumber: user.emergencyContact?.altPhoneNumber || "",
      });

      setEmploymentData({
        employeeId: user.workId || "",
        jobTitle: user.jobTitle || user?.role || "",
        department: user.department || "",
        employmentType: user.employmentType || "Full Time",
        location: user.location || "",
        dateHired: user.dateHired || "",
        supervisor: user.supervisorName || "",
        status: user.employmentStatus || "Active",
      });
    }
  }, [user]);

  // StatusBadge component (same as in employee summary modal)
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

  const tabs = [
    { id: "personal", label: "Personal Information", icon: IconUser },
    { id: "contact", label: "Contact Information", icon: IconMail },
    { id: "emergency", label: "Emergency Contact", icon: IconShield },
    { id: "employment", label: "Employment Details", icon: IconId },
    { id: "qualifications", label: "Qualifications", icon: IconCertificate },
    { id: "documents", label: "Documents", icon: IconFileText },
    // { id: "health", label: "Health Info", icon: IconShield },
  ];

  return (
    <DashboardLayout
      sidebarConfig={adminDashboardConfig}
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
            <span className="text-gray-500">Profile</span>
            </p>
          </div>

        {/* Profile Section */}
        <div className="px-6 py-6 bg-white border-b border-gray-200">
          <div className="flex items-center gap-6">
            {/* Profile Picture Upload */}
            <div className="relative">
              <ProfileImageUpload
                size="w-20 h-20"
                currentImageUrl={user?.avatar}
                userName={user ? `${user.firstName} ${user.lastName}` : ""}
                showActions={false}
                showSizeHint={false}
              />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-green-500" />
            </div>

            {/* Profile Details */}
            <div className="flex-1 text-sm text-gray-700">
              <div className="flex items-center gap-4 mb-1">
                <button
                  type="button"
                  className="text-red-500 font-medium hover:underline"
                  onClick={() => setActiveTab("documents")}
                >
                  Remove
                </button>
                <button
                  type="button"
                  className="text-green-500 font-medium hover:underline"
                  onClick={() => setActiveTab("personal")}
                >
                  Update
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Recommended size: 400x400px
              </p>
              <p className="font-semibold text-gray-800">
                Job Title: {user?.jobRole || user?.role || "System Administrator"}
              </p>
              <p>
                Work ID: {user?.workId || "ADMIN-001"} | Status:{" "}
                {user?.attendanceStatus || "Active"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-2 sm:px-6 py-4">
          <div className="bg-gray-100 rounded-lg p-1 inline-flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1 sm:gap-2 cursor-pointer ${
                  activeTab === tab.id
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

        {/* Main Content */}
        <div className="px-2 sm:px-6 py-4 sm:py-8 bg-white">
          {/* Personal Information Section */}
          {activeTab === "personal" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Personal Information
                </h2>
                {!isProfileEditing ? (
                  <Button
                    onClick={enableEditMode}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <IconEdit size={16} className="mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={cancelEditMode}
                      variant="outline"
                      className="border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveProfile}
                      disabled={!hasChanges() || isSubmitting}
                      className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                        setFormData({ ...formData, username: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                          disabled={!isProfileEditing}
                          className="w-full justify-between font-normal bg-white border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      disabled={!isProfileEditing}
                    >
                      <SelectTrigger className="bg-white border-gray-300 rounded-md text-gray-600 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed">
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single" className="cursor-pointer">
                          Single
                        </SelectItem>
                        <SelectItem value="Married" className="cursor-pointer">
                          Married
                        </SelectItem>
                        <SelectItem value="Divorced" className="cursor-pointer">
                          Divorced
                        </SelectItem>
                        <SelectItem value="Widowed" className="cursor-pointer">
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
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      disabled={!isProfileEditing}
                    >
                      <SelectTrigger className="bg-white border-gray-300 rounded-md text-gray-600 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male" className="cursor-pointer">
                          Male
                        </SelectItem>
                        <SelectItem value="Female" className="cursor-pointer">
                          Female
                        </SelectItem>
                        <SelectItem value="Other" className="cursor-pointer">
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
                        setFormData({ ...formData, personalPronouns: value })
                      }
                      disabled={!isProfileEditing}
                    >
                      <SelectTrigger className="bg-white border-gray-300 rounded-md text-gray-600 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed">
                        <SelectValue placeholder="Select pronouns" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="he/him" className="cursor-pointer">
                          he/him
                        </SelectItem>
                        <SelectItem value="she/her" className="cursor-pointer">
                          she/her
                        </SelectItem>
                        <SelectItem
                          value="they/them"
                          className="cursor-pointer"
                        >
                          they/them
                        </SelectItem>
                        <SelectItem value="other" className="cursor-pointer">
                          other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {isProfileEditing && (
                <div className="flex justify-end">
                  <Button
                    onClick={saveProfile}
                    disabled={!hasChanges() || isSubmitting}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === "contact" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Contact Information
                </h2>
                {!isProfileEditing ? (
                  <Button
                    onClick={enableEditMode}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <IconEdit size={16} className="mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={cancelEditMode}
                      variant="outline"
                      className="border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveProfile}
                      disabled={!hasChanges() || isSubmitting}
                      className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                      value={contactData.email}
                      onChange={(e) =>
                        setContactData({ ...contactData, email: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      value={contactData.address}
                      onChange={(e) =>
                        setContactData({ ...contactData, address: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      value={contactData.regionOrState}
                      onChange={(e) =>
                        setContactData({ ...contactData, regionOrState: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      value={contactData.phoneNumber}
                      onChange={(e) =>
                        setContactData({ ...contactData, phoneNumber: e.target.value })
                      }
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
                      value={contactData.city}
                      onChange={(e) =>
                        setContactData({ ...contactData, city: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      value={contactData.postalCode}
                      onChange={(e) =>
                        setContactData({ ...contactData, postalCode: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end mt-6">
                <Button
                  onClick={saveProfile}
                  disabled={isSubmitting}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          )}

          {/* Emergency Contact Tab */}
          {activeTab === "emergency" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Emergency Contact Information
                </h2>
                {!isProfileEditing ? (
                  <Button
                    onClick={enableEditMode}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <IconEdit size={16} className="mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={cancelEditMode}
                      variant="outline"
                      className="border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveProfile}
                      disabled={!hasChanges() || isSubmitting}
                      className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                      value={emergencyData.fullName}
                      onChange={(e) =>
                        setEmergencyData({ ...emergencyData, fullName: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      value={emergencyData.altPhoneNumber}
                      onChange={(e) =>
                        setEmergencyData({ ...emergencyData, altPhoneNumber: e.target.value })
                      }
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
                      value={emergencyData.regionOrState}
                      onChange={(e) =>
                        setEmergencyData({ ...emergencyData, regionOrState: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      value={emergencyData.address}
                      onChange={(e) =>
                        setEmergencyData({ ...emergencyData, address: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      value={emergencyData.phoneNumber}
                      onChange={(e) =>
                        setEmergencyData({ ...emergencyData, phoneNumber: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      value={emergencyData.city}
                      onChange={(e) =>
                        setEmergencyData({ ...emergencyData, city: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      value={emergencyData.relationship}
                      onChange={(e) =>
                        setEmergencyData({ ...emergencyData, relationship: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end mt-6">
                <Button
                  onClick={saveProfile}
                  disabled={isSubmitting}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
                      </div>
                    )}

          {/* Employment Details Tab */}
          {activeTab === "employment" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Employment Details
                </h2>
                {!isProfileEditing ? (
                  <Button
                    onClick={enableEditMode}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <IconEdit size={16} className="mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={cancelEditMode}
                      variant="outline"
                      className="border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveProfile}
                      disabled={!hasChanges() || isSubmitting}
                      className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                      value={employmentData.employeeId}
                      readOnly
                      className="bg-gray-100 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
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
                      value={employmentData.department}
                      onChange={(e) =>
                        setEmploymentData({ ...employmentData, department: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="emp_type"
                      className="text-sm font-semibold text-gray-800"
                    >
                      Employment Type
                    </Label>
                    <Select
                      value={employmentData.employmentType}
                      onValueChange={(value) =>
                        setEmploymentData({ ...employmentData, employmentType: value })
                      }
                    >
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
                        <SelectItem value="Contract" className="cursor-pointer">
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
                      value={employmentData.location}
                      onChange={(e) =>
                        setEmploymentData({ ...employmentData, location: e.target.value })
                      }
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
                      value={employmentData.jobTitle}
                      onChange={(e) =>
                        setEmploymentData({ ...employmentData, jobTitle: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      value={employmentData.dateHired}
                      onChange={(e) =>
                        setEmploymentData({ ...employmentData, dateHired: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      value={employmentData.supervisor}
                      onChange={(e) =>
                        setEmploymentData({ ...employmentData, supervisor: e.target.value })
                      }
                      disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="emp_status"
                      className="text-sm font-semibold text-gray-800"
                    >
                      Status
                    </Label>
                    <Select
                      value={employmentData.status}
                      onValueChange={(value) =>
                        setEmploymentData({ ...employmentData, status: value })
                      }
                    >
                      <SelectTrigger
                        id="emp_status"
                        className="bg-white border-gray-300 rounded-md text-gray-600 cursor-pointer"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active" className="cursor-pointer">
                          Active
                        </SelectItem>
                        <SelectItem value="Inactive" className="cursor-pointer">
                          Inactive
                        </SelectItem>
                        <SelectItem value="On Leave" className="cursor-pointer">
                          On Leave
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end mt-6">
                <Button
                  onClick={saveProfile}
                  disabled={isSubmitting}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          )}

          {/* Qualifications Tab */}
          {activeTab === "qualifications" && (
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
                            // Open modal for adding new education
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
                        {/* Education Entries */}
                        <div className="space-y-3">
                          {educationEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="bg-white border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {/* Institution Name */}
                                  <h4 className="font-bold text-gray-800 text-base mb-2">
                                    {entry.institution}
                                  </h4>

                                  {/* Description with Icon */}
                                  <div className="flex items-center space-x-2 mb-1">
                                    <IconSchool className="w-4 h-4 text-gray-600" />
                                    <span className="text-gray-700 text-sm">
                                      {entry.description}
                                    </span>
                                  </div>

                                  {/* Duration */}
                                  <p className="text-gray-500 text-sm">
                                    {entry.duration}
                                  </p>
                    </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2 ml-4">
                                  <button
                                    className="p-1 hover:bg-blue-50 rounded transition-colors"
                                    onClick={() => {
                                      // Set edit mode and populate form
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
                                      // Handle delete logic
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

                {/* Education Modal */}
                <Dialog
                  open={showEducationModal}
                  onOpenChange={setShowEducationModal}
                >
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold text-gray-800">
                        {isEditMode ? "Edit Education" : "Add Education"}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                      {/* Institution Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="institution"
                          className="text-sm font-medium text-gray-800"
                        >
                          Institution
                        </Label>
                        <Input
                          id="institution"
                          value={educationForm.institution}
                          onChange={(e) =>
                            setEducationForm({
                              ...educationForm,
                              institution: e.target.value,
                            })
                          }
                          placeholder="University of Example"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                  </div>

                      {/* Description Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="description"
                          className="text-sm font-medium text-gray-800"
                        >
                          Description
                        </Label>
                        <Input
                          id="description"
                          value={educationForm.description}
                          onChange={(e) =>
                            setEducationForm({
                              ...educationForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Degree and field of study"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      {/* Duration/Period Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="duration"
                          className="text-sm font-medium text-gray-800"
                        >
                          Duration/Period
                        </Label>
                        <Input
                          id="duration"
                          value={educationForm.duration}
                          onChange={(e) =>
                            setEducationForm({
                              ...educationForm,
                              duration: e.target.value,
                            })
                          }
                          placeholder="2020 - 2024"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setShowEducationModal(false)}
                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (isEditMode) {
                            // Update existing education entry
                            setEducationEntries((prev) =>
                              prev.map((entry) =>
                                entry.id === editingEducationId
                                  ? { ...entry, ...educationForm }
                                  : entry
                              )
                            );
                          } else {
                            // Add new education entry
                            const newEntry = {
                              id: Date.now(),
                              ...educationForm,
                            };
                            setEducationEntries((prev) => [...prev, newEntry]);
                          }
                          setShowEducationModal(false);
                          setEducationForm({
                            institution: "",
                            description: "",
                            duration: "",
                          });
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        {isEditMode ? "Save Changes" : "Add Item"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Experience Card */}
                <Collapsible
                  open={isExperienceOpen}
                  onOpenChange={setIsExperienceOpen}
                >
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Experience Header */}
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <IconBuilding className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            Experience
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {isExperienceOpen ? (
                          <IconChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <IconChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                        <button
                          className="text-green-500 text-sm font-medium hover:text-green-600 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isExperienceOpen) {
                              setIsExperienceOpen(true);
                            }
                            // Open modal for adding new experience
                            setIsExperienceEditMode(false);
                            setEditingExperienceId(null);
                            setExperienceForm({
                              jobTitle: "",
                              organization: "",
                              description: "",
                              location: "",
                              skills: "",
                              duration: "",
                            });
                            setShowExperienceModal(true);
                          }}
                        >
                          + Add
                        </button>
                      </div>
                    </CollapsibleTrigger>

                    {/* Expanded Experience Content */}
                    <CollapsibleContent>
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        {/* Experience Entries */}
                        <div className="space-y-3">
                          {experienceEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="bg-white border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  {/* Building Icon */}
                                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-1">
                                    <IconBuilding className="w-4 h-4 text-gray-600" />
                                  </div>

                                  <div className="flex-1">
                                    {/* Job Title */}
                                    <h4 className="font-bold text-gray-800 text-base mb-1">
                                      {entry.jobTitle}
                                    </h4>

                                    {/* Employment Type */}
                                    <p className="text-gray-600 text-sm mb-2">
                                      {entry.employmentType}
                                    </p>

                                    {/* Location with Map Pin Icon */}
                                    <div className="flex items-center space-x-1 mb-1">
                                      <IconMapPin className="w-3 h-3 text-red-500" />
                                      <span className="text-gray-500 text-sm">
                                        {entry.location}
                    </span>
                  </div>

                                    {/* Duration */}
                                    <p className="text-gray-500 text-sm mb-2">
                                      {entry.duration}
                                    </p>

                                    {/* Skills */}
                                    <div className="text-sm">
                                      <span className="font-semibold text-gray-800">
                                        Skills:{" "}
                                      </span>
                                      <span className="text-gray-500">
                                        {entry.skills}
                    </span>
                  </div>
                </div>
          </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2 ml-4">
                                  <button
                                    className="p-1 hover:bg-blue-50 rounded transition-colors"
                                    onClick={() => {
                                      // Set edit mode and populate form
                                      setIsExperienceEditMode(true);
                                      setEditingExperienceId(entry.id);
                                      setExperienceForm({
                                        jobTitle: entry.jobTitle,
                                        organization: entry.organization,
                                        description: entry.employmentType,
                                        location: entry.location,
                                        skills: entry.skills,
                                        duration: entry.duration,
                                      });
                                      setShowExperienceModal(true);
                                    }}
                                  >
                                    <IconEdit className="w-4 h-4 text-blue-600" />
                                  </button>
                                  <button
                                    className="p-1 hover:bg-red-50 rounded transition-colors"
                                    onClick={() => {
                                      // Handle delete logic
                                      setExperienceEntries((prev) =>
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

                {/* Experience Modal */}
                <Dialog
                  open={showExperienceModal}
                  onOpenChange={setShowExperienceModal}
                >
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold text-gray-800">
                        {isExperienceEditMode
                          ? "Edit Experience"
                          : "Add Experience"}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                      {/* Job Title Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="jobTitle"
                          className="text-sm font-medium text-gray-800"
                        >
                          Job Title
                        </Label>
                      <Input
                          id="jobTitle"
                          value={experienceForm.jobTitle}
                        onChange={(e) =>
                            setExperienceForm({
                              ...experienceForm,
                              jobTitle: e.target.value,
                            })
                        }
                          placeholder="Software Engineer"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                      />
                    </div>

                      {/* Organization/Company Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="organization"
                          className="text-sm font-medium text-gray-800"
                        >
                          Organization/Company
                        </Label>
                      <Input
                          id="organization"
                          value={experienceForm.organization}
                        onChange={(e) =>
                            setExperienceForm({
                              ...experienceForm,
                              organization: e.target.value,
                            })
                        }
                          placeholder="Organization name"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                      />
                    </div>

                      {/* Description Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="description"
                          className="text-sm font-medium text-gray-800"
                        >
                          Description
                        </Label>
                        <Input
                          id="description"
                          value={experienceForm.description}
                          onChange={(e) =>
                            setExperienceForm({
                              ...experienceForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Job type and responsibilities"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                  </div>

                      {/* Location Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="location"
                          className="text-sm font-medium text-gray-800"
                        >
                          Location
                        </Label>
                    <Input
                          id="location"
                          value={experienceForm.location}
                      onChange={(e) =>
                            setExperienceForm({
                              ...experienceForm,
                              location: e.target.value,
                            })
                      }
                          placeholder="City, Country"
                          disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                      {/* Skills Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="skills"
                          className="text-sm font-medium text-gray-800"
                        >
                          Skills (comma-separated)
                        </Label>
                    <Input
                          id="skills"
                          value={experienceForm.skills}
                      onChange={(e) =>
                            setExperienceForm({
                              ...experienceForm,
                              skills: e.target.value,
                            })
                          }
                          placeholder="React, JavaScript, Node.js, etc."
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      {/* Duration/Period Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="duration"
                          className="text-sm font-medium text-gray-800"
                        >
                          Duration/Period
                        </Label>
                        <Input
                          id="duration"
                          value={experienceForm.duration}
                          onChange={(e) =>
                            setExperienceForm({
                              ...experienceForm,
                              duration: e.target.value,
                            })
                          }
                          placeholder="2020 - 2024"
                          disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setShowExperienceModal(false)}
                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (isExperienceEditMode) {
                            // Update existing experience entry
                            setExperienceEntries((prev) =>
                              prev.map((entry) =>
                                entry.id === editingExperienceId
                                  ? {
                                      ...entry,
                                      jobTitle: experienceForm.jobTitle,
                                      organization: experienceForm.organization,
                                      employmentType:
                                        experienceForm.description,
                                      location: experienceForm.location,
                                      skills: experienceForm.skills,
                                      duration: experienceForm.duration,
                                    }
                                  : entry
                              )
                            );
                          } else {
                            // Add new experience entry
                            const newEntry = {
                              id: Date.now(),
                              jobTitle: experienceForm.jobTitle,
                              organization: experienceForm.organization,
                              employmentType: experienceForm.description,
                              location: experienceForm.location,
                              skills: experienceForm.skills,
                              duration: experienceForm.duration,
                            };
                            setExperienceEntries((prev) => [...prev, newEntry]);
                          }
                          setShowExperienceModal(false);
                          setExperienceForm({
                            jobTitle: "",
                            organization: "",
                            description: "",
                            location: "",
                            skills: "",
                            duration: "",
                          });
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        {isExperienceEditMode ? "Save Changes" : "Add Item"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Licenses & Certifications Card */}
                <Collapsible
                  open={isLicensesOpen}
                  onOpenChange={setIsLicensesOpen}
                >
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Licenses Header */}
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <IconAward className="w-5 h-5 text-gray-600" />
                        </div>
                    <div>
                          <h3 className="font-semibold text-gray-800">
                            Licenses & Certifications
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {isLicensesOpen ? (
                          <IconChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <IconChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                        <button
                          className="text-green-500 text-sm font-medium hover:text-green-600 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isLicensesOpen) {
                              setIsLicensesOpen(true);
                            }
                            // Open modal for adding new license
                            setIsLicensesEditMode(false);
                            setEditingLicensesId(null);
                            setLicensesForm({
                              certificationName: "",
                              organization: "",
                              description: "",
                              issueDate: "",
                            });
                            setShowLicensesModal(true);
                          }}
                        >
                          + Add
                        </button>
                      </div>
                    </CollapsibleTrigger>

                    {/* Expanded Licenses Content */}
                    <CollapsibleContent>
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        {/* License Entries */}
                        <div className="space-y-3">
                          {licensesEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="bg-white border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  {/* Award Icon */}
                                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-1">
                                    <IconAward className="w-4 h-4 text-gray-600" />
                                  </div>

                                  <div className="flex-1">
                                    {/* Organization */}
                                    <h4 className="font-bold text-gray-800 text-base mb-1">
                                      {entry.organization}
                                    </h4>

                                    {/* Certification Name */}
                                    <p className="text-gray-700 text-sm mb-2">
                                      {entry.certificationName}
                                    </p>

                                    {/* Issue Date */}
                                    <p className="text-gray-500 text-sm mb-3">
                                      {entry.issueDate}
                                    </p>

                                    {/* View Certification Button */}
                                    <button className="text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-sm font-medium transition-colors">
                                      View certification
                                    </button>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2 ml-4">
                                  <button
                                    className="p-1 hover:bg-blue-50 rounded transition-colors"
                                    onClick={() => {
                                      // Set edit mode and populate form
                                      setIsLicensesEditMode(true);
                                      setEditingLicensesId(entry.id);
                                      setLicensesForm({
                                        certificationName:
                                          entry.certificationName,
                                        organization: entry.organization,
                                        description: "",
                                        issueDate: entry.issueDate,
                                      });
                                      setShowLicensesModal(true);
                                    }}
                                  >
                                    <IconEdit className="w-4 h-4 text-blue-600" />
                                  </button>
                                  <button
                                    className="p-1 hover:bg-red-50 rounded transition-colors"
                                    onClick={() => {
                                      // Handle delete logic
                                      setLicensesEntries((prev) =>
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

                {/* Licenses Modal */}
                <Dialog
                  open={showLicensesModal}
                  onOpenChange={setShowLicensesModal}
                >
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold text-gray-800">
                        {isLicensesEditMode
                          ? "Edit License/Certification"
                          : "Add License/Certification"}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                      {/* Certification Name Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="certificationName"
                          className="text-sm font-medium text-gray-800"
                        >
                          Certification Name
                        </Label>
                      <Input
                          id="certificationName"
                          value={licensesForm.certificationName}
                        onChange={(e) =>
                            setLicensesForm({
                              ...licensesForm,
                              certificationName: e.target.value,
                            })
                        }
                          placeholder="AWS Certified Developer"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                      />
                    </div>

                      {/* Organization/Company Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="organization"
                          className="text-sm font-medium text-gray-800"
                        >
                          Organization/Company
                        </Label>
                      <Input
                          id="organization"
                          value={licensesForm.organization}
                        onChange={(e) =>
                            setLicensesForm({
                              ...licensesForm,
                              organization: e.target.value,
                            })
                        }
                          placeholder="Organization name"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                      />
                    </div>

                      {/* Description Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="description"
                          className="text-sm font-medium text-gray-800"
                        >
                          Description
                        </Label>
                        <Input
                          id="description"
                          value={licensesForm.description}
                          onChange={(e) =>
                            setLicensesForm({
                              ...licensesForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Certification details"
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                  </div>

                      {/* Issue Date Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="issueDate"
                          className="text-sm font-medium text-gray-800"
                        >
                          Issue Date
                        </Label>
                    <Input
                          id="issueDate"
                          value={licensesForm.issueDate}
                      onChange={(e) =>
                            setLicensesForm({
                              ...licensesForm,
                              issueDate: e.target.value,
                            })
                      }
                          placeholder="Issued January 2024"
                          disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setShowLicensesModal(false)}
                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (isLicensesEditMode) {
                            // Update existing license entry
                            setLicensesEntries((prev) =>
                              prev.map((entry) =>
                                entry.id === editingLicensesId
                                  ? {
                                      ...entry,
                                      certificationName:
                                        licensesForm.certificationName,
                                      organization: licensesForm.organization,
                                      issueDate: licensesForm.issueDate,
                                    }
                                  : entry
                              )
                            );
                          } else {
                            // Add new license entry
                            const newEntry = {
                              id: Date.now(),
                              certificationName: licensesForm.certificationName,
                              organization: licensesForm.organization,
                              issueDate: licensesForm.issueDate,
                            };
                            setLicensesEntries((prev) => [...prev, newEntry]);
                          }
                          setShowLicensesModal(false);
                          setLicensesForm({
                            certificationName: "",
                            organization: "",
                            description: "",
                            issueDate: "",
                          });
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        {isLicensesEditMode ? "Save Changes" : "Add Item"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Skills Card */}
                <Collapsible open={isSkillsOpen} onOpenChange={setIsSkillsOpen}>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Skills Header */}
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <IconBrain className="w-5 h-5 text-gray-600" />
                        </div>
                  <div>
                          <h3 className="font-semibold text-gray-800">
                            Skills
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {isSkillsOpen ? (
                          <IconChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <IconChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                        <button
                          className="text-green-500 text-sm font-medium hover:text-green-600 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isSkillsOpen) {
                              setIsSkillsOpen(true);
                            }
                            // Open modal for adding new skill
                            setSkillsForm({
                              skillName: "",
                            });
                            setShowSkillsModal(true);
                          }}
                        >
                          + Add
                        </button>
                      </div>
                    </CollapsibleTrigger>

                    {/* Expanded Skills Content */}
                    <CollapsibleContent>
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        {/* Skills Tags */}
                        <div className="flex flex-wrap gap-2">
                          {skillsEntries.map((skill, index) => (
                            <div key={index} className="relative group">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                                {skill}
                              </span>
                              <button
                                onClick={() => {
                                  setSkillsEntries((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  );
                                }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Skills Modal */}
                <Dialog
                  open={showSkillsModal}
                  onOpenChange={setShowSkillsModal}
                >
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold text-gray-800">
                        Add Skill
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                      {/* Skill Name Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="skillName"
                          className="text-sm font-medium text-gray-800"
                        >
                          Skill Name
                        </Label>
                        <Input
                          id="skillName"
                          value={skillsForm.skillName}
                          onChange={(e) =>
                            setSkillsForm({
                              ...skillsForm,
                              skillName: e.target.value,
                            })
                          }
                          placeholder="Enter skill name"
                          disabled={!isProfileEditing}
                      className="bg-white border-gray-300 rounded-md text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setShowSkillsModal(false)}
                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (skillsForm.skillName.trim()) {
                            setSkillsEntries((prev) => [
                              ...prev,
                              skillsForm.skillName.trim(),
                            ]);
                            setSkillsForm({ skillName: "" });
                            setShowSkillsModal(false);
                          }
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Add Skill
                      </Button>
                      </div>
                  </DialogContent>
                </Dialog>
                    </div>

              {/* Save Button */}
              <div className="flex justify-end mt-8">
                <Button
                  onClick={saveProfile}
                  disabled={isSubmitting}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
                      </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
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
      </div>
      </div>
    </DashboardLayout>
  );
}
