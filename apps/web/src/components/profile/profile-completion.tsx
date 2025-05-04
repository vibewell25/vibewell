import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/Button';
import { Check, AlertCircle, User, Mail, MapPin, Calendar } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProfileSection {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  icon: React.ReactNode;
}

export function ProfileCompletion() {
  const [sections, setSections] = useState<ProfileSection[]>([
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Name, date of birth, and contact details',
      completed: true,
      required: true,
      icon: <User className="h-4 w-4" />,
    },
    {
      id: 'contact',
      title: 'Contact Information',
      description: 'Email address and phone number',
      completed: true,
      required: true,
      icon: <Mail className="h-4 w-4" />,
    },
    {
      id: 'location',
      title: 'Location',
      description: 'Current city and timezone',
      completed: false,
      required: true,
      icon: <MapPin className="h-4 w-4" />,
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Notification and privacy settings',
      completed: false,
      required: false,
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      id: 'verification',
      title: 'Account Verification',
      description: 'Email and phone verification',
      completed: true,
      required: true,
      icon: <Check className="h-4 w-4" />,
    },
  ]);

  const totalSections = sections.length;
  const completedSections = sections.filter((section) => section.completed).length;
  const completionPercentage = (completedSections / totalSections) * 100;
  const requiredCompleted = sections
    .filter((section) => section.required)
    .every((section) => section.completed);

  const handleCompleteSection = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');sectionId: string) => {
    try {
      // Simulate API call to update section completion
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSections((prev) =>
        prev.map((section) =>
          section.id === sectionId ? { ...section, completed: true } : section,
        ),
      );

      toast.success('Section completed successfully');
    } catch (error) {
      console.error('Error completing section:', error);
      toast.error('Failed to complete section');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Profile Completion</span>
          <span className="text-sm font-normal text-muted-foreground">
            {completedSections}/{totalSections} sections completed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{completionPercentage.toFixed(0)}% Complete</span>
            {requiredCompleted && (
              <span className="text-sm text-green-500">All required sections completed</span>
            )}
          </div>
          <Progress value={completionPercentage} />
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="flex items-start space-x-4 rounded-lg border p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                {section.icon}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{section.title}</h4>
                  {section.completed ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{section.description}</p>
                {!section.completed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCompleteSection(section.id)}
                  >
                    Complete Section
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
