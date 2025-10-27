import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { adminDashboardConfig } from "@/config/dashboardConfigs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  MoreVertical,
  Edit,
  Eye,
  Users,
  Mail,
  Briefcase,
  X,
  UserPlus,
  Trash2,
  Settings,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { contextSearchApi } from "@/services/contextSearchApi";
import { toast } from "sonner";

// API configuration - using the centralized API config
import { getApiUrl } from "@/config/apiConfig";
const API_URL = getApiUrl();

// Sample departments for filtering
const departments = [
  "Design",
  "Engineering",
  "Social Media",
  "Marketing",
  "Production",
  "HR",
  "Finance",
  "Sales",
  "Operations",
];

export default function AdminEmployeesPage() {
  const {
    accessToken,
    user,
    isAuthenticated,
    isTokenValid,
    getTokenExpiration,
  } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Contextual search states
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);

        // Check authentication
        if (!accessToken) {
          console.log("Authentication status:", {
            isAuthenticated,
            hasToken: !!accessToken,
          });
          throw new Error("No access token available. Please log in again.");
        }

        console.log("Making API call to:", `${API_URL}/employees/list`);
        console.log("User:", user);
        console.log("User role:", user?.role);
        console.log("Access token:", accessToken);
        console.log("Token length:", accessToken?.length);
        console.log("Token starts with:", accessToken?.substring(0, 20));
        console.log("Token valid:", isTokenValid());
        console.log("Token expires at:", getTokenExpiration());

        const response = await axios.get(`${API_URL}/employees/list`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Response received:", response);

        if (response.data.success) {
          // Transform API data to match our component structure
          const transformedEmployees = response.data.data.map((emp) => ({
            id: emp._id,
            name: `${emp.firstName} ${emp.lastName}`,
            email: emp.email, // Use the actual email field from API
            role: emp.jobRole,
            department: emp.department, // Use the actual department field from API
            status: emp.attendanceStatus,
            location: emp.locationToday,
            checkIn: emp.checkInTime,
            isLate: emp.isLate, // Use the isLate field from API
            avatar: emp.avatar || null,
          }));

          setEmployees(transformedEmployees);
          console.log("API Response:", response.data);
          console.log("Transformed Employees:", transformedEmployees);
          console.log(
            "Employees state set to:",
            transformedEmployees.length,
            "employees"
          );
        } else {
          setError("Failed to fetch employees");
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
        console.error("Error details:", {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
        });

        // Log the full error response for debugging
        if (err.response?.data) {
          console.error("Backend error response:", err.response.data);
        }

        // Set a more specific error message
        if (err.response?.status === 403) {
          setError(
            "Access denied. You may not have permission to view employee data."
          );
        } else {
          setError(`Error fetching employees: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Contextual search function
  const performContextualSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    if (!accessToken) {
      toast.error("Authentication required for search");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      console.log("Performing contextual search for employees:", query);
      const result = await contextSearchApi.searchEmployees(
        query.trim(),
        accessToken
      );

      if (result.success) {
        console.log("Contextual search results:", result.data);

        // Transform API data to match our component structure
        const transformedResults = result.data.results.map((emp) => ({
          id: emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          role: emp.jobRole,
          department: emp.department,
          status: emp.attendanceStatus,
          location: emp.locationToday,
          checkIn: emp.checkInTime,
          isLate: emp.isLate,
          avatar: emp.avatar || null,
        }));

        setSearchResults(transformedResults);
        toast.success(
          `Found ${transformedResults.length} employees matching "${query}"`
        );
      } else {
        console.error("Contextual search failed:", result.error);
        toast.error(result.error || "Search failed");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Contextual search error:", error);
      toast.error("Search failed. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        performContextualSearch(searchTerm);
      } else {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, accessToken]);

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    console.log("Filtering employees:", employees.length, "total employees");

    // If we have search results, use them; otherwise use all employees
    const employeesToFilter =
      hasSearched && searchResults.length > 0 ? searchResults : employees;

    const filtered = employeesToFilter.filter((employee) => {
      const matchesStatus =
        statusFilter === "all" || employee.status === statusFilter;
      const matchesDepartment =
        departmentFilter === "all" || employee.department === departmentFilter;

      return matchesStatus && matchesDepartment;
    });
    console.log(
      "Filtered employees:",
      filtered.length,
      "employees after filtering"
    );
    return filtered;
  }, [employees, searchResults, hasSearched, statusFilter, departmentFilter]);

  // Pagination
  const totalItems = filteredEmployees.length;
  const currentEmployees = filteredEmployees.slice(
    0,
    currentPage * itemsPerPage
  );
  const hasMoreItems = currentEmployees.length < totalItems && totalItems > 0;

  console.log("Pagination debug:", {
    totalItems,
    currentPage,
    itemsPerPage,
    currentEmployeesLength: currentEmployees.length,
    hasMoreItems,
  });

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  // Function to determine arrival status based on isLate field from API
  const getArrivalStatus = (isLate) => {
    if (isLate === true) {
      return { status: "Late", color: "bg-red-100 text-red-600" };
    } else if (isLate === false) {
      return { status: "On Time", color: "bg-green-100 text-green-600" };
    } else {
      return { status: "Unknown", color: "bg-gray-100 text-gray-600" };
    }
  };

  // Admin-specific functions
  const handleAddEmployee = () => {
    toast.info("Add employee functionality will be implemented soon");
    // TODO: Implement add employee functionality
  };

  const handleEditEmployee = (employee) => {
    toast.info(
      `Edit employee ${employee.name} functionality will be implemented soon`
    );
    // TODO: Implement edit employee functionality
  };

  const handleDeleteEmployee = (employee) => {
    if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
      toast.info(
        `Delete employee ${employee.name} functionality will be implemented soon`
      );
      // TODO: Implement delete employee functionality
    }
  };

  const handleManagePermissions = (employee) => {
    toast.info(
      `Manage permissions for ${employee.name} functionality will be implemented soon`
    );
    // TODO: Implement manage permissions functionality
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout
        sidebarConfig={adminDashboardConfig}
        showSectionCards={false}
        showChart={false}
        showDataTable={false}
      >
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading employees...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout
        sidebarConfig={adminDashboardConfig}
        showSectionCards={false}
        showChart={false}
        showDataTable={false}
      >
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Employees
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-green-500 hover:bg-green-600"
            >
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Active: {
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-700",
        dotColor: "bg-green-500",
        text: "Active",
      },
      "In-active": {
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        textColor: "text-orange-700",
        dotColor: "bg-orange-500",
        text: "In-active",
      },
      Closed: {
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-700",
        dotColor: "bg-red-500",
        text: "Closed",
      },
    };

    const config = statusConfig[status] || statusConfig["In-active"];

    return (
      <div
        className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}
      >
        <div className={`w-2 h-2 ${config.dotColor} rounded-full`}></div>
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.text}
        </span>
      </div>
    );
  };

  return (
    <DashboardLayout
      sidebarConfig={adminDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="mb-8 ml-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-zinc-900">
                Admin Employee Management
              </h1>
              {hasSearched && searchResults.length > 0 && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                  {searchResults.length} search result
                  {searchResults.length !== 1 ? "s" : ""}
                </span>
              )}
              {hasSearched && searchResults.length === 0 && searchTerm && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                  No results for "{searchTerm}"
                </span>
              )}
            </div>
            <Button
              onClick={handleAddEmployee}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
          <p className="text-zinc-500">
            Comprehensive employee management and oversight across the entire
            organization.
          </p>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm ml-6 mr-6">
          {/* Filters Bar */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-end">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 w-full sm:w-80"
                    disabled={isSearching}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {searchTerm && !isSearching && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSearchResults([]);
                        setHasSearched(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32 cursor-pointer">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      All Status
                    </SelectItem>
                    <SelectItem value="active" className="cursor-pointer">
                      Active
                    </SelectItem>
                    <SelectItem value="inactive" className="cursor-pointer">
                      Inactive
                    </SelectItem>
                    <SelectItem value="closed" className="cursor-pointer">
                      Closed
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger className="w-full sm:w-36 cursor-pointer">
                    <SelectValue placeholder="All Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      All Department
                    </SelectItem>
                    {departments.map((dept) => (
                      <SelectItem
                        key={dept}
                        value={dept}
                        className="cursor-pointer"
                      >
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing {currentEmployees.length} of {totalItems} employees
              </div>
              {hasMoreItems && (
                <div>{totalItems - currentEmployees.length} more available</div>
              )}
            </div>
          </div>

          {/* Employee Table */}
          <div className="p-0">
            {currentEmployees.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="w-[300px] py-4 px-6 font-semibold text-gray-900">
                      Employee
                    </TableHead>
                    <TableHead className="py-4 px-6 font-semibold text-gray-900">
                      Role
                    </TableHead>
                    <TableHead className="py-4 px-6 font-semibold text-gray-900">
                      Department
                    </TableHead>
                    <TableHead className="py-4 px-6 font-semibold text-gray-900">
                      Status
                    </TableHead>
                    <TableHead className="py-4 px-6 font-semibold text-gray-900">
                      Location
                    </TableHead>
                    <TableHead className="py-4 px-6 font-semibold text-gray-900">
                      Check-in
                    </TableHead>
                    <TableHead className="py-4 px-6 font-semibold text-gray-900 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentEmployees.map((employee) => (
                    <TableRow
                      key={employee.id}
                      className="hover:bg-gray-50 border-b border-gray-100"
                    >
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10 rounded-full overflow-hidden">
                            <AvatarImage
                              src={employee.avatar}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            <AvatarFallback className="bg-gray-300 text-gray-600 rounded-full">
                              {employee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">
                              {employee.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 font-medium text-gray-900">
                        {employee.role}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-900">
                        {employee.department}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <StatusBadge status={employee.status} />
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {employee.location}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-300 text-gray-700"
                          >
                            {employee.checkIn}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => handleViewEmployee(employee)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="h-8 bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <DropdownMenu
                            onOpenChange={(open) =>
                              console.log(
                                "Employee actions dropdown open:",
                                open
                              )
                            }
                          >
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEditEmployee(employee);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleViewEmployee(employee);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleManagePermissions(employee);
                                }}
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                Manage Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-red-600"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteEmployee(employee);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Employee
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No employees found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            )}

            {/* Load More Button */}
            {hasMoreItems && (
              <div className="mt-6 px-6 pb-6 flex items-center justify-center border-t border-gray-200 pt-6">
                <Button
                  variant="default"
                  onClick={handleLoadMore}
                  className="px-8 py-2 bg-green-500 hover:bg-green-600 text-white"
                >
                  Load More...
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Employee Summary Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Employee Summary
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Quick overview of employee information
            </DialogDescription>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-6">
              {/* Employee Header */}
              <div className="flex items-start space-x-4">
                <Avatar className="w-20 h-20 rounded-full overflow-hidden">
                  <AvatarImage
                    src={selectedEmployee.avatar}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <AvatarFallback className="text-lg bg-gray-300 text-gray-600 rounded-full">
                    {selectedEmployee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedEmployee.name}
                  </h3>
                  <p className="text-gray-600 mb-3">{selectedEmployee.role}</p>
                  <div className="flex items-center space-x-20">
                    <StatusBadge status={selectedEmployee.status} />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Arrival:</span>
                      <div
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          getArrivalStatus(selectedEmployee.isLate).color
                        }`}
                      >
                        {getArrivalStatus(selectedEmployee.isLate).status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900 truncate break-all">
                        {selectedEmployee.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Briefcase className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium text-gray-900 truncate">
                        {selectedEmployee.department}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500">Work Location</p>
                      <p className="font-medium text-gray-900 truncate">
                        {selectedEmployee.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500">Last Check-in</p>
                      <p className="font-medium text-gray-900 truncate">
                        {selectedEmployee.checkIn}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Quick Stats</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">85%</p>
                    <p className="text-sm text-gray-600">Performance</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-2xl font-bold text-green-600">12</p>
                    <p className="text-sm text-gray-600">Projects</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-2xl font-bold text-purple-600">2.5</p>
                    <p className="text-sm text-gray-600">Years</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div className="flex justify-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleManagePermissions(selectedEmployee)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Permissions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEditEmployee(selectedEmployee)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Quick Edit
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Button className="bg-[#04b435] hover:bg-[#04b435]/90 text-white px-6 py-2 cursor-pointer">
                    View Complete Profile
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
