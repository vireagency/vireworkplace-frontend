/**
 * @fileoverview Goal Card Component for Vire Workplace HR App
 * @description Displays individual goal information with progress tracking and status indicators
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// React core library for component creation
import React from "react";

// ============================================================================
// UI COMPONENT IMPORTS
// ============================================================================

// Card components for layout and structure
import { Card, CardContent } from "@/components/ui/card";

// Badge component for status and priority indicators
import { Badge } from "@/components/ui/badge";

// ============================================================================
// ICON IMPORTS
// ============================================================================

// Lucide React icons for visual indicators
import { Users, Clock, Target } from "lucide-react";

/**
 * GoalCard Component
 * @description Displays a single goal with comprehensive information including progress, status, and actions
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.goal - Goal object containing all goal information
 * @param {string} props.goal.title - Goal title
 * @param {string} props.goal.description - Goal description
 * @param {string} props.goal.category - Goal category (Retention, Culture, Inclusion, Skills, Wellness)
 * @param {string} props.goal.priority - Goal priority (High, Medium, Low)
 * @param {string} props.goal.status - Goal status (On Track, Exceeding, Needs Attention, At Risk)
 * @param {number} props.goal.progress - Goal progress percentage (0-100)
 * @param {string} props.goal.deadline - Goal deadline date
 * @param {string} props.goal.owner - Goal owner/assignee
 * @param {string|number} props.goal.currentValue - Current progress value
 * @param {string|number} props.goal.targetValue - Target goal value
 * @returns {JSX.Element} The goal card component
 * 
 * Features:
 * - Visual priority and status indicators with color coding
 * - Progress bar with percentage display
 * - Category-specific icons
 * - Responsive grid layout for goal details
 * - Action buttons for editing and deleting goals
 * - Hover effects and smooth transitions
 */
const GoalCard = ({ goal }) => {
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Get CSS classes for priority-based styling
   * @description Returns appropriate color classes based on goal priority
   * @param {string} priority - Goal priority level
   * @returns {string} CSS classes for priority styling
   * 
   * Priority Colors:
   * - High: Red background and text
   * - Medium: Yellow background and text
   * - Low: Green background and text
   * - Default: Gray background and text
   */
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-700";           // High priority - red theme
      case "Medium": return "bg-yellow-100 text-yellow-700";   // Medium priority - yellow theme
      case "Low": return "bg-green-100 text-green-700";        // Low priority - green theme
      default: return "bg-gray-100 text-gray-700";             // Default - gray theme
    }
  };

  /**
   * Get CSS classes for status-based styling
   * @description Returns appropriate color classes based on goal status
   * @param {string} status - Goal status
   * @returns {string} CSS classes for status styling
   * 
   * Status Colors:
   * - On Track: Blue background and text
   * - Exceeding: Green background and text
   * - Needs Attention: Orange background and text
   * - At Risk: Red background and text
   * - Default: Gray background and text
   */
  const getStatusColor = (status) => {
    switch (status) {
      case "On Track": return "bg-blue-100 text-blue-700";           // On track - blue theme
      case "Exceeding": return "bg-green-100 text-green-700";        // Exceeding - green theme
      case "Needs Attention": return "bg-orange-100 text-orange-700"; // Needs attention - orange theme
      case "At Risk": return "bg-red-100 text-red-700";              // At risk - red theme
      default: return "bg-gray-100 text-gray-700";                   // Default - gray theme
    }
  };

  /**
   * Get appropriate icon component based on goal category
   * @description Returns category-specific icon with appropriate styling
   * @param {string} category - Goal category
   * @returns {JSX.Element} Icon component with category-specific styling
   * 
   * Category Icons:
   * - Retention: Blue Users icon
   * - Culture: Green Users icon
   * - Inclusion: Purple Target icon
   * - Skills: Orange Users icon
   * - Wellness: Teal Users icon
   * - Default: Gray Users icon
   */
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Retention": return <Users className="w-5 h-5 text-blue-600" />;    // Retention - blue users icon
      case "Culture": return <Users className="w-5 h-5 text-green-600" />;     // Culture - green users icon
      case "Inclusion": return <Target className="w-5 h-5 text-purple-600" />;  // Inclusion - purple target icon
      case "Skills": return <Users className="w-5 h-5 text-orange-600" />;      // Skills - orange users icon
      case "Wellness": return <Users className="w-5 h-5 text-teal-600" />;      // Wellness - teal users icon
      default: return <Users className="w-5 h-5 text-gray-600" />;              // Default - gray users icon
    }
  };

  return (
    // ============================================================================
    // GOAL CARD CONTAINER
    // ============================================================================
    
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-6">
        
        {/* ========================================================================
             GOAL HEADER SECTION
             ========================================================================
             
             Contains goal title, description, category icon, and status badges
             ======================================================================== */}
        
        <div className="flex items-start justify-between mb-4">
          {/* Left side: Category icon, title, and description */}
          <div className="flex items-start gap-3">
            {/* Category icon container */}
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {getCategoryIcon(goal.category)}
            </div>
            
            {/* Goal text content */}
            <div className="flex-1">
              {/* Goal title */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{goal.title}</h3>
              {/* Goal description */}
              <p className="text-slate-600 text-sm leading-relaxed">{goal.description}</p>
            </div>
          </div>
          
          {/* Right side: Priority and status badges */}
          <div className="flex flex-col gap-2 ml-4">
            {/* Priority badge */}
            <Badge variant="secondary" className={`${getPriorityColor(goal.priority)} text-xs px-3 py-1`}>
              {goal.priority} Priority
            </Badge>
            {/* Status badge */}
            <Badge variant="secondary" className={`${getStatusColor(goal.status)} text-xs px-3 py-1`}>
              {goal.status}
            </Badge>
          </div>
        </div>

        {/* ========================================================================
             PROGRESS BAR SECTION
             ========================================================================
             
             Visual representation of goal completion progress
             ======================================================================== */}
        
        <div className="mb-4">
          {/* Progress header with percentage */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-sm font-semibold text-slate-900">{goal.progress}%</span>
          </div>
          
          {/* Progress bar container */}
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            {/* Progress bar fill with dynamic width */}
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>

        {/* ========================================================================
             GOAL DETAILS SECTION
             ========================================================================
             
             Grid layout displaying deadline, owner, and target information
             ======================================================================== */}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Deadline information */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">
              Deadline: <span className="font-medium text-slate-900">{goal.deadline}</span>
            </span>
          </div>
          
          {/* Owner information */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">
              Owner: <span className="font-medium text-slate-900">{goal.owner}</span>
            </span>
          </div>
          
          {/* Target value information */}
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">
              {goal.currentValue} (Target: {goal.targetValue})
            </span>
          </div>
        </div>

        {/* ========================================================================
             ACTION BUTTONS SECTION
             ========================================================================
             
             Edit and delete actions for goal management
             ======================================================================== */}
        
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
          {/* Edit goal button */}
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
            Edit
          </button>
          {/* Delete goal button */}
          <button className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer">
            Delete
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

// Export the GoalCard component as default export
export default GoalCard;
