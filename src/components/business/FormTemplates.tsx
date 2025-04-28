import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/use-toast';
import { FormPreview } from './FormPreview';

interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  category: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'file';
  required: boolean;
  options?: string[];
}

interface FormTemplatesProps {
  businessId: string;
}

export function FormTemplates({ businessId }: FormTemplatesProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/business/form-templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load form templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = async (template: FormTemplate) => {
    try {
      const response = await fetch('/api/business/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          name: template.name,
          description: template.description,
          fields: template.fields,
          isRequired: true,
          isActive: true,
          templateId: template.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to create form from template');

      toast({
        title: 'Success',
        description: 'Form created from template successfully',
      });
    } catch (error) {
      console.error('Error using template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create form from template',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.description}</p>
                  <div className="text-sm text-gray-500">Category: {template.category}</div>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setSelectedTemplate(template)}>
                    Preview
                  </Button>
                  <Button onClick={() => useTemplate(template)}>Use Template</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {selectedTemplate && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <Card className="mx-4 h-[80vh] w-full max-w-4xl overflow-auto">
              <CardHeader>
                <CardTitle>{selectedTemplate.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <FormPreview
                  name={selectedTemplate.name}
                  description={selectedTemplate.description}
                  fields={selectedTemplate.fields}
                />
                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                    Close
                  </Button>
                  <Button onClick={() => useTemplate(selectedTemplate)}>Use Template</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
