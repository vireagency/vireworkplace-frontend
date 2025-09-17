import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { hrDashboardConfig } from "@/config/dashboardConfigs"
import hrData from "./hrData.json"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { useState } from "react"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { 
  Download, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  Target, 
  Building2,
  Star,
  ScrollText,
  HeartPulse,
  Users,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react"
import EvaluationCreator from "./EvaluationCreator"

// Loading State Component
const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Preparing Evaluation...</p>
    </div>
  </div>
)

export default function HREvaluationsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showEvaluationCreator, setShowEvaluationCreator] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleNewEvaluation = () => {
    setIsLoading(true)
    // Simulate a brief loading state to show the loading UI
    setTimeout(() => {
      setShowEvaluationCreator(true)
      setIsLoading(false)
    }, 1000) // 1 second loading state
  }

  const handleBackToEvaluations = () => {
    setShowEvaluationCreator(false)
  }

  // If loading, show loading state
  if (isLoading) {
    return <LoadingState />
  }

  // If evaluation creator is active, show it instead of the evaluations overview
  if (showEvaluationCreator) {
    return (
      <EvaluationCreator onBack={handleBackToEvaluations} />
    )
  }

  return (
    <DashboardLayout 
      sidebarConfig={hrDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
      dataTableData={hrData}
    >
      {/* Evaluations Overview Dashboard */}
      <div className="px-4 lg:px-6">
        {/* Header Section */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Evaluations Overview</h1>
              <p className="text-slate-600">Manage and track employee performance evaluations</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button 
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleNewEvaluation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Preparing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>New Evaluation</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Reviews in Progress */}
          <Card className="@container/card relative">
            <CardHeader>
              <CardDescription>Reviews in Progress</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                13
              </CardTitle>
            </CardHeader>
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="text-green-600 bg-green-50">
                <IconTrendingUp className="text-green-600" />
                +56%
              </Badge>
            </div>
          </Card>

          {/* Reviews Completed */}
          <Card className="@container/card relative">
            <CardHeader>
              <CardDescription>Reviews Completed</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                5
              </CardTitle>
            </CardHeader>
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="text-green-600 bg-green-50">
                <IconTrendingUp className="text-green-600" />
                +56%
              </Badge>
            </div>
          </Card>

          {/* Reviews Overdue */}
          <Card className="@container/card relative">
            <CardHeader>
              <CardDescription>Reviews Overdue</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                3
              </CardTitle>
            </CardHeader>
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="text-red-600 bg-red-50">
                <IconTrendingDown className="text-red-600" />
                -18%
              </Badge>
            </div>
          </Card>

          {/* Average Score */}
          <Card className="@container/card relative">
            <CardHeader>
              <CardDescription>Average Score</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                82
              </CardTitle>
            </CardHeader>
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="text-green-600 bg-green-50">
                <IconTrendingUp className="text-green-600" />
                +3.2%
              </Badge>
            </div>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger 
              value="overview"
              className={`data-[state=active]:bg-green-500 data-[state=active]:text-white cursor-pointer`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="recent"
              className={`data-[state=active]:bg-green-500 data-[state=active]:text-white cursor-pointer`}
            >
              Recent Submissions
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming"
              className={`data-[state=active]:bg-green-500 data-[state=active]:text-white cursor-pointer`}
            >
              Upcoming Deadlines
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Recent Submissions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Recent Submissions
                  </CardTitle>
                  <Button variant="link" className="text-sm p-0 h-auto">
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">William Okuu Panwar</p>
                        <p className="text-sm text-slate-600">Annual Performance Review</p>
                        <p className="text-xs text-slate-500">2024-07-20</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        submitted
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Bless Lemplay</p>
                        <p className="text-sm text-slate-600">Mid-Year Check-in</p>
                        <p className="text-xs text-slate-500">2024-07-18</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        submitted
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Maame Esi Quansah</p>
                        <p className="text-sm text-slate-600">Project Feedback</p>
                        <p className="text-xs text-slate-500">2024-07-15</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        submitted
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Middle Column: Quick Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    <Star className="h-4 w-4" />
                    Schedule Team Reviews
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    <ScrollText className="h-4 w-4" />
                    Generate Performance Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    <HeartPulse className="h-4 w-4" />
                    Send Feedback Requests
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    <Users className="h-4 w-4" />
                    View Team Analytics
                  </Button>
                </CardContent>
              </Card>

              {/* Right Column: Department Overview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Department Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-slate-900">Engineering</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">2 evaluations</p>
                        <p className="text-sm font-medium text-slate-900">Avg Score: 75</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-slate-900">Marketing</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">1 evaluations</p>
                        <p className="text-sm font-medium text-slate-900">Avg Score: 92</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                        <span className="font-medium text-slate-900">Design</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">1 evaluations</p>
                        <p className="text-sm font-medium text-slate-900">Avg Score: 78</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                        <span className="font-medium text-slate-900">Sales</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">1 evaluations</p>
                        <p className="text-sm font-medium text-slate-900">Avg Score: 88</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Second Row: Upcoming Deadlines */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h3>
                <Button variant="link" className="flex items-center gap-2 text-sm p-0 h-auto">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  View Calendar
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Jerry John Rothman</p>
                        <p className="text-sm text-slate-600">Annual Performance Review</p>
                        <p className="text-xs text-slate-500">2024-08-15</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Jackson Cole</p>
                        <p className="text-sm text-slate-600">360-Degree Review</p>
                        <p className="text-xs text-slate-500">2024-08-01</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Middle Column */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Daniel Obeng</p>
                        <p className="text-sm text-slate-600">Mid-Year Check-in</p>
                        <p className="text-xs text-slate-500">2024-08-10</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Isabella Wright</p>
                        <p className="text-sm text-slate-600">Performance Improvement Plan</p>
                        <p className="text-xs text-slate-500">2024-07-28</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Column */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Sophia Hayes</p>
                        <p className="text-sm text-slate-600">Project Feedback</p>
                        <p className="text-xs text-slate-500">2024-08-05</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="mt-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search submissions..."
                    className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <select className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Status</option>
                </select>
                <select className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Departments</option>
                </select>
                <Button variant="outline" className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L6.293 13H1a1 1 0 01-1-1V4z" />
                  </svg>
                  More Filters
                </Button>
              </div>
            </div>

            {/* Recent Submissions Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">Recent Submissions (7)</CardTitle>
                <Button variant="ghost" className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  Sort by Score
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-200">
                        <TableHead className="text-left py-3 px-4">
                          <input type="checkbox" className="rounded border-slate-300" />
                        </TableHead>
                        <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                          Employee
                          <svg className="inline ml-1 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </TableHead>
                        <TableHead className="text-left py-3 px-4 font-medium text-slate-600">Evaluation Type</TableHead>
                        <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                          Date
                          <svg className="inline ml-1 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </TableHead>
                        <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                          Score
                          <svg className="inline ml-1 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </TableHead>
                        <TableHead className="text-left py-3 px-4 font-medium text-slate-600">Status</TableHead>
                        <TableHead className="text-left py-3 px-4 font-medium text-slate-600">Department</TableHead>
                        <TableHead className="text-left py-3 px-4 font-medium text-slate-600">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100">
                      {/* Row 1 */}
                      <TableRow className="hover:bg-slate-50">
                        <TableCell className="py-3 px-4">
                          <input type="checkbox" className="rounded border-slate-300" />
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                              WOP
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">William Okuu Panwar</div>
                              <div className="text-sm text-slate-500">Engineering</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">Annual Performance Review</TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">2024-07-20</TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-slate-900">85</span>
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            submitted
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-600">Engineering</TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm-0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Row 2 */}
                      <TableRow className="hover:bg-slate-50">
                        <TableCell className="py-3 px-4">
                          <input type="checkbox" className="rounded border-slate-300" />
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
                              BL
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">Bless Lemplay</div>
                              <div className="text-sm text-slate-500">Marketing</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">Mid-Year Check-in</TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">2024-07-18</TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-slate-900">92</span>
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            submitted
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-600">Marketing</TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm-0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Row 3 */}
                      <TableRow className="hover:bg-slate-50">
                        <TableCell className="py-3 px-4">
                          <input type="checkbox" className="rounded border-slate-300" />
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                              MEQ
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">Maame Esi Quansah</div>
                              <div className="text-sm text-slate-500">Design</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">Project Feedback</TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">2024-07-15</TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-slate-900">78</span>
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            submitted
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-600">Design</TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm-0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Row 4 */}
                      <TableRow className="hover:bg-slate-50">
                        <TableCell className="py-3 px-4">
                          <input type="checkbox" className="rounded border-slate-300" />
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                              AJ
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">Alex Johnson</div>
                              <div className="text-sm text-slate-500">Sales</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">360-Degree Review</TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">2024-07-12</TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-slate-900">88</span>
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            submitted
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-600">Sales</TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm-0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Row 5 */}
                      <TableRow className="hover:bg-slate-50">
                        <TableCell className="py-3 px-4">
                          <input type="checkbox" className="rounded border-slate-300" />
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-semibold text-sm">
                              RK
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">Robert Kim</div>
                              <div className="text-sm text-slate-500">HR</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">Performance Improvement Plan</TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">2024-07-10</TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-slate-900">65</span>
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            submitted
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-600">HR</TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm-0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Row 6 */}
                      <TableRow className="hover:bg-slate-50">
                        <TableCell className="py-3 px-4">
                          <input type="checkbox" className="rounded border-slate-300" />
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-semibold text-sm">
                              SJ
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">Sarah Johnson</div>
                              <div className="text-sm text-slate-500">Finance</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">Quarterly Review</TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">2024-07-08</TableCell>
                        <TableCell className="py-3 px-4">
                          <span className="text-slate-400">-</span>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            pending
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-600">Finance</TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm-0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Row 7 */}
                      <TableRow className="hover:bg-slate-50">
                        <TableCell className="py-3 px-4">
                          <input type="checkbox" className="rounded border-slate-300" />
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                              MC
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">Marcus Chen</div>
                              <div className="text-sm text-slate-500">Engineering</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">Annual Performance Review</TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">2024-07-05</TableCell>
                        <TableCell className="py-3 px-4">
                          <span className="text-slate-400">-</span>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            overdue
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-600">Engineering</TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm-0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-6">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h3>
              <Button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                Send Reminders
              </Button>
            </div>

            {/* Upcoming Deadlines Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-200">
                        <TableHead className="text-left px-4 font-medium text-slate-600">Priority</TableHead>
                        <TableHead className="text-left px-4 font-medium text-slate-600">Employee</TableHead>
                        <TableHead className="text-left px-4 font-medium text-slate-600">Evaluation Type</TableHead>
                        <TableHead className="text-left px-4 font-medium text-slate-600">Deadline</TableHead>
                        <TableHead className="text-left px-4 font-medium text-slate-600">Days Left</TableHead>
                        <TableHead className="text-left px-4 font-medium text-slate-600">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100">
                      {/* Row 1 */}
                      <TableRow className="hover:bg-slate-50">
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                            <span className="text-sm font-medium text-slate-900">High</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                              JJR
                            </div>
                            <div className="font-medium text-slate-900">Jerry John Rothman</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">Annual Performance Review</TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">2024-08-15</TableCell>
                        <TableCell className="py-3 px-4">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                            -375 days
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm-0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Row 2 */}
                      <TableRow className="hover:bg-slate-50">
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm font-medium text-slate-900">Medium</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                              DO
                            </div>
                            <div className="font-medium text-slate-900">Daniel Obeng</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">Mid-Year Check-in</TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">2024-08-10</TableCell>
                        <TableCell className="py-3 px-4">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                            -380 days
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm-0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Row 3 */}
                      <TableRow className="hover:bg-slate-50">
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                            <span className="text-sm font-medium text-slate-900">High</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                              SH
                            </div>
                            <div className="font-medium text-slate-900">Sophia Hayes</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">Project Feedback</TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">2024-08-05</TableCell>
                        <TableCell className="py-3 px-4">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                            -385 days
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm-0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Row 4 */}
                      <TableRow className="hover:bg-slate-50">
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-slate-900">Low</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                              LM
                            </div>
                            <div className="font-medium text-slate-900">Lisa Martinez</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">360-Degree Review</TableCell>
                        <TableCell className="py-3 px-4 text-slate-900">2024-08-01</TableCell>
                        <TableCell className="py-3 px-4">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                            -390 days
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm-0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
