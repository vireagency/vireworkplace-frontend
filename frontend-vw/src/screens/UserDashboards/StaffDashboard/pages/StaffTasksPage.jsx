import { useState, useEffect, useCallback, useRef } from "react";
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

// Enhanced Status Badge Component with better reactivity
const StatusBadge = ({ status, onStatusChange, taskId, canEdit = false }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateTimeoutRef = useRef(null);

  const statusConfig = {
    completed: {
      variant: "default",
      className:
        "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
      icon: CheckCircle2,
      text: "Completed",
      nextStatus: "Pending",
    },
    "in progress": {
      variant: "secondary",
      className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      icon: Clock,
      text: "In Progress",
      nextStatus: "Completed",
    },
    pending: {
      variant: "outline",
      className:
        "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
      icon: AlertCircle,
      text: "Pending",
      nextStatus: "In Progress",
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig["pending"];
  const IconComponent = config.icon;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const handleStatusClick = async () => {
    if (canEdit && onStatusChange && !isUpdating) {
      setIsUpdating(true);

      try {
        await onStatusChange(taskId, config.nextStatus);

        // Reset updating state after successful update
        updateTimeoutRef.current = setTimeout(() => {
          setIsUpdating(false);
        }, 1000);
      } catch (error) {
        setIsUpdating(false);
      }
    }
  };

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${
        canEdit ? "cursor-pointer transition-all duration-200 select-none" : ""
      } relative`}
      onClick={handleStatusClick}
      title={canEdit ? `Click to change to ${config.nextStatus}` : status}
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
      className: "bg-red-50 text-red-700 border-red-200",
      text: "High",
    },
    medium: {
      variant: "secondary",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      text: "Medium",
    },
    low: {
      variant: "outline",
      className: "bg-green-50 text-green-700 border-green-200",
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

// Enhanced Assignee Search Component
const AssigneeSearchInput = ({
  value,
  onValueChange,
  selectedUser,
  onUserSelect,
  placeholder = "Search by name",
  disabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const { accessToken, user: currentUser } = useAuth();
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Initialize search query from value prop
  useEffect(() => {
    if (value !== searchQuery) {
      setSearchQuery(value || "");
    }
  }, [value]);

  // API URL construction
  const getAssigneeSearchApiUrl = useCallback(() => {
    try {
      const baseUrl = getApiUrl();
      let apiUrl;

      if (!baseUrl) {
        apiUrl = "http://localhost:6000/api/v1";
      } else {
        const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
        if (cleanBaseUrl.includes("/api/v1")) {
          apiUrl = cleanBaseUrl;
        } else {
          apiUrl = `${cleanBaseUrl}/api/v1`;
        }
      }

      return `${apiUrl}/tasks/assignees/search`;
    } catch (error) {
      console.error("Error constructing assignee search API URL:", error);
      return "http://localhost:6000/api/v1/tasks/assignees/search";
    }
  }, []);

  // Enhanced search function
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
          params: { query: query.trim() },
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
            .filter(
              (user) => user && user._id && (user.firstName || user.lastName)
            )
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
              }
              errorMessage =
                "Search endpoint not found. Please ensure your server has the '/api/v1/tasks/assignees/search' endpoint.";
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
    [accessToken, currentUser, getAssigneeSearchApiUrl]
  );

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery.trim());
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchUsers]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onValueChange(newValue);
    setSelectedIndex(-1);
    setSearchError(null);

    if (!newValue.trim()) {
      onUserSelect(null);
    }
  };

  const handleUserSelect = (user) => {
    const fullName =
      user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim();

    setSearchQuery(fullName);
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
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    if (users.length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    // Delay to allow for user selection
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 200);
  };

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

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full"
        disabled={disabled}
        autoComplete="off"
      />

      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {users.length > 0 ? (
            users.map((user, index) => (
              <div
                key={user._id}
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
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
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

// Enhanced Edit Task Modal with better reactivity
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
  const [initialData, setInitialData] = useState(null);
  const modalRef = useRef(null);

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
      setInitialData(newFormData);
      setHasChanges(false);
    }
  }, [task, isOpen]);

  // Track changes with better comparison
  useEffect(() => {
    if (initialData && isOpen) {
      const hasChanges = Object.keys(formData).some((key) => {
        if (key === "assignedTo") {
          return formData[key] !== initialData[key];
        }
        return formData[key] !== initialData[key];
      });
      setHasChanges(hasChanges);
    }
  }, [formData, initialData, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enhanced validation
    const errors = [];
    if (!formData.title.trim()) errors.push("Task title is required");
    if (!formData.description.trim())
      errors.push("Task description is required");
    if (!formData.dueDate) errors.push("Due date is required");
    if (!formData.priority) errors.push("Priority is required");
    if (!formData.status) errors.push("Status is required");

    const assigneeId = formData.assignedTo || user?._id;
    if (!assigneeId) errors.push("Assignee is required");

    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    if (!hasChanges) {
      toast.info("No changes to save");
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

      // Reset form state
      setInitialData(formData);
      setHasChanges(false);

      // Close modal after brief delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("Update task error:", error);
      toast.error("Failed to update task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (hasChanges && !isSubmitting) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to close?"
        )
      ) {
        // Reset form
        setFormData(initialData || {});
        setHasChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: "",
        status: "",
        assigneeSearch: "",
        assignedTo: null,
      });
      setInitialData(null);
      setHasChanges(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        ref={modalRef}
        className="sm:max-w-[500px] p-6 max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium text-green-600">
              Edit Task
            </DialogTitle>
            {hasChanges && (
              <Badge
                variant="outline"
                className="text-orange-600 border-orange-200"
              >
                Unsaved changes
              </Badge>
            )}
          </div>
          <DialogDescription>
            Make changes to your task. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
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
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter task title..."
              required
              className="w-full"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="edit-description"
              className="text-sm font-medium text-gray-900"
            >
              Task Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Provide detailed task description..."
              rows={4}
              className="w-full resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Due Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              className="w-full"
              min={new Date().toISOString().split("T")[0]}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
                disabled={isSubmitting}
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
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
                disabled={isSubmitting}
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
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Assignee <span className="text-red-500">*</span>
            </Label>
            <AssigneeSearchInput
              value={formData.assigneeSearch}
              onValueChange={(value) =>
                handleInputChange("assigneeSearch", value)
              }
              selectedUser={formData.assignedTo}
              onUserSelect={(userId) => handleInputChange("assignedTo", userId)}
              placeholder="Search by name"
              disabled={isSubmitting}
            />
          </div>

          {formData.assignedTo ? (
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded-md flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3" />
              <span>Task will be assigned to: {formData.assigneeSearch}</span>
              <button
                type="button"
                onClick={() => {
                  handleInputChange("assignedTo", null);
                  handleInputChange("assigneeSearch", "");
                }}
                className="ml-auto text-red-500 hover:text-red-700"
                disabled={isSubmitting}
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

          <DialogFooter className="flex items-center justify-end gap-3 pt-6 border-t">
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
              disabled={isSubmitting || !hasChanges}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {hasChanges ? "Save Changes" : "No Changes"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Add Task Modal
const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    assigneeSearch: "",
    assignedTo: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        assigneeSearch: "",
        assignedTo: null,
      });
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
      toast.error(error.message || "Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-lg font-medium text-green-600">
            Add new Task
          </DialogTitle>
          <DialogDescription>
            Create a new task and assign it to a team member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
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
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter task title..."
              required
              className="w-full"
              disabled={isSubmitting}
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
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Provide detailed task description..."
              rows={4}
              className="w-full resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Due Date
            </Label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              className="w-full"
              min={new Date().toISOString().split("T")[0]}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Priority
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
                disabled={isSubmitting}
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
                  handleInputChange("assigneeSearch", value)
                }
                selectedUser={formData.assignedTo}
                onUserSelect={(userId) =>
                  handleInputChange("assignedTo", userId)
                }
                placeholder="Search by name"
                disabled={isSubmitting}
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
                  handleInputChange("assignedTo", null);
                  handleInputChange("assigneeSearch", "");
                }}
                className="ml-auto text-red-500 hover:text-red-700"
                disabled={isSubmitting}
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

          <DialogFooter className="flex items-center justify-end gap-3 pt-6 border-t">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Task Actions Menu
const TaskActionsMenu = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  canEdit,
  canDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEdit = () => {
    setIsOpen(false);
    onEdit(task);
  };

  const handleDelete = async () => {
    setIsOpen(false);
    if (window.confirm("Are you sure you want to delete this task?")) {
      await onDelete(task.id);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setIsOpen(false);
    await onStatusChange(task.id, newStatus);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {canEdit && (
          <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
            <Edit className="w-4 h-4 mr-2" />
            Edit Task
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => handleStatusChange("In Progress")}
          className="cursor-pointer"
          disabled={task.status?.toLowerCase() === "in progress"}
        >
          <Clock className="w-4 h-4 mr-2" />
          Mark In Progress
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange("Completed")}
          className="cursor-pointer"
          disabled={task.status?.toLowerCase() === "completed"}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Mark Complete
        </DropdownMenuItem>
        {canDelete && (
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 cursor-pointer focus:text-red-600"
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
    <Loader2 className="w-8 h-8 animate-spin text-green-500 mb-4" />
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
    <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Error Loading Tasks
    </h3>
    <p className="text-gray-500 text-center mb-4 max-w-md">{error}</p>
    <Button onClick={onRetry} className="bg-green-600 hover:bg-green-700">
      <RefreshCw className="w-4 h-4 mr-2" />
      Try Again
    </Button>
  </div>
);

// Main Fixed Staff Tasks Page Component
export default function FixedStaffTasksPage() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  // State management with better organization
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Refs for cleanup
  const abortControllerRef = useRef(null);

  // API configuration
  const getFullApiUrl = useCallback(() => {
    const baseUrl = getApiUrl();
    if (baseUrl && baseUrl.includes("/api/v1")) {
      return baseUrl;
    } else {
      return `${baseUrl || "http://localhost:6000"}/api/v1`;
    }
  }, []);

  // Enhanced API client with better error handling
  const createApiClient = useCallback(() => {
    const client = axios.create({
      baseURL: getFullApiUrl(),
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    client.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );

    return client;
  }, [getFullApiUrl, accessToken, navigate]);

  // Enhanced fetch tasks with better error handling and performance
  const fetchTasks = useCallback(
    async (showSuccessToast = false) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        setLoading(!showSuccessToast); // Don't show loading if refreshing
        if (showSuccessToast) setRefreshing(true);
        setError(null);

        if (!accessToken) {
          throw new Error("No access token available. Please log in again.");
        }

        const apiClient = createApiClient();
        const params = new URLSearchParams();

        if (statusFilter !== "all") params.append("status", statusFilter);
        if (priorityFilter !== "all") params.append("priority", priorityFilter);

        const queryString = params.toString();
        const url = `/tasks${queryString ? `?${queryString}` : ""}`;

        const response = await apiClient.get(url, {
          signal: abortControllerRef.current.signal,
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
            if (showSuccessToast) {
              toast.success(
                `Refreshed! Loaded ${transformedTasks.length} tasks`
              );
            }
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
        // Handle aborted requests gracefully
        if (err.name === "AbortError" || err.name === "CanceledError") {
          return;
        }

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
        if (showSuccessToast) {
          toast.error("Failed to refresh tasks");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, statusFilter, priorityFilter, user?._id, createApiClient]
  );

  // Enhanced task operations with better state management
  const handleAddTask = async (taskData) => {
    try {
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      const apiClient = createApiClient();
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

      const response = await apiClient.post("/tasks/create", preparedTaskData);

      if (response.data.success) {
        // Refresh tasks to get the latest data
        await fetchTasks();
        toast.success("Task created and assigned successfully!");
      } else {
        throw new Error(response.data.message || "Failed to add task");
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

  const handleStatusChange = async (taskId, newStatus) => {
    // Find the task to update
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return;

    // Optimistic update
    const updatedTasks = [...tasks];
    const oldStatus = updatedTasks[taskIndex].status;
    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      status: newStatus.toLowerCase(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(updatedTasks);

    try {
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      const apiClient = createApiClient();
      const response = await apiClient.patch(`/tasks/${taskId}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        toast.success(`Task status updated to ${newStatus}!`);
        // Fetch fresh data to ensure consistency
        await fetchTasks();
      } else {
        throw new Error(
          response.data.message || "Failed to update task status"
        );
      }
    } catch (err) {
      console.error("Error updating task status:", err);

      // Revert optimistic update on error
      const revertedTasks = [...tasks];
      revertedTasks[taskIndex] = {
        ...revertedTasks[taskIndex],
        status: oldStatus,
      };
      setTasks(revertedTasks);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update task status";
      toast.error(`Failed to update task status: ${errorMessage}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      const apiClient = createApiClient();
      const response = await apiClient.delete(`/tasks/${taskId}`);

      if (response.data.success) {
        // Remove task from local state immediately
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
        toast.success("Task deleted successfully!");
      } else {
        throw new Error(response.data.message || "Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error("Failed to delete task. Please try again.");
      // Refresh to ensure consistency
      await fetchTasks();
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      const apiClient = createApiClient();
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

      const response = await apiClient.put(
        `/tasks/${taskId}`,
        preparedTaskData
      );

      if (response.data.success) {
        // Update local state immediately for better UX
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  ...preparedTaskData,
                  updatedAt: new Date().toISOString(),
                }
              : task
          )
        );

        toast.success("Task updated successfully!");

        // Refresh to ensure consistency
        setTimeout(() => fetchTasks(), 500);
      } else {
        throw new Error(response.data.message || "Failed to update task");
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

  // Modal management
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setTimeout(() => setEditingTask(null), 300); // Delay to allow modal animation
  };

  // Initial fetch and filter dependencies
  useEffect(() => {
    if (accessToken) {
      fetchTasks();
    }
  }, [accessToken, fetchTasks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Filter tasks based on search term
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      (task.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.assignee || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Dynamically update the sidebar config with task count
  const dynamicSidebarConfig = {
    ...staffDashboardConfig,
    productivity:
      staffDashboardConfig.productivity?.map((item) =>
        item.title === "Tasks" ? { ...item, badge: tasks.length } : item
      ) || [],
  };

  return (
    <StaffDashboardLayout
      sidebarConfig={dynamicSidebarConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      {/* Header Section */}
      <div className="px-4 lg:px-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
              onClick={() => fetchTasks(true)}
              variant="outline"
              disabled={loading || refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loading || refreshing ? "animate-spin" : ""
                }`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
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
              </div>

              <span className="text-sm text-gray-500">
                {filteredTasks.length} of {tasks.length} tasks
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
              <ErrorState error={error} onRetry={() => fetchTasks(true)} />
            ) : filteredTasks.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200"
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

      {/* Edit Task Modal - Fixed reactivity issues */}
      <EditTaskModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onUpdateTask={handleUpdateTask}
        task={editingTask}
      />
    </StaffDashboardLayout>
  );
}
