/**
 * @fileoverview Staff Tasks Page Component
 * @description Task management interface for staff members to view, manage, and track their assigned tasks
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  ChevronDown,
  X,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Layout Components
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";

// Authentication
import { useAuth } from "@/hooks/useAuth";

// API Configuration
import { getApiUrl } from "@/config/apiConfig";

// Status Badge Component
const StatusBadge = ({ status, onStatusChange, taskId, canEdit = false }) => {
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
      icon: AlertCircle,
      text: "Pending",
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig["pending"];
  const IconComponent = config.icon;

  const handleStatusClick = () => {
    if (canEdit && onStatusChange) {
      const statusOptions = ["pending", "in progress", "completed"];
      const currentIndex = statusOptions.indexOf(status?.toLowerCase());
      const nextStatus =
        statusOptions[(currentIndex + 1) % statusOptions.length];
      onStatusChange(taskId, nextStatus);
    }
  };

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${
        canEdit ? "cursor-pointer hover:opacity-80" : ""
      }`}
      onClick={handleStatusClick}
    >
      <IconComponent className="w-3 h-3 mr-1" />
      {config.text}
    </Badge>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    high: {
      variant: "destructive",
      className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
      text: "High",
    },
    medium: {
      variant: "secondary",
      className:
        "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50",
      text: "Medium",
    },
    low: {
      variant: "outline",
      className:
        "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
      text: "Low",
    },
  };

  const config =
    priorityConfig[priority?.toLowerCase()] || priorityConfig["medium"];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.text}
    </Badge>
  );
};

// User Search Component
const UserSearchSelect = ({
  value,
  onValueChange,
  placeholder = "Search and select user...",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();
  const API_URL = getApiUrl();

  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/users/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="space-y-2">
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
      {loading && <p className="text-sm text-gray-500">Searching...</p>}
      {users.length > 0 && (
        <div className="max-h-32 overflow-y-auto border rounded-md">
          {users.map((user) => (
            <div
              key={user._id}
              className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              onClick={() => {
                onValueChange(user._id);
                setSearchQuery(`${user.firstName} ${user.lastName}`);
                setUsers([]);
              }}
            >
              <div className="text-sm font-medium">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Add Task Modal Component
const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "Medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      setIsSubmitting(true);
      try {
        await onAddTask(formData);
        setFormData({
          title: "",
          description: "",
          assignedTo: "",
          dueDate: "",
          priority: "Medium",
        });
        onClose();
        toast.success("Task created successfully!");
      } catch (error) {
        console.error("Error adding task:", error);
        toast.error("Failed to create task. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-green-600">Add new Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter task title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Task Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Provide detailed task description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <UserSearchSelect
                value={formData.assignedTo}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignedTo: value })
                }
                placeholder="Select Department"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                placeholder="Pick a date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData({ ...formData, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Task Actions Menu Component
const TaskActionsMenu = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  canEdit,
  canDelete,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEdit && (
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Task
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onStatusChange(task.id, "in progress")}
        >
          <Clock className="w-4 h-4 mr-2" />
          Mark In Progress
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange(task.id, "completed")}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Mark Complete
        </DropdownMenuItem>
        {canDelete && (
          <DropdownMenuItem
            onClick={() => onDelete(task.id)}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Task
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-16 h-16 border-2 border-gray-200 rounded-lg flex items-center justify-center mb-4">
      <div className="w-8 h-8 border-2 border-gray-300 rounded-full border-dashed"></div>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
    <p className="text-gray-500 text-center max-w-md">
      It looks like you don't have any tasks assigned to you at the moment.
      <br />
      This section will display all tasks assigned to you by your manager.
    </p>
  </div>
);

// Loading State Component
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-8 h-8 animate-spin border-2 border-green-500 border-t-transparent rounded-full mb-4"></div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Loading tasks...
    </h3>
    <p className="text-gray-500 text-center">
      Please wait while we fetch your tasks.
    </p>
  </div>
);

// Error State Component
const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="text-red-500 text-4xl mb-4">⚠️</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Error Loading Tasks
    </h3>
    <p className="text-gray-500 text-center mb-4 max-w-md">{error}</p>
    <Button onClick={onRetry} className="bg-green-600 hover:bg-green-700">
      Try Again
    </Button>
  </div>
);

// Main Staff Tasks Page Component
export default function StaffTasksPage() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  // State management
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  // API configuration
  const API_URL = getApiUrl();

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (priorityFilter !== "all") {
        params.append("priority", priorityFilter);
      }
      if (dueDateFilter) {
        params.append("dueDate", dueDateFilter);
      }

      const queryString = params.toString();
      const url = `${API_URL}/tasks${queryString ? `?${queryString}` : ""}`;

      console.log("Fetching tasks from:", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        const apiData =
          response.data.data || response.data.tasks || response.data || [];

        if (Array.isArray(apiData)) {
          const transformedTasks = apiData.map((task) => ({
            id: task._id || task.id,
            title: task.title || "Untitled Task",
            description: task.description || "No description provided",
            assignee:
              task.assignedTo?.firstName && task.assignedTo?.lastName
                ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                : task.assignedTo?.name || task.assignee || "Unassigned",
            dueDate: task.dueDate
              ? new Date(task.dueDate).toISOString().split("T")[0]
              : "",
            status: task.status?.toLowerCase() || "pending",
            priority: task.priority?.toLowerCase() || "medium",
            progress: task.progress || 0,
            createdBy: task.createdBy,
            assignedTo: task.assignedTo,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            canEdit:
              task.createdBy?._id === user?._id ||
              task.assignedTo?._id === user?._id,
            canDelete: task.createdBy?._id === user?._id,
          }));

          setTasks(transformedTasks);
          console.log("Tasks fetched successfully:", transformedTasks);
        } else {
          console.warn("API response data is not an array:", apiData);
          setTasks([]);
        }
      } else {
        console.warn("API response indicates failure:", response.data);
        setTasks([]);
        if (response.data.message) {
          throw new Error(response.data.message);
        }
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);

      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (
        err.code === "NETWORK_ERROR" ||
        err.message.includes("Network Error")
      ) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(
          err.message || "An unexpected error occurred while fetching tasks."
        );
      }

      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new task
  const handleAddTask = async (taskData) => {
    try {
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      const response = await axios.post(
        `${API_URL}/tasks/create`,
        {
          title: taskData.title,
          description: taskData.description,
          assignedTo: taskData.assignedTo,
          dueDate: taskData.dueDate,
          priority: taskData.priority,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        await fetchTasks();
        console.log("Task added successfully");
      } else {
        throw new Error(response.data.message || "Failed to add task");
      }
    } catch (err) {
      console.error("Error adding task:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add task";
      setError(`Failed to add task: ${errorMessage}`);
      throw err;
    }
  };

  // Update task status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      const response = await axios.patch(
        `${API_URL}/tasks/${taskId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        await fetchTasks();
        toast.success("Task status updated successfully!");
      } else {
        throw new Error(
          response.data.message || "Failed to update task status"
        );
      }
    } catch (err) {
      console.error("Error updating task status:", err);
      toast.error("Failed to update task status. Please try again.");
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      const response = await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        await fetchTasks();
        toast.success("Task deleted successfully!");
      } else {
        throw new Error(response.data.message || "Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error("Failed to delete task. Please try again.");
    }
  };

  // Edit task (placeholder for future implementation)
  const handleEditTask = (task) => {
    console.log("Edit task:", task);
    // TODO: Implement edit task modal
    toast.info("Edit functionality coming soon!");
  };

  // Initial fetch and refetch when filters change
  useEffect(() => {
    fetchTasks();
  }, [accessToken, statusFilter, priorityFilter, dueDateFilter]);

  // Filter tasks based on search term
  const filteredTasks = (tasks || []).filter((task) => {
    const matchesSearch =
      (task.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.assignee || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Get user's first name, fallback to "User" if not available
  const userName = user?.firstName || "User";

  return (
    <StaffDashboardLayout
      sidebarConfig={staffDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      {/* Header Section */}
      <div className="px-4 lg:px-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Task Management
            </h1>
            <p className="text-gray-500 mt-1">
              Oversee and monitor all assigned and personal tasks
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </Button>
        </div>
      </div>

      {/* Filters & Search Section */}
      <div className="px-4 lg:px-6 mb-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <CardTitle className="text-sm font-medium">
                Filters & Search
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    placeholder="Search tasks or assignees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <span className="text-sm text-gray-500">
                {filteredTasks.length} of {(tasks || []).length} tasks
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List Section */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState error={error} onRetry={fetchTasks} />
            ) : filteredTasks.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {task.title}
                          </h3>
                          <StatusBadge
                            status={task.status}
                            taskId={task.id}
                            onStatusChange={handleStatusChange}
                            canEdit={task.canEdit}
                          />
                          <PriorityBadge priority={task.priority} />
                        </div>

                        <p className="text-gray-600 mb-3 max-w-2xl">
                          {task.description}
                        </p>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="w-4 h-4" />
                            <span>{task.assignee}</span>
                          </div>

                          {task.dueDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {task.dueDate}</span>
                            </div>
                          )}

                          {task.progress > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                Progress:
                              </span>
                              <Progress
                                value={task.progress}
                                className="w-20"
                              />
                              <span className="text-sm text-gray-500">
                                {task.progress}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <TaskActionsMenu
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onStatusChange={handleStatusChange}
                        canEdit={task.canEdit}
                        canDelete={task.canDelete}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddTask={handleAddTask}
      />
    </StaffDashboardLayout>
  );
}
