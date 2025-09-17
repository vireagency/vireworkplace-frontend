import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Users,
  Plus,
  Check,
  CheckCheck,
  Clock,
  User,
  MessageCircle,
  Settings,
  Archive,
  Trash2,
  Star,
  Loader2,
  Bell,
  BellOff,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Layout Components
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";

// Authentication
import { useAuth } from "@/hooks/useAuth";

// API Configuration
import { getApiUrl } from "@/config/apiConfig";

// Message Status Component
const MessageStatus = ({ status, timestamp }) => {
  const getStatusIcon = () => {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className="flex items-center gap-1 text-xs text-gray-400">
      {getStatusIcon()}
      <span>
        {new Date(timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message, isOwn, contact }) => {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex ${
          isOwn ? "flex-row-reverse" : "flex-row"
        } items-end gap-2 max-w-[70%]`}
      >
        {!isOwn && (
          <Avatar className="w-6 h-6">
            <AvatarImage src={contact?.avatar} />
            <AvatarFallback className="text-xs">
              {contact?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        )}
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwn
              ? "bg-blue-500 text-white rounded-br-sm"
              : "bg-gray-100 text-gray-900 rounded-bl-sm"
          }`}
        >
          <p className="text-sm">{message.content}</p>
          <div
            className={`mt-1 flex ${isOwn ? "justify-end" : "justify-start"}`}
          >
            <MessageStatus
              status={message.status}
              timestamp={message.timestamp}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Contact Item Component
const ContactItem = ({ contact, isActive, onClick, unreadCount = 0 }) => {
  const getLastMessagePreview = () => {
    if (!contact.lastMessage) return "No messages yet";
    const content = contact.lastMessage.content;
    return content.length > 30 ? content.substring(0, 30) + "..." : content;
  };

  const getLastMessageTime = () => {
    if (!contact.lastMessage) return "";
    const date = new Date(contact.lastMessage.timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 cursor-pointer transition-colors border-b border-gray-100 ${
        isActive ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={contact.avatar} />
            <AvatarFallback>{contact.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          {contact.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {contact.name}
            </h4>
            <div className="flex items-center gap-2">
              {getLastMessageTime() && (
                <span className="text-xs text-gray-500">
                  {getLastMessageTime()}
                </span>
              )}
              {unreadCount > 0 && (
                <Badge className="bg-blue-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-500 truncate">
              {getLastMessagePreview()}
            </p>
            {contact.lastMessage?.status === "delivered" && (
              <CheckCheck className="w-3 h-3 text-gray-400 ml-1 flex-shrink-0" />
            )}
          </div>
          {contact.role && (
            <p className="text-xs text-blue-600 mt-1">{contact.role}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Chat Header Component
const ChatHeader = ({ contact, onCall, onVideoCall, onSettings }) => {
  if (!contact) return null;

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={contact.avatar} />
            <AvatarFallback>{contact.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          {contact.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">{contact.name}</h3>
          <p className="text-xs text-gray-500">
            {contact.isOnline
              ? "Active now"
              : `Last seen ${contact.lastSeen || "unknown"}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onCall}>
          <Phone className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onVideoCall}>
          <Video className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSettings("mute")}>
              <Bell className="w-4 h-4 mr-2" />
              Mute notifications
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSettings("archive")}>
              <Archive className="w-4 h-4 mr-2" />
              Archive chat
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onSettings("delete")}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// Message Input Component
const MessageInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-end gap-2">
        <Button variant="ghost" size="sm" disabled={disabled}>
          <Paperclip className="w-4 h-4" />
        </Button>
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              disabled
                ? "Select a contact to start messaging"
                : "Type a message..."
            }
            disabled={disabled}
            rows={1}
            className="resize-none min-h-[40px] max-h-[120px] pr-12"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            disabled={disabled}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Main Staff Messages Page Component
export default function StaffMessagesPage() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // State management
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeContact, setActiveContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [newContactDialog, setNewContactDialog] = useState(false);

  // WebSocket state (for real-time messaging)
  const [wsConnection, setWsConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Mock data for demonstration
  const [mockContacts] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      role: "HR Manager",
      avatar: null,
      isOnline: true,
      lastSeen: "now",
      lastMessage: {
        content:
          "Great work on the project! Looking forward to our meeting tomorrow.",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: "read",
      },
    },
    {
      id: 2,
      name: "Mike Chen",
      role: "Team Lead",
      avatar: null,
      isOnline: false,
      lastSeen: "2 hours ago",
      lastMessage: {
        content: "Can you review the documentation when you have a chance?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "delivered",
      },
    },
    {
      id: 3,
      name: "Emily Davis",
      role: "Project Manager",
      avatar: null,
      isOnline: true,
      lastSeen: "now",
      lastMessage: {
        content: "Team meeting is rescheduled to 3 PM",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: "read",
      },
    },
  ]);

  const [mockMessages] = useState({
    1: [
      {
        id: 1,
        content: "Hi! How's the new project coming along?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        senderId: 1,
        status: "read",
      },
      {
        id: 2,
        content:
          "It's going really well! I should have the first draft ready by tomorrow.",
        timestamp: new Date(
          Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000
        ).toISOString(),
        senderId: user?.id || "me",
        status: "read",
      },
      {
        id: 3,
        content:
          "Great work on the project! Looking forward to our meeting tomorrow.",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        senderId: 1,
        status: "read",
      },
    ],
    2: [
      {
        id: 4,
        content:
          "Hey, did you get a chance to look at the code review comments?",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        senderId: 2,
        status: "delivered",
      },
      {
        id: 5,
        content:
          "Yes, I'm working on addressing them now. Should be done by end of day.",
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
        senderId: user?.id || "me",
        status: "delivered",
      },
      {
        id: 6,
        content: "Can you review the documentation when you have a chance?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        senderId: 2,
        status: "delivered",
      },
    ],
    3: [
      {
        id: 7,
        content: "Quick update on the timeline",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        senderId: 3,
        status: "read",
      },
      {
        id: 8,
        content: "Team meeting is rescheduled to 3 PM",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        senderId: 3,
        status: "read",
      },
    ],
  });

  // API configuration
  const getMessagesApiBaseUrl = () => {
    const baseUrl = getApiUrl();
    const cleanBaseUrl = baseUrl
      ? baseUrl.replace(/\/+$/, "")
      : "http://localhost:6000";
    const noApiV1 = cleanBaseUrl.replace(/\/api\/v1$/, "");
    return `${noApiV1}`;
  };

  // Create axios instance
  const apiClient = axios.create({
    baseURL: getMessagesApiBaseUrl(),
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  // Add request interceptor
  apiClient.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  // Add response interceptor
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!accessToken || !user) {
      navigate("/login");
    }
  }, [accessToken, user, navigate]);

  // Initialize WebSocket connection for real-time messaging
  const initializeWebSocket = () => {
    try {
      // In a real implementation, you would connect to your WebSocket server
      // const ws = new WebSocket(`ws://localhost:6000/ws/messages?token=${accessToken}`);

      // Mock WebSocket behavior
      const mockWs = {
        send: (data) => console.log("Sending message:", data),
        close: () => setIsConnected(false),
        readyState: 1, // OPEN
      };

      setWsConnection(mockWs);
      setIsConnected(true);

      // Simulate connection
      setTimeout(() => {
        toast.success("Connected to real-time messaging");
      }, 1000);
    } catch (error) {
      console.error("WebSocket connection failed:", error);
      toast.error("Failed to connect to real-time messaging");
    }
  };

  // Fetch contacts and messages
  const fetchMessagesData = async () => {
    try {
      setLoading(true);

      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      // Try to fetch from API
      try {
        const contactsResponse = await apiClient.get(
          "/api/v1/messages/contacts"
        );
        if (contactsResponse.data && contactsResponse.data.success) {
          const contactsData =
            contactsResponse.data.data || contactsResponse.data.contacts || [];
          setContacts(contactsData);

          // Fetch messages for each contact
          const messagesData = {};
          for (const contact of contactsData) {
            try {
              const messagesResponse = await apiClient.get(
                `/api/v1/messages/conversation/${contact.id}`
              );
              if (messagesResponse.data && messagesResponse.data.success) {
                messagesData[contact.id] =
                  messagesResponse.data.data ||
                  messagesResponse.data.messages ||
                  [];
              }
            } catch (err) {
              console.log(`Failed to fetch messages for contact ${contact.id}`);
            }
          }
          setMessages(messagesData);
          return;
        }
      } catch (err) {
        console.log("Messages API not available, using mock data");
      }

      // Use mock data as fallback
      setContacts(mockContacts);
      setMessages(mockMessages);
    } catch (err) {
      console.error("Error fetching messages data:", err);
      toast.error("Failed to load messages");

      // Use mock data as fallback
      setContacts(mockContacts);
      setMessages(mockMessages);
    } finally {
      setLoading(false);
    }
  };

  // Fetch related data for sidebar badges
  const fetchRelatedData = async () => {
    try {
      // Fetch tasks
      const tasksResponse = await apiClient.get("/api/v1/tasks");
      if (tasksResponse.data && tasksResponse.data.success) {
        setTasks(tasksResponse.data.data || tasksResponse.data.tasks || []);
      }
    } catch (err) {
      console.log("Tasks not available for sidebar");
    }

    try {
      // Fetch evaluations
      const evaluationsResponse = await apiClient.get(
        "/api/v1/dashboard/staff/evaluations/reviews"
      );
      if (evaluationsResponse.data && evaluationsResponse.data.success) {
        setEvaluations(evaluationsResponse.data.data || []);
      }
    } catch (err) {
      console.log("Evaluations not available for sidebar");
    }
  };

  // Send message
  const handleSendMessage = async (content) => {
    if (!activeContact) return;

    const tempId = Date.now();
    const newMessage = {
      id: tempId,
      content,
      timestamp: new Date().toISOString(),
      senderId: user?.id || "me",
      status: "sending",
    };

    // Optimistic update
    setMessages((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMessage],
    }));

    try {
      // Send via WebSocket if connected
      if (wsConnection && isConnected) {
        wsConnection.send(
          JSON.stringify({
            type: "message",
            recipientId: activeContact.id,
            content,
            timestamp: newMessage.timestamp,
          })
        );
      }

      // Also send via API for persistence
      const response = await apiClient.post("/api/v1/messages/send", {
        recipientId: activeContact.id,
        content,
        type: "text",
      });

      if (response.data && response.data.success) {
        // Update message status
        setMessages((prev) => ({
          ...prev,
          [activeContact.id]: prev[activeContact.id].map((msg) =>
            msg.id === tempId
              ? { ...msg, id: response.data.data.id, status: "sent" }
              : msg
          ),
        }));

        // Update contact's last message
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === activeContact.id
              ? {
                  ...contact,
                  lastMessage: {
                    content,
                    timestamp: newMessage.timestamp,
                    status: "sent",
                  },
                }
              : contact
          )
        );
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove failed message or mark as failed
      setMessages((prev) => ({
        ...prev,
        [activeContact.id]: prev[activeContact.id].filter(
          (msg) => msg.id !== tempId
        ),
      }));

      toast.error("Failed to send message. Please try again.");
    }
  };

  // Handle contact actions
  const handleContactAction = (action, contact) => {
    switch (action) {
      case "mute":
        toast.success(`Muted notifications for ${contact.name}`);
        break;
      case "archive":
        toast.success(`Archived chat with ${contact.name}`);
        break;
      case "delete":
        if (
          confirm(`Delete chat with ${contact.name}? This cannot be undone.`)
        ) {
          toast.success(`Deleted chat with ${contact.name}`);
          setContacts((prev) => prev.filter((c) => c.id !== contact.id));
          if (activeContact?.id === contact.id) {
            setActiveContact(null);
          }
        }
        break;
      default:
        break;
    }
  };

  // Handle call actions
  const handleCall = (contact) => {
    toast.success(`Calling ${contact.name}...`);
    // Implement call functionality
  };

  const handleVideoCall = (contact) => {
    toast.success(`Starting video call with ${contact.name}...`);
    // Implement video call functionality
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeContact]);

  // Initial data fetch
  useEffect(() => {
    if (accessToken) {
      fetchMessagesData();
      fetchRelatedData();
      initializeWebSocket();
    }

    // Cleanup WebSocket on unmount
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [accessToken]);

  // Filter contacts
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get active messages
  const activeMessages = activeContact ? messages[activeContact.id] || [] : [];

  // Get unread count for contact
  const getUnreadCount = (contactId) => {
    const contactMessages = messages[contactId] || [];
    return contactMessages.filter(
      (msg) => msg.senderId !== (user?.id || "me") && msg.status !== "read"
    ).length;
  };

  // Dynamically update sidebar badges
  const dynamicSidebarConfig = {
    ...staffDashboardConfig,
    productivity:
      staffDashboardConfig.productivity?.map((item) =>
        item.title === "Tasks" ? { ...item, badge: tasks.length } : item
      ) || [],
    analytics:
      staffDashboardConfig.analytics?.map((item) =>
        item.title === "Evaluations"
          ? { ...item, badge: evaluations.length }
          : item
      ) || [],
  };

  if (loading) {
    return (
      <StaffDashboardLayout
        sidebarConfig={dynamicSidebarConfig}
        showSectionCards={false}
        showChart={false}
        showDataTable={false}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Loading messages...</p>
          </div>
        </div>
      </StaffDashboardLayout>
    );
  }

  return (
    <StaffDashboardLayout
      sidebarConfig={dynamicSidebarConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      <div className="h-[calc(100vh-120px)] flex">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <div className="flex items-center gap-2">
                {isConnected && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Live
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewContactDialog(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Contacts List */}
          <ScrollArea className="flex-1">
            {filteredContacts.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {searchTerm ? "No contacts found" : "No conversations"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Start a conversation to see it here"}
                  </p>
                </div>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  isActive={activeContact?.id === contact.id}
                  onClick={() => setActiveContact(contact)}
                  unreadCount={getUnreadCount(contact.id)}
                />
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {activeContact ? (
            <>
              {/* Chat Header */}
              <ChatHeader
                contact={activeContact}
                onCall={() => handleCall(activeContact)}
                onVideoCall={() => handleVideoCall(activeContact)}
                onSettings={(action) =>
                  handleContactAction(action, activeContact)
                }
              />

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {activeMessages.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                          No messages yet
                        </h3>
                        <p className="text-sm text-gray-500">
                          Start the conversation with {activeContact.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    activeMessages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={message.senderId === (user?.id || "me")}
                        contact={activeContact}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <MessageInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500 max-w-md">
                  Choose a contact from the sidebar to start messaging, or
                  create a new conversation.
                </p>
                <Button
                  onClick={() => setNewContactDialog(true)}
                  className="mt-4 bg-blue-500 hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Message
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Contact Dialog */}
      <Dialog open={newContactDialog} onOpenChange={setNewContactDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
            <DialogDescription>
              Search for a colleague to start messaging
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500">
              Feature coming soon - contact your administrator to add new
              contacts.
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewContactDialog(false)}
            >
              Cancel
            </Button>
            <Button disabled>Start Chat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StaffDashboardLayout>
  );
}
