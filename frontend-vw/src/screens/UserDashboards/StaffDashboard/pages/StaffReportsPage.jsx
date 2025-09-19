import React, { useState } from "react";
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";
import { useStandardizedSidebar } from "@/hooks/useStandardizedSidebar";
import {
  Search,
  Filter,
  Eye,
  Download,
  Plus,
  BarChart3,
  Users,
  AlertTriangle,
  FileText,
  MessageSquare,
  X,
} from "lucide-react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

// My Reports data
const myReportsData = [
  {
    id: 1,
    report: "Q4 Performance Review Summary",
    type: "Performance",
    typeIcon: BarChart3,
    department: "Engineering",
    priority: "high",
    status: "completed",
    author: "John Smith",
    created: "Jan 15, 2024",
    dueDate: "Jan 30, 2024",
  },
  {
    id: 2,
    report: "December Attendance Analysis",
    type: "Attendance",
    typeIcon: Users,
    department: "Engineering",
    priority: "medium",
    status: "in progress",
    author: "John Smith",
    created: "Jan 10, 2024",
    dueDate: "Jan 25, 2024",
  },
  {
    id: 3,
    report: "Monthly Task Completion Report",
    type: "General",
    typeIcon: FileText,
    department: "Engineering",
    priority: "low",
    status: "draft",
    author: "John Smith",
    created: "Jan 12, 2024",
    dueDate: "Jan 20, 2024",
  },
];

// Employee Reports data
const employeeReportsData = [
  {
    id: 1,
    report: "Team Collaboration Metrics",
    type: "Performance",
    typeIcon: BarChart3,
    department: "Engineering",
    priority: "medium",
    status: "completed",
    author: "Sarah Johnson",
    created: "Jan 14, 2024",
    dueDate: "Jan 28, 2024",
  },
  {
    id: 2,
    report: "Project Status Update",
    type: "General",
    typeIcon: FileText,
    department: "Engineering",
    priority: "low",
    status: "in progress",
    author: "Mike Chen",
    created: "Jan 11, 2024",
    dueDate: "Jan 26, 2024",
  },
];

// Overtime Reports data
const overtimeReportsData = [
  {
    id: 1,
    employeeId: "EMP001",
    department: "Engineering",
    date: "Jan 15, 2024",
    regularHours: "8h",
    overtimeHours: "4h",
    totalHours: "12h",
    reason: "Critical bug fix for production deploy...",
    manager: "Sarah Johnson",
  },
  {
    id: 2,
    employeeId: "EMP002",
    department: "Engineering",
    date: "Jan 14, 2024",
    regularHours: "8h",
    overtimeHours: "3h",
    totalHours: "11h",
    reason: "Project deadline preparation",
    manager: "Mike Chen",
  },
];

const myReportsSummaryCards = [
  {
    title: "TOTAL REPORTS",
    value: "3",
    change: "+25%",
    trend: "up",
    icon: IconTrendingUp,
    color: "green",
  },
  {
    title: "PENDING REPORTS",
    value: "1",
    change: "+10%",
    trend: "down",
    icon: IconTrendingDown,
    color: "red",
  },
  {
    title: "COMPLETED REPORTS",
    value: "1",
    change: "+20%",
    trend: "up",
    icon: IconTrendingUp,
    color: "green",
  },
  {
    title: "OVERDUE REPORTS",
    value: "0",
    change: "-5%",
    trend: "down",
    icon: IconTrendingDown,
    color: "red",
  },
];

const employeeReportsSummaryCards = [
  {
    title: "TOTAL REPORTS",
    value: "2",
    change: "+15%",
    trend: "up",
    icon: IconTrendingUp,
    color: "green",
  },
  {
    title: "PENDING REPORTS",
    value: "1",
    change: "+5%",
    trend: "down",
    icon: IconTrendingDown,
    color: "red",
  },
  {
    title: "COMPLETED REPORTS",
    value: "1",
    change: "+25%",
    trend: "up",
    icon: IconTrendingUp,
    color: "green",
  },
  {
    title: "OVERDUE REPORTS",
    value: "0",
    change: "-10%",
    trend: "down",
    icon: IconTrendingDown,
    color: "red",
  },
];

