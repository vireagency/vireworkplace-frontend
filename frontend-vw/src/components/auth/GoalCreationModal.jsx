import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarDays, Target, Users, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { goalsApi } from "@/services/goalsApi";
import { toast } from "sonner";

export function GoalCreationModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  isEditing = false 
}) {
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: initialData || {
      goalType: "Company",
      title: "",
      description: "",
      priority: "Medium",
      deadline: "",
      owner: "Human Resources",
      category: "Employee Engagement",
      currentMetric: "",
      targetMetric: "",
      team: "",
      successCriteria: "",
      startDate: new Date().toISOString().split('T')[0],
      keyMetrics: [{ metric: 'General Performance', target: 'To be defined' }]
    },
    mode: "onChange"
  });

  const selectedPriority = watch("priority");
  const selectedCategory = watch("category");
  const selectedGoalType = watch("goalType");

  // Pre-fill form when initialData changes (for editing)
  useEffect(() => {
    console.log("useEffect triggered - isEditing:", isEditing, "initialData:", initialData);
    if (initialData && isEditing) {
      console.log("Pre-filling form with initial data:", initialData);
      console.log("Available fields in initialData:", Object.keys(initialData));
      console.log("title field:", initialData.title);
      console.log("goalTitle field:", initialData.goalTitle);
      console.log("description field:", initialData.description);
      console.log("goalDescription field:", initialData.goalDescription);
      
      // Map API data to form fields - try both transformed and original field names
      const formData = {
        goalType: initialData.goalType || "Company",
        title: initialData.title || initialData.goalTitle || "",
        description: initialData.description || initialData.goalDescription || "",
        priority: initialData.priority || "Medium",
        deadline: initialData.deadline || (initialData.targetDeadline ? new Date(initialData.targetDeadline).toISOString().split('T')[0] : ""),
        owner: initialData.owner || initialData.goalOwner || "Human Resources",
        category: initialData.category || "Employee Engagement",
        currentMetric: initialData.currentMetric || "",
        targetMetric: initialData.targetMetric || "",
        successCriteria: initialData.successCriteria || "",
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        keyMetrics: initialData.keyMetrics || [{ metric: 'General Performance', target: 'To be defined' }]
      };

      console.log("Mapped form data for editing:", formData);

      // Reset form with new data
      reset(formData);
      console.log("Form reset with data:", formData);
    } else if (!isEditing) {
      // Reset to default values when creating new goal
      reset({
        goalType: "Company",
        title: "",
        description: "",
        priority: "Medium",
        deadline: "",
        owner: "Human Resources",
        category: "Employee Engagement",
        currentMetric: "",
        targetMetric: "",
        team: "",
        successCriteria: "",
        startDate: new Date().toISOString().split('T')[0],
        keyMetrics: [{ metric: 'General Performance', target: 'To be defined' }]
      });
    }
  }, [initialData, isEditing, reset]);

  const companyCategories = [
    { value: "Employee Retention", label: "Employee Retention", icon: Users },
    { value: "Employee Engagement", label: "Employee Engagement", icon: Target },
    { value: "Diversity and Inclusion", label: "Diversity and Inclusion", icon: Users },
    { value: "Learning and Development", label: "Learning and Development", icon: Calendar },
    { value: "Performance Management", label: "Performance Management", icon: Target },
    { value: "Safety and Well-being", label: "Safety and Well-being", icon: AlertCircle }
  ];

  const teamCategories = [
    { value: "Performance", label: "Team Performance", icon: Target },
    { value: "Development", label: "Skill Development", icon: Calendar },
    { value: "Process Improvement", label: "Process Improvement", icon: Target },
    { value: "Strategic", label: "Strategic Initiative", icon: Users },
    { value: "Engagement", label: "Team Engagement", icon: AlertCircle }
  ];

  const vireWorkplaceTeams = [
    { value: "Human Resources", label: "Human Resources (HR)", icon: Users },
    { value: "Social Media", label: "Social Media", icon: Target },
    { value: "Customer Support", label: "Customer Support", icon: Users },
    { value: "Engineering", label: "Engineering", icon: Target },
    { value: "Design Team", label: "Design Team", icon: Target }
  ];

  const categories = selectedGoalType === "Company" ? companyCategories : teamCategories;

  const ownerOptions = [
    "Human Resources",
    "Engineering", 
    "Design",
    "Social Media",
    "Customer Support",
    "Production"
  ];

  const assigneeOptions = [
    "HR Team Lead",
    "HR Analytics Specialist",
    "Social Media Manager",
    "Content Coordinator",
    "Support Team Lead",
    "Support Team",
    "Engineering Lead",
    "Technical Writer",
    "Design Lead",
    "Design Team",
    "Team Lead",
    "Project Manager",
    "Team Wide",
    "Department Head",
    "Individual Contributor"
  ];

  const onFormSubmit = async (data) => {
    if (!accessToken) {
      toast.error("Authentication required. Please log in again.");
      return;
    }

    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form data being sent:', data);
    console.log('Form data keys:', Object.keys(data));
    console.log('Form data values:', Object.values(data));
    console.log('Form data currentMetric:', data.currentMetric);
    console.log('Form data targetMetric:', data.targetMetric);
    console.log('Current metric type:', typeof data.currentMetric);
    console.log('Target metric type:', typeof data.targetMetric);
    console.log('Current metric length:', data.currentMetric?.length);
    console.log('Target metric length:', data.targetMetric?.length);
    console.log('Access token:', accessToken ? 'Present' : 'Missing');
    console.log('Token length:', accessToken?.length);
    console.log('Form validation errors:', errors);

    // Check if required fields are present
    const requiredFields = ['title', 'description', 'owner', 'category', 'deadline', 'currentMetric', 'targetMetric'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    console.log('All required fields present:', requiredFields.every(field => data[field]));

    setIsLoading(true);
    
    try {
      let result;
      
      if (isEditing && initialData?.id) {
        // Update existing goal
        console.log('Updating goal with ID:', initialData.id);
        console.log('Data being sent for update:', data);
        console.log('Form data validation for update:', {
          title: !!data.title,
          description: !!data.description,
          owner: !!data.owner,
          currentMetric: !!data.currentMetric,
          targetMetric: !!data.targetMetric,
          goalType: !!data.goalType,
          category: !!data.category,
          priority: !!data.priority,
          successCriteria: !!data.successCriteria
        });
        result = await goalsApi.updateGoal(initialData.id, data, accessToken);
      } else {
        // Create new goal
        result = await goalsApi.createGoal(data, accessToken);
      }

      if (result.success) {
        toast.success(isEditing ? "Goal updated successfully!" : "Goal created successfully!");
        onSubmit(result.data); // Pass the API response data
        reset();
        onClose();
      } else {
        toast.error(result.error || "Failed to save goal");
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
                      <DialogTitle className="text-[20px] font-bold text-[#0d141c] flex items-center gap-2">
              <Target className="size-5 text-[#00db12]" />
              {isEditing ? "Edit" : "Create New"} Goal
            </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 pt-4">
          {/* Goal Type Selection */}
          <div>
            <Label className="text-[14px] font-medium text-[#0d141c] mb-2 block">
              Goal Type *
            </Label>
            <Select
              value={selectedGoalType}
              onValueChange={(value) => setValue("goalType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select goal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Company">
                  <div className="flex items-center gap-2">
                    <Target className="size-4" />
                    Company Goal
                  </div>
                </SelectItem>
                <SelectItem value="Team">
                  <div className="flex items-center gap-2">
                    <Users className="size-4" />
                    Team Goal
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-[14px] font-medium text-[#0d141c] mb-2 block">
              Goal Title *
            </Label>
            <Input
              id="title"
              {...register("title", { required: "Goal title is required" })}
              placeholder="Enter a clear, specific goal title"
              className="w-full"
            />
            {errors.title && (
              <p className="text-red-500 text-[12px] mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-[14px] font-medium text-[#0d141c] mb-2 block">
              Description *
            </Label>
            <Textarea
              id="description"
              {...register("description", { required: "Description is required" })}
              placeholder="Provide a detailed description of what this goal aims to achieve, including specific outcomes and benefits"
              rows={4}
              className="w-full resize-none"
            />
            {errors.description && (
              <p className="text-red-500 text-[12px] mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Priority and Category Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[14px] font-medium text-[#0d141c] mb-2 block">
                Priority Level *
              </Label>
              <Select
                value={selectedPriority}
                onValueChange={(value) => setValue("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      High Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="Medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      Medium Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="Low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Low Priority
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[14px] font-medium text-[#0d141c] mb-2 block">
                Category *
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue("category", value, { shouldValidate: true })}
                {...register("category", { required: "Category is required" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="size-4" />
                          {category.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-500 text-[12px] mt-1">Category is required</p>
              )}
            </div>
          </div>

          {/* Owner and Deadline Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[14px] font-medium text-[#0d141c] mb-2 block">
                Goal Owner *
              </Label>
              <Select
                value={watch("owner")}
                onValueChange={(value) => setValue("owner", value, { shouldValidate: true })}
                {...register("owner", { required: "Owner is required" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {ownerOptions.map((owner) => (
                    <SelectItem key={owner} value={owner}>
                      <div className="flex items-center gap-2">
                        <Users className="size-4" />
                        {owner}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.owner && (
                <p className="text-red-500 text-[12px] mt-1">Owner is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="deadline" className="text-[14px] font-medium text-[#0d141c] mb-2 block">
                Target Deadline *
              </Label>
              <div className="relative">
                <Input
                  id="deadline"
                  type="date"
                  {...register("deadline", { required: "Deadline is required" })}
                  className="w-full pl-10"
                />
                <CalendarDays className="size-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              {errors.deadline && (
                <p className="text-red-500 text-[12px] mt-1">{errors.deadline.message}</p>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <div>
            <p className="text-[12px] text-slate-600 mb-3">
              Enter current and target values. They will be combined as "Current → Target" in the goal card.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentMetric" className="text-[14px] font-medium text-[#0d141c] mb-2 block">
                Current Metric *
              </Label>
              <Input
                id="currentMetric"
                {...register("currentMetric", { required: "Current metric is required" })}
                placeholder="e.g., 18% or High turnover rate"
                className="w-full"
              />
              {errors.currentMetric && (
                <p className="text-red-500 text-[12px] mt-1">{errors.currentMetric.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="targetMetric" className="text-[14px] font-medium text-[#0d141c] mb-2 block">
                Target Metric *
              </Label>
              <Input
                id="targetMetric"
                {...register("targetMetric", { required: "Target metric is required" })}
                placeholder="e.g., 12% or Low turnover rate"
                className="w-full"
              />
              {errors.targetMetric && (
                <p className="text-red-500 text-[12px] mt-1">{errors.targetMetric.message}</p>
              )}
            </div>
          </div>
          </div>

          {/* Success Criteria */}
          <div>
            <Label htmlFor="successCriteria" className="text-[14px] font-medium text-[#0d141c] mb-2 block">
              Success Criteria *
            </Label>
            <Textarea
              id="successCriteria"
              {...register("successCriteria", { required: "Success criteria is required" })}
              placeholder="Define what success looks like for this goal..."
              className="w-full min-h-[80px]"
            />
            {errors.successCriteria && (
              <p className="text-red-500 text-[12px] mt-1">{errors.successCriteria.message}</p>
            )}
          </div>


          {/* Start Date */}
          <div>
            <Label htmlFor="startDate" className="text-[14px] font-medium text-[#0d141c] mb-2 block">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="px-6 bg-[#00db12] hover:bg-[#00c010] text-white disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditing ? "Update Goal" : "Create Goal"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}