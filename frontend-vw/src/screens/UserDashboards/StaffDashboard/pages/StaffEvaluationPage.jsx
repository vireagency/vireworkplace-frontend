import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  ChevronRight,
  Search,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
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
  X,
  Download,
  Plus,
  CheckCircle,
  AlertTriangle,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";

// shadcn UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";

// Layout Components
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";

// Authentication
import { useAuth } from "@/hooks/useAuth";
import { useStandardizedSidebar } from "@/hooks/useStandardizedSidebar";

// API Services
import { staffEvaluationsApi } from "@/services/staffEvaluations";
import { getApiUrl } from "@/config/apiConfig";
import axios from "axios";

// Evaluation Status Badge Component
const EvaluationStatusBadge = ({ status }) => {
  const statusConfig = {
    completed: {
      variant: "default",
      className:
        "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
      icon: CheckCircle2,
      text: "Completed",
    },
    "in progress": {
      variant: "secondary",
      className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
      icon: Clock,
      text: "In Progress",
    },
    pending: {
      variant: "outline",
      className:
        "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50",
      icon: TrendingUp,
      text: "Pending",
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig["pending"];
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <IconComponent className="w-3 h-3 mr-1" />
      {config.text}
    </Badge>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, changeType = "positive" }) => {
  const getChangeColor = () => {
    if (changeType === "positive") return "text-green-600";
    if (changeType === "negative") return "text-red-600";
    return "text-gray-600";
  };

  const getChangePrefix = () => {
    if (changeType === "positive") return "+ ";
    if (changeType === "negative") return "";
    return "";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6 text-center">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          {title}
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {change && (
          <div className={`text-xs font-medium ${getChangeColor()}`}>
            {getChangePrefix()}
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Evaluation Item Component
const EvaluationItem = ({ evaluation, onClick, loading = false }) => {
  return (
    <div
      className={`flex items-center justify-between p-4 transition-all border-b border-gray-100 last:border-b-0 ${
        loading
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-gray-50 cursor-pointer"
      }`}
      onClick={() => !loading && onClick(evaluation)}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">
            {evaluation.title}
          </h4>
          <p className="text-sm text-gray-500 mt-1">{evaluation.description}</p>
          {evaluation.dueDate && (
            <p className="text-xs text-blue-600 mt-1">
              Due: {new Date(evaluation.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <EvaluationStatusBadge status={evaluation.status} />
        {!loading && <ChevronRight className="w-5 h-5 text-gray-400" />}
        {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-16 h-16 mb-6 text-gray-300">
      <Search className="w-16 h-16" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
      {title}
    </h3>
    <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>
    {action && action}
  </div>
);

// Performance Review Modal Component (Step 1: Instructions)
const PerformanceReviewModal = ({
  isOpen,
  onClose,
  evaluation,
  onStartEvaluation,
  loading,
}) => {
  if (!evaluation && !loading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Evaluations Overview</span>
          </div>
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading evaluation details...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Performance Review
              </DialogTitle>
              {evaluation?.dueDate && (
                <p className="text-sm text-blue-600">
                  Due by {new Date(evaluation.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading evaluation form...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Instructions
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {evaluation?.instructions ||
                  "This review is designed to assess your performance over the past year. Please provide honest and thoughtful responses to each question. Your feedback will be used to help you grow and develop in your role."}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center space-x-3">
          <Button variant="outline" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button
            onClick={() => onStartEvaluation(evaluation)}
            className="bg-green-600 hover:bg-green-700 px-6"
            disabled={evaluation?.status === "completed"}
          >
            {evaluation?.status === "completed"
              ? "Completed"
              : "Start Evaluation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Performance Evaluation Form Modal Component (Step 2: Form)
const PerformanceEvaluationFormModal = ({
  isOpen,
  onClose,
  evaluation,
  onSubmitForm,
  formResponses,
  setFormResponses,
  formComments,
  setFormComments,
  submitting,
  loading,
}) => {
  if (!evaluation && !loading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Evaluations Overview</span>
          </div>
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading evaluation form...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Performance Evaluation
              </DialogTitle>
              <p className="text-sm text-gray-600">
                Review of employee performance.
              </p>
            </div>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading evaluation form...</p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitForm();
            }}
            className="space-y-6 py-4"
          >
            {/* Employee Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Employee Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    value={formResponses.employeeName || ""}
                    onChange={(e) =>
                      setFormResponses({
                        ...formResponses,
                        employeeName: e.target.value,
                      })
                    }
                    placeholder="Employee Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <Input
                    value={formResponses.role || ""}
                    onChange={(e) =>
                      setFormResponses({
                        ...formResponses,
                        role: e.target.value,
                      })
                    }
                    placeholder="Job Title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <Input
                    value={formResponses.department || ""}
                    onChange={(e) =>
                      setFormResponses({
                        ...formResponses,
                        department: e.target.value,
                      })
                    }
                    placeholder="Department"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Review Period */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Review Period
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period
                  </label>
                  <Input
                    value={formResponses.reviewPeriod || ""}
                    onChange={(e) =>
                      setFormResponses({
                        ...formResponses,
                        reviewPeriod: e.target.value,
                      })
                    }
                    placeholder="January 1, 2023 - December 31, 2023"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reviewer
                  </label>
                  <Input
                    value={formResponses.reviewer || ""}
                    onChange={(e) =>
                      setFormResponses({
                        ...formResponses,
                        reviewer: e.target.value,
                      })
                    }
                    placeholder="Reviewer Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review Date
                  </label>
                  <Input
                    type="date"
                    value={formResponses.reviewDate || ""}
                    onChange={(e) =>
                      setFormResponses({
                        ...formResponses,
                        reviewDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Rating Scale */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Rating Scale
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-semibold">1</div>
                  <div className="text-gray-600">Unsatisfactory</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-semibold">2</div>
                  <div className="text-gray-600">Needs Improvement</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-semibold">3</div>
                  <div className="text-gray-600">Meets Expectations</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-semibold">4</div>
                  <div className="text-gray-600">Exceeds Expectations</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-semibold">5</div>
                  <div className="text-gray-600">Outstanding</div>
                </div>
              </div>
            </div>

            {/* Dynamic Questions Section */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900">
                Evaluation Questions
              </h4>

              {evaluation?.questions && evaluation.questions.length > 0 ? (
                <div className="space-y-6">
                  {evaluation.questions.map((question, index) => (
                    <div
                      key={question.id || index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-2">
                          {index + 1}.{" "}
                          {question.question ||
                            question.text ||
                            `Question ${index + 1}`}
                        </h5>
                        {question.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {question.description}
                          </p>
                        )}
                        {question.required && (
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full mb-3">
                            Required
                          </span>
                        )}
                      </div>

                      {/* Question Type Handling */}
                      {question.type === "rating" ||
                      question.type === "scale" ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              Rating:
                            </span>
                            <select
                              value={formResponses[question.id] || ""}
                              onChange={(e) =>
                                setFormResponses({
                                  ...formResponses,
                                  [question.id]: e.target.value,
                                })
                              }
                              className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required={question.required}
                            >
                              <option value="">Select Rating</option>
                              {question.options ? (
                                question.options.map((option, optIndex) => (
                                  <option
                                    key={optIndex}
                                    value={option.value || option}
                                  >
                                    {option.label || option}
                                  </option>
                                ))
                              ) : (
                                <>
                                  <option value="1">1 - Unsatisfactory</option>
                                  <option value="2">
                                    2 - Needs Improvement
                                  </option>
                                  <option value="3">
                                    3 - Meets Expectations
                                  </option>
                                  <option value="4">
                                    4 - Exceeds Expectations
                                  </option>
                                  <option value="5">5 - Outstanding</option>
                                </>
                              )}
                            </select>
                          </div>
                          {question.allowComments && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Additional Comments
                              </label>
                              <textarea
                                value={
                                  formResponses[`${question.id}_comments`] || ""
                                }
                                onChange={(e) =>
                                  setFormResponses({
                                    ...formResponses,
                                    [`${question.id}_comments`]: e.target.value,
                                  })
                                }
                                placeholder="Provide additional comments or examples..."
                                className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                              />
                            </div>
                          )}
                        </div>
                      ) : question.type === "multiple_choice" ? (
                        <div className="space-y-2">
                          {question.options &&
                            question.options.map((option, optIndex) => (
                              <label
                                key={optIndex}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  name={question.id}
                                  value={option.value || option}
                                  checked={
                                    formResponses[question.id] ===
                                    (option.value || option)
                                  }
                                  onChange={(e) =>
                                    setFormResponses({
                                      ...formResponses,
                                      [question.id]: e.target.value,
                                    })
                                  }
                                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                                  required={question.required}
                                />
                                <span className="text-sm text-gray-700">
                                  {option.label || option}
                                </span>
                              </label>
                            ))}
                        </div>
                      ) : question.type === "checkbox" ? (
                        <div className="space-y-2">
                          {question.options &&
                            question.options.map((option, optIndex) => (
                              <label
                                key={optIndex}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  value={option.value || option}
                                  checked={
                                    formResponses[question.id]?.includes(
                                      option.value || option
                                    ) || false
                                  }
                                  onChange={(e) => {
                                    const currentValues =
                                      formResponses[question.id] || [];
                                    const newValues = e.target.checked
                                      ? [
                                          ...currentValues,
                                          option.value || option,
                                        ]
                                      : currentValues.filter(
                                          (v) => v !== (option.value || option)
                                        );
                                    setFormResponses({
                                      ...formResponses,
                                      [question.id]: newValues,
                                    });
                                  }}
                                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {option.label || option}
                                </span>
                              </label>
                            ))}
                        </div>
                      ) : (
                        // Default to text input
                        <div className="space-y-3">
                          <textarea
                            value={formResponses[question.id] || ""}
                            onChange={(e) =>
                              setFormResponses({
                                ...formResponses,
                                [question.id]: e.target.value,
                              })
                            }
                            placeholder={
                              question.placeholder || "Enter your response..."
                            }
                            className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                            required={question.required}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h5 className="text-lg font-medium text-gray-900 mb-2">
                      No Questions Available
                    </h5>
                    <p className="text-sm text-gray-600">
                      This evaluation doesn't have any specific questions. You
                      can add general comments below.
                    </p>
                  </div>
                </div>
              )}

              {/* General Comments Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Comments
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    General Comments
                  </label>
                  <textarea
                    value={formComments}
                    onChange={(e) => setFormComments(e.target.value)}
                    placeholder="Add any additional comments, feedback, or suggestions..."
                    className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center space-x-3 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                className="px-6"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 px-6"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Evaluation"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Evaluation Submitted Success Modal Component (Step 3: Success)
const EvaluationSubmittedModal = ({
  isOpen,
  onClose,
  onViewEvaluation,
  onReturnToDashboard,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Evaluations Overview</span>
          </div>
          <div className="text-center">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Evaluation Submitted
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Your evaluation has been successfully submitted. You can view the
              completed evaluation or return to the dashboard.
            </p>
          </div>
        </DialogHeader>

        <DialogFooter className="flex items-center justify-center space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onReturnToDashboard}
            className="px-6"
          >
            Return to Dashboard
          </Button>
          <Button
            onClick={onViewEvaluation}
            className="bg-green-600 hover:bg-green-700 px-6"
          >
            View Evaluation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Loading State Component
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <Loader2 className="w-8 h-8 animate-spin mb-4 text-green-500" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Loading evaluations...
    </h3>
    <p className="text-gray-500 text-center">
      Please wait while we fetch your evaluations.
    </p>
  </div>
);

// Error State Component
const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Failed to Load Evaluations
    </h3>
    <p className="text-gray-500 text-center max-w-md mb-6">
      {error || "Something went wrong while loading your evaluations."}
    </p>
    <Button onClick={onRetry} className="bg-green-600 hover:bg-green-700">
      Try Again
    </Button>
  </div>
);

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
      if (!evaluation.dueDate) return false;
      const evalDate = new Date(evaluation.dueDate);
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
                            key={evaluation.id || idx}
                            className={`text-xs p-1 rounded border truncate ${colorClass}`}
                            title={`${evaluation.title || "Evaluation"} - ${
                              evaluation.status || "Pending"
                            }`}
                          >
                            {evaluation.title || "Evaluation"}
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

// Main Staff Evaluation Page Component
export default function StaffEvaluationsPage() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const { sidebarConfig } = useStandardizedSidebar();

  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Modal states for the 3-step flow
  const [showPerformanceReviewModal, setShowPerformanceReviewModal] =
    useState(false);
  const [showEvaluationFormModal, setShowEvaluationFormModal] = useState(false);
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);

  const [formResponses, setFormResponses] = useState({});
  const [formComments, setFormComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [evaluationLoading, setEvaluationLoading] = useState(false);

  // Statistics state
  const [statistics, setStatistics] = useState({
    reviewsInProgress: 0,
    reviewsCompleted: 0,
    reviewsOverdue: 0,
    averageScore: 0,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState("asc");

  // API configuration
  const getEvaluationsApiBaseUrl = () => {
    const baseUrl = getApiUrl();
    const cleanBaseUrl = baseUrl
      ? baseUrl.replace(/\/+$/, "")
      : "http://localhost:6000";
    const noApiV1 = cleanBaseUrl.replace(/\/api\/v1$/, "");
    return `${noApiV1}`;
  };

  // Create axios instance with correct base URL
  const apiClient = axios.create({
    baseURL: getEvaluationsApiBaseUrl(),
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000, // 30 second timeout
  });

  // Add request interceptor to include auth token
  apiClient.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for better error handling
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      }
      return Promise.reject(error);
    }
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!accessToken || !user) {
      navigate("/login");
    }
  }, [accessToken, user, navigate]);

  // Calculate statistics from evaluations data
  const calculateStatistics = (evals) => {
    if (!Array.isArray(evals) || evals.length === 0) {
      return;
    }

    const inProgress = evals.filter(
      (e) => e.status === "in_progress" || e.status === "pending"
    ).length;
    const completed = evals.filter(
      (e) => e.status === "completed" || e.status === "submitted"
    ).length;
    const overdue = evals.filter((e) => {
      if (!e.dueDate) return false;
      return new Date(e.dueDate) < new Date() && e.status !== "completed";
    }).length;

    // Calculate average score for completed evaluations
    const completedWithScores = evals.filter(
      (e) => (e.status === "completed" || e.status === "submitted") && e.score
    );
    const avgScore =
      completedWithScores.length > 0
        ? Math.round(
            completedWithScores.reduce((sum, e) => sum + (e.score || 0), 0) /
              completedWithScores.length
          )
        : 0;

    setStatistics({
      reviewsInProgress: inProgress,
      reviewsCompleted: completed,
      reviewsOverdue: overdue,
      averageScore: avgScore,
    });
  };

  // Fetch evaluations assigned to staff
  const fetchEvaluations = async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      const response = await apiClient.get(
        "/api/v1/dashboard/staff/evaluations/reviews"
      );

      let evaluationsData = [];

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        evaluationsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        evaluationsData = response.data;
      } else {
        evaluationsData = [];
      }

      // Transform and enrich evaluation data
      const enrichedEvaluations = evaluationsData.map((evaluation) => ({
        ...evaluation,
        id: evaluation._id || evaluation.id,
        title: evaluation.title || evaluation.formName || "Evaluation",
        description: evaluation.description || "Performance evaluation",
        status: (evaluation.status || "pending").toLowerCase(),
        dueDate: evaluation.dueDate || evaluation.reviewDeadline || null,
        questions: evaluation.questions || [],
        instructions: evaluation.instructions || evaluation.description,
        formType:
          evaluation.formType ||
          evaluation.evaluationType ||
          "Performance Review",
        employeeName:
          evaluation.employeeName || user?.firstName + " " + user?.lastName,
        department: evaluation.department || user?.department,
      }));

      setEvaluations(enrichedEvaluations);
      calculateStatistics(enrichedEvaluations);

      if (showToast && enrichedEvaluations.length > 0) {
        toast.success(`Loaded ${enrichedEvaluations.length} evaluations`);
      }
    } catch (err) {
      console.error("Error fetching evaluations:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch evaluations.";
      setError(errorMessage);
      setEvaluations([]);

      if (showToast) {
        toast.error("Failed to load evaluations");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific evaluation form by ID
  const fetchEvaluationById = async (id) => {
    try {
      setEvaluationLoading(true);
      if (!accessToken) return null;

      const response = await apiClient.get(
        `/api/v1/dashboard/staff/evaluations/reviews/${id}`
      );

      if (response.data && response.data.success) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Error fetching evaluation by ID:", err);
      toast.error("Failed to load evaluation details");
      return null;
    } finally {
      setEvaluationLoading(false);
    }
  };

  // Submit evaluation response
  const submitEvaluationResponse = async (id, responses, comments) => {
    try {
      if (!accessToken) throw new Error("No access token available.");

      const payload = {
        responses: responses || [],
        comments: comments || "",
      };

      const response = await apiClient.post(
        `/api/v1/dashboard/staff/evaluations/reviews/${id}/response`,
        payload
      );

      if (response.data && (response.data.success || response.status === 200)) {
        toast.success("Evaluation response submitted successfully!");
        return true;
      } else {
        toast.error("Failed to submit evaluation response.");
        return false;
      }
    } catch (err) {
      console.error("Error submitting evaluation:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit evaluation response.";
      toast.error(errorMessage);
      return false;
    }
  };

  // Helper functions to filter and format evaluations
  const getFilteredEvaluations = () => {
    let filtered = evaluations;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (evaluation) =>
          evaluation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evaluation.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          evaluation.formType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((evaluation) => {
        switch (statusFilter) {
          case "completed":
            return (
              evaluation.status === "completed" ||
              evaluation.status === "submitted"
            );
          case "pending":
            return (
              evaluation.status === "pending" ||
              evaluation.status === "in_progress"
            );
          case "overdue":
            return (
              evaluation.dueDate &&
              new Date(evaluation.dueDate) < new Date() &&
              evaluation.status !== "completed"
            );
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "title":
          aValue = a.title || "";
          bValue = b.title || "";
          break;
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate) : new Date(0);
          bValue = b.dueDate ? new Date(b.dueDate) : new Date(0);
          break;
        case "createdAt":
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          aValue = a.dueDate ? new Date(a.dueDate) : new Date(0);
          bValue = b.dueDate ? new Date(b.dueDate) : new Date(0);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const getRecentSubmissions = () => {
    return evaluations
      .filter((e) => e.status === "submitted" || e.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.submittedAt || b.createdAt) -
          new Date(a.submittedAt || a.createdAt)
      )
      .slice(0, 5);
  };

  const getUpcomingDeadlines = () => {
    return evaluations
      .filter(
        (e) => e.status !== "completed" && e.status !== "submitted" && e.dueDate
      )
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 10);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
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

  // Handle evaluation click: show performance review modal (Step 1)
  const handleEvaluationClick = async (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowPerformanceReviewModal(true);
    setFormResponses({});
    setFormComments("");

    // If the evaluation doesn't have detailed questions, try to fetch them
    if (!evaluation.questions || evaluation.questions.length === 0) {
      const fullEvaluation = await fetchEvaluationById(evaluation.id);
      if (fullEvaluation) {
        setSelectedEvaluation(fullEvaluation);
      }
    }
  };

  // Show the evaluation form (Step 2)
  const handleStartEvaluation = (evaluation) => {
    if (evaluation.status === "completed") {
      toast.info("This evaluation has already been completed.");
      return;
    }
    setShowPerformanceReviewModal(false);
    setShowEvaluationFormModal(true);
    setFormResponses({});
    setFormComments("");
  };

  // Submit the evaluation form
  const handleSubmitForm = async () => {
    if (!selectedEvaluation) return;

    // Validate required fields
    const requiredQuestions =
      selectedEvaluation.questions?.filter((q) => q.required) || [];
    const missingResponses = requiredQuestions.filter(
      (q) => !formResponses[q.id]?.trim()
    );

    if (missingResponses.length > 0) {
      toast.error("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      // Prepare responses array
      const responsesArr = Object.entries(formResponses)
        .map(([questionId, answer]) => ({ questionId, answer: answer?.trim() }))
        .filter((r) => r.answer); // Remove empty responses

      const success = await submitEvaluationResponse(
        selectedEvaluation.id,
        responsesArr,
        formComments.trim()
      );

      if (success) {
        setShowEvaluationFormModal(false);
        setShowSubmittedModal(true);
        setFormResponses({});
        setFormComments("");

        // Refresh evaluations to reflect the update
        await fetchEvaluations();
      }
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast.error("Failed to submit evaluation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowPerformanceReviewModal(false);
    setShowEvaluationFormModal(false);
    setShowSubmittedModal(false);
    setFormResponses({});
    setFormComments("");
    setSelectedEvaluation(null);
  };

  // Handle success modal actions
  const handleViewEvaluation = () => {
    setShowSubmittedModal(false);
    // Could navigate to a view evaluation page or show evaluation details
    toast.info("Evaluation details would be shown here");
  };

  const handleReturnToDashboard = () => {
    setShowSubmittedModal(false);
    setSelectedEvaluation(null);
    // Could navigate to dashboard or just close modal
  };

  // Initial fetch
  useEffect(() => {
    if (accessToken) {
      fetchEvaluations();
    }
  }, [accessToken]);

  return (
    <StaffDashboardLayout
      sidebarConfig={sidebarConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      {/* Evaluations Overview Dashboard */}
      <div className="px-4 lg:px-6">
        {/* Header Section */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                My Evaluations
              </h1>
              <p className="text-slate-600">
                Complete your assigned performance evaluations
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                onClick={() => fetchEvaluations(true)}
                variant="outline"
                className="flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Refresh</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-slate-600">
              Loading evaluation metrics...
            </span>
          </div>
        ) : (
          <>
            {error && (
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
                    <TrendingUp className="text-green-600" />
                    Active
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
                    <CheckCircle className="text-green-600" />
                    Done
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
                  <Badge variant="secondary" className="text-red-600 bg-red-50">
                    <AlertTriangle className="text-red-600" />
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
                    <Star className="text-green-600" />
                    Good
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
                  <Button variant="link" className="text-sm p-0 h-auto">
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    </div>
                  ) : getRecentSubmissions().length > 0 ? (
                    <div className="space-y-3">
                      {getRecentSubmissions()
                        .slice(0, 3)
                        .map((evaluation, index) => {
                          const statusBadge = getStatusBadge(evaluation.status);
                          return (
                            <div
                              key={evaluation.id || index}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-slate-900">
                                  {evaluation.title || "Evaluation"}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {evaluation.formType || "Performance Review"}
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
                    onClick={() => setShowCalendar(true)}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    View Calendar
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-auto py-3"
                  >
                    <FileText className="h-4 w-4" />
                    Download Templates
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-auto py-3"
                  >
                    <HeartPulse className="h-4 w-4" />
                    Contact HR
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-auto py-3"
                  >
                    <Users className="h-4 w-4" />
                    View Guidelines
                  </Button>
                </CardContent>
              </Card>

              {/* Right Column: My Evaluations */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    My Evaluations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {evaluations.slice(0, 4).map((evaluation) => (
                      <div
                        key={evaluation.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                          <span className="font-medium text-slate-900 text-sm">
                            {evaluation.title || "Evaluation"}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-600">
                            {evaluation.status}
                          </p>
                          <p className="text-xs font-medium text-slate-900">
                            {evaluation.dueDate
                              ? formatDate(evaluation.dueDate)
                              : "No deadline"}
                          </p>
                        </div>
                      </div>
                    ))}
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

              {loading ? (
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
                      const daysUntilDeadline = evaluation.dueDate
                        ? Math.ceil(
                            (new Date(evaluation.dueDate) - new Date()) /
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
                        <Card
                          key={evaluation.id || index}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleEvaluationClick(evaluation)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={`h-3 w-3 ${priorityColor} rounded-full mt-1 flex-shrink-0`}
                              ></div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate">
                                  {evaluation.title || "Evaluation"}
                                </p>
                                <p className="text-sm text-slate-600 truncate">
                                  {evaluation.formType || "Performance Review"}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-xs text-slate-500">
                                    {formatDate(evaluation.dueDate)}
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
                    placeholder="Search evaluations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setSortBy("dueDate");
                    setSortOrder("asc");
                  }}
                >
                  <Filter className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Recent Submissions Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">
                  All Evaluations ({getFilteredEvaluations().length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="title">Title</option>
                    <option value="status">Status</option>
                    <option value="createdAt">Created Date</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="flex items-center gap-1 text-slate-600"
                  >
                    {sortOrder === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <span className="ml-2 text-slate-600">
                        Loading submissions...
                      </span>
                    </div>
                  ) : getFilteredEvaluations().length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500">No evaluations found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-slate-200">
                          <TableHead
                            className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:bg-slate-50"
                            onClick={() => handleSort("title")}
                          >
                            <div className="flex items-center gap-2">
                              Evaluation
                              {sortBy === "title" &&
                                (sortOrder === "asc" ? (
                                  <SortAsc className="h-4 w-4" />
                                ) : (
                                  <SortDesc className="h-4 w-4" />
                                ))}
                            </div>
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                            Type
                          </TableHead>
                          <TableHead
                            className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:bg-slate-50"
                            onClick={() => handleSort("dueDate")}
                          >
                            <div className="flex items-center gap-2">
                              Due Date
                              {sortBy === "dueDate" &&
                                (sortOrder === "asc" ? (
                                  <SortAsc className="h-4 w-4" />
                                ) : (
                                  <SortDesc className="h-4 w-4" />
                                ))}
                            </div>
                          </TableHead>
                          <TableHead
                            className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:bg-slate-50"
                            onClick={() => handleSort("status")}
                          >
                            <div className="flex items-center gap-2">
                              Status
                              {sortBy === "status" &&
                                (sortOrder === "asc" ? (
                                  <SortAsc className="h-4 w-4" />
                                ) : (
                                  <SortDesc className="h-4 w-4" />
                                ))}
                            </div>
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-slate-100">
                        {getFilteredEvaluations().map((evaluation) => {
                          const statusBadge = getStatusBadge(evaluation.status);
                          return (
                            <TableRow
                              key={evaluation.id}
                              className="hover:bg-slate-50"
                            >
                              <TableCell className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                                    <FileText className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900">
                                      {evaluation.title || "Evaluation"}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                      {evaluation.description ||
                                        "Performance evaluation"}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3 px-4 text-slate-900">
                                {evaluation.formType || "Performance Review"}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-slate-900">
                                {evaluation.dueDate
                                  ? formatDate(evaluation.dueDate)
                                  : "No deadline"}
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                <Badge
                                  variant="secondary"
                                  className={statusBadge.class}
                                >
                                  {statusBadge.text}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 cursor-pointer"
                                    title="View"
                                    onClick={() =>
                                      handleEvaluationClick(evaluation)
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
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
                <CalendarIcon className="h-4 w-4" />
                View Calendar
              </Button>
            </div>

            {/* Upcoming Deadlines Cards/Table */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-2 text-slate-600">
                  Loading upcoming deadlines...
                </span>
              </div>
            ) : getUpcomingDeadlines().length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {getUpcomingDeadlines().map((evaluation, index) => {
                  const daysUntilDeadline = evaluation.dueDate
                    ? Math.ceil(
                        (new Date(evaluation.dueDate) - new Date()) /
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
                      key={evaluation.id || index}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleEvaluationClick(evaluation)}
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

                          {/* Evaluation Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm flex-shrink-0">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-900 truncate">
                                  {evaluation.title || "Evaluation"}
                                </p>
                                <p className="text-sm text-slate-600 truncate">
                                  {evaluation.formType || "Performance Review"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Deadline Info */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 sm:min-w-[200px]">
                            <div className="text-left sm:text-right">
                              <p className="text-sm font-medium text-slate-900">
                                {formatDate(evaluation.dueDate)}
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
                                className="h-8 w-8 p-0"
                                title="View details"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEvaluationClick(evaluation);
                                }}
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        evaluations={evaluations}
      />

      {/* Performance Review Modal (Step 1) */}
      <PerformanceReviewModal
        isOpen={showPerformanceReviewModal}
        onClose={handleCloseModal}
        evaluation={selectedEvaluation}
        onStartEvaluation={handleStartEvaluation}
        loading={evaluationLoading}
      />

      {/* Performance Evaluation Form Modal (Step 2) */}
      <PerformanceEvaluationFormModal
        isOpen={showEvaluationFormModal}
        onClose={handleCloseModal}
        evaluation={selectedEvaluation}
        onSubmitForm={handleSubmitForm}
        formResponses={formResponses}
        setFormResponses={setFormResponses}
        formComments={formComments}
        setFormComments={setFormComments}
        submitting={submitting}
        loading={evaluationLoading}
      />

      {/* Evaluation Submitted Success Modal (Step 3) */}
      <EvaluationSubmittedModal
        isOpen={showSubmittedModal}
        onClose={handleCloseModal}
        onViewEvaluation={handleViewEvaluation}
        onReturnToDashboard={handleReturnToDashboard}
      />
    </StaffDashboardLayout>
  );
}
