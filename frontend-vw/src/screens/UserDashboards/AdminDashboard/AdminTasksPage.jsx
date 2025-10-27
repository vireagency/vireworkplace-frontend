import { useState, useEffect, useCallback, useMemo } from "react";
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
  Loader2,
  Save,
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
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { adminDashboardConfig } from "@/config/dashboardConfigs";

// Authentication
import { useAuth } from "@/hooks/useAuth";

// API Configuration
import { getApiUrl } from "@/config/apiConfig";

// Status Badge Component with instant updates
const StatusBadge = ({ status, onStatusChange, taskId, canEdit = false }) => {
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleStatusClick = async () => {
    if (canEdit && onStatusChange && !isUpdating) {
      const statusOptions = ["Pending", "In Progress", "Completed"];
      const currentIndex = statusOptions.findIndex(
        (option) => option.toLowerCase() === status?.toLowerCase()
      );
      const nextStatus =
        statusOptions[(currentIndex + 1) % statusOptions.length];

      setIsUpdating(true);
      try {
        await onStatusChange(taskId, nextStatus);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${
        canEdit ? "cursor-pointer hover:opacity-80 transition-opacity" : ""
      } relative`}
      onClick={handleStatusClick}
    >
      {isUpdating ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : (
        <IconComponent className="w-3 h-3 mr-1" />
      )}
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

// Assignee Search Component with improved performance
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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const { accessToken, user: currentUser } = useAuth();

  // Initialize search query from value prop
  useEffect(() => {
    if (value !== searchQuery) {
      setSearchQuery(value || "");
    }
  }, [value]);

  // API URL construction
  const getAssigneeSearchApiUrl = () => {
    try {
      const baseUrl = getApiUrl();
      const cleanBaseUrl = baseUrl
        ? baseUrl.replace(/\/+$/, "")
        : "https://vireworkplace-backend-hpca.onrender.com";
      const noApiV1 = cleanBaseUrl.replace(/\/api\/v1$/, "");
      return `${noApiV1}/api/v1/tasks/assignees/search`;
    } catch (error) {
      console.error("Error constructing assignee search API URL:", error);
      return "https://vireworkplace-backend-hpca.onrender.com/api/v1/tasks/assignees/search";
    }
  };

  // Highlight matching text in search results
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Search function with debouncing
  const searchUsers = useCallback(
    async (query) => {
      if (!query || query.length < 2) {
        setUsers([]);
        setIsOpen(false);
        setHasSearched(false);
        setSearchError(null);
        return;
      }

      try {
        setLoading(true);
        setHasSearched(true);
        setSearchError(null);

        if (!accessToken) {
          throw new Error("No access token available. Please log in again.");
        }

        const searchUrl = getAssigneeSearchApiUrl();
        const response = await axios.get(searchUrl, {
          params: {
            query: query.trim(),
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000,
        });

        if (response.data && response.data.success) {
          const userData = response.data.users || [];
          const validUsers = userData
            .filter((user) => {
              const hasValidId = user && user._id;
              const hasValidName = user && (user.firstName || user.lastName);
              return hasValidId && hasValidName;
            })
            .map((user) => ({
              _id: user._id,
              id: user._id,
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              department: user.department || "",
              jobTitle: user.jobTitle || "",
              email: user.email || "",
              fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            }));

          // Add current user if they match and aren't already included
          const currentUserMatch =
            currentUser &&
            (currentUser.firstName
              ?.toLowerCase()
              .includes(query.toLowerCase()) ||
              currentUser.lastName
                ?.toLowerCase()
                .includes(query.toLowerCase()));

          if (
            currentUserMatch &&
            !validUsers.find((u) => u._id === currentUser._id)
          ) {
            validUsers.unshift({
              _id: currentUser._id,
              id: currentUser._id,
              firstName: currentUser.firstName || "",
              lastName: currentUser.lastName || "",
              department: currentUser.department || "",
              jobTitle: currentUser.jobTitle || "",
              email: currentUser.email || "",
              fullName: `${currentUser.firstName || ""} ${
                currentUser.lastName || ""
              }`.trim(),
              isCurrentUser: true,
            });
          }

          setUsers(validUsers);
          setIsOpen(validUsers.length > 0);
          setSelectedIndex(-1);
        } else {
          if (response.data.message === "No matching users found") {
            setUsers([]);
            setIsOpen(false);
            setSearchError(null);
          } else {
            setSearchError(response.data.message || "Search request failed");
            setUsers([]);
            setIsOpen(false);
          }
        }
      } catch (error) {
        console.error("Assignee search error:", error);
        let errorMessage = "Failed to search users";

        if (error.response) {
          const status = error.response.status;
          const responseData = error.response.data;

          switch (status) {
            case 404:
              if (responseData?.message === "No matching users found") {
                setUsers([]);
                setIsOpen(false);
                setSearchError(null);
                return;
              } else {
                errorMessage = `Search endpoint not found. Please ensure your server has the '/api/v1/tasks/assignees/search' endpoint implemented.`;
              }
              break;
            case 401:
              errorMessage = "Unauthorized access. Please log in again.";
              break;
            case 400:
              errorMessage =
                responseData?.message || "Invalid search parameters.";
              break;
            case 500:
              errorMessage = "Internal server error. Please try again later.";
              break;
            default:
              errorMessage =
                responseData?.message || `Server error (${status})`;
          }
        } else if (error.code === "ECONNABORTED") {
          errorMessage = "Search request timed out. Please try again.";
        } else if (error.message?.includes("Network Error")) {
          errorMessage = "Network error. Please check your connection.";
        } else {
          errorMessage = error.message || "An unexpected error occurred.";
        }

        setSearchError(errorMessage);
        setUsers([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, currentUser]
  );

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery.trim());
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchUsers]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onValueChange(newValue);
    setSelectedIndex(-1);
    setSearchError(null);

    if (!newValue.trim()) {
      setSelectedUserData(null);
      onUserSelect(null);
    }
  };

  const handleUserSelect = (user) => {
    const fullName =
      user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim();

    setSearchQuery(fullName);
    setSelectedUserData(user);
    onValueChange(fullName);
    onUserSelect(user._id);
    setUsers([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    setSearchError(null);

    toast.success(`Selected ${fullName} as assignee`);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || users.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < users.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < users.length) {
          handleUserSelect(users[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (users.length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 150);
  };

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full"
        autoComplete="off"
      />

      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      )}

      {selectedUserData && !loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        </div>
      )}

      {searchError && !loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <AlertCircle className="w-4 h-4 text-red-500" />
        </div>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {users.length > 0 ? (
            users.map((user, index) => (
              <div
                key={user._id || user.id}
                className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                  index === selectedIndex
                    ? "bg-green-50 border-green-200"
                    : "hover:bg-gray-50"
                } ${user.isCurrentUser ? "bg-blue-50" : ""}`}
                onClick={() => handleUserSelect(user)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {highlightText(user.fullName, searchQuery)}
                      {user.isCurrentUser && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.department && (
                        <span className="mr-2">{user.department}</span>
                      )}
                      {user.jobTitle && (
                        <span className="text-gray-400">• {user.jobTitle}</span>
                      )}
                    </div>
                  </div>
                  {index === selectedIndex && (
                    <div className="text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : searchError ? (
            <div className="p-4 text-center text-red-500 text-sm">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-400" />
              <div className="font-medium mb-1">Search Error</div>
              <div className="text-xs mb-2">{searchError}</div>
              <button
                onClick={() => searchUsers(searchQuery)}
                className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : hasSearched && searchQuery.length >= 2 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              <User className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <div className="font-medium mb-1">No users found</div>
              <div className="text-xs">No users matching "{searchQuery}"</div>
            </div>
          ) : searchQuery.length > 0 && searchQuery.length < 2 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              <div className="text-xs">
                Type at least 2 characters to search for users
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

// Add Task Modal Component with better UX
const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
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
        dueDate: "",
        priority: "",
        assigneeSearch: "",
        assignedTo: null,
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const assigneeId = formData.assignedTo || user?._id;

      if (!assigneeId) {
        toast.error("Unable to determine task assignee. Please try again.");
        return;
      }

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignedTo: assigneeId,
        dueDate: formData.dueDate || null,
        priority: formData.priority || "Medium",
      };

      await onAddTask(taskData);
      onClose();
      toast.success("Task created successfully!");
    } catch (error) {
      console.error("Error adding task:", error);
      const errorMessage =
        error.message || "Failed to create task. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-green-600">Add new Task</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-900"
            >
              Task Title <span className="text-red-500">*</span>
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

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Due Date
            </Label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="w-full"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

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
                onUserSelect={(userId) => {
                  setFormData({ ...formData, assignedTo: userId });
                }}
                placeholder="Search by name"
              />
            </div>
          </div>

          {formData.assignedTo ? (
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded-md flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3" />
              <span>Task will be assigned to: {formData.assigneeSearch}</span>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    assignedTo: null,
                    assigneeSearch: "",
                  });
                }}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md flex items-center gap-2">
              <User className="w-3 h-3" />
              <span>
                If no assignee is selected, this task will be assigned to you (
                {user?.firstName || "You"})
              </span>
            </div>
          )}

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
              disabled={isSubmitting || !formData.title.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Add Task
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Task Modal Component with improved reactivity
const EditTaskModal = ({ isOpen, onClose, onUpdateTask, task }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "",
    status: "",
    assigneeSearch: "",
    assignedTo: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when task changes
  useEffect(() => {
    if (task && isOpen) {
      const assigneeName = task.assignee || "";
      const newFormData = {
        title: task.title || "",
        description: task.description || "",
        dueDate: task.dueDate || "",
        priority: task.priority || "Medium",
        status: task.status || "Pending",
        assigneeSearch: assigneeName,
        assignedTo: task.assignedTo?._id || null,
      };
      setFormData(newFormData);
      setHasChanges(false);
    }
  }, [task, isOpen]);

  // Track changes
  useEffect(() => {
    if (task && isOpen) {
      const hasChanges =
        formData.title !== (task.title || "") ||
        formData.description !== (task.description || "") ||
        formData.dueDate !== (task.dueDate || "") ||
        formData.priority !== (task.priority || "Medium") ||
        formData.status !== (task.status || "Pending") ||
        formData.assignedTo !== (task.assignedTo?._id || null);
      setHasChanges(hasChanges);
    }
  }, [formData, task, isOpen]);

  // Cleanup effect when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all state when modal is closed
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: "",
        status: "",
        assigneeSearch: "",
        assignedTo: null,
      });
      setHasChanges(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a task title.");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a task description.");
      return;
    }
    if (!formData.dueDate) {
      toast.error("Please select a due date.");
      return;
    }
    if (!formData.priority) {
      toast.error("Please select a priority.");
      return;
    }
    if (!formData.status) {
      toast.error("Please select a status.");
      return;
    }
    const assigneeId = formData.assignedTo || user?._id;
    if (!assigneeId) {
      toast.error("Please select an assignee.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignedTo: assigneeId,
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: formData.status,
      };

      await onUpdateTask(task.id, updateData);
      toast.success("Task updated successfully!");
      onClose();
    } catch (error) {
      toast.error(
        "Failed to update task. Please check your input and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (hasChanges && !isSubmitting) {
      if (
        confirm("You have unsaved changes. Are you sure you want to close?")
      ) {
        // Reset form state before closing
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          priority: "",
          status: "",
          assigneeSearch: "",
          assignedTo: null,
        });
        setHasChanges(false);
        setIsSubmitting(false);
        onClose();
      }
    } else {
      // Reset form state before closing
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: "",
        status: "",
        assigneeSearch: "",
        assignedTo: null,
      });
      setHasChanges(false);
      setIsSubmitting(false);
      onClose();
    }
  };

  if (!task) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-green-600">Edit Task</h2>
          {hasChanges && (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-200"
            >
              Unsaved changes
            </Badge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="edit-title"
              className="text-sm font-medium text-gray-900"
            >
              Task Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter task title..."
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="edit-description"
              className="text-sm font-medium text-gray-900"
            >
              Task Description
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Provide detailed task description..."
              rows={4}
              className="w-full resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Due Date
            </Label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="w-full"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
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
                onUserSelect={(userId) => {
                  setFormData({ ...formData, assignedTo: userId });
                }}
                placeholder="Search by name"
              />
            </div>
          </div>

          {formData.assignedTo ? (
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded-md flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3" />
              <span>Task will be assigned to: {formData.assigneeSearch}</span>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    assignedTo: null,
                    assigneeSearch: "",
                  });
                }}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md flex items-center gap-2">
              <User className="w-3 h-3" />
              <span>
                If no assignee is selected, this task will be assigned to you (
                {user?.firstName || "You"})
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              disabled={isSubmitting || !formData.title.trim() || !hasChanges}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Task
                </>
              )}
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
          onClick={() => onStatusChange(task.id, "In Progress")}
        >
          <Clock className="w-4 h-4 mr-2" />
          Mark In Progress
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange(task.id, "Completed")}>
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

