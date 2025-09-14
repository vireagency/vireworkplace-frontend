import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { hrDashboardConfig } from "@/config/dashboardConfigs"
import hrData from "./hrData.json"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Download, TrendingUp, TrendingDown, Target, Loader2, Edit, Trash2 } from "lucide-react"
import { GoalCreationModal } from "@/components/auth/GoalCreationModal"
import { useAuth } from "@/hooks/useAuth"
import { goalsApi } from "@/services/goalsApi"
import { performanceTrendsApi } from "@/services/performanceTrendsApi"
import { toast } from "sonner"

export default function HRPerformancePage() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState("performance")
  const [timeframe, setTimeframe] = useState("12-months")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [goals, setGoals] = useState([])
  const [isLoadingGoals, setIsLoadingGoals] = useState(false)
  const [isDeletingGoal, setIsDeletingGoal] = useState(null)
  
  // Performance trends state
  const [performanceTrends, setPerformanceTrends] = useState(null)
  const [isLoadingTrends, setIsLoadingTrends] = useState(false)

  // Load data from API on component mount
  useEffect(() => {
    if (accessToken) {
      loadGoals();
      loadPerformanceTrends();
    }
  }, [accessToken]);

  const loadGoals = async () => {
    if (!accessToken) return;
    
    setIsLoadingGoals(true);
    try {
      const result = await goalsApi.getAllGoals(accessToken);
      if (result.success) {
        setGoals(result.data?.data || result.data || []);
        console.log("Loaded goals:", result.data);
      } else {
        toast.error(result.error || "Failed to load goals");
        // Fallback to static data if API fails
        setGoals(getStaticGoals());
      }
    } catch (error) {
      console.error("Error loading goals:", error);
      toast.error("Failed to load goals");
      // Fallback to static data
      setGoals(getStaticGoals());
    } finally {
      setIsLoadingGoals(false);
    }
  };

  const loadPerformanceTrends = async () => {
    if (!accessToken) return;
    
    setIsLoadingTrends(true);
    try {
      const result = await performanceTrendsApi.getPerformanceTrends(accessToken);
      if (result.success) {
        setPerformanceTrends(result.data);
        console.log("Loaded performance trends:", result.data);
      } else {
        toast.error(result.error || "Failed to load performance trends");
        // Fallback to static data if API fails
        setPerformanceTrends(getStaticTrends());
      }
    } catch (error) {
      console.error("Error loading performance trends:", error);
      toast.error("Failed to load performance trends");
      // Fallback to static data
      setPerformanceTrends(getStaticTrends());
    } finally {
      setIsLoadingTrends(false);
    }
  };

  // Static performance trends as fallback
  const getStaticTrends = () => ({
    success: true,
    message: "Performance trends fetched successfully",
    period: "Q1-2024",
    TopPerformingDepartment: {
      department: "Engineering",
      avgScore: 4.7,
      totalEmployees: 12
    },
    OverallPerformanceIndex: 4.2,
    OverallDepartmentPerformance: [
      {
        department: "Engineering",
        avgScore: 4.7,
        totalEmployees: 12
      },
      {
        department: "HR",
        avgScore: 4.3,
        totalEmployees: 5
      },
      {
        department: "Finance",
        avgScore: 3.9,
        totalEmployees: 7
      }
    ],
    topPerformers: [
      {
        employeeId: "64efc8d1c5a2a12345f0d9a7",
        name: "Jane Smith",
        role: "Software Engineer",
        score: 4.9,
        department: "Engineering"
      },
      {
        employeeId: "64efc8d1c5a2a12345f0d9a8",
        name: "John Doe",
        role: "Product Manager",
        score: 4.8,
        department: "Product"
      }
    ],
    lowPerformers: [
      {
        employeeId: "64efc8d1c5a2a12345f0d9a9",
        name: "Alex Brown",
        role: "Junior Analyst",
        score: 2.5,
        department: "Finance"
      },
      {
        employeeId: "64efc8d1c5a2a12345f0d9a0",
        name: "Sarah Johnson",
        role: "HR Assistant",
        score: 2.8,
        department: "HR"
      }
    ]
  });

  // Static goals as fallback
  const getStaticGoals = () => [
    {
      id: 1,
      title: "Reduce Employee Turnover Rate",
      description: "Decrease voluntary turnover from 18% to 12% by implementing comprehensive retention programs, improving work-life balance, and enhancing career development opportunities.",
      progress: 65,
      priority: "High Priority",
      deadline: "2024-12-31",
      owner: "HR Leadership Team",
      currentValue: "15%",
      targetValue: "12%",
      status: "On Track",
      category: "Retention",
      goalType: "company",
      metrics: "Current: 15% (Target: 12%)"
    },
    {
      id: 2,
      title: "Improve Employee Engagement Score",
      description: "Increase overall employee engagement score from 3.2 to 4.0 through enhanced communication, recognition programs, and professional development initiatives.",
      progress: 78,
      priority: "High Priority",
      deadline: "2025-03-31",
      owner: "People & Culture Team",
      currentValue: "3.6",
      targetValue: "4.0",
      status: "On Track",
      category: "Engagement",
      goalType: "company",
      metrics: "Current: 3.6 (Target: 4.0)"
    },
    {
      id: 3,
      title: "Achieve Diversity & Inclusion Targets",
      description: "Reach 40% female representation in leadership roles and 35% underrepresented minorities in technical positions through targeted recruitment and development programs.",
      progress: 42,
      priority: "High Priority",
      deadline: "2025-06-30",
      owner: "D&I Committee",
      currentValue: "32%",
      targetValue: "40%",
      status: "Needs Attention",
      category: "Diversity",
      goalType: "company",
      metrics: "Leadership: 32% | Tech: 28%"
    },
    {
      id: 4,
      title: "Implement Learning & Development Program",
      description: "Launch comprehensive skills development program with 95% employee participation rate and average 40 hours of training per employee annually.",
      progress: 85,
      priority: "Medium Priority",
      deadline: "2025-05-15",
      owner: "Learning & Development",
      currentValue: "87%",
      targetValue: "95%",
      status: "On Track",
      category: "Development",
      goalType: "company",
      metrics: "Participation: 87% | Avg Hours: 32"
    },
    {
      id: 5,
      title: "Enhance Workplace Safety & Wellness",
      description: "Achieve zero workplace accidents and improve employee wellness program participation to 75% while reducing stress-related sick leave by 25%.",
      progress: 91,
      priority: "High Priority",
      deadline: "Ongoing",
      owner: "Safety & Wellness Team",
      currentValue: "0",
      targetValue: "75%",
      status: "Exceeding",
      category: "Wellness",
      goalType: "company",
      metrics: "Accidents: 0 | Wellness: 68%"
    }
  ];

  const handleCreateGoal = async (data) => {
    console.log("Goal created/updated:", data);
    // Refresh goals list
    await loadGoals();
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = async (goalId) => {
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    setIsDeletingGoal(goalId);
    try {
      const result = await goalsApi.deleteGoal(goalId, accessToken);
      if (result.success) {
        toast.success("Goal deleted successfully!");
        await loadGoals();
      } else {
        toast.error(result.error || "Failed to delete goal");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    } finally {
      setIsDeletingGoal(null);
    }
  };

  const openGoalModal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const teamGoals = [
    {
      id: 1,
      team: "Human Resources",
      goals: [
        {
          id: "hr1",
          title: "Improve Employee Onboarding Process",
          description: "Streamline and enhance the new employee onboarding experience to increase satisfaction scores and reduce time to productivity.",
          assignee: "HR Team Lead",
          progress: 75,
          priority: "High",
          deadline: "Feb 28, 2025",
          type: "Process Improvement",
          metrics: "Current: 4.2/5 (Target: 4.5/5)"
        },
        {
          id: "hr2",
          title: "Implement HR Analytics Dashboard",
          description: "Develop comprehensive HR analytics dashboard for better data-driven decision making and reporting.",
          assignee: "HR Analytics Specialist",
          progress: 45,
          priority: "Medium",
          deadline: "Apr 30, 2025",
          type: "Strategic",
          metrics: "Dashboard completion: 45% (Target: 100%)"
        }
      ]
    },
    {
      id: 2,
      team: "Social Media",
      goals: [
        {
          id: "sm1",
          title: "Increase Social Media Reach",
          description: "Expand social media presence and increase follower engagement across all platforms by 35%.",
          assignee: "Social Media Manager",
          progress: 68,
          priority: "High",
          deadline: "Mar 31, 2025",
          type: "Performance",
          metrics: "Current reach: 125K (Target: 170K)"
        },
        {
          id: "sm2",
          title: "Launch Content Calendar System",
          description: "Implement and optimize content calendar system for better content planning and consistency.",
          assignee: "Content Coordinator",
          progress: 82,
          priority: "Medium",
          deadline: "Jan 15, 2025",
          type: "Process Improvement",
          metrics: "System adoption: 82% (Target: 95%)"
        }
      ]
    },
    {
      id: 3,
      team: "Customer Support",
      goals: [
        {
          id: "cs1",
          title: "Reduce Response Time",
          description: "Decrease average customer support response time from 4 hours to 2 hours while maintaining quality.",
          assignee: "Support Team Lead",
          progress: 60,
          priority: "High",
          deadline: "Feb 15, 2025",
          type: "Performance",
          metrics: "Current: 3.2 hours (Target: 2 hours)"
        },
        {
          id: "cs2",
          title: "Implement Knowledge Base",
          description: "Create comprehensive knowledge base to reduce support ticket volume and improve customer self-service.",
          assignee: "Support Team",
          progress: 40,
          priority: "Medium",
          deadline: "Apr 30, 2025",
          type: "Strategic",
          metrics: "Articles created: 40% (Target: 100%)"
        }
      ]
    },
    {
      id: 4,
      team: "Engineering",
      goals: [
        {
          id: "eng1",
          title: "Improve Code Quality",
          description: "Implement automated code quality checks and reduce technical debt by 25% across all projects.",
          assignee: "Engineering Lead",
          progress: 70,
          priority: "High",
          deadline: "Mar 31, 2025",
          type: "Process Improvement",
          metrics: "Code quality score: 8.5/10 (Target: 9.0/10)"
        },
        {
          id: "eng2",
          title: "Complete API Documentation",
          description: "Finalize comprehensive API documentation for all public endpoints to improve developer experience.",
          assignee: "Technical Writer",
          progress: 55,
          priority: "Medium",
          deadline: "May 31, 2025",
          type: "Development",
          metrics: "Documentation coverage: 55% (Target: 100%)"
        }
      ]
    },
    {
      id: 5,
      team: "Design Team",
      goals: [
        {
          id: "des1",
          title: "Establish Design System",
          description: "Create and implement comprehensive design system for consistent brand identity across all products.",
          assignee: "Design Lead",
          progress: 65,
          priority: "High",
          deadline: "Feb 28, 2025",
          type: "Strategic",
          metrics: "Components created: 65% (Target: 100%)"
        },
        {
          id: "des2",
          title: "Improve Design Process",
          description: "Optimize design workflow and reduce project delivery time by 20% through process improvements.",
          assignee: "Design Team",
          progress: 50,
          priority: "Medium",
          deadline: "Apr 30, 2025",
          type: "Process Improvement",
          metrics: "Current delivery time: 12 days (Target: 10 days)"
        }
      ]
    }
  ]

  // Helper functions for team goals
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-700 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Performance": return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case "Development": return <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
      case "Process Improvement": return <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case "Strategic": return <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
      case "Engagement": return <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
      default: return <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  const getTeamIcon = (team) => {
    switch (team) {
      case "Sales Team": return <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>;
      case "Engineering Team": return <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case "Marketing Team": return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case "HR Team": return <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
      default: return <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
    }
  };

  return (
    <DashboardLayout 
      sidebarConfig={hrDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
      dataTableData={hrData}
    >
      {/* Employee Performance Overview Dashboard */}
      <div className="px-4 lg:px-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Employee Performance Overview
          </h1>
          <p className="text-slate-600 text-sm">
            Analyze employee performance across the organization with key metrics and trends
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger 
              value="performance" 
              className={`data-[state=active]:bg-green-500 data-[state=active]:text-white cursor-pointer`}
            >
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="goals" 
              className={`data-[state=active]:bg-green-500 data-[state=active]:text-white cursor-pointer`}
            >
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Performance Tab Content */}
          <TabsContent value="performance" className="mt-8">
            {isLoadingTrends ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-2 text-slate-600">Loading performance trends...</span>
              </div>
            ) : performanceTrends ? (
              <>
            {/* First Row - Three Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Overall Performance Index Card */}
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                        Overall Performance Index
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-8">
                        <div className="text-5xl font-bold text-slate-900 mb-3">
                          {performanceTrends.OverallPerformanceIndex?.toFixed(1) || 'N/A'}
                        </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span>Current Quarter ({performanceTrends.period})</span>
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <TrendingUp className="h-4 w-4" />
                            <span>+0.2</span>
                      </div>
                    </div>
                  </div>
                  
                      {/* Department Performance Breakdown */}
                      <div className="space-y-4">
                        {performanceTrends.OverallDepartmentPerformance?.map((dept, index) => (
                          <div key={dept.department}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-slate-700">{dept.department}</span>
                              <span className="text-sm font-semibold text-slate-900">
                                {dept.avgScore?.toFixed(1)} ({dept.totalEmployees} employees)
                              </span>
                      </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  dept.avgScore >= 4.5 ? 'bg-green-500' : 
                                  dept.avgScore >= 4.0 ? 'bg-blue-500' : 
                                  dept.avgScore >= 3.5 ? 'bg-yellow-500' : 'bg-orange-500'
                                }`}
                                style={{ width: `${(dept.avgScore / 5) * 100}%` }}
                              ></div>
                      </div>
                    </div>
                        ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers Card */}
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceTrends.topPerformers?.map((performer, index) => {
                      const initials = performer.name.split(' ').map(n => n[0]).join('').toUpperCase();
                      return (
                        <div key={performer.employeeId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {initials}
                        </div>
                        <div>
                              <div className="font-medium text-slate-900">{performer.name}</div>
                              <div className="text-sm text-slate-600">{performer.role} • {performer.department}</div>
                        </div>
                      </div>
                      <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{(performer.score * 20).toFixed(0)}%</div>
                        <div className="text-xs text-slate-500">Performance</div>
                      </div>
                    </div>
                      );
                    })}

                    {/* View All Button */}
                    <button className="w-full mt-4 text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-2 py-2 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                      View All Top Performers
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Department Card */}
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Top Performing Department
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {performanceTrends.TopPerformingDepartment?.department || 'N/A'}
                    </div>
                    <div className="text-2xl font-semibold text-slate-900 mb-1">
                      {performanceTrends.TopPerformingDepartment?.avgScore?.toFixed(1) || 'N/A'}
                    </div>
                    <div className="text-sm text-slate-600 mb-4">
                      Average Score
                    </div>
                    <div className="text-sm text-slate-500">
                      {performanceTrends.TopPerformingDepartment?.totalEmployees || 0} employees
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Low Performers Card */}
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Low Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceTrends.lowPerformers?.map((performer, index) => {
                      const initials = performer.name.split(' ').map(n => n[0]).join('').toUpperCase();
                      return (
                        <div key={performer.employeeId} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {initials}
                        </div>
                        <div>
                              <div className="font-medium text-slate-900">{performer.name}</div>
                              <div className="text-sm text-slate-600">{performer.role} • {performer.department}</div>
                        </div>
                      </div>
                      <div className="text-right">
                            <div className="text-lg font-bold text-orange-600">{(performer.score * 20).toFixed(0)}%</div>
                        <div className="text-xs text-slate-500">Performance</div>
                      </div>
                    </div>
                      );
                    })}

                    {/* View All Button */}
                    <button className="w-full mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center gap-2 py-2 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                      View All Low Performers
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
            </>
            ) : (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No performance data available</h3>
                <p className="text-slate-600">Performance trends data could not be loaded.</p>
              </div>
            )}

            {/* Second Row - Two Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

              {/* Performance Distribution Card */}
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Performance Distribution
                  </CardTitle>
                  <p className="text-sm text-slate-600">Current Quarter Ratings</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-6">
                    {/* Donut Chart */}
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 32 32">
                        {/* Green segment - Outstanding 15% */}
                        <circle
                          cx="16"
                          cy="16"
                          r="14"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeDasharray={`${2 * Math.PI * 14 * 0.15} ${2 * Math.PI * 14}`}
                          strokeDashoffset="0"
                        />
                        {/* Blue segment - Exceeds 35% */}
                        <circle
                          cx="16"
                          cy="16"
                          r="14"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeDasharray={`${2 * Math.PI * 14 * 0.35} ${2 * Math.PI * 14}`}
                          strokeDashoffset={`-${2 * Math.PI * 14 * 0.15}`}
                        />
                        {/* Orange segment - Meets 40% */}
                        <circle
                          cx="16"
                          cy="16"
                          r="14"
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="3"
                          strokeDasharray={`${2 * Math.PI * 14 * 0.40} ${2 * Math.PI * 14}`}
                          strokeDashoffset={`-${2 * Math.PI * 14 * 0.50}`}
                        />
                        {/* Red segment - Below 10% */}
                        <circle
                          cx="16"
                          cy="16"
                          r="14"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="3"
                          strokeDasharray={`${2 * Math.PI * 14 * 0.10} ${2 * Math.PI * 14}`}
                          strokeDashoffset={`-${2 * Math.PI * 14 * 0.90}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-slate-700">Outstanding</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-slate-700">Exceeds</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">35%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-slate-700">Meets</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">40%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-slate-700">Below</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">10%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Goals Achievement Card */}
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Goals Achievement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-slate-900 mb-2">88%</div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <TrendingUp className="h-4 w-4" />
                        <span>+3% from last quarter</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Goals Breakdown */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Revenue Growth</span>
                        <span className="text-sm font-semibold text-slate-900">87% / 100%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Customer Satisfaction</span>
                        <span className="text-sm font-semibold text-slate-900">92% / 95%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Employee Retention</span>
                        <span className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                          94% / 90%
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full transition-all duration-300" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Training Completion</span>
                        <span className="text-sm font-semibold text-slate-900">78% / 85%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Third Row - Department Performance Comparison Card */}
            <div className="mb-8">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Department Performance Comparison
                  </CardTitle>
                  <p className="text-sm text-slate-600">Comprehensive view of performance metrics across all departments</p>
                </CardHeader>
                <CardContent>
                  {/* Bar Chart */}
                  <div className="h-80 bg-slate-50 rounded-lg p-6 mb-6">
                    <div className="flex items-end justify-between h-full">
                      {/* Engineering Department */}
                      <div className="flex items-end gap-1 h-full">
                        <div className="w-8 bg-blue-300 rounded-t" style={{ height: '79%' }} title="Employee Satisfaction: 79%"></div>
                        <div className="w-8 bg-purple-500 rounded-t" style={{ height: '92%' }} title="Performance Score: 92%"></div>
                        <div className="w-8 bg-orange-500 rounded-t" style={{ height: '88%' }} title="Productivity Index: 88%"></div>
                        <div className="w-8 bg-green-500 rounded-t" style={{ height: '95%' }} title="Retention Rate: 95%"></div>
                      </div>
                      
                      {/* Sales Department */}
                      <div className="flex items-end gap-1 h-full">
                        <div className="w-8 bg-blue-300 rounded-t" style={{ height: '72%' }} title="Employee Satisfaction: 72%"></div>
                        <div className="w-8 bg-purple-500 rounded-t" style={{ height: '78%' }} title="Performance Score: 78%"></div>
                        <div className="w-8 bg-orange-500 rounded-t" style={{ height: '85%' }} title="Productivity Index: 85%"></div>
                        <div className="w-8 bg-green-500 rounded-t" style={{ height: '68%' }} title="Retention Rate: 68%"></div>
                      </div>
                      
                      {/* Marketing Department */}
                      <div className="flex items-end gap-1 h-full">
                        <div className="w-8 bg-blue-300 rounded-t" style={{ height: '81%' }} title="Employee Satisfaction: 81%"></div>
                        <div className="w-8 bg-purple-500 rounded-t" style={{ height: '85%' }} title="Performance Score: 85%"></div>
                        <div className="w-8 bg-orange-500 rounded-t" style={{ height: '82%' }} title="Productivity Index: 82%"></div>
                        <div className="w-8 bg-green-500 rounded-t" style={{ height: '89%' }} title="Retention Rate: 89%"></div>
                      </div>
                      
                      {/* HR Department */}
                      <div className="flex items-end gap-1 h-full">
                        <div className="w-8 bg-blue-300 rounded-t" style={{ height: '94%' }} title="Employee Satisfaction: 94%"></div>
                        <div className="w-8 bg-purple-500 rounded-t" style={{ height: '87%' }} title="Performance Score: 87%"></div>
                        <div className="w-8 bg-orange-500 rounded-t" style={{ height: '90%' }} title="Productivity Index: 90%"></div>
                        <div className="w-8 bg-green-500 rounded-t" style={{ height: '92%' }} title="Retention Rate: 92%"></div>
                      </div>
                      
                      {/* Finance Department */}
                      <div className="flex items-end gap-1 h-full">
                        <div className="w-8 bg-blue-300 rounded-t" style={{ height: '76%' }} title="Employee Satisfaction: 76%"></div>
                        <div className="w-8 bg-purple-500 rounded-t" style={{ height: '89%' }} title="Performance Score: 89%"></div>
                        <div className="w-8 bg-orange-500 rounded-t" style={{ height: '83%' }} title="Productivity Index: 83%"></div>
                        <div className="w-8 bg-green-500 rounded-t" style={{ height: '85%' }} title="Retention Rate: 85%"></div>
                      </div>
                      
                      {/* Operations Department */}
                      <div className="flex items-end gap-1 h-full">
                        <div className="w-8 bg-blue-300 rounded-t" style={{ height: '79%' }} title="Employee Satisfaction: 79%"></div>
                        <div className="w-8 bg-purple-500 rounded-t" style={{ height: '86%' }} title="Performance Score: 86%"></div>
                        <div className="w-8 bg-orange-500 rounded-t" style={{ height: '91%' }} title="Productivity Index: 91%"></div>
                        <div className="w-8 bg-green-500 rounded-t" style={{ height: '83%' }} title="Retention Rate: 83%"></div>
                      </div>
                    </div>
                    
                    {/* X-axis labels */}
                    <div className="flex justify-between text-xs text-slate-500 mt-4">
                      <span className="w-32 text-center">Engineering</span>
                      <span className="w-32 text-center">Sales</span>
                      <span className="w-32 text-center">Marketing</span>
                      <span className="w-32 text-center">HR</span>
                      <span className="w-32 text-center">Finance</span>
                      <span className="w-32 text-center">Operations</span>
                    </div>
                  </div>
                  
                  {/* Chart Legend */}
                  <div className="flex items-center justify-center gap-8 mb-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                      <span className="text-slate-600">Employee Satisfaction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-slate-600">Performance Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-slate-600">Productivity Index</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-slate-600">Retention Rate</span>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div className="flex items-center justify-center gap-8 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Top Performer:</span>
                      <span className="font-semibold text-green-600">Engineering</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Most Satisfied:</span>
                      <span className="font-semibold text-blue-600">HR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Needs Attention:</span>
                      <span className="font-semibold text-red-600">Sales Retention</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Goals Tab Content */}
          <TabsContent value="goals" className="mt-8">
            {/* Company Goals Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Company Goals</h2>
              </div>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={openGoalModal}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Goal
              </Button>
            </div>

            {/* Goals Cards */}
            <div className="space-y-6">
              {isLoadingGoals ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                  <span className="ml-2 text-slate-600">Loading goals...</span>
                </div>
              ) : goals.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No goals found</h3>
                  <p className="text-slate-600 mb-4">Get started by creating your first performance goal.</p>
                  <Button onClick={openGoalModal} className="bg-green-600 hover:bg-green-700 text-white">
                    Create First Goal
                  </Button>
                </div>
              ) : (
                goals.map((goal) => (
                  <Card key={goal.id} className="border border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  {/* Goal Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{goal.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                              {goal.description}
                        </p>
                      </div>
                    </div>
                    {/* Status Tags */}
                    <div className="flex flex-col gap-2 ml-4">
                          <Badge variant="secondary" className={`text-xs px-3 py-1 ${
                            goal.priority === 'High Priority' ? 'bg-red-100 text-red-700' :
                            goal.priority === 'Medium Priority' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {goal.priority}
                      </Badge>
                          <Badge variant="secondary" className={`text-xs px-3 py-1 ${
                            goal.status === 'On Track' ? 'bg-blue-100 text-blue-700' :
                            goal.status === 'Needs Attention' ? 'bg-orange-100 text-orange-700' :
                            goal.status === 'Exceeding' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {goal.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">Progress</span>
                          <span className="text-sm font-semibold text-slate-900">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full transition-all duration-300 ${
                              goal.progress >= 80 ? 'bg-green-500' :
                              goal.progress >= 60 ? 'bg-blue-500' :
                              goal.progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                    </div>
                  </div>

                  {/* Goal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                          <span className="text-sm text-slate-600">
                            Deadline: <span className="font-medium text-slate-900">
                              {goal.deadline === 'Ongoing' ? 'Ongoing' : new Date(goal.deadline).toLocaleDateString()}
                            </span>
                          </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                          <span className="text-sm text-slate-600">
                            Owner: <span className="font-medium text-slate-900">{goal.owner}</span>
                          </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">Key Metrics</span>
                            <span className="text-sm font-medium text-slate-900">{goal.metrics}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                        <button 
                          onClick={() => handleEditGoal(goal)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                      Edit
                    </button>
                        <button 
                          onClick={() => handleDeleteGoal(goal.id)}
                          disabled={isDeletingGoal === goal.id}
                          className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 disabled:opacity-50"
                        >
                          {isDeletingGoal === goal.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                      Delete
                    </button>
                  </div>
                </CardContent>
              </Card>
                ))
              )}
            </div>

            {/* Team Goals Section */}
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Team Goals</h2>
              </div>

              {/* Team Goals Data */}
              {teamGoals.map((teamData) => (
                <div key={teamData.id} className="bg-white rounded-[12px] border border-gray-200 shadow-sm mb-6">
                  {/* Team Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-t-[12px] border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      {getTeamIcon(teamData.team)}
                      <h3 className="text-[16px] font-bold text-[#000000]">{teamData.team}</h3>
                      <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                        {teamData.goals.length} Goals
                      </span>
                    </div>
                  </div>

                  {/* Team Goals */}
                  <div className="p-6 space-y-4">
                    {teamData.goals.map((goal, index) => (
                      <div key={goal.id} className={`pb-4 ${index < teamData.goals.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">
                              {getTypeIcon(goal.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-[14px] font-bold text-[#000000] mb-1">{goal.title}</h4>
                              <p className="text-[12px] text-[#000000] leading-normal mb-2">{goal.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getPriorityColor(goal.priority)}`}>
                              {goal.priority}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">Progress</span>
                            <span className="text-xs font-bold text-gray-900">{goal.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                goal.progress >= 80 ? 'bg-green-500' : 
                                goal.progress >= 60 ? 'bg-blue-500' : 
                                goal.progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Goal Details */}
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <div>
                              <p className="text-gray-500">Assignee</p>
                              <p className="font-medium text-gray-900">{goal.assignee}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <p className="text-gray-500">Deadline</p>
                              <p className="font-medium text-gray-900">{goal.deadline}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3 text-gray-500" />
                            <div>
                              <p className="text-gray-500">Key Metrics</p>
                              <p className="font-medium text-gray-900">{goal.metrics}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-3">
                          <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Goal Button */}
                  <div className="pt-4 border-t border-gray-100">
                    <button 
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      onClick={openGoalModal}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add New Goal for {teamData.team}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Goal Creation Modal */}
      <GoalCreationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleCreateGoal}
        initialData={editingGoal}
        isEditing={!!editingGoal}
      />
    </DashboardLayout>
  )
}
