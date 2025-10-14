import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock } from "lucide-react";

const evaluationTypes = [
  {
    id: "annual",
    title: "Annual",
    description: "Yearly performance review",
  },
  {
    id: "quarterly",
    title: "Quarterly",
    description: "Quarterly performance check-in",
  },
  {
    id: "probationary",
    title: "Probationary",
    description: "New hire performance review",
  },
  {
    id: "project-based",
    title: "Project-based",
    description: "Project-specific performance review",
  },
];

// Get current year dynamically
const currentYear = new Date().getFullYear();

const evaluationPeriods = [
  { value: `q1-${currentYear}`, label: `Q1 ${currentYear} (Jan - Mar)` },
  { value: `q2-${currentYear}`, label: `Q2 ${currentYear} (Apr - Jun)` },
  { value: `q3-${currentYear}`, label: `Q3 ${currentYear} (Jul - Sep)` },
  { value: `q4-${currentYear}`, label: `Q4 ${currentYear} (Oct - Dec)` },
  { value: `h1-${currentYear}`, label: `H1 ${currentYear} (Jan - Jun)` },
  { value: `h2-${currentYear}`, label: `H2 ${currentYear} (Jul - Dec)` },
  { value: `fy-${currentYear}`, label: `FY ${currentYear} (Full Year)` },
  { value: "custom", label: "Custom Period" },
];

export default function EvaluationTypeStep({ data, onUpdate }) {
  const handleTypeChange = useCallback(
    (value) => {
      console.log("Type change triggered:", value);
      onUpdate({ type: value });
    },
    [onUpdate]
  );

  const handlePeriodChange = useCallback(
    (value) => {
      onUpdate({ period: value });
    },
    [onUpdate]
  );

  return (
    <div
      className="space-y-8"
      style={{
        "--card": "oklch(1 0 0)",
        "--card-foreground": "oklch(0.145 0 0)",
      }}
    >
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">New Evaluation</h2>
        <p className="text-gray-600">
          Set up the basic parameters for your evaluation form. Choose the type
          and time period that best fits your needs.
        </p>
      </div>

      <Card className="border border-gray-200 shadow-sm bg-white text-gray-900">
        <CardContent className="p-6 space-y-8">
          {/* Evaluation Type Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Evaluation Type
              </h3>
              <p className="text-sm text-gray-600">
                Select the type of evaluation you want to create.
              </p>
            </div>

            <RadioGroup
              value={data.type}
              onValueChange={handleTypeChange}
              className="space-y-3"
            >
              {evaluationTypes.map((type) => (
                <div
                  key={type.id}
                  className={`flex items-center space-x-4 rounded-lg border p-4 transition-colors cursor-pointer ${
                    data.type === type.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    console.log("Direct click on type:", type.id);
                    handleTypeChange(type.id);
                  }}
                >
                  <RadioGroupItem
                    value={type.id}
                    id={type.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("RadioGroupItem click:", type.id);
                    }}
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={type.id}
                      className="text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      {type.title}
                    </Label>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Evaluation Period Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Evaluation Period
              </h3>
              <p className="text-sm text-gray-600">
                Choose the time period this evaluation will cover.
              </p>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="period-select"
                className="text-sm font-medium text-gray-900"
              >
                Select Period
              </Label>
              <Select value={data.period} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-full max-w-md bg-white text-gray-900 border-gray-300 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <SelectValue placeholder="Select evaluation period" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-900 border border-gray-200 shadow-lg">
                  {evaluationPeriods.map((period) => (
                    <SelectItem
                      key={period.value}
                      value={period.value}
                      className="hover:bg-green-500 focus:bg-green-500 cursor-pointer"
                    >
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Information */}
          {data.type && data.period && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-blue-900">
                    Evaluation Configuration
                  </h4>
                  <p className="text-sm text-blue-700">
                    You've selected a{" "}
                    <strong>
                      {evaluationTypes.find((t) => t.id === data.type)?.title}
                    </strong>{" "}
                    evaluation for{" "}
                    <strong>
                      {
                        evaluationPeriods.find((p) => p.value === data.period)
                          ?.label
                      }
                    </strong>
                    .
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    You can modify these settings later if needed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