// Empty State Component - Updated to match dashboard design
const EmptyState = () => (
  <div className="text-center py-12">
    <div className="text-gray-400 text-4xl mb-4">📝</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Found</h3>
    <p className="text-gray-500 mb-4">
      There are no tasks in the system at the moment.
    </p>
  </div>
);

// Loading State Component - Updated to match dashboard design
const LoadingState = () => (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
    <p className="text-gray-600">Loading tasks...</p>
  </div>
);

// Error State Component - Updated to match dashboard design
const ErrorState = ({ error, onRetry }) => (
  <div className="text-center py-12">
    <div className="text-red-500 text-4xl mb-4">⚠️</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Error Loading Tasks
    </h3>
    <p className="text-gray-500 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
    >
      Try Again
    </button>
  </div>
);

// Main Admin Tasks Page Component
export default function AdminTasksPage() {
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Performance optimization: Track updates in progress
  const [updatingTasks, setUpdatingTasks] = useState(new Set());

  // API configuration
  const getFullApiUrl = () => {
    const baseUrl = getApiUrl();
    const cleanBaseUrl = baseUrl
      ? baseUrl.replace(/\/+$/, "")
      : "https://vireworkplace-backend-hpca.onrender.com";
    const noApiV1 = cleanBaseUrl.replace(/\/api\/v1$/, "");
    return `${noApiV1}/api/v1`;
  };

  // Create axios instance with optimizations
  const apiClient = axios.create({
    baseURL: getFullApiUrl(),
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor
  apiClient.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  // Add response interceptor for better error handling
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      }
      return Promise.reject(error);
    }
  );

  // Fetch tasks with optimized loading states
  const fetchTasks = useCallback(
    async (showSuccessToast = false) => {
      try {
        setLoading(true);
        setError(null);

        if (!accessToken) {
          console.error("No access token available");
          throw new Error("No access token available. Please log in again.");
        }

        const params = new URLSearchParams();
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (priorityFilter !== "all") params.append("priority", priorityFilter);
        if (dueDateFilter) params.append("dueDate", dueDateFilter);

        const queryString = params.toString();
        const url = `/tasks${queryString ? `?${queryString}` : ""}`;

        const response = await apiClient.get(url);

        if (response.data && response.data.success) {
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
              canEdit: true, // Admin can edit all tasks
              canDelete: true, // Admin can delete all tasks
            }));

            setTasks(transformedTasks);
            if (showSuccessToast) {
              toast.success(`Loaded ${transformedTasks.length} tasks`);
            }
          } else {
            console.warn("API response data is not an array:", apiData);
            setTasks([]);
          }
        } else if (response.data && Array.isArray(response.data)) {
          // Handle case where API returns array directly
          const transformedTasks = response.data.map((task) => ({
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
            canEdit: true, // Admin can edit all tasks
            canDelete: true, // Admin can delete all tasks
          }));

          setTasks(transformedTasks);
          if (showSuccessToast) {
            toast.success(`Loaded ${transformedTasks.length} tasks`);
          }
        } else {
          console.warn("API response indicates failure:", response.data);

          // Try to extract tasks from any response format
          let extractedTasks = [];
          if (response.data) {
            if (Array.isArray(response.data)) {
              extractedTasks = response.data;
            } else if (
              response.data.tasks &&
              Array.isArray(response.data.tasks)
            ) {
              extractedTasks = response.data.tasks;
            } else if (
              response.data.data &&
              Array.isArray(response.data.data)
            ) {
              extractedTasks = response.data.data;
            }
          }

          if (extractedTasks.length > 0) {
            const transformedTasks = extractedTasks.map((task) => ({
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
              canEdit: true, // Admin can edit all tasks
              canDelete: true, // Admin can delete all tasks
            }));
            setTasks(transformedTasks);
            if (showSuccessToast) {
              toast.success(`Loaded ${transformedTasks.length} tasks`);
            }
          } else {
            setTasks([]);
            if (response.data?.message) {
              throw new Error(response.data.message);
            }
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
          err.message.includes("Network Error") ||
          err.code === "ECONNABORTED"
        ) {
          setError(
            "Network error. Please check your connection and try again."
          );
        } else {
          setError(
            err.message || "An unexpected error occurred while fetching tasks."
          );
        }

        setTasks([]);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, statusFilter, priorityFilter, dueDateFilter]
  );

  // Add new task
  const handleAddTask = async (taskData) => {
    try {
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      const url = `/tasks/create`;
      const preparedTaskData = {
        title: taskData.title?.trim(),
        description: taskData.description?.trim() || "",
        assignedTo: taskData.assignedTo,
        dueDate: taskData.dueDate || null,
        priority: taskData.priority || "Medium",
      };

      if (!preparedTaskData.title) {
        throw new Error("Task title is required");
      }
      if (!preparedTaskData.assignedTo) {
        throw new Error("Task must be assigned to someone");
      }

      const response = await apiClient.post(url, preparedTaskData);

      if (response.data && response.data.success) {
        await fetchTasks();
        toast.success("Task created and assigned successfully!");
      } else if (response.data && response.status === 201) {
        // Handle case where API returns 201 but no success flag
        await fetchTasks();
        toast.success("Task created and assigned successfully!");
      } else {
        throw new Error(response.data?.message || "Failed to add task");
      }
    } catch (err) {
      console.error("Error adding task:", err);
      let errorMessage = "Failed to add task";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (
        err.response?.status === 404 &&
        errorMessage.includes("Assigned user not found")
      ) {
        errorMessage =
          "The selected assignee was not found. Please select a valid user.";
      }

      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update task status with optimistic updates
  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus.toLowerCase(),
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );

    // Track this update
    setUpdatingTasks((prev) => new Set(prev).add(taskId));

    try {
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      const response = await apiClient.patch(`/tasks/${taskId}/status`, {
        status: newStatus,
      });

      if (response.data && response.data.success) {
        toast.success(`Task status updated to ${newStatus}!`);
        // Refresh to get latest data from server
        await fetchTasks();
      } else if (response.data && response.status === 200) {
        // Handle case where API returns 200 but no success flag
        toast.success(`Task status updated to ${newStatus}!`);
        await fetchTasks();
      } else {
        throw new Error(
          response.data?.message || "Failed to update task status"
        );
      }
    } catch (err) {
      console.error("Error updating task status:", err);
      // Revert optimistic update on error
      await fetchTasks();
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update task status";
      toast.error(`Failed to update task status: ${errorMessage}`);
    } finally {
      // Remove from updating set
      setUpdatingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
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

      const response = await apiClient.delete(`/tasks/${taskId}`);

      if (response.data && response.data.success) {
        await fetchTasks();
        toast.success("Task deleted successfully!");
      } else if (response.data && response.status === 200) {
        // Handle case where API returns 200 but no success flag
        await fetchTasks();
        toast.success("Task deleted successfully!");
      } else {
        throw new Error(response.data?.message || "Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error("Failed to delete task. Please try again.");
    }
  };

  // Update task
  const handleUpdateTask = async (taskId, taskData) => {
    try {
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      const url = `/tasks/${taskId}`;
      const preparedTaskData = {
        title: taskData.title?.trim(),
        description: taskData.description?.trim() || "",
        assignedTo: taskData.assignedTo,
        dueDate: taskData.dueDate || null,
        priority: taskData.priority || "Medium",
        status: taskData.status || "Pending",
      };

      if (!preparedTaskData.title) {
        throw new Error("Task title is required");
      }
      if (!preparedTaskData.assignedTo) {
        throw new Error("Task must be assigned to someone");
      }

      const response = await apiClient.put(url, preparedTaskData);

      if (response.data && response.data.success) {
        await fetchTasks();
        toast.success("Task updated successfully!");
      } else if (response.data && response.status === 200) {
        // Handle case where API returns 200 but no success flag
        await fetchTasks();
        toast.success("Task updated successfully!");
      } else {
        throw new Error(response.data?.message || "Failed to update task");
      }
    } catch (err) {
      console.error("Error updating task:", err);
      let errorMessage = "Failed to update task";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (
        err.response?.status === 404 &&
        errorMessage.includes("Assigned user not found")
      ) {
        errorMessage =
          "The selected assignee was not found. Please select a valid user.";
      }

      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Edit task
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingTask(null);
    // Force a small delay to ensure modal is fully closed before allowing interactions
    setTimeout(() => {
      // This ensures the modal is completely closed and focus is restored
      document.body.style.pointerEvents = "auto";
    }, 100);
  };

  // Initial fetch and refetch when filters change
  useEffect(() => {
    if (accessToken) {
      fetchTasks();
    }
  }, [accessToken, fetchTasks]);

  // Filter tasks based on search term, status, and priority - memoized for performance
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      const matchesSearch =
        (task.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.assignee || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (task.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        task.status?.toLowerCase() === statusFilter.toLowerCase();

      // Priority filter
      const matchesPriority =
        priorityFilter === "all" ||
        task.priority?.toLowerCase() === priorityFilter.toLowerCase();

      // Due date filter
      const matchesDueDate = !dueDateFilter || task.dueDate === dueDateFilter;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesDueDate
      );
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, dueDateFilter]);

  return (
    <DashboardLayout
      sidebarConfig={adminDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      {/* Header Section */}
      <div className="px-4 lg:px-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Task Management
            </h1>
            <p className="text-gray-500 mt-1">
              Oversee and manage all tasks across the organization
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => fetchTasks(true)}
              variant="outline"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Refresh"
              )}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={dueDateFilter}
                  onChange={(e) => setDueDateFilter(e.target.value)}
                  placeholder="Due Date"
                  className="w-48"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {filteredTasks.length} of {tasks.length} tasks
                </span>
                {(statusFilter !== "all" ||
                  priorityFilter !== "all" ||
                  dueDateFilter ||
                  searchTerm) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter("all");
                      setPriorityFilter("all");
                      setDueDateFilter("");
                      setSearchTerm("");
                    }}
                    className="text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
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
              <ErrorState error={error} onRetry={() => fetchTasks(true)} />
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
                          {updatingTasks.has(task.id) && (
                            <Badge
                              variant="outline"
                              className="text-blue-600 border-blue-200"
                            >
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Updating...
                            </Badge>
                          )}
                        </div>

                        <p className="text-gray-600 mb-3 max-w-2xl">
                          {task.description}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
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

                          {task.updatedAt && (
                            <div className="text-xs text-gray-400">
                              Last updated:{" "}
                              {new Date(task.updatedAt).toLocaleString()}
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

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onUpdateTask={handleUpdateTask}
        task={editingTask}
      />
    </DashboardLayout>
  );
}
