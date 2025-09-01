import { useState, useEffect } from "react"
// HRSettingsPage - Profile settings for HR Manager
import { HRDashboardLayout } from "@/components/dashboard/DashboardLayout"
import { hrDashboardConfig } from "@/config/dashboardConfigs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/hooks/useAuth"
import { 
  IconPlus,
  IconUser, 
  IconMail,
  IconId,
  IconCertificate,
  IconFileText,
  IconShield
} from "@tabler/icons-react"

export default function HRSettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("personal")
  const [selectedDate, setSelectedDate] = useState(null)
  const [dateOpen, setDateOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    username: user?.email?.split('@')[0] ? `@${user.email.split('@')[0]}` : "",
    dateOfBirth: user?.dateOfBirth || "",
    maritalStatus: user?.maritalStatus || "",
    lastName: user?.lastName || "",
    nationality: user?.nationality || "Ghanaian",
    gender: user?.gender || "",
    personalPronouns: user?.personalPronouns || ""
  })

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      // Parse date of birth if it exists
      let parsedDate = null
      if (user.dateOfBirth) {
        // Handle both ISO string format and simple date format
        if (user.dateOfBirth.includes('T')) {
          // ISO format: "2002-03-27T00:00:00.000Z"
          parsedDate = new Date(user.dateOfBirth)
        } else {
          // Simple format: "2002-03-27"
          parsedDate = new Date(user.dateOfBirth)
        }
      }

      setSelectedDate(parsedDate)
      setFormData({
        firstName: user.firstName || "",
        username: user.email?.split('@')[0] ? `@${user.email.split('@')[0]}` : "",
        dateOfBirth: user.dateOfBirth || "",
        maritalStatus: user.maritalStatus || "",
        lastName: user.lastName || "",
        nationality: user.nationality || "Ghanaian",
        gender: user.gender || "",
        personalPronouns: user.personalPronouns || ""
      })
    }
  }, [user])

  // StatusBadge component (same as in employee summary modal)
  const StatusBadge = ({ status }) => {
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
  }

  const tabs = [
    { id: "personal", label: "Personal Information", icon: IconUser },
    { id: "contact", label: "Contact Information", icon: IconMail },
    { id: "emergency", label: "Emergency Contact", icon: IconShield },
    { id: "employment", label: "Employment Details", icon: IconId },
    { id: "qualifications", label: "Qualifications", icon: IconCertificate },
    { id: "documents", label: "Documents", icon: IconFileText },
    { id: "health", label: "Health Info", icon: IconShield }
  ]

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
            <span className="text-gray-500">Profile</span>
          </p>
        </div>

        {/* Profile Section */}
        <div className="px-6 py-6 bg-white border-b border-gray-200">
          <div className="flex items-start space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-lg bg-gray-200 text-gray-600">
                  {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U'}
                </AvatarFallback>
              </Avatar>
              {/* Green plus icon overlay */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <IconPlus className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <button className="text-red-500 text-sm hover:underline cursor-pointer">Remove</button>
                <button className="text-green-500 text-sm hover:underline cursor-pointer">Update</button>
              </div>
              <p className="text-sm text-gray-400 mb-2">Recommended size: 400X400px</p>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
              </h3>
              <p className="text-gray-600 mb-3">{user?.jobRole || user?.role || 'Loading...'}</p>
              <div className="flex items-center space-x-6">
                <StatusBadge status={user?.attendanceStatus || "Active"} />
                <div className="flex items-center space-x-1">
                  <span className="text-gray-700 text-sm">Work ID: {user?.workId || 'N/A'}</span>
                </div>
              </div>
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
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-gray-800">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="bg-white border-gray-300 rounded-md text-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold text-gray-800">Username</Label>
                  <Input 
                    id="username" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="bg-white border-gray-300 rounded-md text-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-800">Date of Birth</Label>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="dateOfBirth"
                        className="w-full justify-between font-normal bg-white border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
                      >
                        {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus" className="text-sm font-semibold text-gray-800">Marital Status</Label>
                  <Select value={formData.maritalStatus} onValueChange={(value) => setFormData({...formData, maritalStatus: value})}>
                                    <SelectTrigger className="bg-white border-gray-300 rounded-md text-gray-600 cursor-pointer">
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single" className="cursor-pointer">Single</SelectItem>
                  <SelectItem value="Married" className="cursor-pointer">Married</SelectItem>
                  <SelectItem value="Divorced" className="cursor-pointer">Divorced</SelectItem>
                  <SelectItem value="Widowed" className="cursor-pointer">Widowed</SelectItem>
                </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-gray-800">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="bg-white border-gray-300 rounded-md text-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nationality" className="text-sm font-semibold text-gray-800">Nationality</Label>
                  <Input 
                    id="nationality" 
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    className="bg-white border-gray-300 rounded-md text-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-semibold text-gray-800">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                                    <SelectTrigger className="bg-white border-gray-300 rounded-md text-gray-600 cursor-pointer">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male" className="cursor-pointer">Male</SelectItem>
                  <SelectItem value="Female" className="cursor-pointer">Female</SelectItem>
                  <SelectItem value="Other" className="cursor-pointer">Other</SelectItem>
                </SelectContent>
                  </Select>
              </div>
              
                <div className="space-y-2">
                  <Label htmlFor="personalPronouns" className="text-sm font-semibold text-gray-800">Personal Pronouns</Label>
                  <Select value={formData.personalPronouns} onValueChange={(value) => setFormData({...formData, personalPronouns: value})}>
                    <SelectTrigger className="bg-white border-gray-300 rounded-md text-gray-600 cursor-pointer">
                      <SelectValue placeholder="Select pronouns" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="he/him" className="cursor-pointer">he/him</SelectItem>
                      <SelectItem value="she/her" className="cursor-pointer">she/her</SelectItem>
                      <SelectItem value="they/them" className="cursor-pointer">they/them</SelectItem>
                      <SelectItem value="other" className="cursor-pointer">other</SelectItem>
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
        {activeTab === "contact" && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-800">Email</Label>
                  <Input 
                    id="email" 
                    value="nana@gmail.com"
                    className="bg-white border-gray-300 rounded-md text-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-gray-800">Address</Label>
                  <Input 
                    id="address" 
                    value="New site, Adenta"
                    className="bg-white border-gray-300 rounded-md text-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="region" className="text-sm font-semibold text-gray-800">Region/State</Label>
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
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-800">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value="(+233) 0248940734"
                    className="bg-white border-blue-300 rounded-md text-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-semibold text-gray-800">City</Label>
                  <Input 
                    id="city" 
                    value="Accra"
                    className="bg-white border-gray-300 rounded-md text-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-sm font-semibold text-gray-800">Postal Code</Label>
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
        {activeTab === "emergency" && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Emergency Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ec_fullName" className="text-sm font-semibold text-gray-800">Full Name</Label>
                  <Input
                    id="ec_fullName"
                    value="Michael Gyamfi"
                    className="bg-white border-gray-300 rounded-md text-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ec_altPhone" className="text-sm font-semibold text-gray-800">Alt Phone Number (Optional)</Label>
                  <Input
                    id="ec_altPhone"
                    placeholder="Enter optional phone number"
                    className="bg-white border-gray-300 rounded-md text-gray-600 placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ec_region" className="text-sm font-semibold text-gray-800">Region/State</Label>
                  <Input
                    id="ec_region"
                    value="Greater Accra"
                    className="bg-white border-gray-300 rounded-md text-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ec_address" className="text-sm font-semibold text-gray-800">Address</Label>
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
                  <Label htmlFor="ec_phone" className="text-sm font-semibold text-gray-800">Phone Number</Label>
                  <Input
                    id="ec_phone"
                    value="(+233) 0245678901"
                    className="bg-white border-gray-300 rounded-md text-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ec_city" className="text-sm font-semibold text-gray-800">City</Label>
                  <Input
                    id="ec_city"
                    value="Accra"
                    className="bg-white border-gray-300 rounded-md text-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ec_relationship" className="text-sm font-semibold text-gray-800">Relationship</Label>
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
              <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium">Save</Button>
            </div>
          </div>
        )}

        {/* Employment Details Tab */}
        {activeTab === "employment" && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Employment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="emp_employeeId" className="text-sm font-semibold text-gray-800">Employee ID</Label>
                  <Input id="emp_employeeId" value="VIRE-12345" className="bg-white border-gray-300 rounded-md text-gray-600" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emp_department" className="text-sm font-semibold text-gray-800">Department</Label>
                  <Input id="emp_department" value="Engineering" className="bg-white border-gray-300 rounded-md text-gray-600" />
              </div>
              
                <div className="space-y-2">
                  <Label htmlFor="emp_type" className="text-sm font-semibold text-gray-800">Employment Type</Label>
                  <Select defaultValue="Full Time">
                    <SelectTrigger id="emp_type" className="bg-white border-gray-300 rounded-md text-gray-600 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Time" className="cursor-pointer">Full Time</SelectItem>
                      <SelectItem value="Part Time" className="cursor-pointer">Part Time</SelectItem>
                      <SelectItem value="Contract" className="cursor-pointer">Contract</SelectItem>
                      <SelectItem value="Internship" className="cursor-pointer">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emp_location" className="text-sm font-semibold text-gray-800">Location/Branch</Label>
                  <Input id="emp_location" placeholder="(Optional)" className="bg-white border-gray-300 rounded-md text-gray-600 placeholder:text-gray-400" />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="emp_jobTitle" className="text-sm font-semibold text-gray-800">Job Title</Label>
                  <Input id="emp_jobTitle" value="Engineering Lead" className="bg-white border-gray-300 rounded-md text-gray-600" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emp_dateHired" className="text-sm font-semibold text-gray-800">Date Hired</Label>
                  <Input id="emp_dateHired" value="23 - 09 - 23" className="bg-white border-gray-300 rounded-md text-gray-600" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emp_supervisor" className="text-sm font-semibold text-gray-800">Supervisor</Label>
                  <Input id="emp_supervisor" value="Nana Gyamfi Addae" className="bg-white border-gray-300 rounded-md text-gray-600" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emp_status" className="text-sm font-semibold text-gray-800">Status</Label>
                  <Select defaultValue="Active">
                    <SelectTrigger id="emp_status" className="bg-white border-gray-300 rounded-md text-gray-600 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active" className="cursor-pointer">Active</SelectItem>
                      <SelectItem value="Inactive" className="cursor-pointer">Inactive</SelectItem>
                      <SelectItem value="On Leave" className="cursor-pointer">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium cursor-pointer">Save</Button>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Employment Documents</h2>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0114.13-3.36L23 10"></path><path d="M20.49 15A9 9 0 016.36 18.36L1 14"></path></svg>
                  Reset
                </Button>
                <Button className="bg-green-500 hover:bg-green-600 text-white cursor-pointer">Save Changes</Button>
              </div>
            </div>

            {/* CV/Resume */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-800 mb-2">CV/Resume</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-10 text-center">
                <svg className="w-10 h-10 mx-auto text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p className="mt-3 text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PDF,DOC,DOCX files up to 10MB</p>
                <Button variant="outline" className="mt-4 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">Choose File</Button>
              </div>
            </div>

            {/* National ID */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-800 mb-2">National ID</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-10 text-center">
                <svg className="w-10 h-10 mx-auto text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p className="mt-3 text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PDF,JPG,JPEG,PNG files up to 5MB</p>
                <Button variant="outline" className="mt-4 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">Choose File</Button>
              </div>
            </div>

            {/* Certificate */}
            <div className="mb-2">
              <p className="text-sm font-semibold text-gray-800 mb-2">Certificate</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-10 text-center">
                <svg className="w-10 h-10 mx-auto text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p className="mt-3 text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PDF,JPG,JPEG,PNG files up to 10MB</p>
                <Button variant="outline" className="mt-4 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">Choose File</Button>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </HRDashboardLayout>
  )
}
