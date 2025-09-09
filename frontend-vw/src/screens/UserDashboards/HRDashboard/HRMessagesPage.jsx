import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { hrDashboardConfig } from "@/config/dashboardConfigs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Clock, Settings } from "lucide-react";

export default function HRMessagesPage() {
  const [activeTimeFilter, setActiveTimeFilter] = useState("today");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Sample messages data based on the UI design
  const messages = [
    {
      id: 1,
      title: "Leave Request Approval Required",
      priority: "high",
      priorityColor: "bg-orange-500",
      priorityText: "High",
      sender: "Richard Mensah",
      senderInitials: "RM",
      avatarColor: "bg-green-500",
      description: "Please review and approve the medical leave request from Sarah Johnson for next week.",
      timestamp: "Sep 09, 2025 at 9:30 AM",
      isSystem: false
    },
    {
      id: 2,
      title: "Payroll Processing Complete",
      priority: "medium",
      priorityColor: "bg-yellow-500",
      priorityText: "Medium",
      sender: "System",
      senderInitials: "S",
      avatarColor: "bg-gray-500",
      description: "Monthly payroll has been processed successfully. Reports are now available in the system.",
      timestamp: "Sep 09, 2025 at 8:00 AM",
      isSystem: true
    },
    {
      id: 3,
      title: "Performance Review Deadline",
      priority: "medium",
      priorityColor: "bg-yellow-500",
      priorityText: "Medium",
      sender: "Felix Otu",
      senderInitials: "FO",
      avatarColor: "bg-blue-500",
      description: "Annual performance reviews for Marketing team are due by end of this week.",
      timestamp: "Sep 09, 2025 at 10:15 AM",
      isSystem: false
    },
    {
      id: 4,
      title: "Security Alert",
      priority: "urgent",
      priorityColor: "bg-red-500",
      priorityText: "Urgent",
      sender: "System",
      senderInitials: "S",
      avatarColor: "bg-gray-500",
      description: "Multiple failed login attempts detected. Please review security logs immediately.",
      timestamp: "Sep 09, 2025 at 1:45 PM",
      isSystem: true
    },
    {
      id: 5,
      title: "New Employee Onboarding",
      priority: "low",
      priorityColor: "bg-green-500",
      priorityText: "Low",
      sender: "Kwaku Manu",
      senderInitials: "KM",
      avatarColor: "bg-pink-500",
      description: "Please prepare onboarding materials for new Software Engineer starting Monday.",
      timestamp: "Sep 09, 2025 at 11:00 AM",
      isSystem: false
    },
    {
      id: 6,
      title: "Urgent: Policy Violation Report",
      priority: "urgent",
      priorityColor: "bg-red-500",
      priorityText: "Urgent",
      sender: "Ellis Duveh",
      senderInitials: "ED",
      avatarColor: "bg-purple-500",
      description: "Immediate attention required for workplace harassment complaint filed today.",
      timestamp: "Sep 09, 2025 at 2:30 PM",
      isSystem: false
    }
  ];

  const timeFilters = [
    { id: "today", label: "Today" },
    { id: "3days", label: "3 Days Ago" },
    { id: "7days", label: "7 Days Ago" },
    { id: "lastmonth", label: "Last Month" }
  ];

  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "urgent", label: "Urgent" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
  ];

  return (
    <DashboardLayout 
      sidebarConfig={hrDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>

        {/* Time Filter Tabs */}
        <div className="flex space-x-2">
          {timeFilters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeTimeFilter === filter.id ? "default" : "outline"}
              onClick={() => setActiveTimeFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTimeFilter === filter.id
                  ? "bg-green-500 text-white border-green-500 shadow-sm hover:bg-green-600"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-48 border-gray-300 rounded-lg">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full ${message.avatarColor} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                  {message.isSystem ? (
                    <Settings className="w-5 h-5" />
                  ) : (
                    message.senderInitials
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {message.title}
                        </h3>
                        <Badge 
                          className={`${message.priorityColor} text-white text-xs px-2 py-1 rounded-full`}
                        >
                          {message.priorityText}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {message.sender}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {message.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center space-x-1 text-xs text-gray-500 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{message.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
