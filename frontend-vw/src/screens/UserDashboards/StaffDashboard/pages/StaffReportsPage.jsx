import React, { useState, useEffect } from "react";
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";
import { useStandardizedSidebar } from "@/hooks/useStandardizedSidebar";
import { useAuth } from "@/hooks/useAuth";
import { reportsApi } from "@/services/reportsApi";
import { toast } from "sonner";
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

// Data will be fetched from API

// Summary cards will be calculated from API data

export default function StaffReportsPage() {
  const { sidebarConfig } = useStandardizedSidebar();
  const { user, accessToken } = useAuth();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // API data state
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReports: 0,
  });
  const [hasMoreReports, setHasMoreReports] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [formData, setFormData] = useState({
    reportTitle: "",
    reportType: "",
    department: "",
    priorityLevel: "",
    reportDescription: "",
    recipients: [],
    sendToHR: false, // New field to track if report should go to HR
  });

  // View modal state
  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch reports from API
  const fetchReports = async (params = {}, append = false) => {
    if (!accessToken) return;

    if (!append) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        department: departmentFilter !== "all" ? departmentFilter : undefined,
        priorityLevel: typeFilter !== "all" ? typeFilter : undefined,
        sortBy: "createdAt",
        sortOrder: "desc", // Most recent first
        ...params,
      };

      console.log("Fetching reports with params:", queryParams);
      const result = await reportsApi.getAllReports(queryParams, accessToken);

      if (result.success) {
        const reportsData = result.data.data || result.data || [];

        if (append) {
          // Append new reports to existing ones
          setReports((prevReports) => [...prevReports, ...reportsData]);
        } else {
          // Replace reports (initial load or filter change)
          setReports(reportsData);
        }

        // Update pagination info
        if (result.data.pagination) {
          setPagination(result.data.pagination);
          setHasMoreReports(
            result.data.pagination.currentPage <
              result.data.pagination.totalPages
          );
        }

        console.log("Reports fetched successfully:", reportsData.length);
        console.log("Reports data:", reportsData);

        // Dispatch event for sidebar count update - count only unread reports
        const allReports = append ? [...reports, ...reportsData] : reportsData;
        const unreadCount = allReports.filter(
          (report) => !report.isRead
        ).length;
        window.dispatchEvent(
          new CustomEvent("reportsCountUpdate", {
            detail: { count: unreadCount },
          })
        );
      } else {
        console.error("Failed to fetch reports:", result.error);
        toast.error(result.error || "Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Error fetching reports");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more reports
  const loadMoreReports = async () => {
    if (!hasMoreReports || loadingMore) return;

    const nextPage = pagination.currentPage + 1;
    await fetchReports({ page: nextPage }, true);
  };

  // Initial data fetch
  useEffect(() => {
    console.log("📊 StaffReportsPage mounted, accessToken:", !!accessToken);
    if (accessToken) {
      fetchReports();
    }
  }, [accessToken, departmentFilter, typeFilter]);

  // Create new report
  const createReport = async (reportData) => {
    if (!accessToken) return { success: false, error: "No access token" };

    setSubmitting(true);
    try {
      // Prepare the report data with recipient information
      const reportPayload = {
        ...reportData,
        // If sendToHR is true, the report will be visible to HR
        // If false, it will only be visible to the creator
        visibility: reportData.sendToHR ? "hr" : "self",
        // Set recipients based on selection
        recipients: reportData.sendToHR ? ["hr"] : [user?._id],
      };

      console.log("Creating report with data:", reportPayload);
      const result = await reportsApi.createReport(reportPayload, accessToken);

      if (result.success) {
        const recipientMessage = reportData.sendToHR
          ? "Report created and sent to HR successfully!"
          : "Report created successfully!";
        toast.success(recipientMessage);
        // Refresh the reports list
        await fetchReports();
        return { success: true, data: result.data };
      } else {
        console.error("Failed to create report:", result.error);
        toast.error(result.error || "Failed to create report");
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error creating report:", error);
      toast.error("Error creating report");
      return { success: false, error: error.message };
    } finally {
      setSubmitting(false);
    }
  };

  // View report details and mark as read
  const handleViewReport = async (reportId) => {
    if (!accessToken) return;

    try {
      console.log(`Viewing report with ID: ${reportId}`);
      const result = await reportsApi.getReportById(reportId, accessToken);

      if (result.success) {
        console.log("Report details:", result.data);
        setSelectedReport(result.data.data);
        setIsViewModalOpen(true);

        // Mark report as read
        await markReportAsRead(reportId);
      } else {
        console.error("Failed to fetch report details:", result.error);
        toast.error(result.error || "Failed to fetch report details");
      }
    } catch (error) {
      console.error("Error fetching report details:", error);
      toast.error("Error fetching report details");
    }
  };

  // Mark report as read
  const markReportAsRead = async (reportId) => {
    if (!accessToken) return;

    try {
      console.log(`Marking report as read: ${reportId}`);
      const result = await reportsApi.markReportAsRead(reportId, accessToken);

      if (result.success) {
        console.log("Report marked as read successfully");
        // Update the reports list to reflect the read status
        setReports((prevReports) =>
          prevReports.map((report) =>
            report._id === reportId ? { ...report, isRead: true } : report
          )
        );
        // Update sidebar count
        updateReportCount();
      } else {
        console.error("Failed to mark report as read:", result.error);
      }
    } catch (error) {
      console.error("Error marking report as read:", error);
    }
  };

  // Update report count for sidebar
  const updateReportCount = () => {
    const unreadCount = reports.filter((report) => !report.isRead).length;
    window.dispatchEvent(
      new CustomEvent("reportsCountUpdate", {
        detail: { count: unreadCount },
      })
    );
  };

  // Delete report
  const handleDeleteReport = async (reportId) => {
    if (!accessToken) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this report? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      console.log(`Deleting report with ID: ${reportId}`);
      const result = await reportsApi.deleteReport(reportId, accessToken);

      if (result.success) {
        toast.success("Report deleted successfully!");
        // Remove the report from the current list
        setReports((prevReports) =>
          prevReports.filter((report) => report._id !== reportId)
        );
        // Update sidebar count
        updateReportCount();
      } else {
        console.error("Failed to delete report:", result.error);
        toast.error(result.error || "Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Error deleting report");
    }
  };

  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase();
    switch (priorityLower) {
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
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "completed":
      case "submitted":
        return "bg-green-100 text-green-800";
      case "in progress":
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
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
  const handleOpenModal = (report = null) => {
    if (report) {
      // Editing existing report
      setFormData({
        reportTitle: report.reportTitle || "",
        reportType: report.reportType || "",
        department: report.department || "",
        priorityLevel: report.priorityLevel || "",
        reportDescription: report.reportDescription || "",
        recipients: report.recipients?.map((r) => r._id || r) || [],
        sendToHR: report.sendToHR || false,
      });
      setSelectedReport(report);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    setFormData({
      reportTitle: "",
      reportType: "",
      department: "",
      priorityLevel: "",
      reportDescription: "",
      recipients: [],
      sendToHR: false, // Default to self
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

    // Validate required fields
    if (!formData.reportTitle || !formData.reportDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if we're editing or creating
    if (selectedReport) {
      // Update existing report
      const result = await reportsApi.updateReport(
        selectedReport._id,
        formData,
        accessToken
      );

      if (result.success) {
        toast.success("Report updated successfully!");
        handleCloseModal();
        fetchReports(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to update report");
      }
    } else {
      // Create new report
      const result = await createReport(formData);

      if (result.success) {
        handleCloseModal();
      }
    }
  };

  // Calculate summary stats from API data
  const calculateSummaryStats = () => {
    const totalReports = reports.length;
    const completedReports = reports.filter(
      (report) => report.status === "completed" || report.status === "submitted"
    ).length;
    const pendingReports = reports.filter(
      (report) => report.status === "pending" || report.status === "in_progress"
    ).length;
    const unreadReports = reports.filter((report) => !report.isRead).length;

    return {
      total: totalReports,
      completed: completedReports,
      pending: pendingReports,
      unread: unreadReports,
    };
  };

  const getCurrentData = () => {
    // For now, return API data for all tabs
    // You can add different logic for different tabs later
    return reports;
  };

  const getCurrentSummaryCards = () => {
    const stats = calculateSummaryStats();

    return [
      {
        title: "TOTAL REPORTS",
        value: stats.total.toString(),
        change: "+25%",
        trend: "up",
        icon: IconTrendingUp,
        color: "green",
      },
      {
        title: "PENDING REPORTS",
        value: stats.pending.toString(),
        change: "+10%",
        trend: "down",
        icon: IconTrendingDown,
        color: "red",
      },
      {
        title: "COMPLETED REPORTS",
        value: stats.completed.toString(),
        change: "+20%",
        trend: "up",
        icon: IconTrendingUp,
        color: "green",
      },
      {
        title: "UNREAD REPORTS",
        value: stats.unread.toString(),
        change: "-5%",
        trend: "down",
        icon: IconTrendingDown,
        color: "red",
      },
    ];
  };

  const getReportCount = () => {
    const data = getCurrentData();
    return data.length;
  };

  const filteredReports = getCurrentData().filter((report) => {
    // API data filtering
    const matchesSearch =
      searchQuery === "" ||
      (report.reportTitle &&
        report.reportTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (report.author &&
        report.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (report.department &&
        report.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      typeFilter === "all" ||
      (report.reportType &&
        report.reportType.toLowerCase() === typeFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (report.status &&
        report.status.toLowerCase() === statusFilter.toLowerCase());

    const matchesDepartment =
      departmentFilter === "all" ||
      (report.department &&
        report.department.toLowerCase() === departmentFilter.toLowerCase());

    return matchesSearch && matchesType && matchesStatus && matchesDepartment;
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

        {/* Reports Content */}
        <div className="mt-8">
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
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="attendance">Attendance</SelectItem>
                      <SelectItem value="incident">Incident</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reports Table */}
              <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded-lg">
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
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-200">
                    {filteredReports.map((report) => {
                      const IconComponent = report.typeIcon || FileText;
                      return (
                        <TableRow
                          key={report._id || report.id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="py-4 px-4">
                            <div className="text-sm font-medium text-gray-900">
                              {report.reportTitle ||
                                report.report ||
                                "Untitled Report"}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <div className="flex items-center">
                              {renderIcon(IconComponent)}
                              <span className="text-sm text-gray-900">
                                {report.reportType || report.type || "General"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <span className="text-sm text-gray-900">
                              {report.department || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                report.priorityLevel || report.priority
                              )}`}
                            >
                              {report.priorityLevel ||
                                report.priority ||
                                "Medium"}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                report.status
                              )}`}
                            >
                              {report.status || "draft"}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <span className="text-sm text-gray-900">
                              {report.author?.firstName &&
                              report.author?.lastName
                                ? `${report.author.firstName} ${report.author.lastName}`
                                : report.author?.firstName ||
                                  report.author?.lastName ||
                                  "Unknown"}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <span className="text-sm text-gray-900">
                              {report.createdAt
                                ? new Date(
                                    report.createdAt
                                  ).toLocaleDateString()
                                : report.created || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  handleViewReport(report._id || report.id)
                                }
                                className={`w-8 h-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors ${
                                  report.isRead ? "opacity-50" : ""
                                }`}
                                title={
                                  report.isRead
                                    ? "Report viewed"
                                    : "View report"
                                }
                              >
                                <Eye className="w-4 h-4 text-black" />
                              </button>
                              {(report.author?._id === user?._id ||
                                report.author === user?._id) && (
                                <button
                                  onClick={() => handleOpenModal(report)}
                                  className="w-8 h-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors"
                                  title="Edit report"
                                >
                                  <Pencil className="w-4 h-4 text-blue-600" />
                                </button>
                              )}
                              {/* Always show delete button for all reports */}
                              <button
                                onClick={() =>
                                  handleDeleteReport(report._id || report.id)
                                }
                                className="w-8 h-8 bg-white border border-gray-300 hover:bg-red-50 rounded-md flex items-center justify-center transition-colors"
                                title="Delete report"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Load More Button */}
              {hasMoreReports && (
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={loadMoreReports}
                    disabled={loadingMore}
                    variant="outline"
                    className="px-6"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More Reports"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create New Report Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-[#0d141c] flex items-center gap-2">
              <FileText className="size-5 text-[#00db12]" />
              {selectedReport ? "Edit Report" : "Create New Report"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Fill in the details below to{" "}
              {selectedReport ? "update" : "create"} a report. All fields marked
              with * are required.
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
                      value={formData.reportTitle}
                      onChange={(e) =>
                        handleInputChange("reportTitle", e.target.value)
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
                      value={formData.reportType}
                      onValueChange={(value) =>
                        handleInputChange("reportType", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Performance">Performance</SelectItem>
                        <SelectItem value="Attendance">Attendance</SelectItem>
                        <SelectItem value="Incident">Incident</SelectItem>
                        <SelectItem value="General">General</SelectItem>
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
                      value={formData.priorityLevel}
                      onValueChange={(value) =>
                        handleInputChange("priorityLevel", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Report Description - Full Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Description *
                </label>
                <textarea
                  placeholder="Describe the purpose and content of this report..."
                  value={formData.reportDescription}
                  onChange={(e) =>
                    handleInputChange("reportDescription", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  required
                />
              </div>

              {/* Recipient Selection - Full Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Recipient
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="send-to-self"
                      name="recipient"
                      value="self"
                      checked={!formData.sendToHR}
                      onChange={() => handleInputChange("sendToHR", false)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <label
                      htmlFor="send-to-self"
                      className="text-sm font-medium text-gray-700"
                    >
                      Keep for myself (Personal Report)
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="send-to-hr"
                      name="recipient"
                      value="hr"
                      checked={formData.sendToHR}
                      onChange={() => handleInputChange("sendToHR", true)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <label
                      htmlFor="send-to-hr"
                      className="text-sm font-medium text-gray-700"
                    >
                      Send to HR Department
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formData.sendToHR
                    ? "This report will be sent to the HR department and will appear in their reports section."
                    : "This report will be kept in your personal reports and will not be shared with HR."}
                </p>
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
                  disabled={submitting}
                  className="px-6 bg-[#00db12] hover:bg-[#00c010] text-white disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {selectedReport ? "Updating..." : "Creating..."}
                    </>
                  ) : selectedReport ? (
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

      {/* View Report Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-[#0d141c]">
              Report Details
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              {/* Report Header */}
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedReport.reportTitle}
                </h2>
                <div className="flex flex-wrap gap-3">
                  <Badge
                    className={getPriorityColor(selectedReport.priorityLevel)}
                  >
                    {selectedReport.priorityLevel} Priority
                  </Badge>
                  <Badge className={getStatusColor(selectedReport.status)}>
                    {selectedReport.status}
                  </Badge>
                  <Badge variant="outline">{selectedReport.reportType}</Badge>
                  <Badge variant="outline">{selectedReport.department}</Badge>
                </div>
              </div>

              {/* Report Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Author</p>
                  <p className="text-base text-gray-900">
                    {selectedReport.author?.firstName &&
                    selectedReport.author?.lastName
                      ? `${selectedReport.author.firstName} ${selectedReport.author.lastName}`
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Created Date
                  </p>
                  <p className="text-base text-gray-900">
                    {selectedReport.createdAt
                      ? new Date(selectedReport.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Due Date</p>
                  <p className="text-base text-gray-900">
                    {selectedReport.dueDate
                      ? new Date(selectedReport.dueDate).toLocaleDateString()
                      : "No due date"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Last Updated
                  </p>
                  <p className="text-base text-gray-900">
                    {selectedReport.updatedAt
                      ? new Date(selectedReport.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Report Description */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">
                  Description
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedReport.reportDescription ||
                      "No description provided"}
                  </p>
                </div>
              </div>

              {/* Recipients */}
              {selectedReport.recipients &&
                selectedReport.recipients.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Recipients
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.recipients.map((recipient, index) => (
                        <Badge key={index} variant="secondary">
                          {recipient.firstName && recipient.lastName
                            ? `${recipient.firstName} ${recipient.lastName}`
                            : recipient.email || "Unknown"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
                {(selectedReport.author?._id === user?._id ||
                  selectedReport.author === user?._id) && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleDeleteReport(selectedReport._id);
                    }}
                  >
                    Delete Report
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StaffDashboardLayout>
  );
}
