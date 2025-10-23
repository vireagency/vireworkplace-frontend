import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { adminDashboardConfig } from "@/config/dashboardConfigs";
import adminData from "./adminData.json";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Target,
  Loader2,
  Edit,
  Trash2,
  Users,
  BarChart3,
  Award,
} from "lucide-react";
import { GoalCreationModal } from "@/components/auth/GoalCreationModal";
import { useAuth } from "@/hooks/useAuth";
import { goalsApi } from "@/services/goalsApi";
import { performanceTrendsApi } from "@/services/performanceTrendsApi";
import { toast } from "sonner";

export default function AdminPerformancePage() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeframe, setTimeframe] = useState("12-months");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goals, setGoals] = useState([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [isDeletingGoal, setIsDeletingGoal] = useState(null);

  // Performance trends state
  const [performanceTrends, setPerformanceTrends] = useState(null);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);

  // Admin Overview state
  const [adminOverview, setAdminOverview] = useState(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);

  // Fetch goals from API
  useEffect(() => {
    const fetchGoals = async () => {
      if (!accessToken) return;

      try {
        setIsLoadingGoals(true);
        const result = await goalsApi.getGoals(accessToken);

        if (result.success) {
          setGoals(result.data || []);
        } else {
          toast.error(result.error || "Failed to load goals");
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
        toast.error("Failed to load goals");
      } finally {
        setIsLoadingGoals(false);
      }
    };

    fetchGoals();
  }, [accessToken]);

  // Fetch performance trends
  useEffect(() => {
    const fetchTrends = async () => {
      if (!accessToken) return;

      try {
        setIsLoadingTrends(true);
        const result = await performanceTrendsApi.getTrends(
          accessToken,
          timeframe
        );

        if (result.success) {
          setPerformanceTrends(result.data);
        } else {
          toast.error(result.error || "Failed to load performance trends");
        }
      } catch (error) {
        console.error("Error fetching performance trends:", error);
        toast.error("Failed to load performance trends");
      } finally {
        setIsLoadingTrends(false);
      }
    };

    fetchTrends();
  }, [accessToken, timeframe]);

  // Handle goal creation
  const handleCreateGoal = async (goalData) => {
    try {
      const result = await goalsApi.createGoal(accessToken, goalData);

      if (result.success) {
        setGoals((prev) => [...prev, result.data]);
        toast.success("Goal created successfully");
        setIsModalOpen(false);
      } else {
        toast.error(result.error || "Failed to create goal");
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal");
    }
  };

  // Handle goal update
  const handleUpdateGoal = async (goalId, goalData) => {
    try {
      const result = await goalsApi.updateGoal(accessToken, goalId, goalData);

      if (result.success) {
        setGoals((prev) =>
          prev.map((goal) =>
            goal.id === goalId ? { ...goal, ...goalData } : goal
          )
        );
        toast.success("Goal updated successfully");
        setEditingGoal(null);
      } else {
        toast.error(result.error || "Failed to update goal");
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Failed to update goal");
    }
  };

  // Handle goal deletion
  const handleDeleteGoal = async (goalId) => {
    try {
      setIsDeletingGoal(goalId);
      const result = await goalsApi.deleteGoal(accessToken, goalId);

      if (result.success) {
        setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
        toast.success("Goal deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete goal");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    } finally {
      setIsDeletingGoal(null);
    }
  };

  return (
    <DashboardLayout
      sidebarConfig={adminDashboardConfig}
      showSectionCards={true}
      showChart={true}
      showDataTable={true}
      dataTableData={adminData}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Performance Management
            </h1>
            <p className="text-gray-600">
              Monitor and manage organizational performance metrics
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Target className="w-4 h-4 mr-2" />
            Create Goal
          </Button>
        </div>

        {/* Performance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goals.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Goals
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {goals.filter((goal) => goal.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {goals.length > 0
                  ? Math.round(
                      (goals.filter((goal) => goal.status === "completed")
                        .length /
                        goals.length) *
                        100
                    )
                  : 0}
                % completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Goals
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {goals.filter((goal) => goal.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Team Performance
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +5% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Goals Management</TabsTrigger>
            <TabsTrigger value="trends">Performance Trends</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Department Performance
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Engineering</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: "85%" }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">HR</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: "92%" }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">92%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Finance</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: "78%" }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">78%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Productivity Index
                        </span>
                        <Badge variant="secondary" className="text-green-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          87%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Goal Completion
                        </span>
                        <Badge variant="secondary" className="text-blue-600">
                          73%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Team Satisfaction
                        </span>
                        <Badge variant="secondary" className="text-green-600">
                          91%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Goals Management</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingGoals ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading goals...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {goals.length === 0 ? (
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No goals created yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Create your first goal to start tracking performance
                        </p>
                        <Button onClick={() => setIsModalOpen(true)}>
                          <Target className="w-4 h-4 mr-2" />
                          Create Goal
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {goals.map((goal) => (
                          <div
                            key={goal.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium">{goal.title}</h4>
                              <p className="text-sm text-gray-600">
                                {goal.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge
                                  variant={
                                    goal.status === "completed"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {goal.status}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  Due:{" "}
                                  {new Date(goal.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingGoal(goal)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteGoal(goal.id)}
                                disabled={isDeletingGoal === goal.id}
                              >
                                {isDeletingGoal === goal.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTrends ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading trends...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Performance Trends
                      </h3>
                      <p className="text-gray-500">
                        Trend analysis will be displayed here
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Advanced Analytics
                  </h3>
                  <p className="text-gray-500">
                    Detailed performance analytics will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Goal Creation Modal */}
      <GoalCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGoal}
        editingGoal={editingGoal}
        onUpdate={handleUpdateGoal}
      />
    </DashboardLayout>
  );
}
