import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { useState } from 'react';
import { format as formatDate } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export function ActivityExport() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [format, setFormat] = useState<string>('csv');
  const [exporting, setExporting] = useState(false);

  const exportFormats: ExportFormat[] = [
    {
      id: 'csv',
      name: 'CSV',
      description: 'Comma-separated values format',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'JavaScript Object Notation format',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Portable Document Format',
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  const handleExport = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      setExporting(true);
      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: 'Export Successful',
        description: `Your activity data has been exported in ${format.toUpperCase()} format.`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your activity data.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Activity Data</CardTitle>
        <CardDescription>
          Export your account activity data for the selected time period and format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Date Range</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={dateRange.from.toISOString().split('T')[0]}
                onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })}
                className="rounded-md border p-2"
              />
              <span>to</span>
              <input
                type="date"
                value={dateRange.to.toISOString().split('T')[0]}
                onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })}
                className="rounded-md border p-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Export Format</span>
            </div>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exportFormats.map((format) => (
                  <SelectItem key={format.id} value={format.id}>
                    <div className="flex items-center space-x-2">
                      {format.icon}
                      <span>{format.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button className="w-full" onClick={handleExport} disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />
          {exporting ? 'Exporting...' : 'Export Data'}
        </Button>

        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            Your export will include all activity data from{' '}
            {formatDate(dateRange.from, 'MMM d, yyyy')} to {formatDate(dateRange.to, 'MMM d, yyyy')}{' '}
            in {format.toUpperCase()} format.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
