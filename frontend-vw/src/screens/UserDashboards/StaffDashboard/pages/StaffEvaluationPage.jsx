/**
 * @fileoverview Staff Evaluation Page Component
 * @description Complete evaluation management interface matching Figma design
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

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
  MoreHorizontal,
} from "lucide-react";
import axios from "axios";

// shadcn UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";

// Layout Components
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";

// Authentication
import { useAuth } from "@/hooks/useAuth";

// API Configuration
import { getApiUrl } from "@/config/apiConfig";

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
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          {change && (
            <div
              className={`flex items-center text-sm font-medium ${
                changeType === "positive" ? "text-green-600" : "text-red-600"
              }`}
            >
              {changeType === "positive" ? "+" : ""}
              {change}
              <TrendingUp className="w-4 h-4 ml-1" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Evaluation Item Component
const EvaluationItem = ({ evaluation, onClick }) => {
  return (
    <div
      className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
      onClick={() => onClick(evaluation)}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900">
            {evaluation.title}
          </h4>
          <p className="text-sm text-gray-500 mt-1">{evaluation.description}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  );
};

// Empty State Component
const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-16 h-16 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-center max-w-md">{description}</p>
  </div>
);

// Evaluation Detail Modal Component
const EvaluationModal = ({
  isOpen,
  onClose,
  evaluation,
  onStartEvaluation,
}) => {
  if (!evaluation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Evaluations Overview</span>
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {evaluation.title}
            </DialogTitle>
            <p className="text-sm text-blue-600">Due by {evaluation.dueDate}</p>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Instructions
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {evaluation.instructions}
            </p>
          </div>
        </div>

        <DialogFooter className="flex items-center space-x-3">
          <Button variant="outline" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button
            onClick={() => onStartEvaluation(evaluation)}
            className="bg-green-600 hover:bg-green-700 px-6"
          >
            Start Evaluation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Loading State Component
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-8 h-8 animate-spin border-2 border-green-500 border-t-transparent rounded-full mb-4"></div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Loading evaluations...
    </h3>
    <p className="text-gray-500 text-center">
      Please wait while we fetch your evaluations.
    </p>
  </div>
);

// Main Staff Evaluation Page Component
export default function Evaluation() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  // State management
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [metrics, setMetrics] = useState({
    inProgress: 0,
    reviewsDue: 0,
    completedReviews: 0,
    averagePerformanceRating: 0,
  });
  const [tasks, setTasks] = useState([]);

  // API configuration
  const API_URL = getApiUrl();

  // Create axios instance with default config
  const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor to include auth token
  apiClient.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  // Fetch evaluations from API
  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      // For demo purposes, we'll use mock data that matches the Figma design
      // In real implementation, this would be an API call
      const mockEvaluations = [
        {
          id: "eval-1",
          title: "Annual Performance Evaluation Form",
          description: "Assess overall performance and contributions",
          instructions:
            "This review is designed to assess your performance over the past year. Please provide honest and thoughtful responses to each question. Your feedback will be used to help you grow and develop in your role.",
          dueDate: "July 31, 2024",
          status: "pending",
          type: "self-assessment",
        },
      ];

      const mockMetrics = {
        inProgress: 0,
        reviewsDue: 1,
        completedReviews: 0,
        averagePerformanceRating: 0,
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setEvaluations(mockEvaluations);
      setMetrics(mockMetrics);
    } catch (err) {
      console.error("Error fetching evaluations:", err);
      setError(
        err.message ||
          "An unexpected error occurred while fetching evaluations."
      );
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff tasks for sidebar badge
  const fetchTasks = async () => {
    try {
      if (!accessToken) return;
      const response = await apiClient.get("/tasks");
      if (response.data.success) {
        setTasks(response.data.data || response.data.tasks || []);
      } else {
        setTasks([]);
      }
    } catch {
      setTasks([]);
    }
  };

  // Handle evaluation click
  const handleEvaluationClick = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowEvaluationModal(true);
  };

  // Handle start evaluation
  const handleStartEvaluation = (evaluation) => {
    setShowEvaluationModal(false);
    toast.success("Evaluation Started", {
      description: `You have started the ${evaluation.title}.`,
    });
    // Here you would navigate to the actual evaluation form
    // navigate(`/staff/evaluations/${evaluation.id}/form`);
  };

  // Initial fetch
  useEffect(() => {
    fetchEvaluations();
    fetchTasks();
  }, [accessToken]);

  // Dynamically update the badge for the Tasks sidebar item
  const dynamicSidebarConfig = {
    ...staffDashboardConfig,
    productivity: staffDashboardConfig.productivity.map((item) =>
      item.title === "Tasks" ? { ...item, badge: tasks.length } : item
    ),
  };

  return (
    <StaffDashboardLayout
      sidebarConfig={dynamicSidebarConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      {/* Header Section */}
      <div className="px-4 lg:px-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Evaluations Overview
              </h1>
              <p className="text-gray-500 mt-1">
                Manage and track evaluations.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="px-4 lg:px-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="IN PROGRESS"
            value={metrics.inProgress}
            change="36%"
            changeType="positive"
          />
          <MetricCard
            title="REVIEWS DUE"
            value={metrics.reviewsDue}
            change="14%"
            changeType="negative"
          />
          <MetricCard
            title="COMPLETED REVIEWS"
            value={metrics.completedReviews}
            change="36%"
            changeType="positive"
          />
          <MetricCard
            title="AVERAGE PERFORMANCE RATING"
            value={metrics.averagePerformanceRating}
            change="36%"
            changeType="positive"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <LoadingState />
            ) : evaluations.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No active evaluations"
                description="All evaluations assigned or provided to you will appear here."
              />
            ) : (
              <div>
                {/* Self-Assessment Section */}
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Self-Assessment Evaluation
                  </h3>
                  <p className="text-sm text-blue-600 mb-4">
                    Please click to access the review form, make any necessary
                    modifications, and submit
                  </p>

                  <div className="bg-white border border-gray-200 rounded-lg">
                    {evaluations
                      .filter(
                        (evaluation) => evaluation.type === "self-assessment"
                      )
                      .map((evaluation) => (
                        <EvaluationItem
                          key={evaluation.id}
                          evaluation={evaluation}
                          onClick={handleEvaluationClick}
                        />
                      ))}
                  </div>
                </div>

                {/* Other Evaluations Section - if any exist */}
                {evaluations.filter(
                  (evaluation) => evaluation.type !== "self-assessment"
                ).length > 0 && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Other Evaluations
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg">
                      {evaluations
                        .filter(
                          (evaluation) => evaluation.type !== "self-assessment"
                        )
                        .map((evaluation) => (
                          <EvaluationItem
                            key={evaluation.id}
                            evaluation={evaluation}
                            onClick={handleEvaluationClick}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Evaluation Detail Modal */}
      <EvaluationModal
        isOpen={showEvaluationModal}
        onClose={() => setShowEvaluationModal(false)}
        evaluation={selectedEvaluation}
        onStartEvaluation={handleStartEvaluation}
      />
    </StaffDashboardLayout>
  );
}
