import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { hrDashboardConfig } from "@/config/dashboardConfigs";
import hrData from "./hrData.json";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import evaluationsApi from "@/services/evaluations";
import { toast } from "sonner";
import { apiConfig } from "@/config/apiConfig";
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
  Minus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Edit,
} from "lucide-react";
import EvaluationCreator from "./EvaluationCreator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Loading State Component
const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Preparing Evaluation...</p>
    </div>
  </div>
);

// Evaluation Summary Modal Component
const EvaluationSummaryModal = ({ isOpen, onClose, evaluation }) => {
  if (!evaluation) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      submitted: { class: "bg-green-100 text-green-800", text: "Submitted" },
      completed: { class: "bg-green-100 text-green-800", text: "Completed" },
      pending: { class: "bg-yellow-100 text-yellow-800", text: "Pending" },
      in_progress: { class: "bg-blue-100 text-blue-800", text: "In Progress" },
      overdue: { class: "bg-red-100 text-red-800", text: "Overdue" },
    };
    return (
      statusMap[status] || { class: "bg-gray-100 text-gray-800", text: status }
    );
  };

  const statusBadge = getStatusBadge(evaluation.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Evaluation Summary
          </DialogTitle>
          <DialogDescription>
            Detailed overview of the submitted evaluation
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Employee Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Employee Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Employee Name
                </label>
                <p className="text-gray-900 font-medium">
                  {evaluation.employeeName || evaluation.formName || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Department
                </label>
                <p className="text-gray-900">
                  {evaluation.department || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Employee ID
                </label>
                <p className="text-gray-900">
                  {evaluation.employeeId || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Position
                </label>
                <p className="text-gray-900">
                  {evaluation.position || evaluation.jobTitle || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Evaluation Details */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Evaluation Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Evaluation Type
                </label>
                <p className="text-gray-900 font-medium">
                  {evaluation.formType || evaluation.evaluationType || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Submitted Date
                </label>
                <p className="text-gray-900">
                  {formatDate(evaluation.submittedAt || evaluation.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <div className="mt-1">
                  <Badge variant="secondary" className={statusBadge.class}>
                    {statusBadge.text}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Score */}
          {evaluation.score && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performance Score
              </h3>
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold text-blue-600">
                  {evaluation.score}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${evaluation.score}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Overall Performance Rating
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Evaluation Responses */}
          {evaluation.responses && evaluation.responses.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Evaluation Responses
              </h3>
              <div className="space-y-4">
                {evaluation.responses.map((response, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-green-500 pl-4 py-2"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">
                      {response.question ||
                        response.questionText ||
                        `Question ${index + 1}`}
                    </h4>
                    <p className="text-gray-700">
                      {response.answer ||
                        response.response ||
                        "No response provided"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          {evaluation.comments && (
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Comments
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {evaluation.comments}
              </p>
            </div>
          )}

          {/* Evaluation Sections */}
          {evaluation.sections && evaluation.sections.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detailed Responses
              </h3>
              <div className="space-y-6">
                {evaluation.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {section.title}
                    </h4>
                    {section.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {section.description}
                      </p>
                    )}
                    {section.questions && section.questions.length > 0 && (
                      <div className="space-y-3">
                        {section.questions.map((question, questionIndex) => (
                          <div
                            key={questionIndex}
                            className="bg-gray-50 rounded p-3"
                          >
                            <p className="font-medium text-gray-900 mb-2">
                              {question.questionText ||
                                question.text ||
                                `Question ${questionIndex + 1}`}
                            </p>
                            <p className="text-gray-700">
                              {question.answer ||
                                question.response ||
                                "No response provided"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-gray-500">
                  Evaluation ID
                </label>
                <p className="text-gray-900">{evaluation._id || "N/A"}</p>
              </div>
              <div>
                <label className="font-medium text-gray-500">
                  Last Modified
                </label>
                <p className="text-gray-900">
                  {formatDate(
                    evaluation.updatedAt ||
                      evaluation.submittedAt ||
                      evaluation.createdAt
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => {
              // You can add additional actions here if needed
              onClose();
            }}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Export as PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Edit Evaluation Modal Component
const EditEvaluationModal = ({ isOpen, onClose, evaluation, onSave }) => {
  const [formData, setFormData] = useState({
    formName: "",
    description: "",
    formType: "",
    status: "",
    comments: "",
    score: "",
  });

  useEffect(() => {
    if (evaluation) {
      setFormData({
        formName: evaluation.formName || evaluation.employeeName || "",
        description: evaluation.description || "",
        formType: evaluation.formType || "",
        status: evaluation.status || "",
        comments: evaluation.comments || "",
        score: evaluation.score || "",
      });
    }
  }, [evaluation]);

  const handleSave = () => {
    // Here you would typically make an API call to update the evaluation
    console.log("Saving evaluation changes:", formData);
    onSave && onSave({ ...evaluation, ...formData });
    toast.success("Evaluation updated successfully!");
    onClose();
  };

  if (!evaluation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Edit Evaluation
          </DialogTitle>
          <DialogDescription>
            Modify the evaluation details and responses
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Name
              </label>
              <input
                type="text"
                value={formData.formName}
                onChange={(e) =>
                  setFormData({ ...formData, formName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Type
                </label>
                <select
                  value={formData.formType}
                  onChange={(e) =>
                    setFormData({ ...formData, formType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Type</option>
                  <option value="Annual">Annual</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Probation">Probation</option>
                  <option value="Project-Based">Project-Based</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="submitted">Submitted</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) =>
                  setFormData({ ...formData, score: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter score (0-100)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) =>
                  setFormData({ ...formData, comments: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Add additional comments or feedback..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Calendar Modal Component
const CalendarModal = ({ isOpen, onClose, evaluations }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEvaluationsForDate = (date) => {
    return evaluations.filter((evaluation) => {
      if (!evaluation.reviewDeadline) return false;
      const evalDate = new Date(evaluation.reviewDeadline);
      return evalDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Evaluation Calendar
          </DialogTitle>
          <DialogDescription>
            View upcoming evaluation deadlines on the calendar
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <h3 className="text-lg font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(1)}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="border rounded-lg overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-slate-100">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-semibold text-slate-700 border-r last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-[100px] border-r border-b bg-slate-50"
                    ></div>
                  );
                }

                const date = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  day
                );
                const evalsForDay = getEvaluationsForDate(date);
                const isToday =
                  date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={day}
                    className={`min-h-[100px] border-r border-b p-2 ${
                      isToday ? "bg-green-50" : "bg-white"
                    } hover:bg-slate-50 transition-colors`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isToday ? "text-green-600" : "text-slate-700"
                      }`}
                    >
                      {day}
                    </div>

                    <div className="space-y-1">
                      {evalsForDay.map((evaluation, idx) => {
                        const daysUntil = Math.ceil(
                          (date - new Date()) / (1000 * 60 * 60 * 24)
                        );
                        const colorClass =
                          daysUntil < 0
                            ? "bg-red-100 text-red-700 border-red-200"
                            : daysUntil <= 3
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-blue-100 text-blue-700 border-blue-200";

                        return (
                          <div
                            key={evaluation._id || idx}
                            className={`text-xs p-1 rounded border truncate ${colorClass}`}
                            title={`${
                              evaluation.employeeName || evaluation.formName
                            } - ${evaluation.formType || "Evaluation"}`}
                          >
                            {evaluation.employeeName ||
                              evaluation.formName ||
                              "N/A"}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span className="text-slate-600">Overdue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
              <span className="text-slate-600">Due Soon (≤3 days)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-slate-600">Upcoming</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span className="text-slate-600">Today</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function HREvaluationsPage() {
  console.log("HREvaluationsPage component is rendering");

  const { accessToken, user } = useAuth();
  console.log("Access token:", accessToken ? "Present" : "Missing");
  console.log("User:", user);
  const [activeTab, setActiveTab] = useState("overview");
  const [showEvaluationCreator, setShowEvaluationCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showEvaluationSummary, setShowEvaluationSummary] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // API State
  const [evaluations, setEvaluations] = useState([]);
  const [submittedEvaluations, setSubmittedEvaluations] = useState([]);
  const [pendingEvaluations, setPendingEvaluations] = useState([]);
  const [evaluationsLoading, setEvaluationsLoading] = useState(true);
  const [evaluationsError, setEvaluationsError] = useState(null);
  const [statistics, setStatistics] = useState({
    reviewsInProgress: 0,
    reviewsCompleted: 0,
    reviewsOverdue: 0,
    averageScore: 0,
  });

  // Pagination state for each tab
  const [submittedPage, setSubmittedPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [submittedLimit] = useState(10);
  const [pendingLimit] = useState(10);

  // Fetch employee details by ID
  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await axios.get(
        `${apiConfig.baseURL}/employees/${employeeId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.data;
    } catch (error) {
      console.warn(
        `Could not fetch employee details for ${employeeId}:`,
        error.message
      );
      return null;
    }
  };

  // Fetch all evaluations data from API
  const fetchEvaluations = async (isRefresh = false) => {
    if (!accessToken) {
      console.log("No access token available");
      setEvaluationsLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setEvaluationsLoading(true);
      }
      console.log("Fetching evaluations from API...");
      console.log(
        "API Base URL:",
        `${apiConfig.baseURL}/dashboard/hr/evaluations`
      );

      // Fetch all evaluation types in parallel
      const [allEvaluationsResult, staffSubmittedResult, pendingResult] =
        await Promise.all([
          evaluationsApi.getAllEvaluations(accessToken),
          evaluationsApi.getStaffSubmittedEvaluations(accessToken, {
            page: submittedPage,
            limit: submittedLimit,
          }),
          evaluationsApi.getPendingEvaluations(accessToken, {
            page: pendingPage,
            limit: pendingLimit,
            status: "pending",
          }),
        ]);

      // Process all evaluations
      if (allEvaluationsResult.success) {
        console.log(
          "All evaluations fetched successfully:",
          allEvaluationsResult.data
        );
        const evalData = Array.isArray(allEvaluationsResult.data)
          ? allEvaluationsResult.data
          : allEvaluationsResult.data?.data || [];
        setEvaluations(evalData);

        // Calculate statistics will be called after all data is processed
      } else {
        console.error(
          "Failed to fetch all evaluations:",
          allEvaluationsResult.error
        );
        setEvaluations([]);
      }

      // Process staff-submitted evaluations
      if (staffSubmittedResult.success) {
        console.log(
          "Staff-submitted evaluations fetched successfully:",
          staffSubmittedResult.data
        );
        const submittedData = Array.isArray(staffSubmittedResult.data)
          ? staffSubmittedResult.data
          : staffSubmittedResult.data?.data ||
            staffSubmittedResult.data?.submissions ||
            [];

        console.log("Processed submitted evaluations:", submittedData);
        console.log("Submitted evaluations count:", submittedData.length);

        // Also check if any evaluations in the main list are submitted
        if (allEvaluationsResult.success && submittedData.length === 0) {
          const mainEvaluations = Array.isArray(allEvaluationsResult.data)
            ? allEvaluationsResult.data
            : allEvaluationsResult.data?.data || [];

          const submittedFromMain = mainEvaluations.filter(
            (evaluation) =>
              evaluation.status === "submitted" ||
              evaluation.status === "completed"
          );

          if (submittedFromMain.length > 0) {
            console.log(
              "Found submitted evaluations in main list:",
              submittedFromMain
            );
            // Enhance main list submissions with employee details
            const enhancedMainSubmissions = await Promise.all(
              submittedFromMain.map(async (submission) => {
                if (
                  submission.employeeId ||
                  submission.staffId ||
                  submission.submittedBy
                ) {
                  const employeeId =
                    submission.employeeId ||
                    submission.staffId ||
                    submission.submittedBy;
                  const employeeDetails = await fetchEmployeeDetails(
                    employeeId
                  );

                  if (employeeDetails) {
                    return {
                      ...submission,
                      employeeName:
                        employeeDetails.name ||
                        employeeDetails.fullName ||
                        (
                          employeeDetails.firstName +
                          " " +
                          employeeDetails.lastName
                        ).trim(),
                      employeeAvatar:
                        employeeDetails.avatar ||
                        employeeDetails.profileImage ||
                        employeeDetails.photoUrl,
                      department:
                        employeeDetails.department || submission.department,
                      employeeEmail: employeeDetails.email,
                      employeeRole:
                        employeeDetails.role || employeeDetails.jobTitle,
                    };
                  }
                }
                return submission;
              })
            );
            setSubmittedEvaluations(enhancedMainSubmissions);
          } else {
            // Check localStorage as final fallback
            console.log(
              "⚠️ No submitted evaluations from API, checking localStorage..."
            );
            const submittedFromStorage = JSON.parse(
              localStorage.getItem("submittedEvaluations") || "[]"
            );

            if (submittedFromStorage.length > 0) {
              console.log(
                "📱 Found submitted evaluations in localStorage:",
                submittedFromStorage
              );
              setSubmittedEvaluations(submittedFromStorage);
            } else {
              setSubmittedEvaluations(submittedData);
            }
          }
        } else {
          // Enhance submissions with employee details
          const enhancedSubmissions = await Promise.all(
            submittedData.map(async (submission) => {
              // If we have employeeId, fetch employee details
              if (
                submission.employeeId ||
                submission.staffId ||
                submission.submittedBy
              ) {
                const employeeId =
                  submission.employeeId ||
                  submission.staffId ||
                  submission.submittedBy;
                const employeeDetails = await fetchEmployeeDetails(employeeId);

                if (employeeDetails) {
                  return {
                    ...submission,
                    employeeName:
                      employeeDetails.name ||
                      employeeDetails.fullName ||
                      (
                        employeeDetails.firstName +
                        " " +
                        employeeDetails.lastName
                      ).trim(),
                    employeeAvatar:
                      employeeDetails.avatar ||
                      employeeDetails.profileImage ||
                      employeeDetails.photoUrl,
                    department:
                      employeeDetails.department || submission.department,
                    employeeEmail: employeeDetails.email,
                    employeeRole:
                      employeeDetails.role || employeeDetails.jobTitle,
                  };
                }
              }

              // Return original submission if no employee details found
              return submission;
            })
          );

          console.log(
            "Enhanced staff submissions with employee details:",
            enhancedSubmissions
          );
          setSubmittedEvaluations(enhancedSubmissions);
        }
      } else {
        console.error(
          "Failed to fetch staff-submitted evaluations:",
          staffSubmittedResult.error
        );

        // Fallback: check main evaluations for submitted ones
        if (allEvaluationsResult.success) {
          const mainEvaluations = Array.isArray(allEvaluationsResult.data)
            ? allEvaluationsResult.data
            : allEvaluationsResult.data?.data || [];

          const submittedFromMain = mainEvaluations.filter(
            (evaluation) =>
              evaluation.status === "submitted" ||
              evaluation.status === "completed"
          );

          console.log(
            "Fallback: Found submitted evaluations in main list:",
            submittedFromMain
          );
          // Enhance fallback submissions with employee details
          const enhancedFallbackSubmissions = await Promise.all(
            submittedFromMain.map(async (submission) => {
              if (
                submission.employeeId ||
                submission.staffId ||
                submission.submittedBy
              ) {
                const employeeId =
                  submission.employeeId ||
                  submission.staffId ||
                  submission.submittedBy;
                const employeeDetails = await fetchEmployeeDetails(employeeId);

                if (employeeDetails) {
                  return {
                    ...submission,
                    employeeName:
                      employeeDetails.name ||
                      employeeDetails.fullName ||
                      (
                        employeeDetails.firstName +
                        " " +
                        employeeDetails.lastName
                      ).trim(),
                    employeeAvatar:
                      employeeDetails.avatar ||
                      employeeDetails.profileImage ||
                      employeeDetails.photoUrl,
                    department:
                      employeeDetails.department || submission.department,
                    employeeEmail: employeeDetails.email,
                    employeeRole:
                      employeeDetails.role || employeeDetails.jobTitle,
                  };
                }
              }
              return submission;
            })
          );
          setSubmittedEvaluations(enhancedFallbackSubmissions);
        } else {
          // Final fallback: check localStorage
          console.log(
            "⚠️ API completely failed, checking localStorage as final fallback..."
          );
          const submittedFromStorage = JSON.parse(
            localStorage.getItem("submittedEvaluations") || "[]"
          );

          if (submittedFromStorage.length > 0) {
            console.log(
              "📱 Using submitted evaluations from localStorage:",
              submittedFromStorage
            );
            setSubmittedEvaluations(submittedFromStorage);
          } else {
            setSubmittedEvaluations([]);
          }
        }
      }

      // Process pending evaluations
      if (pendingResult.success) {
        console.log(
          "Pending evaluations fetched successfully:",
          pendingResult.data
        );
        const pendingData = Array.isArray(pendingResult.data)
          ? pendingResult.data
          : pendingResult.data?.data || [];
        setPendingEvaluations(pendingData);
      } else {
        console.error(
          "Failed to fetch pending evaluations:",
          pendingResult.error
        );
        setPendingEvaluations([]);
      }

      setEvaluationsError(null);

      // Calculate statistics with all collected data
      const allEvaluations = Array.isArray(allEvaluationsResult.data)
        ? allEvaluationsResult.data
        : allEvaluationsResult.data?.data || [];

      const staffSubmittedData = Array.isArray(staffSubmittedResult.data)
        ? staffSubmittedResult.data
        : staffSubmittedResult.data?.data ||
          staffSubmittedResult.data?.submissions ||
          [];

      const pendingData = Array.isArray(pendingResult.data)
        ? pendingResult.data
        : pendingResult.data?.data || [];

      calculateStatistics(allEvaluations, staffSubmittedData, pendingData);

      // Only show toast for manual refresh, not auto-refresh
      if (isRefresh && !document.hidden) {
        console.log("Evaluations refreshed successfully (silent auto-refresh)");
      }
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      setEvaluationsError("API currently unavailable");
      console.log("Using fallback to show UI without data");

      // Set empty arrays to prevent UI errors
      setEvaluations([]);
      setSubmittedEvaluations([]);
      setPendingEvaluations([]);

      // Reset statistics to show zero values
      setStatistics({
        reviewsInProgress: 0,
        reviewsCompleted: 0,
        reviewsOverdue: 0,
        averageScore: 0,
      });

      if (isRefresh) {
        toast.error("Failed to refresh evaluations");
      }
    } finally {
      setEvaluationsLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    fetchEvaluations();

    // Set up auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(() => {
      console.log("Auto-refreshing HR evaluations...");
      fetchEvaluations(true);
    }, 10000); // 10 seconds for more frequent updates

    return () => clearInterval(interval);
  }, [accessToken, submittedPage, pendingPage, submittedLimit, pendingLimit]);

  // Manual refresh function
  const handleRefresh = async () => {
    console.log("Manual refresh triggered");
    await fetchEvaluations(true);
    toast.success("Evaluations refreshed successfully!");
  };

  // Debug function to check submitted evaluations
  const debugSubmittedEvaluations = () => {
    console.log("🔍 Debugging submitted evaluations...");

    // Check localStorage for submitted evaluations
    const submittedFromStorage = JSON.parse(
      localStorage.getItem("submittedEvaluations") || "[]"
    );
    console.log(
      "📱 Submitted evaluations from localStorage:",
      submittedFromStorage
    );

    // Check current state
    console.log("📊 Current HR evaluations state:", {
      allEvaluations: evaluations.length,
      submittedEvaluations: submittedEvaluations.length,
      pendingEvaluations: pendingEvaluations.length,
      loading: evaluationsLoading,
      refreshing: refreshing,
    });

    return {
      fromStorage: submittedFromStorage,
      fromState: {
        all: evaluations,
        submitted: submittedEvaluations,
        pending: pendingEvaluations,
      },
    };
  };

  // Add global debug function
  useEffect(() => {
    window.debugHREvaluations = debugSubmittedEvaluations;
    window.forceRefreshHR = handleRefresh;
  }, [
    evaluations,
    submittedEvaluations,
    pendingEvaluations,
    evaluationsLoading,
    refreshing,
  ]);

  // Listen for new evaluation submissions
  useEffect(() => {
    const handleNewSubmission = (event) => {
      console.log(
        "📢 Received notification of new evaluation submission:",
        event.detail
      );
      toast.success(`New evaluation submitted by ${event.detail.employeeName}`);

      // Refresh evaluations after a short delay
      setTimeout(() => {
        console.log("🔄 Refreshing HR evaluations due to new submission...");
        handleRefresh();
      }, 1000);
    };

    window.addEventListener("newEvaluationSubmitted", handleNewSubmission);

    return () => {
      window.removeEventListener("newEvaluationSubmitted", handleNewSubmission);
    };
  }, []);

  // Calculate statistics from evaluations data
  const calculateStatistics = (
    evals,
    staffSubmittedEvals = [],
    pendingEvals = []
  ) => {
    console.log("Calculating statistics with data:", {
      allEvaluations: evals?.length || 0,
      staffSubmittedEvaluations: staffSubmittedEvals?.length || 0,
      pendingEvaluations: pendingEvals?.length || 0,
    });

    // For statistics, we need to count:
    // 1. In Progress: evaluations that are pending/assigned but not yet submitted by staff
    // 2. Completed: evaluations that have been submitted by staff
    // 3. Overdue: evaluations past their deadline that haven't been submitted

    const allEvals = Array.isArray(evals) ? evals : [];
    const staffSubmissions = Array.isArray(staffSubmittedEvals)
      ? staffSubmittedEvals
      : [];
    const pendingEvalsArray = Array.isArray(pendingEvals) ? pendingEvals : [];

    // Get submitted evaluation IDs from staff submissions
    const submittedIds = new Set(
      staffSubmissions.map((s) => s.evaluationId || s._id || s.id)
    );

    console.log(
      "Submitted evaluation IDs from staff:",
      Array.from(submittedIds)
    );

    // Count in progress: evaluations that exist but haven't been submitted by staff
    const inProgress = allEvals.filter((evaluation) => {
      const evalId = evaluation._id || evaluation.id;
      return (
        !submittedIds.has(evalId) &&
        (evaluation.status === "pending" ||
          evaluation.status === "assigned" ||
          evaluation.status === "in_progress")
      );
    }).length;

    // Count completed: evaluations that have been submitted by staff
    const completed = staffSubmissions.length;

    // Count overdue: evaluations past deadline that haven't been submitted
    const now = new Date();
    const overdue = allEvals.filter((evaluation) => {
      const evalId = evaluation._id || evaluation.id;
      const dueDate = evaluation.reviewDeadline || evaluation.dueDate;
      const isPastDeadline = dueDate && new Date(dueDate) < now;
      const notSubmitted = !submittedIds.has(evalId);
      return isPastDeadline && notSubmitted;
    }).length;

    // Calculate average score from staff submissions
    const completedWithScores = staffSubmissions.filter(
      (s) => s.score || s.overallScore || s.rating
    );

    const avgScore =
      completedWithScores.length > 0
        ? Math.round(
            completedWithScores.reduce(
              (sum, s) => sum + (s.score || s.overallScore || s.rating || 0),
              0
            ) / completedWithScores.length
          )
        : 0;

    console.log("Calculated statistics:", {
      inProgress,
      completed,
      overdue,
      avgScore,
      completedWithScores: completedWithScores.length,
      submittedIds: Array.from(submittedIds),
      totalEvaluations: allEvals.length,
    });

    setStatistics({
      reviewsInProgress: inProgress,
      reviewsCompleted: completed,
      reviewsOverdue: overdue,
      averageScore: avgScore,
    });
  };

  const handleNewEvaluation = () => {
    setIsLoading(true);
    // Simulate a brief loading state to show the loading UI
    setTimeout(() => {
      setShowEvaluationCreator(true);
      setIsLoading(false);
    }, 1000); // 1 second loading state
  };

  const handleBackToEvaluations = () => {
    setShowEvaluationCreator(false);
    // Refresh evaluations when returning from creator
    if (accessToken) {
      setEvaluationsLoading(true);
      evaluationsApi
        .getAllEvaluations(accessToken)
        .then((result) => {
          if (result.success) {
            const evalData = Array.isArray(result.data)
              ? result.data
              : result.data?.data || [];
            setEvaluations(evalData);
            calculateStatistics(evalData);
          } else {
            setEvaluations([]);
          }
        })
        .catch((error) => {
          console.error("Error refreshing evaluations:", error);
          setEvaluations([]);
        })
        .finally(() => {
          setEvaluationsLoading(false);
        });
    }
  };

  // Helper functions to filter and format evaluations
  const getRecentSubmissions = () => {
    console.log("Getting recent submissions with data:", {
      submittedEvaluations: submittedEvaluations?.length || 0,
      allEvaluations: evaluations?.length || 0,
    });

    // Use the submittedEvaluations from the API call
    if (submittedEvaluations && submittedEvaluations.length > 0) {
      const sorted = submittedEvaluations.sort(
        (a, b) =>
          new Date(b.submittedAt || b.createdAt || b.updatedAt) -
          new Date(a.submittedAt || a.createdAt || a.updatedAt)
      );
      console.log(
        "Recent submissions from staff-submitted evaluations:",
        sorted.length
      );
      return sorted;
    }

    // Fallback to filtering from all evaluations if API didn't return data
    const filtered = evaluations.filter(
      (e) => e.status === "submitted" || e.status === "completed"
    );

    const sorted = filtered.sort(
      (a, b) =>
        new Date(b.submittedAt || b.createdAt || b.updatedAt) -
        new Date(a.submittedAt || a.createdAt || a.updatedAt)
    );

    console.log(
      "Recent submissions from all evaluations (fallback):",
      sorted.length
    );
    return sorted.slice(0, 5);
  };

  const getUpcomingDeadlines = () => {
    // Use the pendingEvaluations from the API call
    if (pendingEvaluations && pendingEvaluations.length > 0) {
      return pendingEvaluations.sort(
        (a, b) => new Date(a.reviewDeadline) - new Date(b.reviewDeadline)
      );
    }

    // Fallback to filtering from all evaluations if API didn't return data
    return evaluations
      .filter(
        (e) =>
          (e.status === "pending" || e.status === "overdue") && e.reviewDeadline
      )
      .sort((a, b) => new Date(a.reviewDeadline) - new Date(b.reviewDeadline))
      .slice(0, 10);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      submitted: { class: "bg-green-100 text-green-800", text: "Submitted" },
      completed: { class: "bg-green-100 text-green-800", text: "Completed" },
      pending: { class: "bg-yellow-100 text-yellow-800", text: "Pending" },
      in_progress: { class: "bg-blue-100 text-blue-800", text: "In Progress" },
      overdue: { class: "bg-red-100 text-red-800", text: "Overdue" },
    };
    return (
      statusMap[status] || { class: "bg-gray-100 text-gray-800", text: status }
    );
  };

  const getInitials = (name) => {
    if (!name) return "N/A";
    const parts = name.split(" ");
    return parts
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
  };

  // Handle viewing evaluation summary
  const handleViewEvaluation = (evaluation) => {
    console.log("Viewing evaluation summary:", evaluation);
    setSelectedEvaluation(evaluation);
    setShowEvaluationSummary(true);
  };

  // Handle editing evaluation
  const handleEditEvaluation = (evaluation) => {
    console.log("Editing evaluation:", evaluation);
    setSelectedEvaluation(evaluation);
    setShowEditModal(true);
  };

  // Handle downloading evaluation as PDF
  const handleDownloadEvaluation = (evaluation) => {
    console.log("Downloading evaluation as PDF:", evaluation);

    // Generate PDF content
    const generatePDFContent = () => {
      const evaluationData = {
        employeeName: evaluation.employeeName || evaluation.formName || "N/A",
        department: evaluation.department || "N/A",
        evaluationType:
          evaluation.formType || evaluation.evaluationType || "N/A",
        submittedDate: evaluation.submittedAt || evaluation.createdAt || "N/A",
        score: evaluation.score || "N/A",
        status: evaluation.status || "N/A",
        responses: evaluation.responses || [],
        comments: evaluation.comments || "No comments",
      };

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Evaluation Report - ${evaluationData.employeeName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #04b435; padding-bottom: 20px; margin-bottom: 30px; }
            .company-logo { font-size: 24px; font-weight: bold; color: #04b435; }
            .report-title { font-size: 20px; color: #333; margin-top: 10px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; border-left: 4px solid #04b435; padding-left: 10px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .info-item { padding: 10px; background: #f8f9fa; border-radius: 5px; }
            .info-label { font-weight: bold; color: #555; }
            .info-value { color: #333; margin-top: 5px; }
            .status-badge { 
              display: inline-block; 
              padding: 4px 12px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: bold;
              ${
                evaluationData.status === "submitted"
                  ? "background: #d4edda; color: #155724;"
                  : evaluationData.status === "completed"
                  ? "background: #d1ecf1; color: #0c5460;"
                  : "background: #f8d7da; color: #721c24;"
              }
            }
            .responses-section { margin-top: 20px; }
            .response-item { margin-bottom: 15px; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px; }
            .response-question { font-weight: bold; color: #333; margin-bottom: 8px; }
            .response-answer { color: #555; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-logo">Vire Workplace</div>
            <div class="report-title">Employee Performance Evaluation Report</div>
          </div>

          <div class="section">
            <div class="section-title">Evaluation Overview</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Employee Name</div>
                <div class="info-value">${evaluationData.employeeName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Department</div>
                <div class="info-value">${evaluationData.department}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Evaluation Type</div>
                <div class="info-value">${evaluationData.evaluationType}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Submitted Date</div>
                <div class="info-value">${evaluationData.submittedDate}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Score</div>
                <div class="info-value">${evaluationData.score}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">
                  <span class="status-badge">${evaluationData.status.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          ${
            evaluationData.responses.length > 0
              ? `
          <div class="section">
            <div class="section-title">Evaluation Responses</div>
            <div class="responses-section">
              ${evaluationData.responses
                .map(
                  (response, index) => `
                <div class="response-item">
                  <div class="response-question">${
                    response.question || `Question ${index + 1}`
                  }</div>
                  <div class="response-answer">${
                    response.answer ||
                    response.response ||
                    "No response provided"
                  }</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }

          ${
            evaluationData.comments
              ? `
          <div class="section">
            <div class="section-title">Additional Comments</div>
            <div style="padding: 15px; background: #f8f9fa; border-radius: 5px;">
              ${evaluationData.comments}
            </div>
          </div>
          `
              : ""
          }

          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} | Vire Workplace HR Management System</p>
          </div>
        </body>
        </html>
      `;

      return htmlContent;
    };

    try {
      // Create a new window with the HTML content
      const printWindow = window.open("", "_blank");
      printWindow.document.write(generatePDFContent());
      printWindow.document.close();

      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        printWindow.print();
        // Close the window after printing
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };

      toast.success(
        `PDF download initiated for ${
          evaluation.employeeName || evaluation.formName
        }`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  // Handle sending reminder
  const handleSendReminder = (evaluation) => {
    console.log("Sending reminder for evaluation:", evaluation);
    // TODO: Implement actual reminder functionality
    toast.success(
      `Reminder sent to ${evaluation.employeeName || evaluation.formName}`
    );
  };

  // If loading, show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // If evaluation creator is active, show it instead of the evaluations overview
  if (showEvaluationCreator) {
    console.log("Showing EvaluationCreator component");
    return <EvaluationCreator onBack={handleBackToEvaluations} />;
  }

  console.log("Rendering main HREvaluationsPage content");

  try {
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
                <h1 className="text-3xl font-bold text-slate-900">
                  Evaluations Overview
                </h1>
                <p className="text-slate-600">
                  Manage and track employee performance evaluations
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>Refresh</span>
                    </>
                  )}
                </Button>
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
          {evaluationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-slate-600">
                Loading evaluation metrics...
              </span>
            </div>
          ) : (
            <>
              {evaluationsError && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600">⚠️</span>
                    <p className="text-sm text-yellow-800">
                      Unable to load evaluation data from server. Showing page
                      without live data.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Reviews in Progress */}
                <Card className="@container/card relative">
                  <CardHeader>
                    <CardDescription>Reviews in Progress</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {statistics.reviewsInProgress}
                    </CardTitle>
                  </CardHeader>
                  <div className="absolute bottom-3 right-3">
                    <Badge
                      variant="secondary"
                      className="text-green-600 bg-green-50"
                    >
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
                      {statistics.reviewsCompleted}
                    </CardTitle>
                  </CardHeader>
                  <div className="absolute bottom-3 right-3">
                    <Badge
                      variant="secondary"
                      className="text-green-600 bg-green-50"
                    >
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
                      {statistics.reviewsOverdue}
                    </CardTitle>
                  </CardHeader>
                  <div className="absolute bottom-3 right-3">
                    <Badge
                      variant="secondary"
                      className="text-red-600 bg-red-50"
                    >
                      <IconTrendingDown className="text-red-600" />
                      {statistics.reviewsOverdue > 0
                        ? "Needs Attention"
                        : "On Track"}
                    </Badge>
                  </div>
                </Card>

                {/* Average Score */}
                <Card className="@container/card relative">
                  <CardHeader>
                    <CardDescription>Average Score</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {statistics.averageScore}
                    </CardTitle>
                  </CardHeader>
                  <div className="absolute bottom-3 right-3">
                    <Badge
                      variant="secondary"
                      className="text-green-600 bg-green-50"
                    >
                      <IconTrendingUp className="text-green-600" />
                      +3.2%
                    </Badge>
                  </div>
                </Card>
              </div>
            </>
          )}

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
                    <Button
                      variant="link"
                      className="text-sm p-0 h-auto cursor-pointer"
                      onClick={() => setActiveTab("recent")}
                    >
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {evaluationsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                      </div>
                    ) : getRecentSubmissions().length > 0 ? (
                      <div className="space-y-3">
                        {getRecentSubmissions()
                          .slice(0, 3)
                          .map((evaluation, index) => {
                            const statusBadge = getStatusBadge(
                              evaluation.status
                            );
                            return (
                              <div
                                key={evaluation._id || index}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {evaluation.employeeName ||
                                      evaluation.formName ||
                                      "N/A"}
                                  </p>
                                  <p className="text-sm text-slate-600">
                                    {evaluation.formType ||
                                      evaluation.evaluationType ||
                                      "Evaluation"}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {formatDate(
                                      evaluation.submittedAt ||
                                        evaluation.createdAt
                                    )}
                                  </p>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className={statusBadge.class}
                                >
                                  {statusBadge.text}
                                </Badge>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        <p className="text-sm">No recent submissions</p>
                      </div>
                    )}
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
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 h-auto py-3"
                    >
                      <Star className="h-4 w-4" />
                      Schedule Team Reviews
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 h-auto py-3"
                    >
                      <ScrollText className="h-4 w-4" />
                      Generate Performance Reports
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 h-auto py-3"
                    >
                      <HeartPulse className="h-4 w-4" />
                      Send Feedback Requests
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 h-auto py-3"
                    >
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
                          <span className="font-medium text-slate-900">
                            Engineering
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">
                            2 evaluations
                          </p>
                          <p className="text-sm font-medium text-slate-900">
                            Avg Score: 75
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-slate-900">
                            Marketing
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">
                            1 evaluations
                          </p>
                          <p className="text-sm font-medium text-slate-900">
                            Avg Score: 92
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                          <span className="font-medium text-slate-900">
                            Design
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">
                            1 evaluations
                          </p>
                          <p className="text-sm font-medium text-slate-900">
                            Avg Score: 78
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                          <span className="font-medium text-slate-900">
                            Sales
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">
                            1 evaluations
                          </p>
                          <p className="text-sm font-medium text-slate-900">
                            Avg Score: 88
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Second Row: Upcoming Deadlines */}
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Upcoming Deadlines
                    </h3>
                    <p className="text-sm text-slate-500">
                      {getUpcomingDeadlines().length} evaluations pending
                    </p>
                  </div>
                  <Button
                    variant="link"
                    className="flex items-center gap-2 text-sm p-0 h-auto"
                    onClick={() => setShowCalendar(true)}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    View Calendar
                  </Button>
                </div>

                {evaluationsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-slate-600">
                      Loading deadlines...
                    </span>
                  </div>
                ) : getUpcomingDeadlines().length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getUpcomingDeadlines()
                      .slice(0, 6)
                      .map((evaluation, index) => {
                        const daysUntilDeadline = evaluation.reviewDeadline
                          ? Math.ceil(
                              (new Date(evaluation.reviewDeadline) -
                                new Date()) /
                                (1000 * 60 * 60 * 24)
                            )
                          : null;

                        const priorityColor =
                          daysUntilDeadline <= 3
                            ? "bg-red-500"
                            : daysUntilDeadline <= 7
                            ? "bg-orange-500"
                            : daysUntilDeadline <= 14
                            ? "bg-yellow-500"
                            : "bg-green-500";

                        return (
                          <Card key={evaluation._id || index}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`h-3 w-3 ${priorityColor} rounded-full mt-1 flex-shrink-0`}
                                ></div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 truncate">
                                    {evaluation.employeeName ||
                                      evaluation.formName ||
                                      "N/A"}
                                  </p>
                                  <p className="text-sm text-slate-600 truncate">
                                    {evaluation.formType ||
                                      evaluation.evaluationType ||
                                      "Evaluation"}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-slate-500">
                                      {formatDate(evaluation.reviewDeadline)}
                                    </p>
                                    {daysUntilDeadline !== null && (
                                      <span
                                        className={`text-xs font-medium ${
                                          daysUntilDeadline < 0
                                            ? "text-red-600"
                                            : daysUntilDeadline <= 3
                                            ? "text-orange-600"
                                            : "text-slate-600"
                                        }`}
                                      >
                                        {daysUntilDeadline < 0
                                          ? `${Math.abs(
                                              daysUntilDeadline
                                            )}d overdue`
                                          : daysUntilDeadline === 0
                                          ? "Due today"
                                          : `${daysUntilDeadline}d left`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8">
                      <div className="text-center text-slate-500">
                        <svg
                          className="w-12 h-12 mx-auto mb-3 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm font-medium">
                          No upcoming deadlines
                        </p>
                        <p className="text-xs mt-1">
                          All evaluations are up to date
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                      <svg
                        className="h-4 w-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
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
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L6.293 13H1a1 1 0 01-1-1V4z"
                      />
                    </svg>
                    More Filters
                  </Button>
                </div>
              </div>

              {/* Recent Submissions Table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-semibold">
                    Recent Submissions ({getRecentSubmissions().length})
                  </CardTitle>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-slate-600 cursor-pointer"
                  >
                    Sort by Score
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    {evaluationsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-slate-600">
                          Loading submissions...
                        </span>
                      </div>
                    ) : getRecentSubmissions().length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-slate-500">No submissions found</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-slate-200">
                            <TableHead className="text-left py-3 px-4">
                              <input
                                type="checkbox"
                                className="rounded border-slate-300"
                              />
                            </TableHead>
                            <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                              Employee
                              <svg
                                className="inline ml-1 h-4 w-4 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                />
                              </svg>
                            </TableHead>
                            <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                              Evaluation Type
                            </TableHead>
                            <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                              Date
                              <svg
                                className="inline ml-1 h-4 w-4 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                />
                              </svg>
                            </TableHead>
                            <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                              Score
                              <svg
                                className="inline ml-1 h-4 w-4 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                />
                              </svg>
                            </TableHead>
                            <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                              Status
                            </TableHead>
                            <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                              Department
                            </TableHead>
                            <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100">
                          {getRecentSubmissions().map((evaluation) => {
                            const statusBadge = getStatusBadge(
                              evaluation.status
                            );
                            const initials = getInitials(
                              evaluation.employeeName || evaluation.formName
                            );
                            const score = evaluation.score || 0;

                            return (
                              <TableRow
                                key={evaluation._id}
                                className="hover:bg-slate-50"
                              >
                                <TableCell className="py-3 px-4">
                                  <input
                                    type="checkbox"
                                    className="rounded border-slate-300"
                                  />
                                </TableCell>
                                <TableCell className="py-3 px-4">
                                  <div className="flex items-center space-x-3">
                                    {evaluation.employeeAvatar ? (
                                      <img
                                        src={evaluation.employeeAvatar}
                                        alt={
                                          evaluation.employeeName || "Employee"
                                        }
                                        className="h-10 w-10 rounded-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                          e.target.nextSibling.style.display =
                                            "flex";
                                        }}
                                      />
                                    ) : null}
                                    <div
                                      className={`h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm ${
                                        evaluation.employeeAvatar
                                          ? "hidden"
                                          : ""
                                      }`}
                                    >
                                      {initials}
                                    </div>
                                    <div>
                                      <div className="font-medium text-slate-900">
                                        {evaluation.employeeName ||
                                          evaluation.formName ||
                                          "N/A"}
                                      </div>
                                      <div className="text-sm text-slate-500">
                                        {evaluation.employeeRole ||
                                          evaluation.department ||
                                          "N/A"}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-3 px-4 text-slate-900">
                                  {evaluation.formType ||
                                    evaluation.evaluationType ||
                                    "N/A"}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-slate-900">
                                  {formatDate(
                                    evaluation.submittedAt ||
                                      evaluation.createdAt
                                  )}
                                </TableCell>
                                <TableCell className="py-3 px-4">
                                  {score > 0 ? (
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium text-slate-900">
                                        {score}
                                      </span>
                                      <div className="w-16 bg-slate-200 rounded-full h-2">
                                        <div
                                          className="bg-purple-500 h-2 rounded-full"
                                          style={{ width: `${score}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-3 px-4">
                                  <Badge
                                    variant="secondary"
                                    className={statusBadge.class}
                                  >
                                    {statusBadge.text}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-3 px-4 text-slate-600">
                                  {evaluation.department || "N/A"}
                                </TableCell>
                                <TableCell className="py-3 px-4">
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                                      title="View Evaluation"
                                      onClick={() =>
                                        handleViewEvaluation(evaluation)
                                      }
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 cursor-pointer hover:bg-green-50 hover:text-green-600"
                                      title="Edit Evaluation"
                                      onClick={() =>
                                        handleEditEvaluation(evaluation)
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 cursor-pointer hover:bg-purple-50 hover:text-purple-600"
                                      title="Download Evaluation"
                                      onClick={() =>
                                        handleDownloadEvaluation(evaluation)
                                      }
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </div>

                  {/* Pagination Controls for Submitted Evaluations */}
                  {submittedEvaluations && submittedEvaluations.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                      <div className="text-sm text-slate-600">
                        Showing page {submittedPage}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSubmittedPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={submittedPage === 1}
                          className="cursor-pointer"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSubmittedPage((prev) => prev + 1)}
                          disabled={
                            submittedEvaluations.length < submittedLimit
                          }
                          className="cursor-pointer"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upcoming" className="mt-6">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Upcoming Deadlines
                  </h3>
                  <p className="text-sm text-slate-500">
                    {getUpcomingDeadlines().length} evaluations need attention
                  </p>
                </div>
                <Button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                    />
                  </svg>
                  Send Reminders
                </Button>
              </div>

              {/* Upcoming Deadlines Cards/Table */}
              {evaluationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-slate-600">
                    Loading upcoming deadlines...
                  </span>
                </div>
              ) : getUpcomingDeadlines().length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {getUpcomingDeadlines().map((evaluation, index) => {
                    const daysUntilDeadline = evaluation.reviewDeadline
                      ? Math.ceil(
                          (new Date(evaluation.reviewDeadline) - new Date()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : null;

                    const priorityConfig =
                      daysUntilDeadline < 0
                        ? {
                            color: "bg-red-500",
                            text: "Overdue",
                            textColor: "text-red-600",
                          }
                        : daysUntilDeadline <= 3
                        ? {
                            color: "bg-red-500",
                            text: "High",
                            textColor: "text-red-600",
                          }
                        : daysUntilDeadline <= 7
                        ? {
                            color: "bg-orange-500",
                            text: "Medium",
                            textColor: "text-orange-600",
                          }
                        : {
                            color: "bg-green-500",
                            text: "Low",
                            textColor: "text-green-600",
                          };

                    return (
                      <Card
                        key={evaluation._id || index}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Priority Indicator */}
                            <div className="flex items-center gap-3 min-w-0 sm:min-w-[120px]">
                              <div
                                className={`h-3 w-3 ${priorityConfig.color} rounded-full flex-shrink-0`}
                              ></div>
                              <span
                                className={`text-sm font-medium ${priorityConfig.textColor}`}
                              >
                                {priorityConfig.text}
                              </span>
                            </div>

                            {/* Employee Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                {evaluation.employeeAvatar ? (
                                  <img
                                    src={evaluation.employeeAvatar}
                                    alt={evaluation.employeeName || "Employee"}
                                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display =
                                        "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm flex-shrink-0 ${
                                    evaluation.employeeAvatar ? "hidden" : ""
                                  }`}
                                >
                                  {getInitials(
                                    evaluation.employeeName ||
                                      evaluation.formName
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-slate-900 truncate">
                                    {evaluation.employeeName ||
                                      evaluation.formName ||
                                      "N/A"}
                                  </p>
                                  <p className="text-sm text-slate-600 truncate">
                                    {evaluation.formType ||
                                      evaluation.evaluationType ||
                                      "Evaluation"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Deadline Info */}
                            <div className="flex items-center justify-between sm:justify-end gap-4 sm:min-w-[200px]">
                              <div className="text-left sm:text-right">
                                <p className="text-sm font-medium text-slate-900">
                                  {formatDate(evaluation.reviewDeadline)}
                                </p>
                                {daysUntilDeadline !== null && (
                                  <p
                                    className={`text-xs ${priorityConfig.textColor}`}
                                  >
                                    {daysUntilDeadline < 0
                                      ? `${Math.abs(
                                          daysUntilDeadline
                                        )} days overdue`
                                      : daysUntilDeadline === 0
                                      ? "Due today"
                                      : `${daysUntilDeadline} days left`}
                                  </p>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 cursor-pointer hover:bg-orange-50 hover:text-orange-600"
                                  title="Send reminder"
                                  onClick={() => handleSendReminder(evaluation)}
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                  </svg>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                                  title="View details"
                                  onClick={() =>
                                    handleViewEvaluation(evaluation)
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12">
                    <div className="text-center text-slate-500">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-lg font-medium mb-1">All caught up!</p>
                      <p className="text-sm">
                        No upcoming evaluation deadlines at this time
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pagination Controls for Pending Evaluations */}
              {pendingEvaluations && pendingEvaluations.length > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-slate-600">
                    Showing page {pendingPage} - {pendingEvaluations.length}{" "}
                    evaluations
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPendingPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={pendingPage === 1}
                      className="cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingPage((prev) => prev + 1)}
                      disabled={pendingEvaluations.length < pendingLimit}
                      className="cursor-pointer"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Calendar Modal */}
        <CalendarModal
          isOpen={showCalendar}
          onClose={() => setShowCalendar(false)}
          evaluations={evaluations}
        />

        {/* Evaluation Summary Modal */}
        <EvaluationSummaryModal
          isOpen={showEvaluationSummary}
          onClose={() => {
            setShowEvaluationSummary(false);
            setSelectedEvaluation(null);
          }}
          evaluation={selectedEvaluation}
        />

        {/* Edit Evaluation Modal */}
        <EditEvaluationModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvaluation(null);
          }}
          evaluation={selectedEvaluation}
          onSave={(updatedEvaluation) => {
            // Update the evaluation in the local state
            setEvaluations((prev) =>
              prev.map((evaluationItem) =>
                evaluationItem._id === updatedEvaluation._id
                  ? updatedEvaluation
                  : evaluationItem
              )
            );
            // Refresh the data
            fetchEvaluations(true);
          }}
        />
      </DashboardLayout>
    );
  } catch (error) {
    console.error("Error rendering HREvaluationsPage:", error);
    return (
      <DashboardLayout
        sidebarConfig={hrDashboardConfig}
        showSectionCards={false}
        showChart={false}
        showDataTable={false}
      >
        <div className="px-4 lg:px-6 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Error Loading Evaluations Page
            </h1>
            <p className="text-gray-600 mb-4">
              There was an error loading the evaluations page. Please try
              refreshing the page.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Refresh Page
            </Button>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">
                Error Details (for debugging)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {error.toString()}
              </pre>
            </details>
          </div>
        </div>
      </DashboardLayout>
    );
  }
}
