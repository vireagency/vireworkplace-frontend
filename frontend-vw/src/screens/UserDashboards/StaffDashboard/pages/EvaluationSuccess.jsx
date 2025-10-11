import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Bell, CheckCircle, Eye, Home } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Layout and Auth
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useStandardizedSidebar } from "@/hooks/useStandardizedSidebar";

const EvaluationSuccess = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { sidebarConfig } = useStandardizedSidebar();

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

  // Handle view evaluation
  const handleViewEvaluation = () => {
    // Navigate to view the evaluation summary
    navigate(`/staff/evaluations/${id}/summary`);
  };

  // Handle return to dashboard
  const handleReturnToDashboard = () => {
    navigate("/staff/dashboard");
  };

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

        {/* Success Message Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="relative pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Evaluation Submitted
                </CardTitle>
              </div>

              {/* More Options Menu */}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <div className="w-4 h-4 flex flex-col justify-center items-center">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="text-center py-8">
            {/* Success Message */}
            <p className="text-gray-700 text-base leading-relaxed mb-8 max-w-md mx-auto">
              Your evaluation has been successfully submitted. You can view the
              completed evaluation or return to the dashboard.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3 max-w-sm mx-auto">
              <Button
                onClick={handleViewEvaluation}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium rounded-lg"
              >
                View Evaluation
              </Button>

              <Button
                onClick={handleReturnToDashboard}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 text-base font-medium rounded-lg"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StaffDashboardLayout>
  );
};

export default EvaluationSuccess;
