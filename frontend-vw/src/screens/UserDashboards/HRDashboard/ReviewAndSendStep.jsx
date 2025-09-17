import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormPreview from './FormPreview';
import { toast } from 'sonner';
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
  Settings
} from 'lucide-react';

// Mock employee data
const employees = [
  { id: '1', name: 'William Ofosu Parwar', department: 'Engineering', team: 'Frontend', email: 'william@company.com', avatar: '/api/placeholder/32/32' },
  { id: '2', name: 'Sarah Mitchell', department: 'Engineering', team: 'Backend', email: 'sarah@company.com', avatar: '/api/placeholder/32/32' },
  { id: '3', name: 'James Rodriguez', department: 'Engineering', team: 'DevOps', email: 'james@company.com', avatar: '/api/placeholder/32/32' },
  { id: '4', name: 'Emily Chen', department: 'Design', team: 'UX', email: 'emily@company.com', avatar: '/api/placeholder/32/32' },
  { id: '5', name: 'Michael Thompson', department: 'Marketing', team: 'Growth', email: 'michael@company.com', avatar: '/api/placeholder/32/32' },
  { id: '6', name: 'Ava Green', department: 'Marketing', team: 'Content', email: 'ava@company.com', avatar: '/api/placeholder/32/32' },
  { id: '7', name: 'David Wilson', department: 'Sales', team: 'Enterprise', email: 'david@company.com', avatar: '/api/placeholder/32/32' },
  { id: '8', name: 'Lisa Johnson', department: 'HR', team: 'Operations', email: 'lisa@company.com', avatar: '/api/placeholder/32/32' },
];

const evaluationTypes = {
  'annual': 'Annual',
  'quarterly': 'Quarterly',
  'probationary': 'Probationary',
  'project-based': 'Project-based'
};

const evaluationPeriods = {
  'q1-2024': 'Q1 2024 (Jan - Mar)',
  'q2-2024': 'Q2 2024 (Apr - Jun)',
  'q3-2024': 'Q3 2024 (Jul - Sep)',
  'q4-2024': 'Q4 2024 (Oct - Dec)',
  'h1-2024': 'H1 2024 (Jan - Jun)',
  'h2-2024': 'H2 2024 (Jul - Dec)',
  'fy-2024': 'FY 2024 (Full Year)',
  'custom': 'Custom Period'
};

export default function ReviewAndSendStep({ data, onUpdate }) {
  const [dueDate, setDueDate] = useState('');
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    frequency: '3-days'
  });
  const [customMessage, setCustomMessage] = useState('');
  const [sendCopy, setSendCopy] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const selectedEmployeeDetails = employees.filter(emp => 
    data.selectedEmployees.includes(emp.id)
  );

  const totalQuestions = data.sections.reduce((acc, section) => 
    acc + (section.questions?.length || 0), 0
  );

  const estimatedTime = Math.ceil(totalQuestions * 1.5); // 1.5 minutes per question

  return (
    <div className="space-y-6" style={{'--card': 'oklch(1 0 0)', '--card-foreground': 'oklch(0.145 0 0)'}}>
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Review & Send Evaluation</h2>
        <p className="text-gray-600">
          Review all the details and configure delivery settings before sending the evaluation to employees.
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
                <span className="text-sm font-medium">{data.formName || 'Untitled Form'}</span>
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
                <span className="text-sm font-medium">{data.sections.length}</span>
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
                      e.target.style.display = 'none';
                    }}
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-700 font-medium text-sm">
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
            ))}
          </div>
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
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Select value={dueDate} onValueChange={setDueDate}>
                <SelectTrigger className="max-w-xs bg-white text-gray-900 border-gray-300 cursor-pointer">
                  <SelectValue placeholder="Select due date" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-900 border border-gray-200 shadow-lg">
                  <SelectItem value="1-week" className="hover:bg-green-500 hover:text-white focus:bg-green-500 focus:text-white cursor-pointer">1 Week from now</SelectItem>
                  <SelectItem value="2-weeks" className="hover:bg-green-500 hover:text-white focus:bg-green-500 focus:text-white cursor-pointer">2 Weeks from now</SelectItem>
                  <SelectItem value="1-month" className="hover:bg-green-500 hover:text-white focus:bg-green-500 focus:text-white cursor-pointer">1 Month from now</SelectItem>
                  <SelectItem value="custom" className="hover:bg-green-500 hover:text-white focus:bg-green-500 focus:text-white cursor-pointer">Custom date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reminder Settings */}
          <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                <Checkbox
                  checked={reminderSettings.enabled}
                  onCheckedChange={(checked) => 
                    setReminderSettings(prev => ({ ...prev, enabled: !!checked }))
                  }
                  className="cursor-pointer border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <label className="text-sm font-medium text-gray-900 cursor-pointer">
                  Send reminder notifications
                </label>
              </div>
            
            {reminderSettings.enabled && (
              <div className="ml-6 space-y-2">
                <label className="text-sm text-gray-600">Reminder frequency</label>
                <Select 
                  value={reminderSettings.frequency}
                  onValueChange={(value) => 
                    setReminderSettings(prev => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger className="max-w-xs bg-white text-gray-900 border-gray-300 cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900 border border-gray-200 shadow-lg">
                    <SelectItem value="1-day" className="hover:bg-green-500 hover:text-white focus:bg-green-500 focus:text-white cursor-pointer">Daily until completed</SelectItem>
                    <SelectItem value="3-days" className="hover:bg-green-500 hover:text-white focus:bg-green-500 focus:text-white cursor-pointer">Every 3 days</SelectItem>
                    <SelectItem value="1-week" className="hover:bg-green-500 hover:text-white focus:bg-green-500 focus:text-white cursor-pointer">Weekly</SelectItem>
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
                toast.info('Opening form preview - see how employees will experience this evaluation');
              }}
              className="flex items-center space-x-2 border border-gray-300 text-gray-700 hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors duration-200 bg-white"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Form</span>
            </Button>

            <div className="flex items-center space-x-3">
              <Button
                className="flex items-center space-x-2 border border-gray-300 text-gray-700 hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors duration-200 bg-white"
              >
                <span>Save as Draft</span>
              </Button>
              <Button
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white"
                disabled={!dueDate}
              >
                <Send className="w-4 h-4" />
                <span>Send Evaluation</span>
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
              <h4 className="text-sm font-medium text-blue-900">Before You Send</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Employees will receive an email invitation with evaluation instructions</li>
                <li>• They will have until the due date to complete their evaluation</li>
                <li>• You'll receive notifications as evaluations are completed</li>
                <li>• You can track progress and send reminders from the dashboard</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Preview Modal */}
      {showPreview && (
        <FormPreview
          data={data}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}