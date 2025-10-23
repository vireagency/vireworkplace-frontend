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
  Send,
  Reply,
  Forward,
  Archive,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Users,
  Mail,
  Bell,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminMessagesPage() {
  const { accessToken, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("inbox");

  // Mock message data
  const [messages, setMessages] = useState([
    {
      id: 1,
      subject: "System Maintenance Scheduled",
      sender: "System Admin",
      senderEmail: "admin@vireagency.com",
      recipient: "All Users",
      content:
        "We will be performing scheduled maintenance on our servers this weekend. The system will be unavailable from 2 AM to 6 AM EST on Sunday.",
      priority: "High",
      status: "Unread",
      type: "System",
      timestamp: "2024-01-15 10:30",
      isStarred: false,
      isArchived: false,
      attachments: [],
    },
    {
      id: 2,
      subject: "New Employee Onboarding",
      sender: "HR Manager",
      senderEmail: "hr@vireagency.com",
      recipient: "Admin",
      content:
        "Please review the new employee onboarding checklist for David Brown. All documents have been uploaded to the system.",
      priority: "Medium",
      status: "Read",
      type: "HR",
      timestamp: "2024-01-15 09:15",
      isStarred: true,
      isArchived: false,
      attachments: ["onboarding_checklist.pdf"],
    },
    {
      id: 3,
      subject: "Budget Approval Request",
      sender: "Finance Manager",
      senderEmail: "finance@vireagency.com",
      recipient: "Admin",
      content:
        "I need approval for the Q1 marketing budget increase. The proposal is attached for your review.",
      priority: "High",
      status: "Unread",
      type: "Finance",
      timestamp: "2024-01-15 08:45",
      isStarred: false,
      isArchived: false,
      attachments: ["budget_proposal.pdf", "marketing_plan.pdf"],
    },
    {
      id: 4,
      subject: "Security Alert - Unusual Login Activity",
      sender: "Security System",
      senderEmail: "security@vireagency.com",
      recipient: "Admin",
      content:
        "We detected unusual login activity from an unrecognized IP address. Please review the security logs and take appropriate action.",
      priority: "Critical",
      status: "Read",
      type: "Security",
      timestamp: "2024-01-14 16:20",
      isStarred: true,
      isArchived: false,
      attachments: ["security_log.pdf"],
    },
    {
      id: 5,
      subject: "Weekly Performance Report",
      sender: "Performance System",
      senderEmail: "performance@vireagency.com",
      recipient: "Admin",
      content:
        "Your weekly performance report is ready. The team has shown excellent progress this week with a 15% increase in productivity.",
      priority: "Low",
      status: "Read",
      type: "Performance",
      timestamp: "2024-01-14 14:30",
      isStarred: false,
      isArchived: true,
      attachments: ["performance_report.pdf"],
    },
  ]);

  const [newMessage, setNewMessage] = useState({
    subject: "",
    recipient: "",
    content: "",
    priority: "Medium",
    type: "General",
  });

  const [replyMessage, setReplyMessage] = useState({
    content: "",
  });

  const handleComposeMessage = async () => {
    if (!newMessage.subject || !newMessage.recipient || !newMessage.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const message = {
        id: messages.length + 1,
        ...newMessage,
        sender: user?.firstName || "Admin",
        senderEmail: user?.email || "admin@vireagency.com",
        status: "Sent",
        timestamp: new Date().toLocaleString(),
        isStarred: false,
        isArchived: false,
        attachments: [],
      };

      setMessages((prev) => [message, ...prev]);
      setNewMessage({
        subject: "",
        recipient: "",
        content: "",
        priority: "Medium",
        type: "General",
      });
      setIsComposeModalOpen(false);
      toast.success("Message sent successfully");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplyMessage = async () => {
    if (!replyMessage.content) {
      toast.error("Please enter a reply message");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const reply = {
        id: messages.length + 1,
        subject: `Re: ${selectedMessage?.subject}`,
        sender: user?.firstName || "Admin",
        senderEmail: user?.email || "admin@vireagency.com",
        recipient: selectedMessage?.sender,
        content: replyMessage.content,
        priority: selectedMessage?.priority,
        status: "Sent",
        type: "Reply",
        timestamp: new Date().toLocaleString(),
        isStarred: false,
        isArchived: false,
        attachments: [],
      };

      setMessages((prev) => [reply, ...prev]);
      setReplyMessage({ content: "" });
      setIsReplyModalOpen(false);
      setSelectedMessage(null);
      toast.success("Reply sent successfully");
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      toast.success("Message deleted successfully");
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStar = async (messageId) => {
    setIsLoading(true);
    try {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
        )
      );
      toast.success("Message starred/unstarred");
    } catch (error) {
      toast.error("Failed to update message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleArchive = async (messageId) => {
    setIsLoading(true);
    try {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isArchived: !msg.isArchived } : msg
        )
      );
      toast.success("Message archived/unarchived");
    } catch (error) {
      toast.error("Failed to update message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    setIsLoading(true);
    try {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "Read" } : msg
        )
      );
      toast.success("Message marked as read");
    } catch (error) {
      toast.error("Failed to update message");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || message.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "all" || message.priority === selectedPriority;

    // Filter by tab
    let matchesTab = true;
    if (activeTab === "inbox") {
      matchesTab = !message.isArchived;
    } else if (activeTab === "starred") {
      matchesTab = message.isStarred;
    } else if (activeTab === "archived") {
      matchesTab = message.isArchived;
    } else if (activeTab === "sent") {
      matchesTab = message.sender === (user?.firstName || "Admin");
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesTab;
  });

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "Critical":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "High":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "Medium":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Low":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      Critical: "bg-red-100 text-red-800",
      High: "bg-orange-100 text-orange-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-green-100 text-green-800",
    };

    return (
      <Badge className={variants[priority] || "bg-gray-100 text-gray-800"}>
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const variants = {
      Unread: "bg-blue-100 text-blue-800",
      Read: "bg-gray-100 text-gray-800",
      Sent: "bg-green-100 text-green-800",
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const variants = {
      System: "bg-purple-100 text-purple-800",
      HR: "bg-indigo-100 text-indigo-800",
      Finance: "bg-green-100 text-green-800",
      Security: "bg-red-100 text-red-800",
      Performance: "bg-blue-100 text-blue-800",
      General: "bg-gray-100 text-gray-800",
      Reply: "bg-yellow-100 text-yellow-800",
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
              Messages & Communication
            </h1>
            <p className="text-gray-600">
              Manage system communications and notifications
            </p>
          </div>
          <Button onClick={() => setIsComposeModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Compose Message
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Messages
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length}</div>
              <p className="text-xs text-muted-foreground">+3 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unread Messages
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {messages.filter((msg) => msg.status === "Unread").length}
              </div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Starred Messages
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {messages.filter((msg) => msg.isStarred).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Important messages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                High Priority
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  messages.filter(
                    (msg) =>
                      msg.priority === "High" || msg.priority === "Critical"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Urgent messages</p>
            </CardContent>
          </Card>
        </div>

        {/* Message Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Unread">Unread</SelectItem>
                    <SelectItem value="Read">Read</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedPriority}
                  onValueChange={setSelectedPriority}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Messages Table */}
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Manage system communications and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Message</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMessages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {message.isStarred && (
                                <Star className="w-4 h-4 text-yellow-500" />
                              )}
                              <div>
                                <div className="font-medium">
                                  {message.subject}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {message.content.substring(0, 100)}...
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.avatar} />
                                <AvatarFallback>
                                  {message.sender
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {message.sender}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {message.senderEmail}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(message.type)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getPriorityIcon(message.priority)}
                              <span className="ml-2">
                                {getPriorityBadge(message.priority)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(message.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-gray-400" />
                              {message.timestamp}
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
                                  onClick={() => setSelectedMessage(message)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedMessage(message);
                                    setIsReplyModalOpen(true);
                                  }}
                                >
                                  <Reply className="w-4 h-4 mr-2" />
                                  Reply
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleToggleStar(message.id)}
                                >
                                  <Star className="w-4 h-4 mr-2" />
                                  {message.isStarred ? "Unstar" : "Star"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleToggleArchive(message.id)
                                  }
                                >
                                  <Archive className="w-4 h-4 mr-2" />
                                  {message.isArchived ? "Unarchive" : "Archive"}
                                </DropdownMenuItem>
                                {message.status === "Unread" && (
                                  <DropdownMenuItem
                                    onClick={() => handleMarkAsRead(message.id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark as Read
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteMessage(message.id)
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Compose Message Modal */}
      <Dialog open={isComposeModalOpen} onOpenChange={setIsComposeModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>
              Send a new message to users or departments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={newMessage.subject}
                onChange={(e) =>
                  setNewMessage((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
                placeholder="Enter message subject"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipient">Recipient *</Label>
                <Input
                  id="recipient"
                  value={newMessage.recipient}
                  onChange={(e) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      recipient: e.target.value,
                    }))
                  }
                  placeholder="Enter recipient"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newMessage.priority}
                  onValueChange={(value) =>
                    setNewMessage((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="content">Message Content *</Label>
              <Textarea
                id="content"
                value={newMessage.content}
                onChange={(e) =>
                  setNewMessage((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                placeholder="Enter your message here..."
                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsComposeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleComposeMessage} disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Message Modal */}
      <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
            <DialogDescription>
              Reply to: {selectedMessage?.subject}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="replyContent">Your Reply *</Label>
                <Textarea
                  id="replyContent"
                  value={replyMessage.content}
                  onChange={(e) =>
                    setReplyMessage((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Enter your reply here..."
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsReplyModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleReplyMessage} disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reply"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
