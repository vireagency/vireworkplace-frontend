import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MoreVertical,
  Calendar,
  User,
  Building,
  Loader2,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Layout and Auth
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useStandardizedSidebar } from "@/hooks/useStandardizedSidebar";

// API Services
import { staffEvaluationsApi } from "@/services/staffEvaluations";
import { toast } from "sonner";

const EvaluationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, accessToken } = useAuth();
  const { sidebarConfig } = useStandardizedSidebar();

  // State management
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch evaluation details
  const fetchEvaluationDetails = async () => {
    try {
      setLoading(true);
      const result = await staffEvaluationsApi.getEvaluationFormById(
        id,
        accessToken
      );

      if (result.success) {
        setEvaluation(result.data.data || result.data);
      } else {
        toast.error(result.error || "Failed to fetch evaluation details");
        navigate("/staff/evaluations");
      }
    } catch (error) {
      console.error("Error fetching evaluation details:", error);
      toast.error("Failed to load evaluation details");
      navigate("/staff/evaluations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && id) {
      fetchEvaluationDetails();
    }
  }, [accessToken, id]);

  // Handle start evaluation
  const handleStartEvaluation = () => {
    // Check if evaluation is already completed
    const isCompleted = staffEvaluationsApi.isEvaluationCompleted(id);

    if (isCompleted) {
      // If completed, go to summary instead
      navigate(`/staff/evaluations/${id}/summary`);
    } else {
      // If not completed, go to form
      navigate(`/staff/evaluations/${id}/form`);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/staff/evaluations");
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <StaffDashboardLayout
        sidebarConfig={sidebarConfig}
        showSectionCards={false}
        showChart={false}
        showDataTable={false}
      >
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading evaluation details...</p>
          </div>
        </div>
      </StaffDashboardLayout>
    );
  }

  if (!evaluation) {
    return (
      <StaffDashboardLayout
        sidebarConfig={sidebarConfig}
        showSectionCards={false}
        showChart={false}
        showDataTable={false}
      >
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Evaluation not found</p>
            <Button
              onClick={() => navigate("/staff/evaluations")}
              className="mt-4"
            >
              Back to Evaluations
            </Button>
          </div>
        </div>
      </StaffDashboardLayout>
    );
  }

  return (
    <StaffDashboardLayout
      sidebarConfig={sidebarConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      {/* Header Section */}
      <div className="px-4 lg:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/staff/evaluations")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Evaluations Overview
            </Button>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="relative">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {evaluation.title || "Performance Review"}
                </CardTitle>
                {evaluation.dueDate && (
                  <p className="text-blue-600 mt-2">
                    Due by {formatDate(evaluation.dueDate)}
                  </p>
                )}
              </div>

              {/* More Options Menu */}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Instructions Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Instructions
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {evaluation.instructions ||
                  "This review is designed to assess your performance over the past year. Please provide honest and thoughtful responses to each question. Your feedback will be used to help you grow and develop in your role."}
              </p>
            </div>

            {/* Evaluation Details */}
            {evaluation.evaluationPeriod && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Evaluation Period</p>
                    <p className="font-medium text-gray-900">
                      {evaluation.evaluationPeriod}
                    </p>
                  </div>
                </div>

                {evaluation.reviewer && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Reviewer</p>
                      <p className="font-medium text-gray-900">
                        {evaluation.reviewer}
                      </p>
                    </div>
                  </div>
                )}

                {evaluation.department && (
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium text-gray-900">
                        {evaluation.department}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={handleCancel} className="px-6">
                Cancel
              </Button>
              <Button
                onClick={handleStartEvaluation}
                className="px-6 bg-green-600 hover:bg-green-700 text-white"
              >
                {staffEvaluationsApi.isEvaluationCompleted(id)
                  ? "View Summary"
                  : "Start Evaluation"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StaffDashboardLayout>
  );
};

export default EvaluationDetail;
