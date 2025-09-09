import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout"
import { staffDashboardConfig } from "@/config/dashboardConfigs"
import staffData from "./staffData.json"
import { useState, useEffect } from "react"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { getApiUrl } from "@/config/apiConfig"
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table"

function getGreeting() {
  const currentHour = new Date().getHours()
  if (currentHour < 12) return "Good Morning"
  if (currentHour < 18) return "Good Afternoon"
  return "Good Evening"
}

// StatusBadge component with fallback logic
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
  
  const config = statusConfig[status] || statusConfig["In-active"]
  
  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}>
      <div className={`w-2 h-2 ${config.dotColor} rounded-full`}></div>
      <span className={`text-sm font-medium ${config.textColor}`}>{config.text}</span>
    </div>
  )
}

export default function StaffDashboardMainPage() {
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()
  const greeting = getGreeting()
  
  // Get user's first name, fallback to "User" if not available
  const userName = user?.firstName || "User"

  // API configuration
  const API_URL = getApiUrl()

  // State for employee data
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true)
        
        // Check authentication
        if (!accessToken) {
          console.log("No access token available")
          throw new Error("No access token available. Please log in again.")
        }
        
        console.log("Making API call to:", `${API_URL}/employees/list`)
        console.log("User:", user)
        console.log("User role:", user?.role)
        
        const response = await axios.get(`${API_URL}/employees/list`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.data.success) {
          // Transform API data to match our component structure
          const transformedEmployees = response.data.data.map(emp => ({
            id: emp._id,
            name: `${emp.firstName} ${emp.lastName}`,
            email: emp.email,
            role: emp.jobRole,
            department: emp.department,
            status: emp.attendanceStatus || "In-active", // Fallback to "In-active" if status is undefined/null
            location: emp.locationToday,
            checkIn: emp.checkInTime,
            avatar: emp.avatar || null
          }))
          
          setEmployees(transformedEmployees)
          console.log("API Response:", response.data)
          console.log("Transformed Employees:", transformedEmployees)
          console.log("Employee statuses:", transformedEmployees.map(emp => ({ name: emp.name, status: emp.status })))
        } else {
          setError("Failed to fetch employees")
        }
      } catch (err) {
        console.error("Error fetching employees:", err)
        setError(`Error fetching employees: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [accessToken, API_URL, user])

  // Function to handle navigation to Employees page
  const handleSeeAllEmployees = () => {
    navigate("/staff/employees")
  }

  return (
    <StaffDashboardLayout 
      sidebarConfig={staffDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
      dataTableData={staffData}
    >
      {/* Welcome Section */}
      <div className="px-4 lg:px-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-normal text-gray-900 mb-1">
              <span className="font-medium">{greeting}, {userName}</span>
              <span className="text-base font-light"> – here's what's happening in Vire Agency today</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm text-green-600 px-3 py-1.5 border border-gray-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Active
            </div>
          </div>
        </div>
      </div>

      {/* Staff Dashboard Section Cards */}
      <div className="px-4 lg:px-6">
        <div
          className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          <Card className="@container/card relative">
            <CardHeader>
              <CardDescription>My Tasks Today</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                8
              </CardTitle>
            </CardHeader>
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="text-green-600 bg-green-50">
                <IconTrendingUp className="text-green-600" />
                +25%
              </Badge>
            </div>
          </Card>
          
          <Card className="@container/card relative">
            <CardHeader>
              <CardDescription>Completed Tasks</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                6
              </CardTitle>
            </CardHeader>
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="text-green-600 bg-green-50">
                <IconTrendingUp className="text-green-600" />
                +15%
              </Badge>
            </div>
          </Card>
          
          <Card className="@container/card relative">
            <CardHeader>
              <CardDescription>Hours Worked Today</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                7.5
              </CardTitle>
            </CardHeader>
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="text-green-600 bg-green-50">
                <IconTrendingUp className="text-green-600" />
                +5%
              </Badge>
            </div>
          </Card>
          
          <Card className="@container/card relative">
            <CardHeader>
              <CardDescription>Performance Score</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                92%
              </CardTitle>
            </CardHeader>
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="text-green-600 bg-green-50">
                <IconTrendingUp className="text-green-600" />
                +8%
              </Badge>
            </div>
          </Card>
        </div>
      </div>

      {/* AI Work Log Analyzer and Real-Time Tracker Section */}
      <div className="px-4 lg:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Work Log Analyzer - Takes up 2/3 of the space */}
          <div className="lg:col-span-2 bg-white rounded-lg border p-6">
            {/* Header Section with Time Range Selector and Export Button on same line */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">My Work Progress</h3>
                <p className="text-sm text-gray-500">Daily Task Completion & Productivity</p>
              </div>
              
              <div className="flex items-center space-x-24">
                <div className="flex space-x-1">
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg">Today</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Week</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Month</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Year</button>
                </div>
                <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF
                </button>
              </div>
            </div>
            
            {/* Chart Area */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 h-80">
              {/* Chart Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">Tasks Completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">Hours Worked</span>
                  </div>
                </div>
              </div>
              
              {/* Chart Content */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm">Chart visualization will be implemented here</p>
                  <p className="text-xs text-gray-400 mt-1">Line chart with daily task completion data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Tracker - Takes up 1/3 of the space */}
          <div className="lg:col-span-1 bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Summary</h3>
              <select className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white">
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
            
            {/* Metrics */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tasks Completed</span>
                  <span className="text-sm font-semibold text-gray-900">6/8</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Hours Worked</span>
                  <span className="text-sm font-semibold text-gray-900">7.5/8</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Performance Score</span>
                  <span className="text-sm font-semibold text-gray-900">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Attendance</span>
                  <span className="text-sm font-semibold text-gray-900">On Time</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Overview Table Section */}
      <div className="px-4 lg:px-6 mt-6">
        <div className="bg-white rounded-lg border p-6">
          {/* Table Header */}
          <div className="mb-6">
            <div className="mb-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">My Tasks Today</h3>
              <div className="flex items-center gap-64">
                <p className="text-sm text-gray-500">Track your daily tasks and progress</p>
                <div className="text-center">
                  <button 
                    onClick={handleSeeAllEmployees}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                  >
                    View All Tasks &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Task Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading tasks...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Tasks</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Try Again
                </button>
              </div>
            ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center gap-2 cursor-pointer">
                      Task Name
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center gap-2 cursor-pointer">
                      Status
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center gap-2 cursor-pointer">
                      Priority
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center gap-2 cursor-pointer">
                      Due Date
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center gap-2 cursor-pointer">
                      Progress
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100">
                {[
                  { id: 1, name: "Complete project documentation", status: "In Progress", priority: "High", dueDate: "Today", progress: "75%" },
                  { id: 2, name: "Review code changes", status: "Completed", priority: "Medium", dueDate: "Today", progress: "100%" },
                  { id: 3, name: "Update user interface", status: "Pending", priority: "Low", dueDate: "Tomorrow", progress: "0%" },
                  { id: 4, name: "Test new features", status: "In Progress", priority: "High", dueDate: "Today", progress: "50%" },
                  { id: 5, name: "Prepare presentation", status: "Completed", priority: "Medium", dueDate: "Yesterday", progress: "100%" }
                ].map((task) => (
                  <TableRow key={task.id} className="hover:bg-gray-50">
                    <TableCell className="py-4 px-4">
                      <div className="font-medium text-gray-900">{task.name}</div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <StatusBadge status={task.status} />
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <span className="text-sm text-gray-900">{task.dueDate}</span>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{task.progress}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: task.progress }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  )
}
