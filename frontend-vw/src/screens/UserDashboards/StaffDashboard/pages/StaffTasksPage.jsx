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

// Debug API Configuration
const debugApiConfig = () => {
  const baseUrl = getApiUrl();
  console.log("=== API CONFIGURATION DEBUG ===");
  console.log("Base URL from getApiUrl():", baseUrl);
  console.log("Base URL type:", typeof baseUrl);
  console.log("Base URL length:", baseUrl?.length);
  console.log("================================");
  return baseUrl;
};

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
      const statusOptions = ["Pending", "In Progress", "Completed"];
      const currentIndex = statusOptions.findIndex(
        (option) => option.toLowerCase() === status?.toLowerCase()
      );
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

// FIXED: Assignee Search Component with correct API endpoint
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

  // FIXED: Correct API URL construction that matches backend
  const getAssigneeSearchApiUrl = () => {
    try {
      const baseUrl = getApiUrl();
      console.log("=== ASSIGNEE SEARCH API CONFIG ===");
      console.log("Raw base URL from config:", baseUrl);

      let apiUrl;

      if (!baseUrl) {
        // Fallback to localhost if no base URL is configured
        apiUrl = "http://localhost:6000/api/v1";
        console.warn("No base URL configured, using fallback:", apiUrl);
      } else {
        // Clean up the base URL - remove any trailing slashes
        const cleanBaseUrl = baseUrl.replace(/\/+$/, "");

        if (cleanBaseUrl.includes("/api/v1")) {
          // Base URL already includes the API path
          apiUrl = cleanBaseUrl;
        } else {
          // Append API version to base URL
          apiUrl = `${cleanBaseUrl}/api/v1`;
        }
      }

      // FIXED: Use the exact endpoint from your API documentation
      const searchUrl = `${apiUrl}/tasks/assignees/search`;

      console.log("Final assignee search URL:", searchUrl);
      console.log("=====================================");

      return searchUrl;
    } catch (error) {
      console.error("Error constructing assignee search API URL:", error);
      // Return a fallback URL that matches your backend
      const fallbackUrl = "http://localhost:6000/api/v1/tasks/assignees/search";
      console.log("Using fallback URL:", fallbackUrl);
      return fallbackUrl;
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

  // FIXED: Search function that uses correct API endpoint
  const searchUsers = async (query) => {
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

      console.log("=== ASSIGNEE SEARCH REQUEST ===");
      console.log("Search URL:", searchUrl);
      console.log("Search query:", query);
      console.log("Access token exists:", !!accessToken);
      console.log("===============================");

      // FIXED: Make the request exactly as your backend expects
      const response = await axios.get(searchUrl, {
        params: {
          query: query.trim(), // Your backend expects 'query' parameter
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000, // 10 second timeout
      });

      console.log("=== ASSIGNEE SEARCH RESPONSE ===");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      console.log("================================");

      // FIXED: Handle the response based on your backend structure
      if (response.data && response.data.success) {
        // Your backend returns: { success: true, message: '...', count: number, users: [...] }
        const userData = response.data.users || [];

        console.log("Users from backend:", userData);

        // Validate and transform user data
        const validUsers = userData
          .filter((user) => {
            const hasValidId = user && user._id;
            const hasValidName = user && (user.firstName || user.lastName);
            return hasValidId && hasValidName;
          })
          .map((user) => ({
            _id: user._id,
            id: user._id, // Ensure both _id and id are available
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            department: user.department || "",
            jobTitle: user.jobTitle || "",
            email: user.email || "",
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          }));

        console.log("Processed valid users:", validUsers);

        // Add current user to results if they match and aren't already included
        const currentUserMatch =
          currentUser &&
          (currentUser.firstName?.toLowerCase().includes(query.toLowerCase()) ||
            currentUser.lastName?.toLowerCase().includes(query.toLowerCase()));

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

        console.log("Final users list:", validUsers.length, "users");
      } else {
        // Handle case where backend returns success: false
        console.warn("Backend returned success: false:", response.data);
        const errorMessage = response.data.message || "Search request failed";

        if (response.data.message === "No matching users found") {
          // This is expected when no users match
          setUsers([]);
          setIsOpen(false);
          setSearchError(null); // Don't show error for no results
        } else {
          setSearchError(errorMessage);
          setUsers([]);
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.error("=== ASSIGNEE SEARCH ERROR ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("=============================");

      let errorMessage = "Failed to search users";

      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        switch (status) {
          case 404:
            // Check if it's "no users found" vs "endpoint not found"
            if (responseData?.message === "No matching users found") {
              // This is expected when no users match the search
              setUsers([]);
              setIsOpen(false);
              setSearchError(null);
              return; // Don't show error
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
            errorMessage = responseData?.message || `Server error (${status})`;
        }
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Search request timed out. Please try again.";
      } else if (error.message?.includes("Network Error")) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = error.message || "An unexpected error occurred.";
      }

      console.error("Final error message:", errorMessage);
      setSearchError(errorMessage);
      setUsers([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery.trim());
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, accessToken]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onValueChange(newValue);
    setSelectedIndex(-1);
    setSearchError(null);

    // Reset selected user if input is cleared
    if (!newValue.trim()) {
      setSelectedUserData(null);
      onUserSelect(null);
    }
  };

  // FIXED: Better user selection handling
  const handleUserSelect = (user) => {
    const fullName =
      user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim();

    console.log("=== USER SELECTION ===");
    console.log("Selected user:", user);
    console.log("Full name:", fullName);
    console.log("User ID:", user._id);
    console.log("=====================");

    setSearchQuery(fullName);
    setSelectedUserData(user);
    onValueChange(fullName);
    onUserSelect(user._id); // Make sure we pass the _id
    setUsers([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    setSearchError(null);

    // Show success feedback
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

      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 animate-spin border-2 border-green-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Success indicator when user is selected */}
      {selectedUserData && !loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        </div>
      )}

      {/* Error indicator */}
      {searchError && !loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <AlertCircle className="w-4 h-4 text-red-500" />
        </div>
      )}

      {/* Search suggestions dropdown */}
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

      {/* Helper text */}
      {searchQuery.length > 0 && searchQuery.length < 2 && !searchError && (
        <div className="absolute top-full left-0 mt-1 text-xs text-gray-500">
          Type at least 2 characters to search for users
        </div>
      )}

      {/* Error message below input */}
      {searchError && !isOpen && (
        <div className="absolute top-full left-0 mt-1 text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200 max-w-md z-10">
          <div className="font-medium">Search Error:</div>
          <div>{searchError}</div>
          <div className="mt-1 text-gray-600">
            Make sure your server has the endpoint:
            /api/v1/tasks/assignees/search
          </div>
        </div>
      )}
    </div>
  );
};

// FIXED: Add Task Modal Component using correct API endpoint
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

    console.log("=== ADD TASK FORM SUBMISSION ===");
    console.log("Form data:", formData);
    console.log("Current user:", user);
    console.log("===============================");

    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // FIXED: Better assignee handling with validation
      const assigneeId = formData.assignedTo || user?._id;

      if (!assigneeId) {
        toast.error("Unable to determine task assignee. Please try again.");
        return;
      }

      console.log("=== TASK CREATION DATA ===");
      console.log("Assignee ID:", assigneeId);
      console.log("Title:", formData.title);
      console.log("Description:", formData.description);
      console.log("Due Date:", formData.dueDate);
      console.log("Priority:", formData.priority);
      console.log("=========================");

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignedTo: assigneeId, // This should be a MongoDB ObjectId string
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
          {/* Task Title */}
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

          {/* Due Date */}
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
                onUserSelect={(userId) => {
                  console.log("=== ASSIGNEE SELECTED ===");
                  console.log("User ID:", userId);
                  console.log("========================");
                  setFormData({ ...formData, assignedTo: userId });
                }}
                placeholder="Search by name"
              />
              {formData.assignedTo ? (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded-md flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>
                    Task will be assigned to: {formData.assigneeSearch}
                  </span>
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
                    If no assignee is selected, this task will be assigned to
                    you ({user?.firstName || "You"})
                  </span>
                </div>
              )}
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
              disabled={isSubmitting || !formData.title.trim()}
            >
              {isSubmitting ? "Adding..." : "Add Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// FIXED: Edit Task Modal Component
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

  // Initialize form data when task changes
  useEffect(() => {
    if (task && isOpen) {
      const assigneeName = task.assignee || "";
      setFormData({
        title: task.title || "",
        description: task.description || "",
        dueDate: task.dueDate || "",
        priority: task.priority || "Medium",
        status: task.status || "Pending",
        assigneeSearch: assigneeName,
        assignedTo: task.assignedTo?._id || null,
      });
    }
  }, [task, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("=== EDIT TASK FORM SUBMISSION ===");
    console.log("Form data:", formData);
    console.log("Current user:", user);
    console.log("Task ID:", task?.id);
    console.log("================================");

    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // FIXED: Better assignee handling
      const assigneeId = formData.assignedTo || user?._id;

      if (!assigneeId) {
        toast.error("Unable to determine task assignee. Please try again.");
        return;
      }

      const updateData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        assignedTo: assigneeId,
        dueDate: formData.dueDate || null,
        priority: formData.priority || "Medium",
        status: formData.status || "Pending",
      };

      console.log("=== TASK UPDATE DATA ===");
      console.log("Update data being sent:", updateData);
      console.log("=======================");

      await onUpdateTask(task.id, updateData);
      onClose();
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("EditTaskModal - Error updating task:", error);
      const errorMessage =
        error.message || "Failed to update task. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-green-600">Edit Task</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
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

          {/* Task Description */}
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

          {/* Due Date */}
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

          {/* Priority, Status, and Assignee Row */}
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
                  console.log("=== ASSIGNEE SELECTED IN EDIT ===");
                  console.log("User ID:", userId);
                  console.log("===============================");
                  setFormData({ ...formData, assignedTo: userId });
                }}
                placeholder="Search by name"
              />
            </div>
          </div>

          {/* Assignee Status */}
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
              disabled={isSubmitting || !formData.title.trim()}
            >
              {isSubmitting ? "Updating..." : "Update Task"}
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

  // FIXED: API configuration with proper URL handling
  const getFullApiUrl = () => {
    const baseUrl = getApiUrl();
    console.log("Base API URL from config:", baseUrl);

    // Check if the URL includes the full path or just the base
    if (baseUrl && baseUrl.includes("/api/v1")) {
      return baseUrl;
    } else {
      // Assume we need to add /api/v1
      return `${baseUrl || "http://localhost:6000"}/api/v1`;
    }
  };

  // FIXED: Fetch tasks using correct API endpoint
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
      const apiUrl = getFullApiUrl();
      // FIXED: Use correct endpoint from API documentation
      const url = `${apiUrl}/tasks${queryString ? `?${queryString}` : ""}`;

      console.log("Fetching tasks from:", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000, // 15 second timeout
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
        err.message.includes("Network Error") ||
        err.code === "ECONNABORTED"
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

  // FIXED: Add new task using correct API endpoint
  const handleAddTask = async (taskData) => {
    try {
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      console.log("=== ADDING NEW TASK ===");
      console.log("Task data received:", taskData);
      console.log("Current user:", user);
      console.log("======================");

      const apiUrl = getFullApiUrl();
      // FIXED: Use correct endpoint from API documentation
      const url = `${apiUrl}/tasks/create`;
      console.log("API URL:", url);

      // FIXED: Improved task data validation and preparation
      const preparedTaskData = {
        title: taskData.title?.trim(),
        description: taskData.description?.trim() || "",
        assignedTo: taskData.assignedTo, // Should be a valid MongoDB ObjectId
        dueDate: taskData.dueDate || null,
        priority: taskData.priority || "Medium",
      };

      // Validate required fields
      if (!preparedTaskData.title) {
        throw new Error("Task title is required");
      }

      if (!preparedTaskData.assignedTo) {
        throw new Error("Task must be assigned to someone");
      }

      console.log("=== PREPARED TASK DATA ===");
      console.log("Prepared task data:", preparedTaskData);
      console.log("Assignee ID:", preparedTaskData.assignedTo);
      console.log("Assignee ID type:", typeof preparedTaskData.assignedTo);
      console.log("========================");

      const response = await axios.post(url, preparedTaskData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

      console.log("=== TASK CREATION RESPONSE ===");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      console.log("=============================");

      if (response.data.success) {
        await fetchTasks();
        console.log("Task added successfully");
        toast.success("Task created and assigned successfully!");
      } else {
        throw new Error(response.data.message || "Failed to add task");
      }
    } catch (err) {
      console.error("=== ERROR ADDING TASK ===");
      console.error("Error object:", err);
      console.error("Error response:", err.response?.data);
      console.error("========================");

      let errorMessage = "Failed to add task";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Handle specific error cases
      if (
        err.response?.status === 404 &&
        errorMessage.includes("Assigned user not found")
      ) {
        errorMessage =
          "The selected assignee was not found. Please select a valid user.";
      }

      console.error("Final error message:", errorMessage);
      setError(`Failed to add task: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  };

  // FIXED: Update task status using correct API endpoint
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      console.log("Updating task status:", { taskId, newStatus });

      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      const apiUrl = getFullApiUrl();
      // FIXED: Use correct endpoint from API documentation
      const response = await axios.patch(
        `${apiUrl}/tasks/${taskId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("Status update response:", response.data);

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
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update task status";
      toast.error(`Failed to update task status: ${errorMessage}`);
    }
  };

  // FIXED: Delete task using correct API endpoint
  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      const apiUrl = getFullApiUrl();
      // FIXED: Use correct endpoint from API documentation
      const response = await axios.delete(`${apiUrl}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
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

  // FIXED: Update task using correct API endpoint
  const handleUpdateTask = async (taskId, taskData) => {
    try {
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      console.log("=== UPDATING TASK ===");
      console.log("Task ID:", taskId);
      console.log("Task data:", taskData);
      console.log("====================");

      const apiUrl = getFullApiUrl();
      // FIXED: Use correct endpoint from API documentation
      const url = `${apiUrl}/tasks/${taskId}`;
      console.log("API URL:", url);

      // FIXED: Improved task data validation and preparation
      const preparedTaskData = {
        title: taskData.title?.trim(),
        description: taskData.description?.trim() || "",
        assignedTo: taskData.assignedTo,
        dueDate: taskData.dueDate || null,
        priority: taskData.priority || "Medium",
        status: taskData.status || "Pending",
      };

      // Validate required fields
      if (!preparedTaskData.title) {
        throw new Error("Task title is required");
      }

      if (!preparedTaskData.assignedTo) {
        throw new Error("Task must be assigned to someone");
      }

      console.log("=== PREPARED UPDATE DATA ===");
      console.log("Prepared update data:", preparedTaskData);
      console.log("===========================");

      // FIXED: Use PUT method as per API documentation
      const response = await axios.put(url, preparedTaskData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

      console.log("=== TASK UPDATE RESPONSE ===");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      console.log("===========================");

      if (response.data.success) {
        await fetchTasks();
        console.log("Task updated successfully");
        toast.success("Task updated successfully!");
      } else {
        throw new Error(response.data.message || "Failed to update task");
      }
    } catch (err) {
      console.error("=== ERROR UPDATING TASK ===");
      console.error("Error object:", err);
      console.error("Error response:", err.response?.data);
      console.error("==========================");

      let errorMessage = "Failed to update task";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Handle specific error cases
      if (
        err.response?.status === 404 &&
        errorMessage.includes("Assigned user not found")
      ) {
        errorMessage =
          "The selected assignee was not found. Please select a valid user.";
      }

      console.error("Final error message:", errorMessage);
      setError(`Failed to update task: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  };

  // Edit task
  const handleEditTask = (task) => {
    console.log("Edit task:", task);
    setEditingTask(task);
    setShowEditModal(true);
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

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTask(null);
        }}
        onUpdateTask={handleUpdateTask}
        task={editingTask}
      />
    </StaffDashboardLayout>
  );
}
