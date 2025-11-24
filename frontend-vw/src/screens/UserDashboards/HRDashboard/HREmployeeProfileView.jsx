import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { hrDashboardConfig } from "@/config/dashboardConfigs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { employeesApi } from "@/services/employeesApi";
import { toast } from "sonner";
import {
  IconUser,
  IconMail,
  IconId,
  IconCertificate,
  IconFileText,
  IconShield,
  IconArrowLeft,
} from "@tabler/icons-react";

export default function HREmployeeProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employee, setEmployee] = useState(null);

  const tabs = [
    { id: "personal", label: "Personal Information", icon: IconUser },
    { id: "contact", label: "Contact Information", icon: IconMail },
    { id: "emergency", label: "Emergency Contact", icon: IconShield },
    { id: "employment", label: "Employment Details", icon: IconId },
    { id: "qualifications", label: "Qualifications", icon: IconCertificate },
    { id: "documents", label: "Documents", icon: IconFileText },
  ];

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!accessToken || !id) {
        setError("Missing access token or employee ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await employeesApi.getEmployeeById(accessToken, id);

        if (result.success) {
          const employeeData = result.data?.data || result.data;
          setEmployee(employeeData);
        } else {
          setError(result.error || "Failed to fetch employee data");
          toast.error(result.error || "Failed to load employee profile");
        }
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError(err.message || "Failed to fetch employee data");
        toast.error("Failed to load employee profile");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [accessToken, id]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout
        sidebarConfig={hrDashboardConfig}
        showSectionCards={false}
        showChart={false}
        showDataTable={false}
      >
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading employee profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !employee) {
    return (
      <DashboardLayout
        sidebarConfig={hrDashboardConfig}
        showSectionCards={false}
        showChart={false}
        showDataTable={false}
      >
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Employee Profile
            </h3>
            <p className="text-gray-500 mb-4">{error || "Employee not found"}</p>
            <Button
              onClick={() => navigate("/human-resource-manager/employees")}
              className="bg-green-500 hover:bg-green-600"
            >
              <IconArrowLeft className="w-4 h-4 mr-2" />
              Back to Employees
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Extract profile data with fallbacks
  const profile = employee.profile || {};
  const personalInfo = profile.personalInfo || {};
  const contactInfo = profile.contactInfo || {};
  const emergencyContact = profile.emergencyContact || {};
  const employmentDetails = profile.employmentDetails || {};
  const qualifications = profile.qualifications || {};

  return (
    <DashboardLayout
      sidebarConfig={hrDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb Navigation */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/human-resource-manager/employees")}
              className="text-gray-600 hover:text-gray-900"
            >
              <IconArrowLeft className="w-4 h-4 mr-2" />
              Back to Employees
            </Button>
            <p className="text-lg">
              <span className="font-bold text-black">Employee Management</span>
              <span className="text-gray-500"> / </span>
              <span className="text-gray-500">
                {employee.firstName} {employee.lastName}
              </span>
            </p>
          </div>
        </div>

        {/* Profile Section */}
        <div className="px-6 py-6 bg-white border-b border-gray-200">
          <div className="flex items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="w-20 h-20 rounded-full overflow-hidden">
                <AvatarImage
                  src={employee.avatar}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <AvatarFallback className="bg-gray-300 text-gray-600 rounded-full text-lg">
                  {employee.firstName?.[0] || ""}
                  {employee.lastName?.[0] || ""}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-green-500" />
            </div>

            {/* Profile Details */}
            <div className="flex-1 text-sm text-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="font-semibold text-gray-800 mb-1">
                Job Title: {employee.jobRole || employmentDetails.jobTitle || "N/A"}
              </p>
              <p>
                Work ID: {employee.workId || "N/A"} | Status:{" "}
                <Badge
                  variant={
                    employee.attendanceStatus === "Active"
                      ? "default"
                      : "secondary"
                  }
                  className={
                    employee.attendanceStatus === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }
                >
                  {employee.attendanceStatus || "Unknown"}
                </Badge>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-4">
          <div className="bg-gray-100 rounded-lg p-1 inline-flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer ${
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
        <div className="px-6 py-8 bg-white">
          {/* Personal Information Section */}
          {activeTab === "personal" && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      First Name
                    </Label>
                    <Input
                      value={employee.firstName || ""}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Username
                    </Label>
                    <Input
                      value={
                        employee.email
                          ? `@${employee.email.split("@")[0]}`
                          : ""
                      }
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Date of Birth
                    </Label>
                    <Input
                      value={
                        employee.dateOfBirth ||
                        personalInfo.dateOfBirth ||
                        "Not provided"
                      }
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Marital Status
                    </Label>
                    <Input
                      value={personalInfo.maritalStatus || "Not provided"}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Last Name
                    </Label>
                    <Input
                      value={employee.lastName || ""}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Nationality
                    </Label>
                    <Input
                      value={personalInfo.nationality || "Not provided"}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Gender
                    </Label>
                    <Input
                      value={personalInfo.gender || employee.gender || "Not provided"}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Personal Pronouns
                    </Label>
                    <Input
                      value={
                        Array.isArray(personalInfo.personalPronouns)
                          ? personalInfo.personalPronouns.join(", ")
                          : personalInfo.personalPronouns || "Not provided"
                      }
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === "contact" && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Email
                    </Label>
                    <Input
                      value={employee.email || contactInfo.email || "Not provided"}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Phone Number
                    </Label>
                    <Input
                      value={contactInfo.phoneNumber || "Not provided"}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Address
                    </Label>
                    <Input
                      value={contactInfo.address || "Not provided"}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      City
                    </Label>
                    <Input
                      value={contactInfo.city || "Not provided"}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Region/State
                    </Label>
                    <Input
                      value={contactInfo.regionOrState || "Not provided"}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Postal Code
                    </Label>
                    <Input
                      value={contactInfo.postalCode || "Not provided"}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact Tab */}
          {activeTab === "emergency" && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Emergency Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Full Name
                    </Label>
                    <Input
                      value={emergencyContact.fullName || "Not provided"}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Relationship
                    </Label>
                    <Input
                      value={emergencyContact.relationship || "Not provided"}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Phone Number
                    </Label>
                    <Input
                      value={emergencyContact.phoneNumber || "Not provided"}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Address
                    </Label>
                    <Input
                      value={emergencyContact.address || "Not provided"}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employment Details Tab */}
          {activeTab === "employment" && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Employment Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Job Title
                    </Label>
                    <Input
                      value={
                        employmentDetails.jobTitle ||
                        employee.jobRole ||
                        "Not provided"
                      }
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Department
                    </Label>
                    <Input
                      value={
                        employmentDetails.department ||
                        employee.department ||
                        "Not provided"
                      }
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Employment Type
                    </Label>
                    <Input
                      value={employmentDetails.employmentType || "Not provided"}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Supervisor Name
                    </Label>
                    <Input
                      value={employmentDetails.supervisorName || "Not provided"}
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">
                      Employment Status
                    </Label>
                    <Input
                      value={
                        employmentDetails.employmentStatus ||
                        employee.attendanceStatus ||
                        "Not provided"
                      }
                      readOnly
                      className="bg-gray-50 border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Qualifications Tab */}
          {activeTab === "qualifications" && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Qualifications
              </h2>

              {/* Education */}
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-700 mb-4">
                  Education
                </h3>
                {qualifications.education &&
                Array.isArray(qualifications.education) &&
                qualifications.education.length > 0 ? (
                  <div className="space-y-4">
                    {qualifications.education.map((edu, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-gray-500">
                              Institution
                            </Label>
                            <p className="font-medium text-gray-900">
                              {edu.institution || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">
                              Degree/Level
                            </Label>
                            <p className="font-medium text-gray-900">
                              {edu.degree || edu.level || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">
                              Duration
                            </Label>
                            <p className="font-medium text-gray-900">
                              {edu.startDate?.month && edu.startDate?.year
                                ? `${edu.startDate.month}/${edu.startDate.year}`
                                : ""}
                              {edu.endDate?.month && edu.endDate?.year
                                ? ` - ${edu.endDate.month}/${edu.endDate.year}`
                                : ""}
                              {!edu.startDate && !edu.endDate && "Not provided"}
                            </p>
                          </div>
                          {edu.description && (
                            <div>
                              <Label className="text-xs text-gray-500">
                                Description
                              </Label>
                              <p className="font-medium text-gray-900">
                                {edu.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No education records</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-md font-semibold text-gray-700 mb-4">
                  Skills
                </h3>
                {qualifications.skills &&
                Array.isArray(qualifications.skills) &&
                qualifications.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {qualifications.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 px-3 py-1"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No skills listed</p>
                )}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Documents
              </h2>
              <div className="text-center py-12">
                <IconFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Document management will be available soon
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

