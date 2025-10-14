import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import FormPreview from "./FormPreview";
import { toast } from "sonner";
import {
  CheckCircle,
  Calendar,
  Users,
  FileText,
  Clock,
  Mail,
  AlertCircle,
  Send,
  Eye,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { apiConfig } from "@/config/apiConfig";

// API URL
const API_URL = apiConfig.baseURL;

const evaluationTypes = {
  annual: "Annual",
  quarterly: "Quarterly",
  probationary: "Probationary",
  "project-based": "Project-based",
};

// Get current year dynamically
const currentYear = new Date().getFullYear();

const evaluationPeriods = {
  [`q1-${currentYear}`]: `Q1 ${currentYear} (Jan - Mar)`,
  [`q2-${currentYear}`]: `Q2 ${currentYear} (Apr - Jun)`,
  [`q3-${currentYear}`]: `Q3 ${currentYear} (Jul - Sep)`,
  [`q4-${currentYear}`]: `Q4 ${currentYear} (Oct - Dec)`,
  [`h1-${currentYear}`]: `H1 ${currentYear} (Jan - Jun)`,
  [`h2-${currentYear}`]: `H2 ${currentYear} (Jul - Dec)`,
  [`fy-${currentYear}`]: `FY ${currentYear} (Full Year)`,
  custom: "Custom Period",
};

export default function ReviewAndSendStep({ data, onUpdate }) {
  const { accessToken } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dueDate, setDueDate] = useState(data.reviewDeadline || "");
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    frequency: "daily",
  });
  const [customMessage, setCustomMessage] = useState("");
  const [sendCopy, setSendCopy] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);

        if (!accessToken) {
          throw new Error("No access token available. Please log in again.");
        }

        const response = await axios.get(`${API_URL}/employees/list`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data.success) {
          // Transform API data to match our component structure
          const transformedEmployees = response.data.data.map((emp) => ({
            id: emp._id,
            name: `${emp.firstName} ${emp.lastName}`,
            email: emp.email,
            role: emp.jobRole,
            department: emp.department,
            team: emp.jobRole, // Using jobRole as team since API doesn't have team field
            avatar: emp.profilePicture || `/api/placeholder/32/32`,
          }));

          setEmployees(transformedEmployees);
        } else {
          throw new Error(response.data.message || "Failed to fetch employees");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        // Fallback to empty array if API fails
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [accessToken]);

  const selectedEmployeeDetails = employees.filter(
    (emp) => data.selectedEmployees && data.selectedEmployees.includes(emp.id)
  );

  // Debug logging
  console.log("ReviewAndSendStep - data:", data);
  console.log("ReviewAndSendStep - selectedEmployees:", data.selectedEmployees);
  console.log("ReviewAndSendStep - employees:", employees);
  console.log(
    "ReviewAndSendStep - selectedEmployeeDetails:",
    selectedEmployeeDetails
  );

  const totalQuestions = data.sections.reduce(
    (acc, section) => acc + (section.questions?.length || 0),
    0
  );

  const estimatedTime = Math.ceil(totalQuestions * 1.5); // 1.5 minutes per question

  // Generate reminder date options based on due date
  const generateReminderDates = () => {
    if (!dueDate) return [];

    const due = new Date(dueDate);
    const dates = [];

    // Add dates leading up to the due date
    for (let i = 7; i >= 1; i--) {
      const reminderDate = new Date(due.getTime() - i * 24 * 60 * 60 * 1000);
      dates.push({
        value: reminderDate.toISOString().split("T")[0],
        label: reminderDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      });
    }

    return dates;
  };

  // Format reminder frequency for display
  const formatReminderFrequency = (frequency) => {
    if (frequency === "daily") {
      return "Daily until completed";
    }

    const date = new Date(frequency);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    return frequency;
  };

  return (
    <div
      className="space-y-6"
      style={{
        "--card": "oklch(1 0 0)",
        "--card-foreground": "oklch(0.145 0 0)",
      }}
    >
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Review & Send Evaluation
        </h2>
        <p className="text-gray-600">
          Review all the details and configure delivery settings before sending
          the evaluation to employees.
        </p>
      </div>

      {/* Evaluation Summary */}
      <Card className="border border-gray-200 shadow-sm bg-white text-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Evaluation Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Form Name:</span>
                <span className="text-sm font-medium">
                  {data.formName || "Untitled Form"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <Badge variant="secondary">
                  {evaluationTypes[data.type] || data.type}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Period:</span>
                <span className="text-sm font-medium">
                  {evaluationPeriods[data.period] || data.period}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sections:</span>
                <span className="text-sm font-medium">
                  {data.sections.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Questions:</span>
                <span className="text-sm font-medium">{totalQuestions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Est. Time:</span>
                <span className="text-sm font-medium">{estimatedTime} min</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipients */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Recipients ({selectedEmployeeDetails.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading employees...</p>
              </div>
            </div>
          ) : selectedEmployeeDetails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedEmployeeDetails.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={employee.avatar}
                      alt={employee.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-700 font-medium text-sm">
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {employee.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {employee.department} • {employee.team}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-2">
                No employees selected
              </p>
              <p className="text-xs text-gray-400">
                Go back to step 2 to select employees for this evaluation
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card className="border border-gray-200 shadow-sm bg-white text-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Delivery Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Due Date <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2 max-w-xs">
              <Input
                type="date"
                id="due-date-picker"
                value={
                  dueDate ? new Date(dueDate).toISOString().split("T")[0] : ""
                }
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  if (selectedDate) {
                    const isoDate = new Date(selectedDate).toISOString();
                    setDueDate(isoDate);
                    onUpdate({ reviewDeadline: isoDate });
                  }
                }}
                onClick={(e) => {
                  // Force the date picker to open
                  if (e.target.showPicker) {
                    e.target.showPicker();
                  }
                }}
                onFocus={(e) => {
                  // Alternative way to trigger date picker
                  if (e.target.showPicker) {
                    e.target.showPicker();
                  }
                }}
                min={new Date().toISOString().split("T")[0]} // Prevent selecting past dates
                className="bg-white text-gray-900 border-gray-300 cursor-pointer"
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "textfield",
                }}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const dateInput = document.getElementById("due-date-picker");
                  if (dateInput) {
                    if (dateInput.showPicker) {
                      dateInput.showPicker();
                    } else {
                      dateInput.focus();
                      dateInput.click();
                    }
                  }
                }}
                className="flex items-center space-x-1 border-gray-300 hover:bg-gray-50 hover:text-gray-900 text-gray-900"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Pick Date</span>
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Select the deadline for completing this evaluation
            </p>
          </div>

          {/* Reminder Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={reminderSettings.enabled}
                onCheckedChange={(checked) =>
                  setReminderSettings((prev) => ({
                    ...prev,
                    enabled: !!checked,
                  }))
                }
                className="cursor-pointer border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <label className="text-sm font-medium text-gray-900 cursor-pointer">
                Send reminder notifications
              </label>
            </div>

            {reminderSettings.enabled && (
              <div className="ml-6 space-y-2">
                <label className="text-sm text-gray-600">
                  Reminder frequency
                </label>
                <Select
                  value={reminderSettings.frequency}
                  onValueChange={(value) =>
                    setReminderSettings((prev) => ({
                      ...prev,
                      frequency: value,
                    }))
                  }
                >
                  <SelectTrigger className="max-w-xs bg-white text-gray-900 border-gray-300 cursor-pointer">
                    <SelectValue>
                      {formatReminderFrequency(reminderSettings.frequency)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900 border border-gray-200 shadow-lg">
                    <SelectItem
                      value="daily"
                      className="hover:bg-green-500 hover:text-white focus:bg-green-500 focus:text-white cursor-pointer"
                    >
                      Daily until completed
                    </SelectItem>
                    {generateReminderDates().map((date) => (
                      <SelectItem
                        key={date.value}
                        value={date.value}
                        className="hover:bg-green-500 hover:text-white focus:bg-green-500 focus:text-white cursor-pointer"
                      >
                        {date.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Custom Message (Optional)
            </label>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal message that will be included in the evaluation invitation email..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Send Copy */}
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={sendCopy}
              onCheckedChange={(checked) => setSendCopy(!!checked)}
              className="cursor-pointer border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
            <label className="text-sm font-medium text-gray-900 cursor-pointer">
              Send me a copy of the invitation email
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="border border-gray-200 shadow-sm bg-white text-gray-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <Button
              onClick={() => {
                setShowPreview(true);
                toast.info(
                  "Opening form preview - see how employees will experience this evaluation"
                );
              }}
              className="flex items-center space-x-2 border border-gray-300 text-gray-700 hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors duration-200 bg-white"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Form</span>
            </Button>

            <div className="flex items-center space-x-3">
              <Button className="flex items-center space-x-2 border border-gray-300 text-gray-700 hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors duration-200 bg-white">
                <span>Save as Draft</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-blue-900">
                Before You Send
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • Employees will receive an email invitation with evaluation
                  instructions
                </li>
                <li>
                  • They will have until the due date to complete their
                  evaluation
                </li>
                <li>
                  • You'll receive notifications as evaluations are completed
                </li>
                <li>
                  • You can track progress and send reminders from the dashboard
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Preview Modal */}
      {showPreview && (
        <FormPreview data={data} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}
