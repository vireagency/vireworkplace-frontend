import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { adminDashboardConfig } from "@/config/dashboardConfigs";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  FileText,
  Users,
  Calendar,
  Star,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

export default function AdminEvaluationsPage() {
  const { accessToken, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [isCreateEvaluationModalOpen, setIsCreateEvaluationModalOpen] =
    useState(false);
  const [isEditEvaluationModalOpen, setIsEditEvaluationModalOpen] =
    useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock evaluation data
  const [evaluations, setEvaluations] = useState([
    {
      id: 1,
      title: "Q4 2023 Performance Review",
      type: "Performance",
      status: "Completed",
      employee: "John Doe",
      employeeId: 1,
      evaluator: "Jane Smith",
      startDate: "2023-10-01",
      endDate: "2023-12-31",
      dueDate: "2024-01-15",
      score: 4.2,
      maxScore: 5.0,
      progress: 100,
      categories: [
        { name: "Technical Skills", score: 4.5, maxScore: 5 },
        { name: "Communication", score: 4.0, maxScore: 5 },
        { name: "Teamwork", score: 4.2, maxScore: 5 },
        { name: "Leadership", score: 4.1, maxScore: 5 },
      ],
      feedback:
        "Excellent performance throughout the quarter. Strong technical skills and good team collaboration.",
      avatar: null,
    },
    {
      id: 2,
      title: "Annual 360 Review",
      type: "360 Review",
      status: "In Progress",
      employee: "Jane Smith",
      employeeId: 2,
      evaluator: "Mike Johnson",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      dueDate: "2024-02-15",
      score: 0,
      maxScore: 5.0,
      progress: 65,
      categories: [
        { name: "Leadership", score: 0, maxScore: 5 },
        { name: "Communication", score: 0, maxScore: 5 },
        { name: "Strategic Thinking", score: 0, maxScore: 5 },
        { name: "Team Management", score: 0, maxScore: 5 },
      ],
      feedback: "",
      avatar: null,
    },
    {
      id: 3,
      title: "Probation Review",
      type: "Probation",
      status: "Pending",
      employee: "David Brown",
      employeeId: 5,
      evaluator: "Sarah Wilson",
      startDate: "2024-01-15",
      endDate: "2024-02-15",
      dueDate: "2024-02-20",
      score: 0,
      maxScore: 5.0,
      progress: 0,
      categories: [
        { name: "Job Performance", score: 0, maxScore: 5 },
        { name: "Adaptability", score: 0, maxScore: 5 },
        { name: "Learning", score: 0, maxScore: 5 },
        { name: "Cultural Fit", score: 0, maxScore: 5 },
      ],
      feedback: "",
      avatar: null,
    },
  ]);

  const [newEvaluation, setNewEvaluation] = useState({
    title: "",
    type: "",
    employeeId: "",
    evaluator: "",
    startDate: "",
    endDate: "",
    dueDate: "",
  });

  const handleCreateEvaluation = async () => {
    if (
      !newEvaluation.title ||
      !newEvaluation.type ||
      !newEvaluation.employeeId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const evaluation = {
        id: evaluations.length + 1,
        ...newEvaluation,
        status: "Pending",
        score: 0,
        maxScore: 5.0,
        progress: 0,
        categories: [],
        feedback: "",
        avatar: null,
      };

      setEvaluations((prev) => [...prev, evaluation]);
      setNewEvaluation({
        title: "",
        type: "",
        employeeId: "",
        evaluator: "",
        startDate: "",
        endDate: "",
        dueDate: "",
      });
      setIsCreateEvaluationModalOpen(false);
      toast.success("Evaluation created successfully");
    } catch (error) {
      toast.error("Failed to create evaluation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEvaluation = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setIsEditEvaluationModalOpen(true);
  };

  const handleUpdateEvaluation = async () => {
    if (!selectedEvaluation) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEvaluations((prev) =>
        prev.map((eval) =>
          eval.id === selectedEvaluation.id ? selectedEvaluation : eval
        )
      );
      setIsEditEvaluationModalOpen(false);
      setSelectedEvaluation(null);
      toast.success("Evaluation updated successfully");
    } catch (error) {
      toast.error("Failed to update evaluation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvaluation = async (evaluationId) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEvaluations((prev) => prev.filter((eval) => eval.id !== evaluationId));
      toast.success("Evaluation deleted successfully");
    } catch (error) {
      toast.error("Failed to delete evaluation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEvaluation = async (evaluationId) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEvaluations((prev) =>
        prev.map((eval) =>
          eval.id === evaluationId
            ? { ...eval, status: "In Progress", progress: 10 }
            : eval
        )
      );
      toast.success("Evaluation started");
    } catch (error) {
      toast.error("Failed to start evaluation");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvaluations = evaluations.filter((evaluation) => {
    const matchesSearch =
      evaluation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.evaluator.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || evaluation.status === selectedStatus;
    const matchesType =
      selectedType === "all" || evaluation.type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "In Progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "Pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Completed: "bg-green-100 text-green-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Pending: "bg-yellow-100 text-yellow-800",
    };

    return (
      <Badge className={variants[status] || variants.Pending}>{status}</Badge>
    );
  };

  const getTypeBadge = (type) => {
    const variants = {
      Performance: "bg-purple-100 text-purple-800",
      "360 Review": "bg-indigo-100 text-indigo-800",
      Probation: "bg-orange-100 text-orange-800",
    };

    return (
      <Badge className={variants[type] || "bg-gray-100 text-gray-800"}>
        {type}
      </Badge>
    );
  };

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
              Evaluation Management
            </h1>
            <p className="text-gray-600">
              Manage employee evaluations and performance reviews
            </p>
          </div>
          <Button onClick={() => setIsCreateEvaluationModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Evaluation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Evaluations
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{evaluations.length}</div>
              <p className="text-xs text-muted-foreground">
                +1 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  evaluations.filter((eval) => eval.status === "Completed")
                    .length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(
                  (evaluations.filter((eval) => eval.status === "Completed")
                    .length /
                    evaluations.length) *
                    100
                )}
                % completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  evaluations.filter((eval) => eval.status === "In Progress")
                    .length
                }
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Score
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {evaluations.filter((eval) => eval.status === "Completed")
                  .length > 0
                  ? (
                      evaluations
                        .filter((eval) => eval.status === "Completed")
                        .reduce((sum, eval) => sum + eval.score, 0) /
                      evaluations.filter((eval) => eval.status === "Completed")
                        .length
                    ).toFixed(1)
                  : "0.0"}
              </div>
              <p className="text-xs text-muted-foreground">Out of 5.0</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search evaluations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Performance">Performance</SelectItem>
                <SelectItem value="360 Review">360 Review</SelectItem>
                <SelectItem value="Probation">Probation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Evaluations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluations</CardTitle>
            <CardDescription>
              Manage employee evaluations and performance reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evaluation</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvaluations.map((evaluation) => (
                    <TableRow key={evaluation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{evaluation.title}</div>
                          <div className="text-sm text-gray-500">
                            Evaluator: {evaluation.evaluator}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={evaluation.avatar} />
                            <AvatarFallback>
                              {evaluation.employee
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">
                            {evaluation.employee}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(evaluation.type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(evaluation.status)}
                          <span className="ml-2">
                            {getStatusBadge(evaluation.status)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={evaluation.progress}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-500">
                            {evaluation.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {evaluation.status === "Completed" ? (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="font-medium">
                              {evaluation.score}/{evaluation.maxScore}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {evaluation.dueDate}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditEvaluation(evaluation)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {evaluation.status === "Pending" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStartEvaluation(evaluation.id)
                                }
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Start
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteEvaluation(evaluation.id)
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Evaluation Modal */}
      <Dialog
        open={isCreateEvaluationModalOpen}
        onOpenChange={setIsCreateEvaluationModalOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Evaluation</DialogTitle>
            <DialogDescription>
              Set up a new evaluation for an employee.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Evaluation Title *</Label>
              <Input
                id="title"
                value={newEvaluation.title}
                onChange={(e) =>
                  setNewEvaluation((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="e.g., Q1 2024 Performance Review"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Evaluation Type *</Label>
                <Select
                  value={newEvaluation.type}
                  onValueChange={(value) =>
                    setNewEvaluation((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="360 Review">360 Review</SelectItem>
                    <SelectItem value="Probation">Probation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employeeId">Employee *</Label>
                <Select
                  value={newEvaluation.employeeId}
                  onValueChange={(value) =>
                    setNewEvaluation((prev) => ({ ...prev, employeeId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">John Doe</SelectItem>
                    <SelectItem value="2">Jane Smith</SelectItem>
                    <SelectItem value="3">Mike Johnson</SelectItem>
                    <SelectItem value="4">Sarah Wilson</SelectItem>
                    <SelectItem value="5">David Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="evaluator">Evaluator</Label>
              <Input
                id="evaluator"
                value={newEvaluation.evaluator}
                onChange={(e) =>
                  setNewEvaluation((prev) => ({
                    ...prev,
                    evaluator: e.target.value,
                  }))
                }
                placeholder="e.g., Manager Name"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newEvaluation.startDate}
                  onChange={(e) =>
                    setNewEvaluation((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newEvaluation.endDate}
                  onChange={(e) =>
                    setNewEvaluation((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newEvaluation.dueDate}
                  onChange={(e) =>
                    setNewEvaluation((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateEvaluationModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateEvaluation} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Evaluation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Evaluation Modal */}
      <Dialog
        open={isEditEvaluationModalOpen}
        onOpenChange={setIsEditEvaluationModalOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Evaluation</DialogTitle>
            <DialogDescription>
              Update the evaluation details.
            </DialogDescription>
          </DialogHeader>
          {selectedEvaluation && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editTitle">Evaluation Title</Label>
                <Input
                  id="editTitle"
                  value={selectedEvaluation.title}
                  onChange={(e) =>
                    setSelectedEvaluation((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editType">Evaluation Type</Label>
                  <Select
                    value={selectedEvaluation.type}
                    onValueChange={(value) =>
                      setSelectedEvaluation((prev) => ({
                        ...prev,
                        type: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Performance">Performance</SelectItem>
                      <SelectItem value="360 Review">360 Review</SelectItem>
                      <SelectItem value="Probation">Probation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editEvaluator">Evaluator</Label>
                  <Input
                    id="editEvaluator"
                    value={selectedEvaluation.evaluator}
                    onChange={(e) =>
                      setSelectedEvaluation((prev) => ({
                        ...prev,
                        evaluator: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editStartDate">Start Date</Label>
                  <Input
                    id="editStartDate"
                    type="date"
                    value={selectedEvaluation.startDate}
                    onChange={(e) =>
                      setSelectedEvaluation((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="editEndDate">End Date</Label>
                  <Input
                    id="editEndDate"
                    type="date"
                    value={selectedEvaluation.endDate}
                    onChange={(e) =>
                      setSelectedEvaluation((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="editDueDate">Due Date</Label>
                  <Input
                    id="editDueDate"
                    type="date"
                    value={selectedEvaluation.dueDate}
                    onChange={(e) =>
                      setSelectedEvaluation((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditEvaluationModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateEvaluation} disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Evaluation"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
