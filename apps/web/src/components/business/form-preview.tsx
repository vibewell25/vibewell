import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'file';
  required: boolean;
  options?: string[];
}

interface FormPreviewProps {
  name: string;
  description?: string;
  fields: FormField[];
  onSubmit?: (data: Record<string, any>) => void;
}

export function FormPreview({ name, description, fields, onSubmit }: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, File>>({});

  const handleChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleFileChange = (fieldId: string, file: File | null) => {
    if (file) {
      setFiles((prev) => ({ ...prev, [fieldId]: file }));
    } else {
      const newFiles = { ...files };
      delete newFiles[fieldId];
      setFiles(newFiles);
    }
  };

  const handleSubmit = (e: React?.FormEvent) => {
    e?.preventDefault();
    if (onSubmit) {
      // Combine form data and files
      const submitData = {
        ...formData,
        files,
      };
      onSubmit(submitData);
    }
  };

  const renderField = (field: FormField) => {
    switch (field?.type) {
      case 'text':
        return (
          <Input
            value={formData[field?.id] || ''}
            onChange={(e) => handleChange(field?.id, e?.target.value)}
            required={field?.required}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={formData[field?.id] || ''}
            onChange={(e) => handleChange(field?.id, e?.target.value)}
            required={field?.required}
          />
        );
      case 'select':
        return (
          <Select
            value={formData[field?.id] || ''}
            onValueChange={(value) => handleChange(field?.id, value)}
            required={field?.required}
          >
            <option value="">Select an option</option>
            {field?.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        );
      case 'checkbox':
        return (
          <Checkbox
            checked={formData[field?.id] || false}
            onCheckedChange={(checked) => handleChange(field?.id, checked)}
            required={field?.required}
          />
        );
      case 'file':
        return (
          <Input
            type="file"
            onChange={(e) => {
              const file = e?.target.files?.[0] || null;
              handleFileChange(field?.id, file);
            }}
            required={field?.required}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields?.map((field) => (
            <div key={field?.id} className="space-y-2">
              <Label>
                {field?.label}
                {field?.required && <span className="text-red-500">*</span>}
              </Label>
              {renderField(field)}
            </div>
          ))}
          {onSubmit && (
            <Button type="submit" className="w-full">
              Submit
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