const overtimeReportsSummaryCards = [
  {
    title: "TOTAL REPORTS",
    value: "2",
    change: "+20%",
    trend: "up",
    icon: IconTrendingUp,
    color: "green",
  },
  {
    title: "PENDING REPORTS",
    value: "0",
    change: "-15%",
    trend: "down",
    icon: IconTrendingDown,
    color: "red",
  },
  {
    title: "COMPLETED REPORTS",
    value: "2",
    change: "+30%",
    trend: "up",
    icon: IconTrendingUp,
    color: "green",
  },
  {
    title: "OVERDUE REPORTS",
    value: "0",
    change: "-5%",
    trend: "down",
    icon: IconTrendingDown,
    color: "red",
  },
];

export default function StaffReportsPage() {
  const { sidebarConfig } = useStandardizedSidebar();
  const [activeTab, setActiveTab] = useState("my-reports");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    department: "",
    priority: "",
    dueDate: "",
    description: "",
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Safe icon renderer
  const renderIcon = (
    IconComponent,
    className = "w-4 h-4 text-gray-400 mr-2"
  ) => {
    if (IconComponent && typeof IconComponent === "function") {
      return <IconComponent className={className} />;
    }
    return <div className={className} />;
  };

  // Modal handlers
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      title: "",
      type: "",
      department: "",
      priority: "",
      dueDate: "",
      description: "",
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    handleCloseModal();
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "my-reports":
        return myReportsData;
      case "employee-reports":
        return employeeReportsData;
      case "overtime-reports":
        return overtimeReportsData;
      default:
        return myReportsData;
    }
  };

  const getCurrentSummaryCards = () => {
    switch (activeTab) {
      case "my-reports":
        return myReportsSummaryCards;
      case "employee-reports":
        return employeeReportsSummaryCards;
      case "overtime-reports":
        return overtimeReportsSummaryCards;
      default:
        return myReportsSummaryCards;
    }
  };

  const getTableTitle = () => {
    switch (activeTab) {
      case "my-reports":
        return "My Reports";
      case "employee-reports":
        return "Reports from Team Members";
      case "overtime-reports":
        return "Team Overtime Reports";
      default:
        return "My Reports";
    }
  };

  const getReportCount = () => {
    const data = getCurrentData();
    return data.length;
  };

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "overtime-reports":
        return "Search employees, IDs, or departments...";
      default:
        return "Search reports...";
    }
  };

  const filteredReports = getCurrentData().filter((report) => {
    if (activeTab === "overtime-reports") {
      // Overtime reports filtering
      const matchesSearch =
        report.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.manager.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment =
        departmentFilter === "all" ||
        report.department.toLowerCase() === departmentFilter.toLowerCase();

      return matchesSearch && matchesDepartment;
    } else {
      // Regular reports filtering
      const matchesSearch =
        report.report.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        typeFilter === "all" ||
        report.type.toLowerCase() === typeFilter.toLowerCase();
      const matchesStatus =
        statusFilter === "all" ||
        report.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesType && matchesStatus;
    }
  });

  return (
    <StaffDashboardLayout
      sidebarConfig={sidebarConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      {/* Page Header and Navigation */}
      <div className="px-4 lg:px-6">
        {/* Page Header */}
        <div className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600 mt-1">
                View and manage your performance reports and analytics.
              </p>
            </div>
            <Button
              onClick={handleOpenModal}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Report
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger
              value="my-reports"
              className={`data-[state=active]:bg-green-500 data-[state=active]:text-white cursor-pointer`}
            >
              My Reports
            </TabsTrigger>
            <TabsTrigger
              value="employee-reports"
              className={`data-[state=active]:bg-green-500 data-[state=active]:text-white cursor-pointer`}
            >
              Team Reports
            </TabsTrigger>
            <TabsTrigger
              value="overtime-reports"
              className={`data-[state=active]:bg-green-500 data-[state=active]:text-white cursor-pointer`}
            >
              Overtime Reports
            </TabsTrigger>
          </TabsList>

          {/* My Reports Tab Content */}
          {activeTab === "my-reports" && (
            <TabsContent value="my-reports" className="mt-8">
              {/* Summary Cards */}
              <div>
                <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                  {myReportsSummaryCards.map((card, index) => (
                    <Card key={index} className="@container/card relative">
                      <CardHeader>
                        <CardDescription>{card.title}</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                          {card.value}
                        </CardTitle>
                      </CardHeader>
                      <div className="absolute bottom-3 right-3">
                        <Badge
                          variant="secondary"
                          className={
                            card.color === "green"
                              ? "text-green-600 bg-green-50"
                              : "text-red-600 bg-red-50"
                          }
                        >
                          {renderIcon(
                            card.icon,
                            card.color === "green"
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                          {card.change}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Reports Table Section */}
              <div className="mt-6">
                <div className="bg-white rounded-lg border p-6">
                  {/* Table Header */}
                  <div className="mb-6">
                    <div className="mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        My Reports
                      </h3>
                      <div className="flex items-center gap-64">
                        <p className="text-sm text-gray-500">3 reports</p>
                      </div>
                    </div>
                  </div>

                  {/* Search and Filter Bar */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="performance">
                            Performance
                          </SelectItem>
                          <SelectItem value="attendance">Attendance</SelectItem>
                          <SelectItem value="incident">Incident</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="in progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Reports Table */}
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow className="border-b border-gray-200">
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Report
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Type
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Department
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Priority
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Status
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Author
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Created
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Due Date
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-200">
                        {filteredReports.map((report) => {
                          const IconComponent = report.typeIcon;
                          return (
                            <TableRow
                              key={report.id}
                              className="hover:bg-gray-50"
                            >
                              <TableCell className="py-4 px-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {report.report}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <div className="flex items-center">
                                  {renderIcon(IconComponent)}
                                  <span className="text-sm text-gray-900">
                                    {report.type}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span className="text-sm text-gray-900">
                                  {report.department}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                    report.priority
                                  )}`}
                                >
                                  {report.priority}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    report.status
                                  )}`}
                                >
                                  {report.status}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span className="text-sm text-gray-900">
                                  {report.author}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span className="text-sm text-gray-900">
                                  {report.created}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span className="text-sm text-gray-900">
                                  {report.dueDate}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  <button className="w-8 h-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors">
                                    <Eye className="w-4 h-4 text-black" />
                                  </button>
                                  <button className="w-8 h-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors">
                                    <Download className="w-4 h-4 text-black" />
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Employee Reports Tab Content */}
          {activeTab === "employee-reports" && (
            <TabsContent value="employee-reports" className="mt-8">
              {/* Summary Cards */}
              <div>
                <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                  {employeeReportsSummaryCards.map((card, index) => (
                    <Card key={index} className="@container/card relative">
                      <CardHeader>
                        <CardDescription>{card.title}</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                          {card.value}
                        </CardTitle>
                      </CardHeader>
                      <div className="absolute bottom-3 right-3">
                        <Badge
                          variant="secondary"
                          className={
                            card.color === "green"
                              ? "text-green-600 bg-green-50"
                              : "text-red-600 bg-red-50"
                          }
                        >
                          {renderIcon(
                            card.icon,
                            card.color === "green"
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                          {card.change}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Reports Table Section */}
              <div className="mt-6">
                <div className="bg-white rounded-lg border p-6">
                  {/* Table Header */}
                  <div className="mb-6">
                    <div className="mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Reports from Team Members
                      </h3>
                      <div className="flex items-center gap-64">
                        <p className="text-sm text-gray-500">2 reports</p>
                      </div>
                    </div>
                  </div>

                  {/* Search and Filter Bar */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="performance">
                            Performance
                          </SelectItem>
                          <SelectItem value="attendance">Attendance</SelectItem>
                          <SelectItem value="incident">Incident</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="in progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Reports Table */}
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow className="border-b border-gray-200">
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Report
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Type
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Department
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Priority
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Status
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Author
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Created
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Due Date
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-200">
                        {filteredReports.map((report) => {
                          const IconComponent = report.typeIcon;
                          return (
                            <TableRow
                              key={report.id}
                              className="hover:bg-gray-50"
                            >
                              <TableCell className="py-4 px-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {report.report}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <div className="flex items-center">
                                  {renderIcon(IconComponent)}
                                  <span className="text-sm text-gray-900">
                                    {report.type}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span className="text-sm text-gray-900">
                                  {report.department}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                    report.priority
                                  )}`}
                                >
                                  {report.priority}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    report.status
                                  )}`}
                                >
                                  {report.status}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span className="text-sm text-gray-900">
                                  {report.author}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span className="text-sm text-gray-900">
                                  {report.created}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span className="text-sm text-gray-900">
                                  {report.dueDate}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  <button className="w-8 h-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors">
                                    <Eye className="w-4 h-4 text-black" />
                                  </button>
                                  <button className="w-8 h-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors">
                                    <Download className="w-4 h-4 text-black" />
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Overtime Reports Tab Content */}
          {activeTab === "overtime-reports" && (
            <TabsContent value="overtime-reports" className="mt-8">
              {/* Summary Cards */}
              <div>
                <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                  {overtimeReportsSummaryCards.map((card, index) => (
                    <Card key={index} className="@container/card relative">
                      <CardHeader>
                        <CardDescription>{card.title}</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                          {card.value}
                        </CardTitle>
                      </CardHeader>
                      <div className="absolute bottom-3 right-3">
                        <Badge
                          variant="secondary"
                          className={
                            card.color === "green"
                              ? "text-green-600 bg-green-50"
                              : "text-red-600 bg-red-50"
                          }
                        >
                          {renderIcon(
                            card.icon,
                            card.color === "green"
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                          {card.change}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Overtime Reports Table Section */}
              <div className="mt-6">
                <div className="bg-white rounded-lg border p-6">
                  {/* Table Header */}
                  <div className="mb-6">
                    <div className="mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Team Overtime Reports
                      </h3>
                      <div className="flex items-center gap-64">
                        <p className="text-sm text-gray-500">
                          2 overtime records
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Search and Filter Bar */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder={getSearchPlaceholder()}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <Select
                        value={departmentFilter}
                        onValueChange={setDepartmentFilter}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="All Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Department</SelectItem>
                          <SelectItem value="engineering">
                            Engineering
                          </SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="customer support">
                            Customer Support
                          </SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Overtime Reports Table */}
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow className="border-b border-gray-200">
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Employee ID
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Department
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Date
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Regular Hours
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Overtime Hours
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Total Hours
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Reason
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Manager
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-200">
                        {filteredReports.map((report) => (
                          <TableRow
                            key={report.id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="py-4 px-4">
                              <div className="text-sm font-medium text-gray-900">
                                {report.employeeId}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <span className="text-sm text-gray-900">
                                {report.department}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <span className="text-sm text-gray-900">
                                {report.date}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 text-gray-400 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="text-sm text-gray-900">
                                  {report.regularHours}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 text-orange-500 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="text-sm text-orange-500 font-medium">
                                  {report.overtimeHours}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <span className="text-sm text-gray-900">
                                {report.totalHours}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <span className="text-sm text-gray-900">
                                {report.reason}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <span className="text-sm text-gray-900">
                                {report.manager}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center justify-end">
                                <button className="w-8 h-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors">
                                  <MessageSquare className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Create New Report Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-[#0d141c] flex items-center gap-2">
              <FileText className="size-5 text-[#00db12]" />
              Create New Report
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Fill in the details below to create a new report. All fields
              marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Two Column Layout for first 4 fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Report Title */}
                  <div>
                    <label className="text-[14px] font-medium text-[#0d141c] mb-2 block">
                      Report Title *
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter report title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="w-full"
                      required
                    />
                  </div>

                  {/* Report Type */}
                  <div>
                    <label className="text-[14px] font-medium text-[#0d141c] mb-2 block">
                      Report Type *
                    </label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        handleInputChange("type", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="attendance">Attendance</SelectItem>
                        <SelectItem value="incident">Incident</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Department */}
                  <div>
                    <label className="text-[14px] font-medium text-[#0d141c] mb-2 block">
                      Department
                    </label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        handleInputChange("department", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="customer-support">
                          Customer Support
                        </SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority Level */}
                  <div>
                    <label className="text-[14px] font-medium text-[#0d141c] mb-2 block">
                      Priority Level
                    </label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        handleInputChange("priority", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Due Date - Full Width */}
              <div>
                <label className="text-[14px] font-medium text-[#0d141c] mb-2 block">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Report Description - Full Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Description *
                </label>
                <textarea
                  placeholder="Describe the purpose and content of this report..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-6 bg-[#00db12] hover:bg-[#00c010] text-white"
                >
                  Create Report
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </StaffDashboardLayout>
  );
}
