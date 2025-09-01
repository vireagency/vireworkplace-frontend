import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Users, Filter } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Mock employee data
const employees = [
  { id: '1', name: 'William Ofosu Parwar', department: 'Engineering', team: 'Frontend', avatar: '/api/placeholder/40/40' },
  { id: '2', name: 'Sarah Mitchell', department: 'Engineering', team: 'Backend', avatar: '/api/placeholder/40/40' },
  { id: '3', name: 'James Rodriguez', department: 'Engineering', team: 'DevOps', avatar: '/api/placeholder/40/40' },
  { id: '4', name: 'Emily Chen', department: 'Design', team: 'UX', avatar: '/api/placeholder/40/40' },
  { id: '5', name: 'Michael Thompson', department: 'Marketing', team: 'Growth', avatar: '/api/placeholder/40/40' },
  { id: '6', name: 'Ava Green', department: 'Marketing', team: 'Content', avatar: '/api/placeholder/40/40' },
  { id: '7', name: 'David Wilson', department: 'Sales', team: 'Enterprise', avatar: '/api/placeholder/40/40' },
  { id: '8', name: 'Lisa Johnson', department: 'HR', team: 'Operations', avatar: '/api/placeholder/40/40' },
];

const departments = ['All Departments', 'Engineering', 'Design', 'Marketing', 'Sales', 'HR'];
const teams = ['All Teams', 'Frontend', 'Backend', 'DevOps', 'UX', 'Growth', 'Content', 'Enterprise', 'Operations'];

export default function EmployeeSelectionStep({ data, onUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedTeam, setSelectedTeam] = useState('All Teams');

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All Departments' || employee.department === selectedDepartment;
    const matchesTeam = selectedTeam === 'All Teams' || employee.team === selectedTeam;
    
    return matchesSearch && matchesDepartment && matchesTeam;
  });

  const handleEmployeeToggle = (employeeId) => {
    const updatedSelected = data.selectedEmployees.includes(employeeId)
      ? data.selectedEmployees.filter(id => id !== employeeId)
      : [...data.selectedEmployees, employeeId];
    
    onUpdate({ selectedEmployees: updatedSelected });
  };

  const handleSelectAll = () => {
    const allIds = filteredEmployees.map(emp => emp.id);
    const allSelected = allIds.every(id => data.selectedEmployees.includes(id));
    
    if (allSelected) {
      // Deselect all filtered employees
      const updatedSelected = data.selectedEmployees.filter(id => !allIds.includes(id));
      onUpdate({ selectedEmployees: updatedSelected });
    } else {
      // Select all filtered employees
      const updatedSelected = [...new Set([...data.selectedEmployees, ...allIds])];
      onUpdate({ selectedEmployees: updatedSelected });
    }
  };

  const allFilteredSelected = filteredEmployees.length > 0 && 
    filteredEmployees.every(emp => data.selectedEmployees.includes(emp.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Select Employees</h2>
        <p className="text-gray-600">
          Choose the employees who will participate in this evaluation. You can search by name, filter by department or team.
        </p>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6 space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, department, or team"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#f7fafc] border-[#cfdbe8]"
              />
            </div>

            {/* Filter Section */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <h4 className="text-sm font-medium text-gray-900">Filter</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="bg-[#f7fafc] border-[#cfdbe8] cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept} className="cursor-pointer">{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Team</label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger className="bg-[#f7fafc] border-[#cfdbe8] cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team} value={team} className="cursor-pointer">{team}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Employee List Header */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Employees</h3>
                <span className="text-sm text-gray-500">
                  ({data.selectedEmployees.length} of {filteredEmployees.length} selected)
                </span>
              </div>
              
              {filteredEmployees.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-sm"
                >
                  {allFilteredSelected ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>

            {/* Employee List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No employees found matching your criteria.</p>
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                      data.selectedEmployees.includes(employee.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-[#f7fafc] hover:bg-gray-50'
                    }`}
                    onClick={() => handleEmployeeToggle(employee.id)}
                  >
                    <Checkbox
                      checked={data.selectedEmployees.includes(employee.id)}
                      onChange={() => handleEmployeeToggle(employee.id)}
                      className="pointer-events-none border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={employee.avatar} alt={employee.name} />
                      <AvatarFallback className="bg-gray-200 text-gray-700 font-medium">
                        {employee.name.split(' ').map(n => n[0]).join('')}
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
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Summary */}
      {data.selectedEmployees.length > 0 && (
        <Card className="border border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-green-800">
                <strong>{data.selectedEmployees.length}</strong> employee{data.selectedEmployees.length !== 1 ? 's' : ''} selected for evaluation
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}