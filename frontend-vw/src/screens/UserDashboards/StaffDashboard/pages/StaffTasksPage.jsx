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
  RefreshCw,
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
import { useSidebarCounts } from "@/hooks/useSidebarCounts";

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

// User Search Component for Assignee
const AssigneeSearchInput = ({
  value,
  onValueChange,
  selectedUser,
  onUserSelect,
  placeholder = "Search by name",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { accessToken } = useAuth();
  const API_URL = getApiUrl();

  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setUsers([]);
      setIsOpen(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/tasks/assignees/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setUsers(response.data.data || []);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
      setIsOpen(false);
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

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onValueChange(newValue);
  };

  const handleUserSelect = (user) => {
    const fullName = `${user.firstName} ${user.lastName}`;
    setSearchQuery(fullName);
    onValueChange(fullName);
    onUserSelect(user._id);
    setUsers([]);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        className="w-full"
        onFocus={() => {
          if (users.length > 0) {
            setIsOpen(true);
          }
        }}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 animate-spin border-2 border-green-500 border-t-transparent rounded-full"></div>
        </div>
      )}
      {isOpen && users.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user._id}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              onClick={() => handleUserSelect(user)}
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
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    dueDate: "",
    priority: "",
    assigneeSearch: "",
    assignedTo: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        department: "",
        dueDate: "",
        priority: "",
        assigneeSearch: "",
        assignedTo: null,
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      setIsSubmitting(true);
      try {
        // If no assignee is selected, default to current user
        const assigneeId = formData.assignedTo || user?._id;

        await onAddTask({
          title: formData.title,
          description: formData.description,
          assignedTo: assigneeId,
          dueDate: formData.dueDate,
          priority: formData.priority || "Medium",
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
      <DialogContent className="sm:max-w-[500px] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-green-600">Add new Task</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-900"
            >
              Task Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter task title..."
              required
              className="w-full"
            />
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-900"
            >
              Task Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Provide detailed task description..."
              rows={4}
              className="w-full resize-none"
            />
          </div>

          {/* Department and Due Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Department
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  setFormData({ ...formData, department: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Due Date
              </Label>
              <Select
                value={formData.dueDate}
                onValueChange={(value) =>
                  setFormData({ ...formData, dueDate: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={
                      new Date(Date.now() + 86400000)
                        .toISOString()
                        .split("T")[0]
                    }
                  >
                    Tomorrow
                  </SelectItem>
                  <SelectItem
                    value={
                      new Date(Date.now() + 7 * 86400000)
                        .toISOString()
                        .split("T")[0]
                    }
                  >
                    1 Week
                  </SelectItem>
                  <SelectItem
                    value={
                      new Date(Date.now() + 14 * 86400000)
                        .toISOString()
                        .split("T")[0]
                    }
                  >
                    2 Weeks
                  </SelectItem>
                  <SelectItem
                    value={
                      new Date(Date.now() + 30 * 86400000)
                        .toISOString()
                        .split("T")[0]
                    }
                  >
                    1 Month
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority and Assignee Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Priority
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Assignee
              </Label>
              <AssigneeSearchInput
                value={formData.assigneeSearch}
                onValueChange={(value) =>
                  setFormData({ ...formData, assigneeSearch: value })
                }
                selectedUser={formData.assignedTo}
                onUserSelect={(userId) =>
                  setFormData({ ...formData, assignedTo: userId })
                }
                placeholder="Search by name"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
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
          </div>
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
    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
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

  // Get sidebar counts
  const sidebarCounts = useSidebarCounts();

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

  // Fetch tasks from API with enhanced error handling and debugging
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        console.error("No access token available for task fetching");
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

      console.log("🔍 Fetching tasks from:", url);
      console.log("👤 Current user:", user?.firstName, user?.lastName);
      console.log("🔑 Access token available:", !!accessToken);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      });

      console.log("📡 API Response:", response.data);

      if (response.data.success) {
        const apiData =
          response.data.data || response.data.tasks || response.data || [];

        if (Array.isArray(apiData)) {
          const transformedTasks = apiData.map((task) => {
            const transformedTask = {
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
            };

            console.log("🔄 Transformed task:", transformedTask.title, {
              canEdit: transformedTask.canEdit,
              canDelete: transformedTask.canDelete,
              status: transformedTask.status,
            });

            return transformedTask;
          });

          setTasks(transformedTasks);
          console.log("✅ Tasks fetched successfully:", {
            count: transformedTasks.length,
            tasks: transformedTasks.map((t) => ({
              title: t.title,
              status: t.status,
            })),
          });
        } else {
          console.warn("⚠️ API response data is not an array:", apiData);
          setTasks([]);
        }
      } else {
        console.warn("⚠️ API response indicates failure:", response.data);
        setTasks([]);
        if (response.data.message) {
          throw new Error(response.data.message);
        }
      }
    } catch (err) {
      console.error("❌ Error fetching tasks:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        code: err.code,
      });

      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. You don't have permission to view tasks.");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (
        err.code === "NETWORK_ERROR" ||
        err.message.includes("Network Error")
      ) {
        setError("Network error. Please check your connection and try again.");
      } else if (err.code === "ECONNABORTED") {
        setError("Request timeout. Please try again.");
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

  // Update task status with enhanced debugging
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      if (!accessToken) {
        console.error("No access token available for status update");
        throw new Error("No access token available. Please log in again.");
      }

      console.log("🔄 Updating task status:", { taskId, newStatus });

      const response = await axios.patch(
        `${API_URL}/tasks/${taskId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("📡 Status update response:", response.data);

      if (response.data.success) {
        await fetchTasks();
        toast.success(`Task status updated to ${newStatus}!`);
        console.log("✅ Task status updated successfully");
      } else {
        throw new Error(
          response.data.message || "Failed to update task status"
        );
      }
    } catch (err) {
      console.error("❌ Error updating task status:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        taskId,
        newStatus,
      });

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update task status";
      toast.error(`Failed to update task status: ${errorMessage}`);
    }
  };

  // Delete task with enhanced debugging
  const handleDeleteTask = async (taskId) => {
    if (
      !confirm(
        "Are you sure you want to delete this task? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      if (!accessToken) {
        console.error("No access token available for task deletion");
        throw new Error("No access token available. Please log in again.");
      }

      console.log("🗑️ Deleting task:", taskId);

      const response = await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      console.log("📡 Delete response:", response.data);

      if (response.data.success) {
        await fetchTasks();
        toast.success("Task deleted successfully!");
        console.log("✅ Task deleted successfully");
      } else {
        throw new Error(response.data.message || "Failed to delete task");
      }
    } catch (err) {
      console.error("❌ Error deleting task:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        taskId,
      });

      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete task";
      toast.error(`Failed to delete task: ${errorMessage}`);
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

  // Filter tasks based on search term and filters
  const filteredTasks = (tasks || []).filter((task) => {
    const matchesSearch =
      (task.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.assignee || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Get user's first name, fallback to "User" if not available
  const userName = user?.firstName || "User";

  // Dynamically update the badges for sidebar items
  const dynamicSidebarConfig = {
    ...staffDashboardConfig,
    analytics:
      staffDashboardConfig.analytics?.map((item) => {
        if (item.title === "Evaluations") {
          return {
            ...item,
            badge:
              sidebarCounts.evaluations > 0
                ? sidebarCounts.evaluations
                : undefined,
          };
        }
        return item;
      }) || [],
    productivity:
      staffDashboardConfig.productivity?.map((item) => {
        if (item.title === "Tasks") {
          return {
            ...item,
            badge: sidebarCounts.tasks > 0 ? sidebarCounts.tasks : undefined,
          };
        }
        if (item.title === "Attendance") {
          return {
            ...item,
            badge:
              sidebarCounts.attendance > 0
                ? sidebarCounts.attendance
                : undefined,
          };
        }
        return item;
      }) || [],
    company:
      staffDashboardConfig.company?.map((item) => {
        if (item.title === "Messages") {
          return {
            ...item,
            badge:
              sidebarCounts.messages > 0 ? sidebarCounts.messages : undefined,
          };
        }
        return item;
      }) || [],
  };

  return (
    <StaffDashboardLayout
      sidebarConfig={dynamicSidebarConfig}
      itemCounts={{
        tasks: sidebarCounts.tasks,
        evaluations: sidebarCounts.evaluations,
        attendance: sidebarCounts.attendance,
        messages: sidebarCounts.messages,
      }}
      isLoading={sidebarCounts.loading}
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
          <div className="flex items-center gap-3">
            <Button
              onClick={() => fetchTasks()}
              variant="outline"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Task
            </Button>
          </div>
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

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
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
            ) : (tasks || []).length === 0 ? (
              <EmptyState />
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tasks match your filters
                </h3>
                <p className="text-gray-500 text-center">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
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
