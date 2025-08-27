import { useState, useMemo } from "react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { hrDashboardConfig } from "@/config/dashboardConfigs"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Filter, MapPin, Clock, MoreVertical, Edit, Eye, Users, Mail, Briefcase, X } from "lucide-react"

// Sample employee data matching the UI
const employees = [
  {
    id: 1,
    name: "Bless Lamptey",
    email: "blesslampt@gmail.com",
    role: "Graphic Designer",
    department: "Design",
    status: "active",
    location: "In-person",
    checkIn: "8:30 am",
    avatar: null
  },
  {
    id: 2,
    name: "Fiifi Adoko",
    email: "adoko@gmail.com",
    role: "Graphic Designer",
    department: "Design",
    status: "active",
    location: "In-person",
    checkIn: "9:10 am",
    avatar: null
  },
  {
    id: 3,
    name: "Maame Esi Quansah",
    email: "quansahesi@gmail.com",
    role: "Admin Assistant",
    department: "Administration",
    status: "inactive",
    location: "Remote",
    checkIn: "10:00 am",
    avatar: null
  },
  {
    id: 4,
    name: "William Ofosu Parwar",
    email: "william677@gmail.com",
    role: "Software Developer",
    department: "Engineering",
    status: "active",
    location: "Remote",
    checkIn: "9:00 am",
    avatar: null
  },
  {
    id: 5,
    name: "Jerry John Richman",
    email: "johnjerry@gmail.com",
    role: "Software Developer",
    department: "Engineering",
    status: "closed",
    location: "Remote",
    checkIn: "9:35 am",
    avatar: null
  },
  {
    id: 6,
    name: "Lemuel Oti",
    email: "lee@gmail.com",
    role: "Software Developer",
    department: "Engineering",
    status: "active",
    location: "In-person",
    checkIn: "9:10 am",
    avatar: null
  },
  {
    id: 7,
    name: "Agnes Doe",
    email: "agnes1@gmail.com",
    role: "Graphic Designer",
    department: "Design",
    status: "inactive",
    location: "Remote",
    checkIn: "10:00 am",
    avatar: null
  },
  {
    id: 8,
    name: "Emerald Doe",
    email: "emy67@gmail.com",
    role: "Intern",
    department: "Engineering",
    status: "active",
    location: "Remote",
    checkIn: "9:00 am",
    avatar: null
  },
  {
    id: 9,
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    role: "Marketing Manager",
    department: "Marketing",
    status: "active",
    location: "In-person",
    checkIn: "8:45 am",
    avatar: null
  },
  {
    id: 10,
    name: "Michael Chen",
    email: "mchen@company.com",
    role: "Data Analyst",
    department: "Engineering",
    status: "active",
    location: "Remote",
    checkIn: "9:15 am",
    avatar: null
  },
  {
    id: 11,
    name: "Lisa Rodriguez",
    email: "lisa.r@company.com",
    role: "HR Specialist",
    department: "Administration",
    status: "inactive",
    location: "In-person",
    checkIn: "10:30 am",
    avatar: null
  },
  {
    id: 12,
    name: "David Kim",
    email: "dkim@company.com",
    role: "Product Manager",
    department: "Engineering",
    status: "active",
    location: "Remote",
    checkIn: "8:55 am",
    avatar: null
  },
  {
    id: 13,
    name: "Emma Wilson",
    email: "emma.w@company.com",
    role: "UX Designer",
    department: "Design",
    status: "active",
    location: "In-person",
    checkIn: "9:20 am",
    avatar: null
  },
  {
    id: 14,
    name: "James Brown",
    email: "jbrown@company.com",
    role: "Sales Representative",
    department: "Sales",
    status: "closed",
    location: "Remote",
    checkIn: "9:40 am",
    avatar: null
  },
  {
    id: 15,
    name: "Maria Garcia",
    email: "mgarcia@company.com",
    role: "Content Writer",
    department: "Marketing",
    status: "active",
    location: "Remote",
    checkIn: "8:50 am",
    avatar: null
  },
  {
    id: 16,
    name: "Robert Taylor",
    email: "rtaylor@company.com",
    role: "DevOps Engineer",
    department: "Engineering",
    status: "active",
    location: "In-person",
    checkIn: "9:05 am",
    avatar: null
  },
  {
    id: 17,
    name: "Jennifer Lee",
    email: "jlee@company.com",
    role: "Financial Analyst",
    department: "Administration",
    status: "inactive",
    location: "Remote",
    checkIn: "10:15 am",
    avatar: null
  },
  {
    id: 18,
    name: "Thomas Anderson",
    email: "tanderson@company.com",
    role: "QA Engineer",
    department: "Engineering",
    status: "active",
    location: "In-person",
    checkIn: "9:25 am",
    avatar: null
  }
]

