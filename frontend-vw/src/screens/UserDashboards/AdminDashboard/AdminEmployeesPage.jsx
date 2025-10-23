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
  UserPlus,
  Users,
  Building,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
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

export default function AdminEmployeesPage() {
  const { accessToken, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock employee data
  const [employees, setEmployees] = useState([
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@vireagency.com",
      phone: "+1 (555) 123-4567",
      department: "Engineering",
      position: "Senior Developer",
      status: "Active",
      hireDate: "2023-01-15",
      location: "New York, NY",
      avatar: null,
      manager: "Jane Smith",
      salary: "$85,000",
      lastLogin: "2024-01-15 09:30",
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@vireagency.com",
      phone: "+1 (555) 234-5678",
      department: "HR",
      position: "HR Manager",
      status: "Active",
      hireDate: "2022-06-01",
      location: "San Francisco, CA",
      avatar: null,
      manager: "Mike Johnson",
      salary: "$95,000",
      lastLogin: "2024-01-15 08:45",
    },
    {
      id: 3,
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike.johnson@vireagency.com",
      phone: "+1 (555) 345-6789",
      department: "Finance",
      position: "Finance Manager",
      status: "Active",
      hireDate: "2022-03-10",
      location: "Chicago, IL",
      avatar: null,
      manager: "Sarah Wilson",
      salary: "$90,000",
      lastLogin: "2024-01-14 16:20",
    },
    {
      id: 4,
      firstName: "Sarah",
      lastName: "Wilson",
      email: "sarah.wilson@vireagency.com",
      phone: "+1 (555) 456-7890",
      department: "Marketing",
      position: "Marketing Director",
      status: "Active",
      hireDate: "2021-11-20",
      location: "Los Angeles, CA",
      avatar: null,
      manager: "CEO",
      salary: "$110,000",
      lastLogin: "2024-01-15 10:15",
    },
    {
      id: 5,
      firstName: "David",
      lastName: "Brown",
      email: "david.brown@vireagency.com",
      phone: "+1 (555) 567-8901",
      department: "Sales",
      position: "Sales Representative",
      status: "Inactive",
      hireDate: "2023-08-05",
      location: "Austin, TX",
      avatar: null,
      manager: "Sarah Wilson",
      salary: "$65,000",
      lastLogin: "2024-01-10 14:30",
    },
  ]);

  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    location: "",
    manager: "",
    salary: "",
  });

  const handleAddEmployee = async () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const employee = {
        id: employees.length + 1,
        ...newEmployee,
        status: "Active",
        hireDate: new Date().toISOString().split("T")[0],
        avatar: null,
        lastLogin: "Never",
      };

      setEmployees((prev) => [...prev, employee]);
      setNewEmployee({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
        position: "",
        location: "",
        manager: "",
        salary: "",
      });
      setIsAddEmployeeModalOpen(false);
      toast.success("Employee added successfully");
    } catch (error) {
      toast.error("Failed to add employee");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsEditEmployeeModalOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === selectedEmployee.id ? selectedEmployee : emp
        )
      );
      setIsEditEmployeeModalOpen(false);
      setSelectedEmployee(null);
      toast.success("Employee updated successfully");
    } catch (error) {
      toast.error("Failed to update employee");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
      toast.success("Employee deleted successfully");
    } catch (error) {
      toast.error("Failed to delete employee");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (employeeId) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId
            ? {
                ...emp,
                status: emp.status === "Active" ? "Inactive" : "Active",
              }
            : emp
        )
      );
      toast.success("Employee status updated");
    } catch (error) {
      toast.error("Failed to update employee status");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "all" ||
      employee.department === selectedDepartment;
    const matchesStatus =
      selectedStatus === "all" || employee.status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Inactive":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Active: "bg-green-100 text-green-800",
      Inactive: "bg-red-100 text-red-800",
      Pending: "bg-yellow-100 text-yellow-800",
    };

    return (
      <Badge className={variants[status] || variants.Pending}>{status}</Badge>
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
              Employee Management
            </h1>
            <p className="text-gray-600">
              Manage employee information and organizational structure
            </p>
          </div>
          <Button onClick={() => setIsAddEmployeeModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Employees
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter((emp) => emp.status === "Active").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(
                  (employees.filter((emp) => emp.status === "Active").length /
                    employees.length) *
                    100
                )}
                % of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(employees.map((emp) => emp.department)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Across organization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New This Month
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Recent hires</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
            <CardDescription>
              Manage employee information and organizational structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback>
                              {employee.firstName[0]}
                              {employee.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-gray-400" />
                          {employee.department}
                        </div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(employee.status)}
                          <span className="ml-2">
                            {getStatusBadge(employee.status)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {employee.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {employee.lastLogin}
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
                              onClick={() => handleEditEmployee(employee)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(employee.id)}
                            >
                              {employee.status === "Active" ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteEmployee(employee.id)}
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
      </div>

      {/* Add Employee Modal */}
      <Dialog
        open={isAddEmployeeModalOpen}
        onOpenChange={setIsAddEmployeeModalOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter the employee's information to add them to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newEmployee.firstName}
                  onChange={(e) =>
                    setNewEmployee((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newEmployee.lastName}
                  onChange={(e) =>
                    setNewEmployee((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newEmployee.phone}
                  onChange={(e) =>
                    setNewEmployee((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={newEmployee.department}
                  onValueChange={(value) =>
                    setNewEmployee((prev) => ({ ...prev, department: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={newEmployee.position}
                  onChange={(e) =>
                    setNewEmployee((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newEmployee.location}
                  onChange={(e) =>
                    setNewEmployee((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  value={newEmployee.manager}
                  onChange={(e) =>
                    setNewEmployee((prev) => ({
                      ...prev,
                      manager: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                value={newEmployee.salary}
                onChange={(e) =>
                  setNewEmployee((prev) => ({
                    ...prev,
                    salary: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddEmployeeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddEmployee} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Employee"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Modal */}
      <Dialog
        open={isEditEmployeeModalOpen}
        onOpenChange={setIsEditEmployeeModalOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update the employee's information.
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={selectedEmployee.firstName}
                    onChange={(e) =>
                      setSelectedEmployee((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={selectedEmployee.lastName}
                    onChange={(e) =>
                      setSelectedEmployee((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editEmail">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={selectedEmployee.email}
                    onChange={(e) =>
                      setSelectedEmployee((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    value={selectedEmployee.phone}
                    onChange={(e) =>
                      setSelectedEmployee((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editDepartment">Department</Label>
                  <Select
                    value={selectedEmployee.department}
                    onValueChange={(value) =>
                      setSelectedEmployee((prev) => ({
                        ...prev,
                        department: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editPosition">Position</Label>
                  <Input
                    id="editPosition"
                    value={selectedEmployee.position}
                    onChange={(e) =>
                      setSelectedEmployee((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditEmployeeModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateEmployee} disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Employee"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
