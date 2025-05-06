import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, ExternalLink } from 'lucide-react';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'file';
  required: boolean;
  options?: string[];
interface FormResponse {
  id: string;
  formId: string;
  userId: string;
  responses: Record<string, any>;
  attachments: Array<{
    id: string;
    url: string;
    filename: string;
    mimeType: string;
>;
  createdAt: string;
interface FormResponseViewerProps {
  response: FormResponse;
  fields: FormField[];
  onDownload?: (attachmentId: string) => void;
export function FormResponseViewer({ response, fields, onDownload }: FormResponseViewerProps) {
  const formatValue = (field: FormField, value: any) => {
    switch (field.type) {
      case 'checkbox':
        return value ? 'Yes' : 'No';
      case 'select':
        return value;
      case 'file':
        const attachment = response.attachments.find((a) => a.id === value);
        if (!attachment) return 'No file';
        return (
          <div className="flex items-center space-x-2">
            <span>{attachment.filename}</span>
            <Button variant="outline" size="icon" onClick={() => onDownload.(attachment.id)}>
              <Download size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(attachment.url, '_blank')}
            >
              <ExternalLink size={16} />
            </Button>
          </div>
default:
        return value;
return (
    <Card>
      <CardHeader>
        <CardTitle>Form Response</CardTitle>
        <div className="text-sm text-gray-500">
          Submitted on {new Date(response.createdAt).toLocaleString()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="space-y-1">
              <div className="font-medium">{field.label}</div>
              <div className="text-gray-700">
                {formatValue(field, response.responses[field.id])}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
