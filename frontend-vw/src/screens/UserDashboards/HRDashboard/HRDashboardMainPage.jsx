import HRDashboardLayout from "@/components/dashboard/HRDashboardLayout"
import { hrDashboardConfig } from "@/config/dashboardConfigs"
import hrData from "./hrData.json"
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

function getGreeting() {
  const currentHour = new Date().getHours()
  if (currentHour < 12) return "Good Morning"
  if (currentHour < 18) return "Good Afternoon"
  return "Good Evening"
}

export default function HRDashboardMainPage() {
  const { user } = useAuth()
  const greeting = getGreeting()
  
  // Get user's first name, fallback to "User" if not available
  const userName = user?.firstName || "User"

  return (
    <HRDashboardLayout 
      sidebarConfig={hrDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
      dataTableData={hrData}
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

      {/* HR Dashboard Section Cards */}
      <div className="px-4 lg:px-6">
        <div
          className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          <Card className="@container/card relative">
            <CardHeader>
              <CardDescription>Active Employees</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                12
              </CardTitle>
            </CardHeader>
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="text-green-600 bg-green-50">
                <IconTrendingUp className="text-green-600" />
                +36%
              </Badge>
            </div>
          </Card>
          
          <Card className="@container/card relative">
            <CardHeader>
              <CardDescription>Total Remote Workers Today</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                4
              </CardTitle>
            </CardHeader>
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="text-red-600 bg-red-50">
                <IconTrendingDown className="text-red-600" />
                -14%
              </Badge>
            </div>
          </Card>
          
          <Card className="@container/card relative">
            <CardHeader>
              <CardDescription>No Check-In Today</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                2
              </CardTitle>
            </CardHeader>
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="text-green-600 bg-green-50">
                <IconTrendingUp className="text-green-600" />
                +36%
              </Badge>
            </div>
          </Card>
          
          <Card className="@container/card relative">
            <CardHeader>
              <CardDescription>Incomplete Tasks</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                10
              </CardTitle>
            </CardHeader>
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="text-red-600 bg-red-50">
                <IconTrendingDown className="text-red-600" />
                -36%
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
                <h3 className="text-xl font-semibold text-gray-900 mb-1">AI Work Log Analyzer</h3>
                <p className="text-sm text-gray-500">Monthly Attendance & Productivity</p>
              </div>
              
              <div className="flex items-center space-x-24">
                <div className="flex space-x-1">
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg">12 Months</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">6 Months</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">30 Days</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">7 Days</button>
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
                    <span className="text-sm text-gray-600">Attendance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">Productivity</span>
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
                  <p className="text-xs text-gray-400 mt-1">Line chart with monthly data from Feb to Jan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Tracker - Takes up 1/3 of the space */}
          <div className="lg:col-span-1 bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Real-Time Tracker</h3>
              <select className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
              </select>
            </div>
            
            {/* Metrics */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Active Employees</span>
                  <span className="text-sm font-semibold text-gray-900">1,43,382</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Inactive for 60+ mins</span>
                  <span className="text-sm font-semibold text-gray-900">87,974</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">No Check-In</span>
                  <span className="text-sm font-semibold text-gray-900">45,211</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Incomplete Tasks</span>
                  <span className="text-sm font-semibold text-gray-900">21,893</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Overview Table Section */}
      <div className="px-4 lg:px-6 mt-6">
        <div className="bg-white rounded-lg border p-6">
          {/* Table Header */}
          <div className="mb-6">
            <div className="mb-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Employee Overview</h3>
              <div className="flex items-center gap-64">
                <p className="text-sm text-gray-500">Monitor employee status, attendance, and task completion in real-time</p>
                <div className="text-center">
                  <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    See All Employees &gt;
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      Name
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      Status
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      Role
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      Location Today
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      Check-In Time
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      Tasks Completed Today
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Employee Row 1 */}
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">BL</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Bless Lamptey</div>
                        <div className="text-sm text-gray-500">blesslampt@gmail.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 font-medium">Active</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">Graphic Designer</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">In-person</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-purple-600 font-medium">8:30 am</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">+4</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">On Track</span>
                    </div>
                  </td>
                </tr>

                {/* Employee Row 2 */}
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">FA</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Fiifi Adoko</div>
                        <div className="text-sm text-gray-500">adoko@gmail.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 font-medium">Active</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">Graphic Designer</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">In-person</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-purple-600 font-medium">9:10 am</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">3</span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Low Input</span>
                    </div>
                  </td>
                </tr>

                {/* Employee Row 3 */}
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">MQ</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Maame Esi Quansah</div>
                        <div className="text-sm text-gray-500">quansahesi@gmail.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-orange-600 font-medium">In-active</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">Admin Assistant</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">Remote</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-orange-600 font-medium">10:00 am</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">5</span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">Incomplete</span>
                    </div>
                  </td>
                </tr>

                {/* Employee Row 4 */}
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">WO</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">William Ofosu Parwar</div>
                        <div className="text-sm text-gray-500">william677@gmail.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 font-medium">Active</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">Software Developer</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">Remote</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-purple-600 font-medium">9:00 am</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">5</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Completed</span>
                    </div>
                  </td>
                </tr>

                {/* Employee Row 5 */}
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">JJ</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Jerry John Richman</div>
                        <div className="text-sm text-gray-500">johnjerry@gmail.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-600 font-medium">Closed</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">Software Developer</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">Remote</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-orange-600 font-medium">9:35 am</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">4</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Completed</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </HRDashboardLayout>
  )
}
