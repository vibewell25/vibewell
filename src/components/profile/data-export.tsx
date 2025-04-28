import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Download, Database, User, Mail, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
}

export function DataExport() {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportOptions: ExportOption[] = [
    {
      id: 'profile',
      title: 'Profile Information',
      description: 'Basic profile details, preferences, and settings',
      icon: <User className="h-5 w-5" />,
      selected: true,
    },
    {
      id: 'activity',
      title: 'Activity History',
      description: 'Your complete activity log and history',
      icon: <Calendar className="h-5 w-5" />,
      selected: true,
    },
    {
      id: 'communications',
      title: 'Communications',
      description: 'Emails, messages, and notifications',
      icon: <Mail className="h-5 w-5" />,
      selected: false,
    },
    {
      id: 'data',
      title: 'All Data',
      description: 'Complete export of all your data',
      icon: <Database className="h-5 w-5" />,
      selected: false,
    },
  ];

  const handleExport = async () => {
    try {
      setExporting(true);
      setProgress(0);

      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setProgress(i);
      }

      // Generate and download the export file
      const selectedOptions = exportOptions.filter((option) => option.selected);
      const exportData = {
        timestamp: new Date().toISOString(),
        options: selectedOptions.map((option) => option.id),
        // Add actual data export logic here
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vibewell-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: 'Your data has been successfully exported.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your data.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Export</CardTitle>
        <CardDescription>
          Export your data in a portable format. Choose what you want to include in your export.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {exportOptions.map((option) => (
            <div key={option.id} className="flex items-start space-x-4 rounded-lg border p-4">
              <div className="mt-1">{option.icon}</div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{option.title}</p>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <Button
                variant={option.selected ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  option.selected = !option.selected;
                }}
              >
                {option.selected ? 'Selected' : 'Select'}
              </Button>
            </div>
          ))}
        </div>

        {exporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Exporting data...</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Button className="w-full" onClick={handleExport} disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />
          {exporting ? 'Exporting...' : 'Export Data'}
        </Button>
      </CardContent>
    </Card>
  );
}
