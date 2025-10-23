import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { adminDashboardConfig } from "@/config/dashboardConfigs";
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
  Calendar,
  TrendingUp,
  TrendingDown,
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

export default function AdminReportsPage() {
  const { accessToken, user } = useAuth();

  // Debug: Verify component is mounting
  useEffect(() => {
    console.log("✅ AdminReportsPage mounted successfully");
    console.log("User:", user);
    console.log("Access Token exists:", !!accessToken);
  }, []);

  const [activeTab, setActiveTab] = useState("system-reports");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: "all",
    reportType: "all",
    status: "all",
  });
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewingReport, setIsViewingReport] = useState(false);

  // Mock data for demonstration
  const mockReports = [
    {
      id: 1,
      title: "System Performance Report",
      type: "System",
      status: "Completed",
      createdDate: "2024-01-15",
      generatedBy: "System Admin",
      description: "Comprehensive system performance analysis",
      metrics: {
        uptime: "99.9%",
        responseTime: "120ms",
        errorRate: "0.1%",
        userSatisfaction: "94%",
      },
    },
    {
      id: 2,
      title: "Employee Productivity Report",
      type: "HR",
      status: "Completed",
      createdDate: "2024-01-14",
      generatedBy: "HR Manager",
      description: "Monthly employee productivity analysis",
      metrics: {
        averageProductivity: "87%",
        goalCompletion: "73%",
        attendanceRate: "95%",
        satisfactionScore: "4.2/5",
      },
    },
    {
      id: 3,
      title: "Financial Performance Report",
      type: "Finance",
      status: "In Progress",
      createdDate: "2024-01-13",
      generatedBy: "Finance Manager",
      description: "Quarterly financial performance review",
      metrics: {
        revenue: "$2.4M",
        expenses: "$1.8M",
        profitMargin: "25%",
        growthRate: "12%",
      },
    },
    {
      id: 4,
      title: "Security Audit Report",
      type: "Security",
      status: "Completed",
      createdDate: "2024-01-12",
      generatedBy: "Security Admin",
      description: "Monthly security audit and compliance check",
      metrics: {
        securityScore: "98%",
        vulnerabilities: "2",
        complianceRate: "100%",
        lastAudit: "2024-01-12",
      },
    },
  ];

  useEffect(() => {
    setReports(mockReports);
  }, []);

  const handleCreateReport = async () => {
    setIsCreatingReport(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newReport = {
        id: reports.length + 1,
        title: "New System Report",
        type: "System",
        status: "In Progress",
        createdDate: new Date().toISOString().split("T")[0],
        generatedBy: user?.firstName || "Admin",
        description: "Automatically generated system report",
        metrics: {},
      };

      setReports((prev) => [newReport, ...prev]);
      toast.success("Report generation started");
    } catch (error) {
      toast.error("Failed to create report");
    } finally {
      setIsCreatingReport(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsViewingReport(true);
  };

  const handleDownloadReport = (report) => {
    toast.success(`Downloading ${report.title}...`);
  };

  const handleDeleteReport = (reportId) => {
    setReports((prev) => prev.filter((report) => report.id !== reportId));
    toast.success("Report deleted successfully");
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedFilters.reportType === "all" ||
      report.type === selectedFilters.reportType;
    const matchesStatus =
      selectedFilters.status === "all" ||
      report.status === selectedFilters.status;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <DashboardLayout
      sidebarConfig={adminDashboardConfig}
      showSectionCards={true}
      showChart={true}
      showDataTable={true}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Reports & Analytics
            </h1>
            <p className="text-gray-600">
              Generate and manage system reports and analytics
            </p>
          </div>
          <Button onClick={handleCreateReport} disabled={isCreatingReport}>
            {isCreatingReport ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Generate Report
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reports
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Reports
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.filter((r) => r.status === "Completed").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {reports.length > 0
                  ? Math.round(
                      (reports.filter((r) => r.status === "Completed").length /
                        reports.length) *
                        100
                    )
                  : 0}
                % completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Loader2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.filter((r) => r.status === "In Progress").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently generating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                System Health
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +0.2% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedFilters.reportType}
              onValueChange={(value) =>
                setSelectedFilters((prev) => ({ ...prev, reportType: value }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedFilters.status}
              onValueChange={(value) =>
                setSelectedFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reports Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="system-reports">System Reports</TabsTrigger>
            <TabsTrigger value="hr-reports">HR Reports</TabsTrigger>
            <TabsTrigger value="financial-reports">
              Financial Reports
            </TabsTrigger>
            <TabsTrigger value="security-reports">Security Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="system-reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Reports</CardTitle>
                <CardDescription>
                  Monitor system performance, uptime, and technical metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports
                    .filter((r) => r.type === "System")
                    .map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{report.title}</h4>
                            <Badge
                              variant={
                                report.status === "Completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {report.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {report.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Created: {report.createdDate}</span>
                            <span>By: {report.generatedBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReport(report.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hr-reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>HR Reports</CardTitle>
                <CardDescription>
                  Employee performance, attendance, and HR analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports
                    .filter((r) => r.type === "HR")
                    .map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{report.title}</h4>
                            <Badge
                              variant={
                                report.status === "Completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {report.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {report.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Created: {report.createdDate}</span>
                            <span>By: {report.generatedBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReport(report.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial-reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>
                  Financial performance, budgets, and revenue analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports
                    .filter((r) => r.type === "Finance")
                    .map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{report.title}</h4>
                            <Badge
                              variant={
                                report.status === "Completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {report.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {report.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Created: {report.createdDate}</span>
                            <span>By: {report.generatedBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReport(report.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security-reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Reports</CardTitle>
                <CardDescription>
                  Security audits, compliance, and threat analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports
                    .filter((r) => r.type === "Security")
                    .map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{report.title}</h4>
                            <Badge
                              variant={
                                report.status === "Completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {report.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {report.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Created: {report.createdDate}</span>
                            <span>By: {report.generatedBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReport(report.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Report View Modal */}
      <Dialog open={isViewingReport} onOpenChange={setIsViewingReport}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>{selectedReport?.description}</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Report Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span>{selectedReport.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge
                        variant={
                          selectedReport.status === "Completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {selectedReport.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span>{selectedReport.createdDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generated By:</span>
                      <span>{selectedReport.generatedBy}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Key Metrics</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(selectedReport.metrics || {}).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}:
                          </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewingReport(false)}
                >
                  Close
                </Button>
                <Button onClick={() => handleDownloadReport(selectedReport)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
