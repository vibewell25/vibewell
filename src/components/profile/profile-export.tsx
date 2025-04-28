import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { toast } from 'sonner';
import { Download, FileText, FileJson, FileCsv, User, Activity, Settings } from 'lucide-react';

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export function ProfileExport() {
  const [format, setFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['profile', 'activity']);

  const exportOptions: ExportOption[] = [
    {
      id: 'profile',
      label: 'Profile Information',
      description: 'Basic profile details and settings',
      icon: <User className="h-5 w-5" />,
    },
    {
      id: 'activity',
      label: 'Activity Logs',
      description: 'Account activity and security events',
      icon: <Activity className="h-5 w-5" />,
    },
    {
      id: 'preferences',
      label: 'Preferences',
      description: 'Account preferences and settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const handleExport = async () => {
    try {
      // Simulate API call to generate export
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Export generated successfully!');

      // Simulate file download
      const blob = new Blob([JSON.stringify({ format, selectedOptions })], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-export-${new Date().toISOString()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating export:', error);
      toast.error('Failed to generate export');
    }
  };

  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Profile Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value: 'json' | 'csv' | 'pdf') => setFormat(value)}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="json" id="json" className="peer sr-only" />
                <Label
                  htmlFor="json"
                  className="peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground"
                >
                  <FileJson className="mb-3 h-6 w-6" />
                  JSON
                </Label>
              </div>
              <div>
                <RadioGroupItem value="csv" id="csv" className="peer sr-only" />
                <Label
                  htmlFor="csv"
                  className="peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground"
                >
                  <FileCsv className="mb-3 h-6 w-6" />
                  CSV
                </Label>
              </div>
              <div>
                <RadioGroupItem value="pdf" id="pdf" className="peer sr-only" />
                <Label
                  htmlFor="pdf"
                  className="peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground"
                >
                  <FileText className="mb-3 h-6 w-6" />
                  PDF
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Data to Export</Label>
            <div className="space-y-4">
              {exportOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-4 rounded-lg border p-4">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                    {option.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{option.label}</h3>
                      <Checkbox
                        checked={selectedOptions.includes(option.id)}
                        onCheckedChange={() => toggleOption(option.id)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleExport} disabled={selectedOptions.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
