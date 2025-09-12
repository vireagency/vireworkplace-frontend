/**
 * @fileoverview Staff Tasks Page Component
 * @description Complete task management interface with full CRUD operations
 * @author Vire Development Team
 * @version 2.0.0
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
  Edit3,
  Trash2,
  Eye,
  Users,
  MoreVertical,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
const StatusBadge = ({ status }) => {
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

  return (
    <Badge variant={config.variant} className={config.className}>
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
  onUserSelect,
  selectedUserId,
  selectedUserName,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { accessToken } = useAuth();
  const API_URL = getApiUrl();

  const searchUsers = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axios.get(`${API_URL}/users/search`, {
        params: { query },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        setSearchResults(response.data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        searchUsers(searchTerm);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleUserSelect = (user) => {
    onUserSelect(user._id || user.id, `${user.firstName} ${user.lastName}`);
    setSearchTerm(`${user.firstName} ${user.lastName}`);
    setShowResults(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(true);

    // If input is cleared, clear selection
    if (!value) {
      onUserSelect("", "");
    }
  };

  // Initialize search term with selected user name
  useEffect(() => {
    if (selectedUserName && !searchTerm) {
      setSearchTerm(selectedUserName);
    }
  }, [selectedUserName]);

  return (
    <div className="relative">
      <div className="relative">
        <Users className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search users by name..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="pl-10"
        />
      </div>

      {showResults && (searchResults.length > 0 || isSearching) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
          {isSearching ? (
            <div className="p-3 text-center text-gray-500">
              <div className="w-4 h-4 animate-spin border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <button
                key={user._id || user.id}
                type="button"
                className="w-full text-left p-3 hover:bg-gray-50 flex items-center space-x-2"
                onClick={() => handleUserSelect(user)}
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

// Add/Edit Task Modal Component
const TaskModal = ({
  isOpen,
  onClose,
  onSaveTask,
  task = null,
  mode = "create",
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    assignedToName: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when task prop changes
  useEffect(() => {
    if (task && mode === "edit") {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        assignedTo: task.assignedTo?._id || task.assignedTo || "",
        assignedToName: task.assignee || "",
        dueDate: task.dueDate || "",
        priority:
          task.priority?.charAt(0).toUpperCase() +
            task.priority?.slice(1).toLowerCase() || "Medium",
        status:
          task.status?.charAt(0).toUpperCase() +
            task.status?.slice(1).toLowerCase() || "Pending",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        assignedTo: "",
        assignedToName: "",
        dueDate: "",
        priority: "Medium",
        status: "Pending",
      });
    }
  }, [task, mode, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.title.trim() && formData.assignedTo) {
      setIsSubmitting(true);
      try {
        await onSaveTask(formData, task?.id);
        onClose();
      } catch (error) {
        console.error(
          `Error ${mode === "edit" ? "updating" : "creating"} task:`,
          error
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleUserSelect = (userId, userName) => {
    setFormData({
      ...formData,
      assignedTo: userId,
      assignedToName: userName,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Task" : "Add New Task"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the task details below."
              : "Create a new task and assign it to a user."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Assign To *</Label>
            <UserSearchSelect
              onUserSelect={handleUserSelect}
              selectedUserId={formData.assignedTo}
              selectedUserName={formData.assignedToName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                required
              />
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
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {mode === "edit" && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={
                isSubmitting || !formData.title.trim() || !formData.assignedTo
              }
            >
              {isSubmitting
                ? mode === "edit"
                  ? "Updating..."
                  : "Creating..."
                : mode === "edit"
                ? "Update Task"
                : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Task Details Modal Component
const TaskDetailsModal = ({
  isOpen,
  onClose,
  task,
  onStatusUpdate,
  currentUser,
}) => {
  const [newStatus, setNewStatus] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (task) {
      setNewStatus(
        task.status?.charAt(0).toUpperCase() +
          task.status?.slice(1).toLowerCase() || "Pending"
      );
    }
  }, [task]);

  const handleStatusUpdate = async () => {
    if (newStatus !== task.status && onStatusUpdate) {
      setIsUpdatingStatus(true);
      try {
        await onStatusUpdate(task.id, newStatus);
        onClose();
      } catch (error) {
        console.error("Error updating status:", error);
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };

  if (!task) return null;

  const isAssignee =
    currentUser?.id === task.assignedTo?._id ||
    currentUser?.id === task.assignedTo;
  const canUpdateStatus = isAssignee;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Task Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
            <p className="text-gray-600">
              {task.description || "No description provided"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Status
              </Label>
              <div className="mt-1">
                <StatusBadge status={task.status} />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Priority
              </Label>
              <div className="mt-1">
                <PriorityBadge priority={task.priority} />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Assigned To
              </Label>
              <p className="mt-1">{task.assignee || "Unassigned"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Due Date
              </Label>
              <p className="mt-1">{task.dueDate || "No due date"}</p>
            </div>
          </div>

          {canUpdateStatus && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Update Status</Label>
              <div className="flex items-center gap-3">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={newStatus === task.status || isUpdatingStatus}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUpdatingStatus ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          )}

          {task.createdAt && (
            <div className="pt-4 border-t text-sm text-gray-500">
              <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
              {task.updatedAt && task.updatedAt !== task.createdAt && (
                <p>
                  Last updated: {new Date(task.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      It looks like there are no tasks matching your current filters.
      <br />
      Try adjusting your search criteria or create a new task.
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

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalMode, setModalMode] = useState("create");

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
      const url = `/tasks${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get(url);

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
                : task.assignee || "Unassigned",
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
          }));

          setTasks(transformedTasks);
        } else {
          setTasks([]);
        }
      } else {
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

  // Create or update task
  const handleSaveTask = async (taskData, taskId = null) => {
    try {
      const requestPayload = {
        title: taskData.title,
        description: taskData.description,
        assignedTo: taskData.assignedTo,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        ...(taskId && { status: taskData.status }), // Include status only for updates
      };

      let response;
      if (taskId) {
        // Update existing task
        response = await apiClient.put(`/tasks/${taskId}`, requestPayload);
      } else {
        // Create new task
        response = await apiClient.post(`/tasks`, requestPayload);
      }

      if (
        response.status === 201 ||
        response.status === 200 ||
        response.data.success
      ) {
        await fetchTasks();
        toast.success(taskId ? "Task Updated" : "Task Created", {
          description: taskId
            ? "The task has been updated successfully."
            : "The task has been created successfully.",
        });
      } else {
        throw new Error(response.data.message || "Failed to save task");
      }
    } catch (err) {
      console.error("Error saving task:", err);

      let errorMessage = "Failed to save task";
      if (err.response?.status === 400) {
        errorMessage =
          "Bad request: Please check all required fields are filled correctly.";
      } else if (err.response?.status === 401) {
        errorMessage = "Unauthorized: Please log in again.";
      } else if (err.response?.status === 404) {
        errorMessage =
          "Assigned user not found. Please check the user selection.";
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (err.response?.status === 500) {
        errorMessage = "Internal server error. Please try again later.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      toast.error("Error", {
        description: errorMessage,
      });
      throw err;
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await apiClient.delete(`/tasks/${taskId}`);

      if (response.status === 200 || response.data.success) {
        await fetchTasks();
        toast.success("Task Deleted", {
          description: "The task has been deleted successfully.",
        });
      } else {
        throw new Error(response.data.message || "Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);

      let errorMessage = "Failed to delete task";
      if (err.response?.status === 401) {
        errorMessage = "Unauthorized: Please log in again.";
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to delete this task.";
      } else if (err.response?.status === 404) {
        errorMessage = "Task not found.";
      } else if (err.response?.status === 500) {
        errorMessage = "Internal server error. Please try again later.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      toast.error("Error", {
        description: errorMessage,
      });
    }
  };

  // Update task status
  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const response = await apiClient.put(`/tasks/${taskId}/status`, {
        status: newStatus,
      });

      if (response.status === 200 || response.data.success) {
        await fetchTasks();
        toast.success("Status Updated", {
          description: `Task status has been updated to ${newStatus}.`,
        });
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating task status:", err);

      let errorMessage = "Failed to update task status";
      if (err.response?.status === 401) {
        errorMessage = "Unauthorized: Please log in again.";
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to update this task status.";
      } else if (err.response?.status === 404) {
        errorMessage = "Task not found.";
      } else if (err.response?.status === 500) {
        errorMessage = "Internal server error. Please try again later.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      toast.error("Error", {
        description: errorMessage,
      });
      throw err;
    }
  };

  // Modal handlers
  const handleCreateTask = () => {
    setSelectedTask(null);
    setModalMode("create");
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
  };

  const handleDeleteConfirm = (task) => {
    setSelectedTask(task);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedTask) {
      await handleDeleteTask(selectedTask.id);
      setShowDeleteDialog(false);
      setSelectedTask(null);
    }
  };

  // Permission checks
  const canEditTask = (task) => {
    return (
      user &&
      task.createdBy &&
      (user.id === task.createdBy._id || user.id === task.createdBy)
    );
  };

  const canDeleteTask = (task) => {
    return (
      user &&
      task.createdBy &&
      (user.id === task.createdBy._id || user.id === task.createdBy)
    );
  };

  const isAssignee = (task) => {
    return (
      user &&
      task.assignedTo &&
      (user.id === task.assignedTo._id || user.id === task.assignedTo)
    );
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
            onClick={handleCreateTask}
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

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={dueDateFilter}
                  onChange={(e) => setDueDateFilter(e.target.value)}
                  className="w-48"
                  placeholder="Filter by due date"
                />
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
                          <StatusBadge status={task.status} />
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

                      <div className="ml-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleViewTask(task)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>

                            {canEditTask(task) && (
                              <DropdownMenuItem
                                onClick={() => handleEditTask(task)}
                              >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Task
                              </DropdownMenuItem>
                            )}

                            {canDeleteTask(task) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteConfirm(task)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Task
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals and Dialogs */}
      <TaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSaveTask={handleSaveTask}
        task={selectedTask}
        mode={modalMode}
      />

      <TaskDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        task={selectedTask}
        onStatusUpdate={handleStatusUpdate}
        currentUser={user}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{selectedTask?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StaffDashboardLayout>
  );
}
