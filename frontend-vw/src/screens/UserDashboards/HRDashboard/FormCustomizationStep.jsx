import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Settings, FileText, Star, Target, Edit2, X, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const defaultSections = [
  {
    id: '1',
    title: 'Overall Performance',
    description: 'General performance evaluation across key areas',
    type: 'rating',
    required: true,
    questions: [
      { id: '1', text: 'How would you rate your overall job performance this period?', type: 'rating', required: true },
      { id: '2', text: 'Rate the quality of work you have delivered', type: 'rating', required: true },
      { id: '3', text: 'How effectively do you meet deadlines and commitments?', type: 'rating', required: true },
      { id: '4', text: 'What are your main accomplishments this period?', type: 'text', required: false },
    ]
  },
  {
    id: '2',
    title: 'Goal Achievement',
    description: 'Assessment of goal completion and progress',
    type: 'goals',
    required: true,
    questions: [
      { id: '5', text: 'Rate your progress on quarterly goals', type: 'rating', required: true },
      { id: '6', text: 'Which goals did you exceed expectations on?', type: 'text', required: false },
      { id: '7', text: 'What challenges prevented you from achieving certain goals?', type: 'text', required: false },
      { id: '8', text: 'How well did you adapt when priorities changed?', type: 'rating', required: true },
    ]
  },
  {
    id: '3',
    title: 'Skills & Competencies',
    description: 'Technical and soft skills assessment',
    type: 'skills',
    required: false,
    questions: [
      { id: '9', text: 'Rate your technical skills proficiency', type: 'rating', required: true },
      { id: '10', text: 'How effectively do you communicate with team members?', type: 'rating', required: true },
      { id: '11', text: 'Rate your problem-solving abilities', type: 'rating', required: true },
      { id: '12', text: 'What new skills would you like to develop?', type: 'text', required: false },
    ]
  },
  {
    id: '4',
    title: 'Team Collaboration',
    description: 'Working relationships and team dynamics',
    type: 'rating',
    required: false,
    questions: [
      { id: '13', text: 'How well do you collaborate with colleagues?', type: 'rating', required: true },
      { id: '14', text: 'Rate your contribution to team projects', type: 'rating', required: true },
      { id: '15', text: 'How effectively do you support team members?', type: 'rating', required: true },
      { id: '16', text: 'Describe a successful collaboration this period', type: 'text', required: false },
    ]
  }
];

