import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Bell,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  Send,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Layout and Auth
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useStandardizedSidebar } from "@/hooks/useStandardizedSidebar";

// API Services
import { staffEvaluationsApi } from "@/services/staffEvaluations";
import { toast } from "sonner";

const EvaluationSummary = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, accessToken } = useAuth();
  const { sidebarConfig } = useStandardizedSidebar();

  // State management
  const [evaluation, setEvaluation] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch evaluation summary
  const fetchEvaluationSummary = async () => {
    try {
      setLoading(true);
      const result = await staffEvaluationsApi.getEvaluationFormById(
        id,
        accessToken
      );

      if (result.success) {
        const data = result.data.data || result.data;
        setEvaluation(data);

        // Mock evaluation summary data based on the image
        const mockResponses = [
          {
            section: "Performance Goals",
            items: [
              {
                title: "Goal 1: Increase Sales by 15%",
                description: "Achieved all quarterly targets",
                status: "completed",
              },
              {
                title: "Goal 2: Improve Client Satisfaction",
                description: "Exceeded expectations in client satisfaction",
                status: "completed",
              },
            ],
          },
          {
            section: "Skills and Development",
            items: [
              {
                title: "Skill 1: CRM Proficiency",
                description: "Completed training on new CRM system",
                status: "completed",
              },
              {
                title: "Skill 2: Leadership Development",
                description: "Attended leadership workshop",
                status: "completed",
              },
            ],
          },
          {
            section: "Feedback and Contributions",
            items: [
              {
                title: "Team Collaboration",
                description: "Actively participated in team meetings",
                status: "completed",
              },
              {
                title: "Mentorship",
                description: "Provided mentorship to new team members",
                status: "completed",
              },
            ],
          },
          {
            section: "Areas for Improvement",
            items: [
              {
                title: "Time Management",
                description: "Needs improvement in time management",
                status: "incomplete",
              },
              {
                title: "Project Planning",
                description: "Requires further training in project planning",
                status: "incomplete",
              },
            ],
          },
        ];

        setResponses(mockResponses);
      } else {
        toast.error(result.error || "Failed to fetch evaluation summary");
        navigate("/staff/evaluations");
      }
    } catch (error) {
      console.error("Error fetching evaluation summary:", error);
      toast.error("Failed to load evaluation summary");
      navigate("/staff/evaluations");
    } finally {
      setLoading(false);
    }
  };

  // Check if user can access this evaluation summary
  useEffect(() => {
    const checkAccess = () => {
      if (!id) return;

      // Check if evaluation is completed
      const isCompleted = staffEvaluationsApi.isEvaluationCompleted(id);

      if (!isCompleted) {
        toast.error(
          "You can only view the summary after completing the evaluation"
        );
        navigate(`/staff/evaluations/${id}/form`);
        return;
      }
    };

    checkAccess();
  }, [id, navigate]);

  useEffect(() => {
    if (accessToken && id) {
      fetchEvaluationSummary();
    }
  }, [accessToken, id]);

  // Handle edit
  const handleEdit = () => {
    navigate(`/staff/evaluations/${id}/form`);
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Mock submission - in real implementation, this would submit the evaluation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Evaluation submitted successfully!");
      navigate(`/staff/evaluations/${id}/success`);
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast.error("Failed to submit evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "U";
  };

  // Get profile image URL
  const getProfileImageUrl = () => {
    return user?.profileImage || user?.avatar || user?.photoUrl || null;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    if (status === "completed") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Incomplete
        </Badge>
      );
    }
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
            <p className="text-gray-600">Loading evaluation summary...</p>
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
            <p className="text-gray-600">Evaluation summary not found</p>
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
        <div className="flex items-center gap-4 mb-6">
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

        {/* Main Content Card */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="relative pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Evaluation Summary
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Review your responses before submitting. Unanswered questions
                  are highlighted.
                </p>
              </div>

              {/* More Options Menu */}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Evaluation Sections */}
            {responses.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {section.section}
                </h3>

                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`p-4 rounded-lg border ${
                        item.status === "incomplete"
                          ? "bg-gray-50 border-gray-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="px-6"
                disabled={submitting}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 bg-green-600 hover:bg-green-700 text-white"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Submit
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StaffDashboardLayout>
  );
};

export default EvaluationSummary;
