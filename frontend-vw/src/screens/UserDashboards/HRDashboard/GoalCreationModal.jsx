import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarDays, Target, Users, AlertCircle } from "lucide-react";

export function GoalCreationModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  type, 
  initialData,
  isEditing = false 
}) {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: initialData || {
      title: "",
      description: "",
      priority: "Medium Priority",
      deadline: "",
      owner: "",
      category: "",
      metrics: ""
    }
  });

  const selectedPriority = watch("priority");
  const selectedCategory = watch("category");

  const companyCategories = [
    { value: "Retention", label: "Employee Retention", icon: Users },
    { value: "Engagement", label: "Employee Engagement", icon: Target },
    { value: "Diversity", label: "Diversity & Inclusion", icon: Users },
    { value: "Development", label: "Learning & Development", icon: Calendar },
    { value: "Wellness", label: "Safety & Wellness", icon: AlertCircle }
  ];

  const teamCategories = [
    { value: "Performance", label: "Team Performance", icon: Target },
    { value: "Development", label: "Skill Development", icon: Calendar },
    { value: "Process Improvement", label: "Process Improvement", icon: Target },
    { value: "Strategic", label: "Strategic Initiative", icon: Users },
    { value: "Engagement", label: "Team Engagement", icon: AlertCircle }
  ];

  const categories = type === "company" ? companyCategories : teamCategories;

  const ownerOptions = type === "company" 
    ? [
        "HR Leadership Team",
        "People & Culture Team", 
        "D&I Committee",
        "Learning & Development",
        "Safety & Wellness Team",
        "Executive Team"
      ]
    : [
        "Team Lead",
        "Project Manager",
        "Team Wide",
        "Department Head",
        "Individual Contributor"
      ];

  const onFormSubmit = (data) => {
    onSubmit(data);
    reset();
    onClose();
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
            {isEditing ? "Edit" : "Create New"} {type === "company" ? "Company" : "Team"} Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 pt-4">
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
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High Priority" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      High Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="Medium Priority" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      Medium Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="Low Priority" className="cursor-pointer">
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
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <SelectItem key={category.value} value={category.value} className="cursor-pointer">
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
                onValueChange={(value) => setValue("owner", value)}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {ownerOptions.map((owner) => (
                    <SelectItem key={owner} value={owner} className="cursor-pointer">
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
            <Label htmlFor="metrics" className="text-[14px] font-medium text-[#0d141c] mb-2 block">
              Key Metrics & Success Criteria *
            </Label>
            <Input
              id="metrics"
              {...register("metrics", { required: "Metrics are required" })}
              placeholder="e.g., Reduce turnover from 18% to 12%, Increase engagement score to 4.0"
              className="w-full"
            />
            {errors.metrics && (
              <p className="text-red-500 text-[12px] mt-1">{errors.metrics.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="px-6 cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="px-6 bg-[#00db12] hover:bg-[#00c010] text-white cursor-pointer"
            >
              {isEditing ? "Update Goal" : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