export default function FormCustomizationStep({ data, onUpdate }) {
  const [sections, setSections] = useState(
    data.sections.length > 0 ? data.sections : defaultSections
  );
  const [formName, setFormName] = useState(data.formName || '');
  const [editingSection, setEditingSection] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Initialize with default sections if none exist
  React.useEffect(() => {
    if (data.sections.length === 0) {
      onUpdate({ sections: defaultSections });
    }
  }, [data.sections.length, onUpdate]);

  const handleFormNameChange = (name) => {
    setFormName(name);
    onUpdate({ formName: name });
  };

  const handleSectionsUpdate = (updatedSections) => {
    setSections(updatedSections);
    onUpdate({ sections: updatedSections });
  };

  const addNewSection = () => {
    const newSection = {
      id: Date.now().toString(),
      title: 'New Section',
      description: 'Section description',
      type: 'rating',
      required: false,
      questions: [
        { id: Date.now().toString(), text: 'Sample question', type: 'rating', required: true }
      ]
    };
    handleSectionsUpdate([...sections, newSection]);
  };

  const removeSection = (sectionId) => {
    handleSectionsUpdate(sections.filter(s => s.id !== sectionId));
  };

  const updateSection = (sectionId, updates) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    handleSectionsUpdate(updatedSections);
  };

  const moveSection = (fromIndex, toIndex) => {
    const newSections = [...sections];
    const [movedSection] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedSection);
    handleSectionsUpdate(newSections);
  };

  const addQuestion = (sectionId) => {
    const newQuestion = {
      id: Date.now().toString(),
      text: 'New question',
      type: 'rating',
      required: false
    };
    updateSection(sectionId, {
      questions: [...sections.find(s => s.id === sectionId).questions, newQuestion]
    });
  };

  const updateQuestion = (sectionId, questionId, updates) => {
    const section = sections.find(s => s.id === sectionId);
    const updatedQuestions = section.questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    updateSection(sectionId, { questions: updatedQuestions });
  };

  const removeQuestion = (sectionId, questionId) => {
    const section = sections.find(s => s.id === sectionId);
    const updatedQuestions = section.questions.filter(q => q.id !== questionId);
    updateSection(sectionId, { questions: updatedQuestions });
  };

  const moveQuestion = (sectionId, fromIndex, toIndex) => {
    const section = sections.find(s => s.id === sectionId);
    const newQuestions = [...section.questions];
    const [movedQuestion] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, movedQuestion);
    updateSection(sectionId, { questions: newQuestions });
  };

  const getSectionIcon = (type) => {
    switch (type) {
      case 'rating':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'goals':
        return <Target className="w-5 h-5 text-blue-500" />;
      case 'skills':
        return <GripVertical className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'rating':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'text':
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Customize Form</h2>
        <p className="text-gray-600">
          Design your evaluation form by adding sections and questions. You can customize the structure to match your specific evaluation needs.
        </p>
      </div>

      {/* Form Name */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Form Name</h3>
              <p className="text-sm text-gray-600">
                Give your evaluation form a descriptive name that employees will recognize.
              </p>
            </div>
            <Input
              value={formName}
              onChange={(e) => handleFormNameChange(e.target.value)}
              placeholder="Enter form name (e.g., Q1 2024 Performance Review)"
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Sections</h3>
              <Button
                onClick={addNewSection}
                size="sm"
                className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700  cursor-pointer hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
              </Button>
            </div>

            <div className="space-y-3">
              {sections.map((section, index) => (
                <Card
                  key={section.id}
                  className="border border-gray-200 shadow-sm"
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => index > 0 && moveSection(index, index - 1)}
                            disabled={index === 0}
                            className="h-4 p-0 text-gray-400 hover:text-gray-600"
                          >
                            ▲
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => index < sections.length - 1 && moveSection(index, index + 1)}
                            disabled={index === sections.length - 1}
                            className="h-4 p-0 text-gray-400 hover:text-gray-600"
                          >
                            ▼
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getSectionIcon(section.type)}
                          <div>
                            {editingSection === section.id ? (
                              <Input
                                value={section.title}
                                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                onBlur={() => setEditingSection(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingSection(null)}
                                className="text-base font-medium h-8 w-48"
                                autoFocus
                              />
                            ) : (
                              <CardTitle 
                                className="text-base cursor-pointer hover:text-blue-600"
                                onClick={() => setEditingSection(section.id)}
                              >
                                {section.title}
                              </CardTitle>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {editingSection === section.id ? (
                            <div className="flex items-center space-x-2">
                              <Select
                                value={section.type}
                                onValueChange={(value) => updateSection(section.id, { type: value })}
                              >
                                <SelectTrigger className="w-24 h-6 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="rating">Rating</SelectItem>
                                  <SelectItem value="goals">Goals</SelectItem>
                                  <SelectItem value="skills">Skills</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <div className="flex items-center space-x-1">
                                <Switch
                                  checked={section.required}
                                  onCheckedChange={(checked) => updateSection(section.id, { required: checked })}
                                  className="scale-75"
                                />
                                <span className="text-xs text-gray-600">Required</span>
                              </div>
                            </div>
                          ) : (
                            <>
                          <Badge
                            variant={section.type === 'rating' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {section.type}
                          </Badge>
                          {section.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSection(section.id === editingSection ? null : section.id)}
                          className="text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSection(section.id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                          disabled={section.required}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-0">
                    <div className="space-y-3">
                      <Textarea
                        value={section.description}
                        onChange={(e) => updateSection(section.id, { description: e.target.value })}
                        placeholder="Section description"
                        className="text-sm resize-none"
                        rows={2}
                      />
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-700">
                          Questions ({section.questions.length})
                        </h5>
                          <Button
                            size="sm"
                            className="text-xs bg-white border border-gray-300 text-gray-700 cursor-pointer hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors duration-200"
                            onClick={() => addQuestion(section.id)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Question
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {section.questions.map((question, qIndex) => (
                            <div
                              key={question.id}
                              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              {/* Question Number and Move Buttons */}
                              <div className="flex flex-col items-center space-y-1">
                                <span className="text-xs text-gray-500 font-medium">
                                  {qIndex + 1}
                                </span>
                                <div className="flex flex-col space-y-0.5">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => qIndex > 0 && moveQuestion(section.id, qIndex, qIndex - 1)}
                                    disabled={qIndex === 0}
                                    className="h-3 w-3 p-0 text-gray-400 hover:text-gray-600"
                                  >
                                    ▲
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => qIndex < section.questions.length - 1 && moveQuestion(section.id, qIndex, qIndex + 1)}
                                    disabled={qIndex === section.questions.length - 1}
                                    className="h-3 w-3 p-0 text-gray-400 hover:text-gray-600"
                                  >
                                    ▼
                                  </Button>
                                </div>
                              </div>

                              {/* Question Type Icon */}
                              <div className="flex-shrink-0">
                                {getQuestionTypeIcon(question.type)}
                              </div>

                              {/* Question Content */}
                              <div className="flex-1 min-w-0">
                                {editingQuestion === question.id ? (
                                  <div className="space-y-2">
                                    <Input
                                      value={question.text}
                                      onChange={(e) => updateQuestion(section.id, question.id, { text: e.target.value })}
                                      placeholder="Enter question text"
                                      className="text-sm"
                                      autoFocus
                                    />
                                    <div className="flex items-center space-x-3">
                                      <Select
                                        value={question.type}
                                        onValueChange={(value) => updateQuestion(section.id, question.id, { type: value })}
                                      >
                                        <SelectTrigger className="w-32 h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="rating">Rating</SelectItem>
                                          <SelectItem value="text">Text</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          checked={question.required}
                                          onCheckedChange={(checked) => updateQuestion(section.id, question.id, { required: checked })}
                                          className="scale-75"
                                        />
                                        <span className="text-xs text-gray-600">Required</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <p className="text-sm text-gray-900 font-medium">
                                      {question.text}
                                    </p>
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline" className="text-xs">
                                        {question.type}
                                      </Badge>
                                      {question.required && (
                                        <Badge variant="destructive" className="text-xs">
                                          Required
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Question Actions */}
                              <div className="flex items-center space-x-1">
                                {editingQuestion === question.id ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingQuestion(null)}
                                      className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingQuestion(null)}
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingQuestion(question.id)}
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeQuestion(section.id, question.id)}
                                      className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Preview */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-blue-900">Form Preview</h4>
              <p className="text-sm text-blue-700">
                Your evaluation form "{formName || 'Untitled Form'}" contains {sections.length} section{sections.length !== 1 ? 's' : ''} 
                with {sections.reduce((acc, s) => acc + s.questions.length, 0)} total questions.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                You can preview the full form before sending it to employees.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}