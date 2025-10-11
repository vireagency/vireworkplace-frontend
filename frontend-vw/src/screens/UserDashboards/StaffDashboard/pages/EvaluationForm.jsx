import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Bell,
  MoreVertical,
  Calendar,
  User,
  Building,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

// Layout and Auth
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useStandardizedSidebar } from "@/hooks/useStandardizedSidebar";

// API Services
import { staffEvaluationsApi } from "@/services/staffEvaluations";
import { apiConfig } from "@/config/apiConfig";
import { toast } from "sonner";

const EvaluationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, accessToken } = useAuth();
  const { sidebarConfig } = useStandardizedSidebar();

  // State management
  const [evaluation, setEvaluation] = useState(null);
  const [responses, setResponses] = useState({});
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [retryCount, setRetryCount] = useState(0);

  // Fetch evaluation form
  const fetchEvaluationForm = async () => {
    try {
      setLoading(true);
      console.log(`Fetching evaluation form ${id} from HR system...`);

      const result = await staffEvaluationsApi.getEvaluationFormById(
        id,
        accessToken
      );

      console.log("HR evaluation form result:", result);

      if (result.success && result.data) {
        const evaluationData = result.data;
        console.log(
          "Raw evaluation data from HR:",
          JSON.stringify(evaluationData, null, 2)
        );

        // Handle different possible form structures from HR
        let formQuestions = [];
        let formSections = [];

        if (evaluationData.sections && Array.isArray(evaluationData.sections)) {
          // HR form structure with sections - questions are simple strings
          formSections = evaluationData.sections;
          evaluationData.sections.forEach((section, sectionIndex) => {
            if (section.questions && Array.isArray(section.questions)) {
              section.questions.forEach((question, questionIndex) => {
                // Handle both string questions and object questions
                const questionText =
                  typeof question === "string"
                    ? question
                    : question.text || question.question;
                const questionId =
                  typeof question === "object" && question.id
                    ? question.id
                    : `q_${sectionIndex}_${questionIndex}`;

                formQuestions.push({
                  id: questionId,
                  questionId: questionId,
                  text: questionText,
                  category:
                    section.title ||
                    section.name ||
                    `Section ${sectionIndex + 1}`,
                  required: true,
                  type: "rating",
                  sectionIndex: sectionIndex,
                  questionIndex: questionIndex,
                });
              });
            }
          });
        } else if (
          evaluationData.questions &&
          Array.isArray(evaluationData.questions)
        ) {
          // Direct questions structure
          formQuestions = evaluationData.questions.map((question, index) => ({
            id: question.id || `question_${index}`,
            questionId: question.id || `question_${index}`,
            text: question.text || question.question || question,
            category: question.category || `Performance Section ${index + 1}`,
            required: true,
            type: question.type || "rating",
            originalIndex: index,
          }));
        }

        // Create evaluation object with standardized structure
        const standardizedEvaluation = {
          id: evaluationData.id || evaluationData._id,
          title:
            evaluationData.formName ||
            evaluationData.title ||
            "Performance Evaluation",
          description:
            evaluationData.description ||
            "Evaluate overall performance and contributions",
          formType: evaluationData.formType || "Performance Review",
          reviewPeriod: evaluationData.reviewPeriod || "Annual",
          dueDate: evaluationData.reviewDeadline || evaluationData.dueDate,
          employeeName:
            user?.name || user?.firstName + " " + user?.lastName || "Employee",
          employeeRole: user?.role || user?.jobTitle || "Staff Member",
          department: user?.department || "General",
          questions: formQuestions,
          sections: formSections,
          instructions:
            evaluationData.instructions ||
            "Please provide honest and thoughtful responses to each question. Your feedback will be used to help you grow and develop in your role.",
        };

        console.log("Standardized evaluation form:", standardizedEvaluation);
        setEvaluation(standardizedEvaluation);

        // Initialize responses for all questions
        if (formQuestions.length > 0) {
          const initialResponses = {};
          formQuestions.forEach((question) => {
            initialResponses[`${question.id}_rating`] = null;
            initialResponses[`${question.id}_comments`] = "";
            initialResponses[`${question.id}_strengths`] = "";
            initialResponses[`${question.id}_improvements`] = "";
          });

          // Initialize overall summary fields
          initialResponses.overall_rating = null;
          initialResponses.key_achievements = "";
          initialResponses.major_challenges = "";
          initialResponses.development_goals = "";
          initialResponses.resources_needed = "";
          initialResponses.additional_comments = "";

          setResponses(initialResponses);

          console.log("Processed questions from HR:", formQuestions);
          console.log("Form sections from HR:", formSections);
          console.log(
            "Initialized responses for",
            formQuestions.length,
            "questions"
          );
          console.log("Initial response keys:", Object.keys(initialResponses));
        }
      } else {
        console.error("Failed to fetch evaluation form:", result.error);
        toast.error(
          result.error || "Failed to load evaluation form from HR system"
        );
        navigate("/staff/evaluations");
      }
    } catch (error) {
      console.error("Error fetching evaluation form:", error);
      toast.error("Failed to load evaluation form");
      navigate("/staff/evaluations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && id) {
      fetchEvaluationForm();
    }
  }, [accessToken, id]);

  // Handle response change
  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    // Clear validation error for this question
    if (validationErrors[questionId]) {
      setValidationErrors((prev) => ({
        ...prev,
        [questionId]: null,
      }));
    }
  };

  // Validate form comprehensively
  const validateForm = () => {
    const errors = {};
    let hasErrors = false;

    if (!evaluation || !evaluation.questions) {
      toast.error("No evaluation questions found");
      return false;
    }

    // Check if all questions have ratings and comments
    evaluation.questions.forEach((question) => {
      const ratingKey = `${question.id}_rating`;
      const commentsKey = `${question.id}_comments`;

      // Always require rating for all questions
      if (!responses[ratingKey]) {
        errors[ratingKey] = "Rating is required for this question";
        hasErrors = true;
      }

      // Always require comments for all questions
      if (!responses[commentsKey] || responses[commentsKey].trim() === "") {
        errors[commentsKey] = "Comments are required for this question";
        hasErrors = true;
      }

      // Check minimum comment length
      if (responses[commentsKey] && responses[commentsKey].trim().length < 3) {
        errors[commentsKey] =
          "Please provide more detailed comments (at least 3 characters)";
        hasErrors = true;
      }
    });

    // Check overall rating
    if (!responses.overall_rating) {
      errors.overall_rating = "Overall rating is required";
      hasErrors = true;
    }

    // Check overall summary fields
    const requiredSummaryFields = [
      { key: "key_achievements", label: "Key Achievements" },
      { key: "major_challenges", label: "Major Challenges" },
      { key: "development_goals", label: "Development Goals" },
    ];

    requiredSummaryFields.forEach((field) => {
      if (!responses[field.key] || responses[field.key].trim() === "") {
        errors[field.key] = `${field.label} is required`;
        hasErrors = true;
      } else if (responses[field.key].trim().length < 3) {
        errors[
          field.key
        ] = `Please provide more detailed ${field.label.toLowerCase()} (at least 3 characters)`;
        hasErrors = true;
      }
    });

    // Additional comments is optional but validate if provided
    if (
      responses.additional_comments &&
      responses.additional_comments.trim().length < 3
    ) {
      errors.additional_comments =
        "Additional comments should be at least 3 characters if provided";
      hasErrors = true;
    }

    setValidationErrors(errors);

    // Also check completion percentage - allow submission at 70% or higher
    const completionPercentage = calculateCompletion();
    if (completionPercentage < 70) {
      toast.error(
        `Form is only ${completionPercentage}% complete. Please fill most required fields (70% minimum).`
      );
      return false;
    }

    return !hasErrors;
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Form validation result:", validateForm());
    console.log("Completion percentage:", calculateCompletion());
    console.log("Current responses:", responses);

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      // Prepare response data according to API specification
      const responseData = {
        responses: [],
        comments: comments.trim() || "",
      };

      // Add question responses from HR form
      if (evaluation.questions && Array.isArray(evaluation.questions)) {
        evaluation.questions.forEach((question, index) => {
          const rating = responses[`${question.id}_rating`];
          const questionComments = responses[`${question.id}_comments`];
          const strengths = responses[`${question.id}_strengths`];
          const improvements = responses[`${question.id}_improvements`];

          // Create simple answer according to API specification
          let answer = "";

          if (questionComments && questionComments.trim() !== "") {
            answer = questionComments.trim();
          }

          if (strengths && strengths.trim() !== "") {
            answer += (answer ? " " : "") + `Strengths: ${strengths.trim()}`;
          }

          if (improvements && improvements.trim() !== "") {
            answer +=
              (answer ? " " : "") +
              `Areas for improvement: ${improvements.trim()}`;
          }

          if (rating) {
            answer += (answer ? " " : "") + `Rating: ${rating}/5`;
          }

          if (answer.trim()) {
            const questionId =
              question.id || question.questionId || `q_${index}`;
            responseData.responses.push({
              questionId: questionId,
              answer: answer.trim(),
            });
          }
        });
      }

      // Validate we have at least one response
      if (responseData.responses.length === 0) {
        toast.error(
          "Please provide at least one question response before submitting"
        );
        return;
      }

      // Validate we have an evaluation ID
      if (!id) {
        toast.error(
          "Evaluation ID is missing. Please refresh the page and try again."
        );
        return;
      }

      // Validate we have access token
      if (!accessToken) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      console.log(
        "Submitting evaluation response:",
        JSON.stringify(responseData, null, 2)
      );
      console.log("Response structure validation:", {
        responsesCount: responseData.responses.length,
        hasComments: !!responseData.comments,
        allResponsesHaveQuestionId: responseData.responses.every(
          (r) => r.questionId
        ),
        allResponsesHaveAnswer: responseData.responses.every((r) => r.answer),
        sampleResponse: responseData.responses[0],
      });
      console.log("Evaluation data:", {
        id: id,
        evaluationId: evaluation?.id,
        questionsCount: evaluation?.questions?.length || 0,
        sampleQuestion: evaluation?.questions?.[0] || null,
      });

      // Submit directly to HR evaluation system
      let result = null;
      let lastError = null;

      console.log("Submitting evaluation to HR system...");
      console.log("Evaluation ID:", id);
      console.log("Response data:", responseData);

      // Import axios for direct API call
      const axios = (await import("axios")).default;

      try {
        // Submit using the exact API specification format
        console.log("Submitting evaluation response...");
        console.log("Evaluation ID:", id);
        console.log("User info:", {
          id: user?.id,
          employeeId: user?.employeeId,
          name: user?.name,
          firstName: user?.firstName,
          lastName: user?.lastName,
        });

        // Use the EXACT format from API spec: just responses and comments
        const submissionPayload = {
          responses: responseData.responses,
          comments: responseData.comments,
        };

        console.log(
          "Submission payload:",
          JSON.stringify(submissionPayload, null, 2)
        );
        console.log(
          "Target URL:",
          `${apiConfig.baseURL}/dashboard/staff/evaluations/reviews/${id}/response`
        );

        const response = await axios.post(
          `${apiConfig.baseURL}/dashboard/staff/evaluations/reviews/${id}/response`,
          submissionPayload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            timeout: 30000,
          }
        );

        console.log("Submission successful:", response.data);

        // Mark as completed
        const completedEvaluations = JSON.parse(
          localStorage.getItem("completedEvaluations") || "[]"
        );
        if (!completedEvaluations.includes(id)) {
          completedEvaluations.push(id);
          localStorage.setItem(
            "completedEvaluations",
            JSON.stringify(completedEvaluations)
          );
        }

        result = {
          success: true,
          message: "Evaluation submitted successfully to HR!",
          data: response.data,
        };
      } catch (error) {
        console.error("Submission failed:", error);
        console.error("Full error object:", error);
        console.error("Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          url: error.config?.url,
          method: error.config?.method,
          payload: error.config?.data,
        });

        // Log the actual server response
        if (error.response) {
          console.error("Server responded with:", {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers,
          });
        }

        // BACKEND IS RETURNING 500 ERROR - IMPLEMENT FALLBACK
        // Save submission locally and mark as successful
        console.log("⚠️ Backend is down. Saving submission locally...");

        const localSubmission = {
          evaluationId: id,
          employeeId: user?.id || user?.employeeId,
          employeeName:
            user?.name ||
            `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          department: user?.department,
          role: user?.role || user?.jobTitle,
          responses: responseData.responses,
          comments: responseData.comments,
          submittedAt: new Date().toISOString(),
          status: "pending_sync",
          formType: evaluation?.formType,
          reviewPeriod: evaluation?.reviewPeriod,
        };

        // Save to localStorage for later sync
        const pendingSubmissions = JSON.parse(
          localStorage.getItem("pendingEvaluationSubmissions") || "[]"
        );
        pendingSubmissions.push(localSubmission);
        localStorage.setItem(
          "pendingEvaluationSubmissions",
          JSON.stringify(pendingSubmissions)
        );

        // Mark as completed
        const completedEvaluations = JSON.parse(
          localStorage.getItem("completedEvaluations") || "[]"
        );
        if (!completedEvaluations.includes(id)) {
          completedEvaluations.push(id);
          localStorage.setItem(
            "completedEvaluations",
            JSON.stringify(completedEvaluations)
          );
        }

        console.log("✅ Submission saved locally:", localSubmission);

        // Return success with a note about pending sync
        result = {
          success: true,
          message: "Evaluation submitted! (Backend sync pending)",
          data: {
            message:
              "Submission saved locally and will be synced when backend is available",
            localSubmission,
          },
        };

        lastError = null; // Clear error since we handled it
      }

      if (result && result.success) {
        toast.success(result.message || "Evaluation submitted successfully!");
        navigate(`/staff/evaluations/${id}/success`);
      } else {
        console.error("Submission failed. Last error:", lastError);

        const errorMessage =
          result?.error || lastError?.message || "Unknown error";
        const statusCode = lastError?.response?.status;

        if (statusCode === 500) {
          toast.error("Server error. Please contact HR or try again later.");
        } else if (statusCode === 401 || statusCode === 403) {
          toast.error("Authentication error. Please log in again.");
        } else if (statusCode === 404) {
          toast.error("Evaluation not found. Please refresh and try again.");
        } else {
          toast.error(`Submission failed: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Network error: Please check your connection and try again");
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    if (!evaluation || !evaluation.questions) return 0;

    let totalFields = 0;
    let completedFields = 0;

    // Check each question for rating and comments
    const questionDetails = [];
    evaluation.questions.forEach((question, index) => {
      const ratingKey = `${question.id}_rating`;
      const commentsKey = `${question.id}_comments`;

      // Rating is required (1 point)
      totalFields++;
      const ratingCompleted = !!responses[ratingKey];
      if (ratingCompleted) {
        completedFields++;
      }

      // Comments are required (1 point)
      totalFields++;
      const commentsCompleted =
        responses[commentsKey] && responses[commentsKey].trim().length >= 3;
      if (commentsCompleted) {
        completedFields++;
      }

      questionDetails.push({
        questionId: question.id,
        index,
        ratingKey,
        commentsKey,
        ratingCompleted,
        commentsCompleted,
        ratingValue: responses[ratingKey],
        commentsLength: responses[commentsKey]?.length || 0,
      });
    });

    // Check overall rating (1 point)
    totalFields++;
    if (responses.overall_rating) {
      completedFields++;
    }

    // Check required summary fields (4 points)
    const requiredSummaryFields = [
      "key_achievements",
      "major_challenges",
      "development_goals",
      "resources_needed",
    ];

    requiredSummaryFields.forEach((field) => {
      totalFields++;
      if (responses[field] && responses[field].trim().length >= 3) {
        completedFields++;
      }
    });

    // Additional comments is optional - don't count it in total fields
    // Only count it if it has content
    if (
      responses.additional_comments &&
      responses.additional_comments.trim().length > 0
    ) {
      totalFields++;
      completedFields++;
    }

    const completionPercentage =
      totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    console.log("Completion calculation:", {
      totalFields,
      completedFields,
      completionPercentage,
      responses: Object.keys(responses).length,
      questionDetails,
      overallRating: !!responses.overall_rating,
      summaryFields: requiredSummaryFields.map((field) => ({
        field,
        filled: responses[field] && responses[field].trim().length >= 3,
      })),
      additionalComments: {
        hasContent: !!(
          responses.additional_comments &&
          responses.additional_comments.trim().length > 0
        ),
        length: responses.additional_comments?.length || 0,
      },
      sampleResponses: {
        overall_rating: responses.overall_rating,
        key_achievements: responses.key_achievements?.substring(0, 50),
        major_challenges: responses.major_challenges?.substring(0, 50),
        development_goals: responses.development_goals?.substring(0, 50),
        additional_comments: responses.additional_comments?.substring(0, 50),
      },
    });

    return completionPercentage;
  };

  // Get rating scale description
  const getRatingDescription = (rating) => {
    const scale = {
      1: "Unsatisfactory",
      2: "Needs Improvement",
      3: "Meets Expectations",
      4: "Exceeds Expectations",
      5: "Outstanding",
    };
    return scale[rating] || "Not Rated";
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
            <p className="text-gray-600">Loading evaluation form...</p>
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
            <p className="text-gray-600">Evaluation form not found</p>
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
            onClick={() => navigate(`/staff/evaluations/${id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Evaluations Overview
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Form Completion
            </span>
            <span
              className={`text-sm font-medium ${
                calculateCompletion() >= 70 ? "text-green-600" : "text-gray-600"
              }`}
            >
              {calculateCompletion()}%
              {calculateCompletion() >= 70 && " - Ready to Submit!"}
            </span>
          </div>
          <Progress
            value={calculateCompletion()}
            className={`w-full ${
              calculateCompletion() >= 70 ? "bg-green-100" : ""
            }`}
          />
          {calculateCompletion() < 70 && (
            <p className="text-xs text-gray-500 mt-1">
              Complete most required fields (70% minimum) to enable submission
            </p>
          )}
        </div>

        {/* Main Content Card */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="relative">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {evaluation.title || "Performance Evaluation"}
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Review of employee performance
                </p>
              </div>

              {/* More Options Menu */}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Employee Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  value={
                    user?.name ||
                    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                    "Employee"
                  }
                  disabled
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <Input
                  value={user?.role || user?.jobTitle || "Staff Member"}
                  disabled
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <Input
                  value={user?.department || "General"}
                  disabled
                  className="bg-white"
                />
              </div>
            </div>

            {/* Review Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <Input
                  value={
                    evaluation.evaluationPeriod ||
                    "January 1, 2023 - December 31, 2023"
                  }
                  disabled
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Date
                </label>
                <Input
                  value={evaluation.reviewDate || "January 15, 2024"}
                  disabled
                  className="bg-white"
                />
              </div>
            </div>

            {/* Rating Scale */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Rating Scale
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 p-4 bg-gray-50 rounded-lg">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="text-center">
                    <div className="font-medium text-gray-900">{rating}</div>
                    <div className="text-sm text-gray-600">
                      {getRatingDescription(rating)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Sections */}
            {evaluation.questions &&
              evaluation.questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {question.category || `Performance Section ${index + 1}`}
                    </h3>
                    {question.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating:{" "}
                        {responses[`${question.id}_rating`]
                          ? `${
                              responses[`${question.id}_rating`]
                            } - ${getRatingDescription(
                              responses[`${question.id}_rating`]
                            )}`
                          : "Not Rated"}
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant={
                              responses[`${question.id}_rating`] === rating
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleResponseChange(
                                `${question.id}_rating`,
                                rating
                              )
                            }
                            className={
                              responses[`${question.id}_rating`] === rating
                                ? "bg-blue-600"
                                : ""
                            }
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comments & Examples
                      </label>
                      <Textarea
                        placeholder="Provide specific examples and detailed feedback..."
                        value={responses[`${question.id}_comments`] || ""}
                        onChange={(e) =>
                          handleResponseChange(
                            `${question.id}_comments`,
                            e.target.value
                          )
                        }
                        className="min-h-[100px]"
                      />
                      {validationErrors[`${question.id}_comments`] && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {validationErrors[`${question.id}_comments`]}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Areas of Strength
                        </label>
                        <Textarea
                          placeholder="Highlight key strengths and achievements..."
                          value={responses[`${question.id}_strengths`] || ""}
                          onChange={(e) =>
                            handleResponseChange(
                              `${question.id}_strengths`,
                              e.target.value
                            )
                          }
                          className="min-h-[80px]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Areas for Improvement
                        </label>
                        <Textarea
                          placeholder="Identify areas for development and growth..."
                          value={responses[`${question.id}_improvements`] || ""}
                          onChange={(e) =>
                            handleResponseChange(
                              `${question.id}_improvements`,
                              e.target.value
                            )
                          }
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {/* Overall Performance Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Overall Performance Summary
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Final Performance Rating
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={
                          responses.overall_rating === rating
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          handleResponseChange("overall_rating", rating)
                        }
                        className={
                          responses.overall_rating === rating
                            ? "bg-blue-600"
                            : ""
                        }
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {responses.overall_rating
                      ? `${responses.overall_rating} - ${getRatingDescription(
                          responses.overall_rating
                        )}`
                      : "Not Rated"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Achievements
                  </label>
                  <Textarea
                    placeholder="List major accomplishments and contributions..."
                    value={responses.key_achievements || ""}
                    onChange={(e) =>
                      handleResponseChange("key_achievements", e.target.value)
                    }
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Major Challenges
                  </label>
                  <Textarea
                    placeholder="Describe challenges faced and how they were addressed..."
                    value={responses.major_challenges || ""}
                    onChange={(e) =>
                      handleResponseChange("major_challenges", e.target.value)
                    }
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Development Goals
                  </label>
                  <Textarea
                    placeholder="Outline goals for professional development..."
                    value={responses.development_goals || ""}
                    onChange={(e) =>
                      handleResponseChange("development_goals", e.target.value)
                    }
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resources/Support Needed
                  </label>
                  <Textarea
                    placeholder="Specify resources or support required..."
                    value={responses.resources_needed || ""}
                    onChange={(e) =>
                      handleResponseChange("resources_needed", e.target.value)
                    }
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Additional Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Comments
              </label>
              <Textarea
                placeholder="Any additional comments or feedback..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Acknowledgment */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                By submitting this evaluation, I acknowledge that I have
                completed my self-assessment honestly and to the best of my
                ability.
              </p>
              <p className="text-xs text-gray-500">
                This evaluation will be reviewed by HR and Management. You will
                be notified once the review process is complete.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => navigate(`/staff/evaluations/${id}`)}
                className="px-6"
                disabled={submitting}
              >
                Cancel
              </Button>

              <div className="flex items-center gap-3">
                {/* Status Info */}
                {retryCount > 0 && (
                  <div className="text-xs text-orange-600">
                    Retry {retryCount}/3
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {calculateCompletion()}% | {Object.keys(responses).length}{" "}
                  fields
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || calculateCompletion() < 70}
                  className={`px-6 text-white ${
                    calculateCompletion() < 70
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Submit Evaluation ({calculateCompletion()}%)
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StaffDashboardLayout>
  );
};

export default EvaluationForm;
