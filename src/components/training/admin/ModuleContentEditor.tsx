'use client';;
import { useState } from 'react';
import { Card, Button, Input, Select, Textarea } from '@/components/ui';
import { createModuleContent, updateModuleContent } from '@/lib/api/training-admin';
import { DocumentIcon, VideoCameraIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface ModuleContentEditorProps {
  moduleId: string;
  initialContent?: any;
  onSave: () => void;
}

interface ContentSection {
  id: string;
  type: 'text' | 'video' | 'quiz';
  title: string;
  content: any;
}

export default function ModuleContentEditor({
  moduleId,
  initialContent,
  onSave,
}: ModuleContentEditorProps) {
  const [sections, setSections] = useState<ContentSection[]>(initialContent?.sections || []);
  const [selectedSection, setSelectedSection] = useState<ContentSection | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAddSection = (type: 'text' | 'video' | 'quiz') => {
    const newSection: ContentSection = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: '',
      content: type === 'quiz' ? { questions: [] } : '',
    };
    setSections([...sections, newSection]);
    setSelectedSection(newSection);
  };

  const handleUpdateSection = (updatedSection: ContentSection) => {
    setSections(sections.map((s) => (s.id === updatedSection.id ? updatedSection : s)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const content = {
        sections,
      };
      if (initialContent) {
        await updateModuleContent(moduleId, content);
      } else {
        await createModuleContent(moduleId, content);
      }
      onSave();
    } catch (error) {
      console.error('Error saving module content:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderSectionEditor = () => {
    if (!selectedSection) return null;

    switch (selectedSection.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <Input
              label="Section Title"
              value={selectedSection.title}
              onChange={(value) =>
                handleUpdateSection({
                  ...selectedSection,
                  title: value,
                })
              }
            />
            <Textarea
              label="Content"
              value={selectedSection.content}
              onChange={(value) =>
                handleUpdateSection({
                  ...selectedSection,
                  content: value,
                })
              }
              rows={10}
            />
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <Input
              label="Section Title"
              value={selectedSection.title}
              onChange={(value) =>
                handleUpdateSection({
                  ...selectedSection,
                  title: value,
                })
              }
            />
            <Input
              label="Video URL"
              value={selectedSection.content}
              onChange={(value) =>
                handleUpdateSection({
                  ...selectedSection,
                  content: value,
                })
              }
              placeholder="Enter video URL (YouTube, Vimeo, etc.)"
            />
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-4">
            <Input
              label="Section Title"
              value={selectedSection.title}
              onChange={(value) =>
                handleUpdateSection({
                  ...selectedSection,
                  title: value,
                })
              }
            />
            <div className="space-y-4">
              {selectedSection.content.questions.map((question: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <Input
                      label={`Question ${index + 1}`}
                      value={question.text}
                      onChange={(value) => {
                        const newQuestions = [...selectedSection.content.questions];
                        newQuestions[index] = {
                          ...question,
                          text: value,
                        };
                        handleUpdateSection({
                          ...selectedSection,
                          content: {
                            ...selectedSection.content,
                            questions: newQuestions,
                          },
                        });
                      }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      {question.options.map((option: string, optionIndex: number) => (
                        <Input
                          key={optionIndex}
                          label={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(value) => {
                            const newQuestions = [...selectedSection.content.questions];
                            newQuestions[index].options[optionIndex] = value;
                            handleUpdateSection({
                              ...selectedSection,
                              content: {
                                ...selectedSection.content,
                                questions: newQuestions,
                              },
                            });
                          }}
                        />
                      ))}
                    </div>
                    <Select
                      label="Correct Answer"
                      value={question.correctAnswer}
                      onChange={(value) => {
                        const newQuestions = [...selectedSection.content.questions];
                        newQuestions[index].correctAnswer = value;
                        handleUpdateSection({
                          ...selectedSection,
                          content: {
                            ...selectedSection.content,
                            questions: newQuestions,
                          },
                        });
                      }}
                      options={question.options.map((option: string, i: number) => ({
                        value: i.toString(),
                        label: option,
                      }))}
                    />
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newQuestions = [
                    ...selectedSection.content.questions,
                    {
                      text: '',
                      options: ['', '', '', ''],
                      correctAnswer: '0',
                    },
                  ];
                  handleUpdateSection({
                    ...selectedSection,
                    content: {
                      ...selectedSection.content,
                      questions: newQuestions,
                    },
                  });
                }}
              >
                Add Question
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Sections List */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Content Sections</h2>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => handleAddSection('text')}>
              <DocumentIcon className="mr-1 h-4 w-4" />
              Text
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAddSection('video')}>
              <VideoCameraIcon className="mr-1 h-4 w-4" />
              Video
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAddSection('quiz')}>
              <QuestionMarkCircleIcon className="mr-1 h-4 w-4" />
              Quiz
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`cursor-pointer rounded-lg p-3 ${
                selectedSection?.id === section.id
                  ? 'border-blue-200 bg-blue-50'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedSection(section)}
            >
              <h3 className="font-medium">{section.title || `Untitled ${section.type} section`}</h3>
              <p className="text-sm capitalize text-gray-500">{section.type}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Section Editor */}
      {selectedSection && (
        <div className="md:col-span-2">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Section</h2>
              <Button
                variant="outline"
                onClick={() => {
                  setSections(sections.filter((s) => s.id !== selectedSection.id));
                  setSelectedSection(null);
                }}
              >
                Delete Section
              </Button>
            </div>
            {renderSectionEditor()}
          </Card>
        </div>
      )}

      {/* Save Button */}
      <div className="md:col-span-3">
        <Button className="w-full" onClick={handleSave} loading={saving}>
          Save Content
        </Button>
      </div>
    </div>
  );
}
