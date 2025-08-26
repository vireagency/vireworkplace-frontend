import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Target } from "lucide-react";

const GoalCard = ({ goal }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-700";
      case "Medium": return "bg-yellow-100 text-yellow-700";
      case "Low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "On Track": return "bg-blue-100 text-blue-700";
      case "Exceeding": return "bg-green-100 text-green-700";
      case "Needs Attention": return "bg-orange-100 text-orange-700";
      case "At Risk": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Retention": return <Users className="w-5 h-5 text-blue-600" />;
      case "Culture": return <Users className="w-5 h-5 text-green-600" />;
      case "Inclusion": return <Target className="w-5 h-5 text-purple-600" />;
      case "Skills": return <Users className="w-5 h-5 text-orange-600" />;
      case "Wellness": return <Users className="w-5 h-5 text-teal-600" />;
      default: return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-6">
        {/* Goal Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {getCategoryIcon(goal.category)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{goal.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{goal.description}</p>
            </div>
          </div>
          {/* Status Tags */}
          <div className="flex flex-col gap-2 ml-4">
            <Badge variant="secondary" className={`${getPriorityColor(goal.priority)} text-xs px-3 py-1`}>
              {goal.priority} Priority
            </Badge>
            <Badge variant="secondary" className={`${getStatusColor(goal.status)} text-xs px-3 py-1`}>
              {goal.status}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-sm font-semibold text-slate-900">{goal.progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${goal.progress}%` }}></div>
          </div>
        </div>

        {/* Goal Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">Deadline: <span className="font-medium text-slate-900">{goal.deadline}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">Owner: <span className="font-medium text-slate-900">{goal.owner}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">{goal.currentValue} (Target: {goal.targetValue})</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Edit</button>
          <button className="text-sm text-red-600 hover:text-red-700 font-medium">Delete</button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;
