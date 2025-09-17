import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createEvaluationReview } from '@/services/evaluations';
import { toast } from 'sonner';
import EvaluationTypeStep from './EvaluationTypeStep';
import EmployeeSelectionStep from './EmployeeSelectionStep';
import FormCustomizationStep from './FormCustomizationStep';
import ReviewAndSendStep from './ReviewAndSendStep';

const steps = [
  { id: 1, title: 'Evaluation Type', description: 'Select type and period' },
  { id: 2, title: 'Select Employees', description: 'Choose who to evaluate' },
  { id: 3, title: 'Customize Form', description: 'Design the evaluation' },
  { id: 4, title: 'Review & Send', description: 'Final review and distribution' }
];

export default function EvaluationCreator({ onBack }) {
  const { accessToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationData, setEvaluationData] = useState({
    type: '',
    period: '',
    selectedEmployees: [],
    formName: '',
    sections: [],
    description: '',
    reviewDeadline: '',
    recipients: {
      individuals: [],
      departments: [],
      teams: []
    }
  });

  const updateEvaluationData = useCallback((updates) => {
    setEvaluationData(prev => ({ ...prev, ...updates }));
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!accessToken) {
      toast.error('Authentication required. Please log in to create evaluations.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare the request body according to the API specification
      const requestBody = {
        formName: evaluationData.formName,
        formType: evaluationData.type,
        description: evaluationData.description || `Evaluation for ${evaluationData.period}`,
        reviewPeriod: evaluationData.period,
        reviewDeadline: evaluationData.reviewDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 1 week from now
        sections: evaluationData.sections,
        employees: evaluationData.selectedEmployees
      };

      console.log('Submitting evaluation with data:', requestBody);

      const result = await createEvaluationReview(requestBody, accessToken);

      if (result.success) {
        toast.success('Evaluation created successfully!');
        
        // Reset the form or redirect
        setEvaluationData({
          type: '',
          period: '',
          selectedEmployees: [],
          formName: '',
          sections: [],
          description: '',
          reviewDeadline: '',
          recipients: {
            individuals: [],
            departments: [],
            teams: []
          }
        });
        setCurrentStep(1);
        
        // Optionally call onBack to return to the previous page
        if (onBack) {
          onBack();
        }
      } else {
        toast.error(result.error || 'Failed to create evaluation. Please try again.');
      }
    } catch (error) {
      console.error('Error creating evaluation:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return evaluationData.type && evaluationData.period;
      case 2:
        return evaluationData.selectedEmployees.length > 0;
      case 3:
        return evaluationData.formName.trim().length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <EvaluationTypeStep
            data={evaluationData}
            onUpdate={updateEvaluationData}
          />
        );
      case 2:
        return (
          <EmployeeSelectionStep
            data={evaluationData}
            onUpdate={updateEvaluationData}
          />
        );
      case 3:
        return (
          <FormCustomizationStep
            data={evaluationData}
            onUpdate={updateEvaluationData}
          />
        );
      case 4:
        return (
          <ReviewAndSendStep
            data={evaluationData}
            onUpdate={updateEvaluationData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{'--card': 'oklch(1 0 0)', '--card-foreground': 'oklch(0.145 0 0)'}}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onBack ? onBack() : window.history.back()}
            className="flex items-center space-x-2 text-gray-700 hover:text-green-500 border-gray-300 hover:border-gray-400 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Overview</span>
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create New Evaluation
          </h1>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    // Allow navigation to any completed step or current step
                    if (step.id <= currentStep) {
                      setCurrentStep(step.id);
                    }
                  }}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                      currentStep > step.id
                        ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                        : currentStep === step.id
                        ? 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-sm font-medium transition-colors ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block w-16 h-0.5 ml-6 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Navigation Hint */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              💡 You can click on completed steps to go back and make changes
            </p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Save Indicator */}
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700">
                Your progress is automatically saved as you complete each step
              </span>
            </div>
          </div>
          
          {renderStepContent()}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>

          {currentStep < steps.length ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Evaluation...</span>
                </>
              ) : (
                <>
                  <span>Send Evaluation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}