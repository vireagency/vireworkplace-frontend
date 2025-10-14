import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import {
  Star,
  FileText,
  Clock,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";

const evaluationTypes = {
  annual: "Annual",
  quarterly: "Quarterly",
  probationary: "Probationary",
  "project-based": "Project-based",
};

// Get current year dynamically
const currentYear = new Date().getFullYear();

const evaluationPeriods = {
  [`q1-${currentYear}`]: `Q1 ${currentYear} (Jan - Mar)`,
  [`q2-${currentYear}`]: `Q2 ${currentYear} (Apr - Jun)`,
  [`q3-${currentYear}`]: `Q3 ${currentYear} (Jul - Sep)`,
  [`q4-${currentYear}`]: `Q4 ${currentYear} (Oct - Dec)`,
  [`h1-${currentYear}`]: `H1 ${currentYear} (Jan - Jun)`,
  [`h2-${currentYear}`]: `H2 ${currentYear} (Jul - Dec)`,
  [`fy-${currentYear}`]: `FY ${currentYear} (Full Year)`,
  custom: "Custom Period",
};

export default function FormPreview({ data, onClose }) {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});

  const sections = data.sections || [];
  const totalSections = sections.length;
  const progress =
    totalSections > 0 ? ((currentSection + 1) / totalSections) * 100 : 0;

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const nextSection = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const renderRatingScale = (questionId) => {
    const ratings = [
      { value: "1", label: "Poor" },
      { value: "2", label: "Below Average" },
      { value: "3", label: "Average" },
      { value: "4", label: "Good" },
      { value: "5", label: "Excellent" },
    ];

    return (
      <RadioGroup
        value={responses[questionId] || ""}
        onValueChange={(value) => handleResponseChange(questionId, value)}
        className="flex flex-wrap gap-2 sm:gap-4"
      >
        {ratings.map((rating) => (
          <div
            key={rating.value}
            className="flex flex-col items-center space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={rating.value}
                id={`${questionId}-${rating.value}`}
              />
              <Label
                htmlFor={`${questionId}-${rating.value}`}
                className="cursor-pointer"
              >
                {rating.value}
              </Label>
            </div>
            <span className="text-xs text-gray-600 text-center">
              {rating.label}
            </span>
          </div>
        ))}
      </RadioGroup>
    );
  };

  const renderStarRating = (questionId) => {
    const selectedRating = parseInt(responses[questionId] || "0");

    return (
      <div className="flex items-center space-x-1 flex-wrap">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleResponseChange(questionId, star.toString())}
            className={`p-1 transition-colors ${
              star <= selectedRating
                ? "text-yellow-400"
                : "text-gray-300 hover:text-yellow-200"
            }`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {selectedRating > 0 ? `${selectedRating}/5` : "Not rated"}
        </span>
      </div>
    );
  };

  const renderQuestion = (question) => {
    return (
      <div key={question.id} className="space-y-3">
        <div className="flex items-start space-x-2">
          <Label className="text-base">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>

        <div className="mt-3">
          {question.type === "rating" && (
            <div className="space-y-4">
              {renderRatingScale(question.id)}
              <div className="pt-2">{renderStarRating(question.id)}</div>
            </div>
          )}

          {question.type === "text" && (
            <Textarea
              value={responses[question.id] || ""}
              onChange={(e) =>
                handleResponseChange(question.id, e.target.value)
              }
              placeholder="Please provide your response..."
              className="min-h-[100px] resize-none"
            />
          )}

          {question.type === "choice" && question.options && (
            <RadioGroup
              value={responses[question.id] || ""}
              onValueChange={(value) =>
                handleResponseChange(question.id, value)
              }
              className="space-y-2"
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`${question.id}-${index}`}
                  />
                  <Label
                    htmlFor={`${question.id}-${index}`}
                    className="cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      </div>
    );
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Content Available
            </h3>
            <p className="text-gray-600 mb-4">
              There are no sections configured for this evaluation form.
            </p>
            <Button onClick={onClose} variant="outline">
              Close Preview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSectionData = sections[currentSection];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6 pt-8 sm:pt-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {data.formName || "Evaluation Form"}
                </h2>
                <p className="text-sm text-gray-600">
                  {evaluationTypes[data.type]} •{" "}
                  {evaluationPeriods[data.period]}
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-gray-500">
              ✕
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Section {currentSection + 1} of {totalSections}
              </span>
              <span className="text-gray-600">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <Card className="border border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg">
                  {currentSectionData.title}
                </CardTitle>
                {currentSectionData.required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              {currentSectionData.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {currentSectionData.description}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {currentSectionData.questions &&
              currentSectionData.questions.length > 0 ? (
                currentSectionData.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Question {index + 1}
                      </span>
                    </div>
                    {renderQuestion(question)}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No questions configured for this section.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={prevSection}
              disabled={currentSection === 0}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-sm text-gray-500">
                Preview Mode - Changes are not saved
              </div>
              <Button
                onClick={onClose}
                variant="outline"
                className="cursor-pointer"
              >
                Close Preview
              </Button>
            </div>

            {currentSection < totalSections - 1 ? (
              <Button
                onClick={nextSection}
                className="flex items-center space-x-2 bg-[#04b435] hover:bg-[#04b435]/90 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                className="flex items-center space-x-2 bg-[#04b435] hover:bg-[#04b435]/90 cursor-pointer"
                disabled
              >
                <Send className="w-4 h-4" />
                <span>Submit (Preview)</span>
              </Button>
            )}
          </div>
        </div>

        {/* Employee Info Banner */}
        <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white p-2 text-center text-sm">
          <div className="flex items-center justify-center space-x-4">
            <span>📝 PREVIEW MODE</span>
            <span>•</span>
            <span>
              Viewing as: {user?.firstName} {user?.lastName} (
              {user?.department || user?.jobRole || "Employee"})
            </span>
            <span>•</span>
            <span>Due: Dec 15, 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
}
