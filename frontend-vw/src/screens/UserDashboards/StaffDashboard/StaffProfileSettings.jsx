import { useState, useEffect } from "react"
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout"
import { staffDashboardConfig } from "@/config/dashboardConfigs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
  IconMapPin
} from "@tabler/icons-react"

export default function StaffProfileSettings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("personal")
  const [selectedDate, setSelectedDate] = useState(null)
  const [dateOpen, setDateOpen] = useState(false)
  const [isEducationOpen, setIsEducationOpen] = useState(false)
  const [showEducationModal, setShowEducationModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingEducationId, setEditingEducationId] = useState(null)
  const [isExperienceOpen, setIsExperienceOpen] = useState(false)
  const [showExperienceModal, setShowExperienceModal] = useState(false)
  const [isExperienceEditMode, setIsExperienceEditMode] = useState(false)
  const [editingExperienceId, setEditingExperienceId] = useState(null)
  const [isLicensesOpen, setIsLicensesOpen] = useState(false)
  const [showLicensesModal, setShowLicensesModal] = useState(false)
  const [isLicensesEditMode, setIsLicensesEditMode] = useState(false)
  const [editingLicensesId, setEditingLicensesId] = useState(null)
  const [isSkillsOpen, setIsSkillsOpen] = useState(false)
  const [showSkillsModal, setShowSkillsModal] = useState(false)
  const [educationForm, setEducationForm] = useState({
    institution: "",
    description: "",
    duration: ""
  })
  const [experienceForm, setExperienceForm] = useState({
    jobTitle: "",
    organization: "",
    description: "",
    location: "",
    skills: "",
    duration: ""
  })
  const [licensesForm, setLicensesForm] = useState({
    certificationName: "",
    organization: "",
    description: "",
    issueDate: ""
  })
  const [skillsForm, setSkillsForm] = useState({
    skillName: ""
  })
  const [educationEntries, setEducationEntries] = useState([
    {
      id: 1,
      institution: "University of Ghana, Legon",
      description: "Mathematics",
      duration: "2018-2022"
    },
    {
      id: 2,
      institution: "University of Hong-Kong",
      description: "Associate Diploma (Software Engineering)",
      duration: "2020-2021"
    }
  ])
  const [experienceEntries, setExperienceEntries] = useState([
    {
      id: 1,
      jobTitle: "Software Developer",
      organization: "VIRE Workplace",
      employmentType: "Full-Time",
      location: "Accra, Ghana",
      duration: "2023 - present",
      description: "Developing and maintaining web applications using React and Node.js"
    }
  ])
  const [licensesEntries, setLicensesEntries] = useState([
    {
      id: 1,
      certificationName: "AWS Certified Developer",
      organization: "Amazon Web Services",
      description: "Cloud development and deployment",
      issueDate: "2023-06-15"
    }
  ])
  const [skillsEntries, setSkillsEntries] = useState([
    { id: 1, skillName: "JavaScript" },
    { id: 2, skillName: "React" },
    { id: 3, skillName: "Node.js" },
    { id: 4, skillName: "Python" }
  ])

  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    dateOfBirth: "",
    emergencyContact: "",
    emergencyPhone: ""
  })

  const [professionalInfo, setProfessionalInfo] = useState({
    employeeId: "",
    department: "",
    position: "",
    manager: "",
    startDate: "",
    employmentType: "",
    workLocation: "",
    workSchedule: ""
  })

  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProfessionalInfoChange = (field, value) => {
    setProfessionalInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEducationSubmit = (e) => {
    e.preventDefault()
    if (isEditMode) {
      setEducationEntries(prev => 
        prev.map(entry => 
          entry.id === editingEducationId 
            ? { ...educationForm, id: editingEducationId }
            : entry
        )
      )
      setEditingEducationId(null)
      setIsEditMode(false)
    } else {
      const newEntry = {
        ...educationForm,
        id: Date.now()
      }
      setEducationEntries(prev => [...prev, newEntry])
    }
    setEducationForm({ institution: "", description: "", duration: "" })
    setShowEducationModal(false)
  }

  const handleExperienceSubmit = (e) => {
    e.preventDefault()
    if (isExperienceEditMode) {
      setExperienceEntries(prev => 
        prev.map(entry => 
          entry.id === editingExperienceId 
            ? { ...experienceForm, id: editingExperienceId }
            : entry
        )
      )
      setEditingExperienceId(null)
      setIsExperienceEditMode(false)
    } else {
      const newEntry = {
        ...experienceForm,
        id: Date.now()
      }
      setExperienceEntries(prev => [...prev, newEntry])
    }
    setExperienceForm({ jobTitle: "", organization: "", description: "", location: "", skills: "", duration: "" })
    setShowExperienceModal(false)
  }

  const handleLicensesSubmit = (e) => {
    e.preventDefault()
    if (isLicensesEditMode) {
      setLicensesEntries(prev => 
        prev.map(entry => 
          entry.id === editingLicensesId 
            ? { ...licensesForm, id: editingLicensesId }
            : entry
        )
      )
      setEditingLicensesId(null)
      setIsLicensesEditMode(false)
    } else {
      const newEntry = {
        ...licensesForm,
        id: Date.now()
      }
      setLicensesEntries(prev => [...prev, newEntry])
    }
    setLicensesForm({ certificationName: "", organization: "", description: "", issueDate: "" })
    setShowLicensesModal(false)
  }

  const handleSkillsSubmit = (e) => {
    e.preventDefault()
    const newEntry = {
      ...skillsForm,
      id: Date.now()
    }
    setSkillsEntries(prev => [...prev, newEntry])
    setSkillsForm({ skillName: "" })
    setShowSkillsModal(false)
  }

  const handleEditEducation = (entry) => {
    setEducationForm(entry)
    setEditingEducationId(entry.id)
    setIsEditMode(true)
    setShowEducationModal(true)
  }

  const handleEditExperience = (entry) => {
    setExperienceForm(entry)
    setEditingExperienceId(entry.id)
    setIsExperienceEditMode(true)
    setShowExperienceModal(true)
  }

  const handleEditLicenses = (entry) => {
    setLicensesForm(entry)
    setEditingLicensesId(entry.id)
    setIsLicensesEditMode(true)
    setShowLicensesModal(true)
  }

  const handleDeleteEducation = (id) => {
    setEducationEntries(prev => prev.filter(entry => entry.id !== id))
  }

  const handleDeleteExperience = (id) => {
    setExperienceEntries(prev => prev.filter(entry => entry.id !== id))
  }

  const handleDeleteLicenses = (id) => {
    setLicensesEntries(prev => prev.filter(entry => entry.id !== id))
  }

  const handleDeleteSkills = (id) => {
    setSkillsEntries(prev => prev.filter(entry => entry.id !== id))
  }

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
              <h1 className="text-2xl font-bold text-zinc-900 mb-2">Profile Settings</h1>
              <p className="text-zinc-500">Manage your personal and professional information.</p>
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
          {/* Personal Information */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <IconUser className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={personalInfo.firstName}
                  onChange={(e) => handlePersonalInfoChange("firstName", e.target.value)}
                  placeholder="Enter first name" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={personalInfo.lastName}
                  onChange={(e) => handlePersonalInfoChange("lastName", e.target.value)}
                  placeholder="Enter last name" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                  placeholder="Enter email address" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                  placeholder="Enter phone number" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={personalInfo.address}
                  onChange={(e) => handlePersonalInfoChange("address", e.target.value)}
                  placeholder="Enter address" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  value={personalInfo.city}
                  onChange={(e) => handlePersonalInfoChange("city", e.target.value)}
                  placeholder="Enter city" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input 
                  id="emergencyContact" 
                  value={personalInfo.emergencyContact}
                  onChange={(e) => handlePersonalInfoChange("emergencyContact", e.target.value)}
                  placeholder="Enter emergency contact name" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input 
                  id="emergencyPhone" 
                  value={personalInfo.emergencyPhone}
                  onChange={(e) => handlePersonalInfoChange("emergencyPhone", e.target.value)}
                  placeholder="Enter emergency contact phone" 
                />
              </div>
            </div>
            
            <div className="mt-6">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Personal Information
              </Button>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <IconBuilding className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Professional Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input 
                  id="employeeId" 
                  value={professionalInfo.employeeId}
                  onChange={(e) => handleProfessionalInfoChange("employeeId", e.target.value)}
                  placeholder="Enter employee ID" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input 
                  id="department" 
                  value={professionalInfo.department}
                  onChange={(e) => handleProfessionalInfoChange("department", e.target.value)}
                  placeholder="Enter department" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input 
                  id="position" 
                  value={professionalInfo.position}
                  onChange={(e) => handleProfessionalInfoChange("position", e.target.value)}
                  placeholder="Enter position" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Input 
                  id="manager" 
                  value={professionalInfo.manager}
                  onChange={(e) => handleProfessionalInfoChange("manager", e.target.value)}
                  placeholder="Enter manager name" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workLocation">Work Location</Label>
                <Select 
                  value={professionalInfo.workLocation}
                  onValueChange={(value) => handleProfessionalInfoChange("workLocation", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select 
                  value={professionalInfo.employmentType}
                  onValueChange={(value) => handleProfessionalInfoChange("employmentType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-Time</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-6">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Professional Information
              </Button>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <IconBrain className="w-6 h-6 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
              </div>
              <Dialog open={showSkillsModal} onOpenChange={setShowSkillsModal}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <IconPlus className="w-4 h-4 mr-2" />
                    Add Skill
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Skill</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSkillsSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="skillName">Skill Name</Label>
                      <Input
                        id="skillName"
                        value={skillsForm.skillName}
                        onChange={(e) => setSkillsForm({ ...skillsForm, skillName: e.target.value })}
                        placeholder="Enter skill name"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowSkillsModal(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Add Skill
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {skillsEntries.map((skill) => (
                <div key={skill.id} className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-gray-700">{skill.skillName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSkills(skill.id)}
                    className="h-6 w-6 p-0 hover:bg-red-100"
                  >
                    <IconX className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  )
}