const departments = ["Design", "Engineering", "Social Media", "Marketing", "Production"]

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [viewFilter, setViewFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.role.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || employee.status === statusFilter
      const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
      
      return matchesSearch && matchesStatus && matchesDepartment
    })
  }, [searchTerm, statusFilter, departmentFilter])

  // Pagination
  const totalItems = filteredEmployees.length
  const currentEmployees = filteredEmployees.slice(0, currentPage * itemsPerPage)
  const hasMoreItems = currentEmployees.length < totalItems

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee)
    setIsModalOpen(true)
  }

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      active: { 
        bgColor: "bg-green-50", 
        borderColor: "border-green-200", 
        textColor: "text-green-700",
        dotColor: "bg-green-500",
        text: "Active" 
      },
      inactive: { 
        bgColor: "bg-orange-50", 
        borderColor: "border-orange-200", 
        textColor: "text-orange-700",
        dotColor: "bg-orange-500",
        text: "Inactive" 
      },
      closed: { 
        bgColor: "bg-red-50", 
        borderColor: "border-red-200", 
        textColor: "text-red-700",
        dotColor: "bg-red-500",
        text: "Closed" 
      }
    }
    
    const config = statusConfig[status] || statusConfig.inactive
    
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.borderColor}`}>
        <div className={`w-2 h-2 ${config.dotColor} rounded-full`}></div>
        <span className={`text-sm font-medium ${config.textColor}`}>{config.text}</span>
      </div>
    )
  }

  return (
    <DashboardLayout 
      sidebarConfig={hrDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="mb-8 ml-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Employee List Overview</h1>
        <p className="text-zinc-500">Manage and monitor employee information across the organization.</p>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm ml-6 mr-6">
        {/* Filters Bar */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <div 
                className={`border rounded-lg px-3 py-1.5 cursor-pointer transition-colors ${
                  viewFilter === "all" 
                    ? "bg-gray-50 border-gray-200" 
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setViewFilter("all")}
              >
                <span className={`text-sm font-medium ${
                  viewFilter === "all" ? "text-gray-700" : "text-gray-600"
                }`}>View all</span>
              </div>
              <div 
                className={`border rounded-lg px-3 py-1.5 cursor-pointer transition-colors ${
                  viewFilter === "monitored" 
                    ? "bg-gray-50 border-gray-200" 
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setViewFilter("monitored")}
              >
                <span className={`text-sm font-medium ${
                  viewFilter === "monitored" ? "text-gray-700" : "text-gray-600"
                }`}>Monitored</span>
              </div>
              <div 
                className={`border rounded-lg px-3 py-1.5 cursor-pointer transition-colors ${
                  viewFilter === "teams" 
                    ? "bg-gray-50 border-gray-200" 
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setViewFilter("teams")}
              >
                <span className={`text-sm font-medium ${
                  viewFilter === "teams" ? "text-gray-700" : "text-gray-600"
                }`}>Teams</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search employees..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-80"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="All Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Department</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {currentEmployees.length} of {totalItems} employees
            </div>
            {hasMoreItems && (
              <div>
                {totalItems - currentEmployees.length} more available
              </div>
            )}
          </div>
        </div>

        {/* Employee Table */}
        <div className="p-0">
          {currentEmployees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="w-[300px] py-4 px-6 font-semibold text-gray-900">Employee</TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-gray-900">Role</TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-gray-900">Department</TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-gray-900">Location</TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-gray-900">Check-in</TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-gray-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentEmployees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-gray-50 border-b border-gray-100">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback className="bg-gray-300 text-gray-600">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 font-medium text-gray-900">{employee.role}</TableCell>
                    <TableCell className="py-4 px-6 text-gray-900">{employee.department}</TableCell>
                    <TableCell className="py-4 px-6">
                      <StatusBadge status={employee.status} />
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">{employee.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                          {employee.checkIn}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={() => handleViewEmployee(employee)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="default" className="h-8 bg-green-500 hover:bg-green-600 text-white">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Send Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </div>
          )}

          {/* Load More Button */}
          {hasMoreItems && (
            <div className="mt-6 px-6 pb-6 flex items-center justify-center border-t border-gray-200 pt-6">
              <Button 
                variant="default" 
                onClick={handleLoadMore}
                className="px-8 py-2 bg-green-500 hover:bg-green-600 text-white"
              >
                Load More...
              </Button>
            </div>
          )}
        </div>
      </Card>
      </div>

      {/* Employee Summary Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Employee Summary</DialogTitle>
            <DialogDescription className="text-gray-600">
              Quick overview of employee information
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Employee Header */}
              <div className="flex items-start space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedEmployee.avatar} />
                  <AvatarFallback className="text-lg bg-gray-300 text-gray-600">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedEmployee.name}</h3>
                  <p className="text-gray-600 mb-3">{selectedEmployee.role}</p>
                  {(() => {
                    const statusConfig = {
                      active: { bgColor: "bg-green-50", borderColor: "border-green-200", textColor: "text-green-700", dotColor: "bg-green-500", text: "Active" },
                      inactive: { bgColor: "bg-orange-50", borderColor: "border-orange-200", textColor: "text-orange-700", dotColor: "bg-orange-500", text: "Inactive" },
                      closed: { bgColor: "bg-red-50", borderColor: "border-red-200", textColor: "text-red-700", dotColor: "bg-red-500", text: "Closed" }
                    }
                    const config = statusConfig[selectedEmployee.status] || statusConfig.active
                    return (
                      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full ${config.bgColor} ${config.borderColor}`}>
                        <div className={`w-2 h-2 ${config.dotColor} rounded-full`}></div>
                        <span className={`text-sm font-medium ${config.textColor}`}>{config.text}</span>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Employee Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedEmployee.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium text-gray-900">{selectedEmployee.department}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Work Location</p>
                      <p className="font-medium text-gray-900">{selectedEmployee.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Last Check-in</p>
                      <p className="font-medium text-gray-900">{selectedEmployee.checkIn}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Quick Stats</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">85%</p>
                    <p className="text-sm text-gray-600">Performance</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-2xl font-bold text-green-600">12</p>
                    <p className="text-sm text-gray-600">Projects</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-2xl font-bold text-purple-600">2.5</p>
                    <p className="text-sm text-gray-600">Years</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Edit className="w-4 h-4 mr-2" />
                    Quick Edit
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Button 
                    className="bg-[#04b435] hover:bg-[#04b435]/90 text-white px-6 py-2"
                  >
                    View Complete Profile
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
