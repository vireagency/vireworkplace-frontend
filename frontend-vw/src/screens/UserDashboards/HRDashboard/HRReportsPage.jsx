import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { hrDashboardConfig } from "@/config/dashboardConfigs";
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
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { reportsApi } from "@/services/reportsApi";
import { toast } from "sonner";
import axios from "axios";
import { apiConfig } from "@/config/apiConfig";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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

// All data is now fetched from the API - no mock data needed

export default function HRReportsPage() {
  const { accessToken, user } = useAuth();

  // Debug: Verify component is mounting
  useEffect(() => {
    console.log("✅ HRReportsPage mounted successfully");
    console.log("User:", user);
    console.log("Access Token exists:", !!accessToken);
  }, []);

  const [activeTab, setActiveTab] = useState("my-reports");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    department: "",
    priority: "",
    dueDate: "",
    description: "",
    recipients: [],
  });

  // API State
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReports: 0,
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [recipientSearchQuery, setRecipientSearchQuery] = useState("");

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "bg-red-200 text-red-900";
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

  // Fetch reports on component mount and when filters change
  useEffect(() => {
    if (accessToken) {
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, pagination.currentPage, departmentFilter, priorityFilter]);

  // Fetch reports from API
  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: 10,
        department: departmentFilter !== "all" ? departmentFilter : undefined,
        priorityLevel: priorityFilter !== "all" ? priorityFilter : undefined,
      };

      const result = await reportsApi.getAllReports(params, accessToken);

      if (result.success) {
        setReports(result.data.data || []);
        if (result.data.pagination) {
          setPagination(result.data.pagination);
        }
      } else {
        toast.error(result.error || "Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("An error occurred while fetching reports");
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for recipients dropdown
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await axios.get(`${apiConfig.baseURL}/employees/list`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        const transformedEmployees = response.data.data.map((emp) => ({
          id: emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          role: emp.jobRole,
          department: emp.department,
        }));
        setEmployees(transformedEmployees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees list");
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Modal handlers
  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingReportId(null);
    setIsModalOpen(true);
    fetchEmployees(); // Fetch employees when modal opens
  };

  const handleOpenEditModal = (report) => {
    setIsEditMode(true);
    setEditingReportId(report._id);
    setFormData({
      title: report.reportTitle || "",
      type: report.reportType || "",
      department: report.department || "",
      priority: report.priorityLevel?.toLowerCase() || "",
      dueDate: report.dueDate
        ? new Date(report.dueDate).toISOString().split("T")[0]
        : "",
      description: report.reportDescription || "",
      recipients: report.recipients?.map((r) => r._id || r) || [],
    });
    setIsModalOpen(true);
    fetchEmployees(); // Fetch employees when modal opens for editing
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingReportId(null);
    setFormData({
      title: "",
      type: "",
      department: "",
      priority: "",
      dueDate: "",
      description: "",
      recipients: [],
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description) {
        toast.error("Please fill in all required fields");
        setSubmitting(false);
        return;
      }

      // Map department values to API expected format
      const departmentMap = {
        "human-resources": "Human Resource Management",
        engineering: "Engineering",
        operations: "Operations",
        "customer-support": "Customer Support",
        finance: "Finance",
        marketing: "Marketing",
      };

      // Map form data to API expected format
      const reportData = {
        reportTitle: formData.title.trim(),
        reportDescription: formData.description.trim(),
        department:
          departmentMap[formData.department] ||
          formData.department ||
          "Human Resource Management",
        reportType: formData.type || "General",
        priorityLevel: formData.priority
          ? formData.priority.charAt(0).toUpperCase() +
            formData.priority.slice(1)
          : "Medium",
        dueDate:
          formData.dueDate && formData.dueDate.trim() !== ""
            ? formData.dueDate
            : undefined,
        recipients: Array.isArray(formData.recipients)
          ? formData.recipients
          : [],
      };

      console.log("Submitting report data:", reportData);
      console.log("Form data before mapping:", formData);

      let result;
      if (isEditMode && editingReportId) {
        result = await reportsApi.updateReport(
          editingReportId,
          reportData,
          accessToken
        );
      } else {
        result = await reportsApi.createReport(reportData, accessToken);
      }

      if (result.success) {
        toast.success(
          isEditMode
            ? "Report updated successfully!"
            : "Report created successfully!"
        );
        handleCloseModal();
        fetchReports(); // Refresh the reports list
      } else {
        console.error("Report submission failed:", result);
        const errorMsg =
          result.error ||
          `Failed to ${isEditMode ? "update" : "create"} report`;
        toast.error(errorMsg);

        // Show additional details if available
        if (result.details) {
          console.error("Error details:", result.details);
        }
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("An unexpected error occurred while submitting the report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (
      !confirm(
        "Are you sure you want to delete this report? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const result = await reportsApi.deleteReport(reportId, accessToken);

      if (result.success) {
        toast.success("Report deleted successfully!");
        fetchReports(); // Refresh the reports list
      } else {
        toast.error(result.error || "Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("An error occurred while deleting the report");
    }
  };

  const handleViewReport = async (reportId) => {
    try {
      const result = await reportsApi.getReportById(reportId, accessToken);

      if (result.success) {
        setSelectedReport(result.data.data);
        setIsViewModalOpen(true);
      } else {
        toast.error(result.error || "Failed to fetch report details");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("An error occurred while fetching report details");
    }
  };

  const getCurrentData = () => {
    // All tabs now use real API data
    switch (activeTab) {
      case "my-reports":
        // Filter reports where current user is the author
        return reports.filter(
          (report) =>
            report.author?._id === user?._id || report.author === user?._id
        );
      case "employee-reports":
        // Filter reports where current user is a recipient
        return reports.filter(
          (report) =>
            report.recipients?.some(
              (r) => r._id === user?._id || r === user?._id
            ) || report.author?._id !== user?._id
        );
      case "overtime-reports":
        // For now, show all reports in overtime tab until we have a specific overtime API
        // You can filter by reportType: "overtime" or similar when that API is available
        return reports.filter(
          (report) =>
            report.reportType?.toLowerCase().includes("overtime") ||
            report.reportTitle?.toLowerCase().includes("overtime")
        );
      default:
        return reports;
    }
  };

  const getCurrentSummaryCards = () => {
    const currentData = getCurrentData();
    const totalReports = currentData.length;
    const pendingReports = currentData.filter(
      (r) => r.status === "in progress" || r.status === "draft"
    ).length;
    const completedReports = currentData.filter(
      (r) => r.status === "completed"
    ).length;
    const overdueReports = currentData.filter(
      (r) => r.status === "overdue"
    ).length;

    return [
      {
        title: "TOTAL REPORTS",
        value: totalReports.toString(),
        change: "+36%",
        trend: "up",
        icon: IconTrendingUp,
        color: "green",
      },
      {
        title: "PENDING REPORTS",
        value: pendingReports.toString(),
        change: "+14%",
        trend: "down",
        icon: IconTrendingDown,
        color: "red",
      },
      {
        title: "COMPLETED REPORTS",
        value: completedReports.toString(),
        change: "+34%",
        trend: "up",
        icon: IconTrendingUp,
        color: "green",
      },
      {
        title: "OVERDUE REPORTS",
        value: overdueReports.toString(),
        change: "+36%",
        trend: "down",
        icon: IconTrendingDown,
        color: "red",
      },
    ];
  };

  const getTableTitle = () => {
    switch (activeTab) {
      case "my-reports":
        return "My Reports";
      case "employee-reports":
        return "Reports from Employees";
      case "overtime-reports":
        return "Employee Overtime Reports";
      default:
        return "My Reports";
    }
  };

  const getReportCount = () => {
    const data = getCurrentData();
    return data.length;
  };

  const getSearchPlaceholder = () => {
    return "Search reports...";
  };

  const filteredReports = getCurrentData().filter((report) => {
    // Unified filtering for all tabs using API data structure
    const reportTitle = report.reportTitle || report.report || "";
    const authorName = report.author?.firstName
      ? `${report.author.firstName} ${report.author.lastName}`
      : report.author || "";
    const dept = report.department || "";

    const matchesSearch =
      reportTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === "all" ||
      (report.reportType || report.type || "").toLowerCase() ===
        typeFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      (report.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <DashboardLayout
      sidebarConfig={hrDashboardConfig}
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
                Manage and track all HR reports.
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
              Employee Reports
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
                  {getCurrentSummaryCards().map((card, index) => (
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
                        <p className="text-sm text-gray-500">
                          {filteredReports.length} reports
                        </p>
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
                    {loading ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                      </div>
                    ) : filteredReports.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No reports found</p>
                      </div>
                    ) : (
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
                            const reportType =
                              report.reportType || report.type || "";
                            const getTypeIcon = (type) => {
                              switch (type.toLowerCase()) {
                                case "performance":
                                  return BarChart3;
                                case "attendance":
                                  return Users;
                                case "incident":
                                  return AlertTriangle;
                                default:
                                  return FileText;
                              }
                            };
                            const IconComponent = getTypeIcon(reportType);
                            const authorName = report.author?.firstName
                              ? `${report.author.firstName} ${report.author.lastName}`
                              : "N/A";
                            const createdDate = report.createdAt
                              ? new Date(report.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )
                              : "N/A";
                            const dueDate = report.dueDate
                              ? new Date(report.dueDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )
                              : "N/A";
                            const priority = (
                              report.priorityLevel ||
                              report.priority ||
                              "medium"
                            ).toLowerCase();

                            return (
                              <TableRow
                                key={report._id || report.id}
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="py-4 px-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {report.reportTitle || report.report}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                  <div className="flex items-center">
                                    {renderIcon(IconComponent)}
                                    <span className="text-sm text-gray-900">
                                      {reportType}
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
                                      priority
                                    )}`}
                                  >
                                    {priority}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                  <span className="text-sm text-gray-900">
                                    {authorName}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                  <span className="text-sm text-gray-900">
                                    {createdDate}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                  <span className="text-sm text-gray-900">
                                    {dueDate}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() =>
                                        handleViewReport(report._id)
                                      }
                                      className="w-8 h-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors"
                                      title="View report"
                                    >
                                      <Eye className="w-4 h-4 text-black" />
                                    </button>
                                    {(report.author?._id === user?._id ||
                                      report.author === user?._id) && (
                                      <>
                                        <button
                                          onClick={() =>
                                            handleOpenEditModal(report)
                                          }
                                          className="w-8 h-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors"
                                          title="Edit report"
                                        >
                                          <Pencil className="w-4 h-4 text-blue-600" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteReport(report._id)
                                          }
                                          className="w-8 h-8 bg-white border border-gray-300 hover:bg-red-50 rounded-md flex items-center justify-center transition-colors"
                                          title="Delete report"
                                        >
                                          <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
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
                  {getCurrentSummaryCards().map((card, index) => (
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
                        Reports from Employees
                      </h3>
                      <div className="flex items-center gap-64">
                        <p className="text-sm text-gray-500">
                          {filteredReports.length} reports
                        </p>
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
                    {loading ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                      </div>
                    ) : filteredReports.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No reports found</p>
                      </div>
                    ) : (
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
                            const reportType =
                              report.reportType || report.type || "";
                            const getTypeIcon = (type) => {
                              switch (type.toLowerCase()) {
                                case "performance":
                                  return BarChart3;
                                case "attendance":
                                  return Users;
                                case "incident":
                                  return AlertTriangle;
                                default:
                                  return FileText;
                              }
                            };
                            const IconComponent = getTypeIcon(reportType);
                            const authorName = report.author?.firstName
                              ? `${report.author.firstName} ${report.author.lastName}`
                              : "N/A";
                            const createdDate = report.createdAt
                              ? new Date(report.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )
                              : "N/A";
                            const dueDate = report.dueDate
                              ? new Date(report.dueDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )
                              : "N/A";
                            const priority = (
                              report.priorityLevel ||
                              report.priority ||
                              "medium"
                            ).toLowerCase();

                            return (
                              <TableRow
                                key={report._id || report.id}
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="py-4 px-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {report.reportTitle || report.report}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                  <div className="flex items-center">
                                    {renderIcon(IconComponent)}
                                    <span className="text-sm text-gray-900">
                                      {reportType}
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
                                      priority
                                    )}`}
                                  >
                                    {priority}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                  <span className="text-sm text-gray-900">
                                    {authorName}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                  <span className="text-sm text-gray-900">
                                    {createdDate}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                  <span className="text-sm text-gray-900">
                                    {dueDate}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() =>
                                        handleViewReport(report._id)
                                      }
                                      className="w-8 h-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors"
                                      title="View report"
                                    >
                                      <Eye className="w-4 h-4 text-black" />
                                    </button>
                                    {(report.author?._id === user?._id ||
                                      report.author === user?._id) && (
                                      <>
                                        <button
                                          onClick={() =>
                                            handleOpenEditModal(report)
                                          }
                                          className="w-8 h-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors"
                                          title="Edit report"
                                        >
                                          <Pencil className="w-4 h-4 text-blue-600" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteReport(report._id)
                                          }
                                          className="w-8 h-8 bg-white border border-gray-300 hover:bg-red-50 rounded-md flex items-center justify-center transition-colors"
                                          title="Delete report"
                                        >
                                          <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
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
                  {getCurrentSummaryCards().map((card, index) => (
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
                        Overtime Reports
                      </h3>
                      <div className="flex items-center gap-64">
                        <p className="text-sm text-gray-500">
                          {filteredReports.length} reports
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Search and Filter Bar */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search overtime reports..."
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

                  {/* Overtime Reports Table */}
                  <div className="overflow-x-auto">
                    {loading ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                      </div>
                    ) : filteredReports.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          No overtime reports found
                        </p>
                      </div>
                    ) : (
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
                            const reportType =
                              report.reportType || report.type || "";
                            const getTypeIcon = (type) => {
                              switch (type.toLowerCase()) {
                                case "performance":
                                  return BarChart3;
                                case "attendance":
                                  return Users;
                                case "incident":
                                  return AlertTriangle;
                                default:
                                  return FileText;
                              }
                            };
                            const IconComponent = getTypeIcon(reportType);
                            const authorName = report.author?.firstName
                              ? `${report.author.firstName} ${report.author.lastName}`
                              : "N/A";
                            const createdDate = report.createdAt
                              ? new Date(report.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )
                              : "N/A";
                            const dueDate = report.dueDate
                              ? new Date(report.dueDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )
                              : "N/A";
                            const priority = (
                              report.priorityLevel ||
                              report.priority ||
                              "medium"
                            ).toLowerCase();

                            return (
                              <TableRow
                                key={report._id || report.id}
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="py-4 px-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {report.reportTitle || report.report}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                  <div className="flex items-center">
                                    {renderIcon(IconComponent)}
                                    <span className="text-sm text-gray-900">
                                      {reportType}
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
                                      priority
                                    )}`}
                                  >
                                    {priority}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                  <span className="text-sm text-gray-900">
                                    {authorName}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                  <span className="text-sm text-gray-900">
                                    {createdDate}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                  <span className="text-sm text-gray-900">
                                    {dueDate}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() =>
                                        handleViewReport(report._id)
                                      }
                                      className="w-8 h-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors"
                                      title="View report"
                                    >
                                      <Eye className="w-4 h-4 text-black" />
                                    </button>
                                    {(report.author?._id === user?._id ||
                                      report.author === user?._id) && (
                                      <>
                                        <button
                                          onClick={() =>
                                            handleOpenEditModal(report)
                                          }
                                          className="w-8 h-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors"
                                          title="Edit report"
                                        >
                                          <Pencil className="w-4 h-4 text-blue-600" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteReport(report._id)
                                          }
                                          className="w-8 h-8 bg-white border border-gray-300 hover:bg-red-50 rounded-md flex items-center justify-center transition-colors"
                                          title="Delete report"
                                        >
                                          <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* View Report Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-[#0d141c] flex items-center gap-2">
              <FileText className="size-5 text-[#00db12]" />
              Report Details
            </DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="pt-4 space-y-6">
              {/* Report Title */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Report Title
                </h3>
                <p className="text-base font-semibold text-gray-900">
                  {selectedReport.reportTitle}
                </p>
              </div>

              {/* Report Information Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Type
                  </h3>
                  <p className="text-base text-gray-900">
                    {selectedReport.reportType}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Department
                  </h3>
                  <p className="text-base text-gray-900">
                    {selectedReport.department}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Priority Level
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                      selectedReport.priorityLevel?.toLowerCase()
                    )}`}
                  >
                    {selectedReport.priorityLevel}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Author
                  </h3>
                  <p className="text-base text-gray-900">
                    {selectedReport.author?.firstName
                      ? `${selectedReport.author.firstName} ${selectedReport.author.lastName}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Created Date
                  </h3>
                  <p className="text-base text-gray-900">
                    {selectedReport.createdAt
                      ? new Date(selectedReport.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Due Date
                  </h3>
                  <p className="text-base text-gray-900">
                    {selectedReport.dueDate
                      ? new Date(selectedReport.dueDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "Not set"}
                  </p>
                </div>
              </div>

              {/* Report Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Description
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-base text-gray-900 whitespace-pre-wrap">
                    {selectedReport.reportDescription}
                  </p>
                </div>
              </div>

              {/* Recipients */}
              {selectedReport.recipients &&
                selectedReport.recipients.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Recipients
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.recipients.map((recipient, index) => (
                        <Badge key={index} variant="secondary">
                          {recipient.firstName
                            ? `${recipient.firstName} ${recipient.lastName}`
                            : recipient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6"
                >
                  Close
                </Button>
                {(selectedReport.author?._id === user?._id ||
                  selectedReport.author === user?._id) && (
                  <Button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleOpenEditModal(selectedReport);
                    }}
                    className="px-6 bg-[#00db12] hover:bg-[#00c010] text-white"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Report
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create New Report Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-[#0d141c] flex items-center gap-2">
              <FileText className="size-5 text-[#00db12]" />
              {isEditMode ? "Edit Report" : "Create New Report"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Fill in the details below to {isEditMode ? "update" : "create"} a
              report. All fields marked with * are required.
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
                        <SelectItem value="human-resources">
                          Human Resources
                        </SelectItem>
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

              {/* Assign Recipients - Full Width */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Assign to Recipients (Optional)
                  </label>
                  {formData.recipients.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-700"
                    >
                      {formData.recipients.length} selected
                    </Badge>
                  )}
                </div>

                {loadingEmployees ? (
                  <div className="flex items-center justify-center py-8 border border-gray-200 rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-green-500 mr-2" />
                    <span className="text-sm text-gray-500">
                      Loading employees...
                    </span>
                  </div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-8 border border-gray-200 rounded-lg">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      No employees available
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Search Box for Recipients */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search employees..."
                        value={recipientSearchQuery}
                        onChange={(e) =>
                          setRecipientSearchQuery(e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>

                    <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                      <div className="p-3 space-y-2">
                        {employees
                          .filter((employee) => {
                            if (!recipientSearchQuery) return true;
                            const query = recipientSearchQuery.toLowerCase();
                            return (
                              employee.name.toLowerCase().includes(query) ||
                              employee.role?.toLowerCase().includes(query) ||
                              employee.department
                                ?.toLowerCase()
                                .includes(query) ||
                              employee.email?.toLowerCase().includes(query)
                            );
                          })
                          .map((employee) => (
                            <div
                              key={employee.id}
                              className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors"
                            >
                              <Checkbox
                                id={`employee-${employee.id}`}
                                checked={formData.recipients.includes(
                                  employee.id
                                )}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleInputChange("recipients", [
                                      ...formData.recipients,
                                      employee.id,
                                    ]);
                                  } else {
                                    handleInputChange(
                                      "recipients",
                                      formData.recipients.filter(
                                        (id) => id !== employee.id
                                      )
                                    );
                                  }
                                }}
                                className="mt-1"
                              />
                              <label
                                htmlFor={`employee-${employee.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {employee.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {employee.role} • {employee.department}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {employee.email}
                                  </Badge>
                                </div>
                              </label>
                            </div>
                          ))}
                        {employees.filter((employee) => {
                          if (!recipientSearchQuery) return true;
                          const query = recipientSearchQuery.toLowerCase();
                          return (
                            employee.name.toLowerCase().includes(query) ||
                            employee.role?.toLowerCase().includes(query) ||
                            employee.department
                              ?.toLowerCase()
                              .includes(query) ||
                            employee.email?.toLowerCase().includes(query)
                          );
                        }).length === 0 && (
                          <div className="text-center py-8">
                            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                              No employees match your search
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {formData.recipients.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-600">
                      Selected ({formData.recipients.length}):
                    </span>
                    {formData.recipients.map((recipientId) => {
                      const employee = employees.find(
                        (emp) => emp.id === recipientId
                      );
                      return employee ? (
                        <Badge
                          key={recipientId}
                          variant="secondary"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {employee.name}
                          <button
                            type="button"
                            onClick={() =>
                              handleInputChange(
                                "recipients",
                                formData.recipients.filter(
                                  (id) => id !== recipientId
                                )
                              )
                            }
                            className="ml-2 hover:text-green-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="px-6"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-6 bg-[#00db12] hover:bg-[#00c010] text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : isEditMode ? (
                    "Update Report"
                  ) : (
                    "Create Report"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
