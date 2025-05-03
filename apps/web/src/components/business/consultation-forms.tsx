import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { FormFieldEditor } from './FormFieldEditor';
import { FormPreview } from './FormPreview';

interface ConsultationFormProps {
  businessId: string;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'file';
  required: boolean;
  options?: string[];
}

interface ConsultationForm {
  id?: string;
  name: string;
  description?: string;
  fields: FormField[];
  isRequired: boolean;
  isActive: boolean;
}

export function ConsultationForms({ businessId }: ConsultationFormProps) {
  const { toast } = useToast();
  const [forms, setForms] = useState<ConsultationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingForm, setEditingForm] = useState<ConsultationForm | null>(null);
  const [activeTab, setActiveTab] = useState('edit');

  useEffect(() => {
    fetchForms();
  }, [businessId]);

  const fetchForms = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const response = await fetch(`/api/business/forms?businessId=${businessId}`);
      if (!response?.ok) throw new Error('Failed to fetch forms');
      const data = await response?.json();
      setForms(data);
    } catch (error) {
      console?.error('Error fetching forms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load consultation forms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');form: ConsultationForm) => {
    try {
      const response = await fetch('/api/business/forms', {
        method: form?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON?.stringify({ ...form, businessId }),
      });

      if (!response?.ok) throw new Error('Failed to save form');

      toast({
        title: 'Success',
        description: 'Form saved successfully',
      });

      setEditingForm(null);
      fetchForms();
    } catch (error) {
      console?.error('Error saving form:', error);
      toast({
        title: 'Error',
        description: 'Failed to save form',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');formId: string) => {
    try {
      const response = await fetch(`/api/business/forms?id=${formId}`, {
        method: 'DELETE',
      });

      if (!response?.ok) throw new Error('Failed to delete form');

      toast({
        title: 'Success',
        description: 'Form deleted successfully',
      });

      fetchForms();
    } catch (error) {
      console?.error('Error deleting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete form',
        variant: 'destructive',
      });
    }
  };

  const handleSwitchChange = (checked: boolean, field: 'isRequired' | 'isActive') => {
    if (editingForm) {
      setEditingForm({ ...editingForm, [field]: checked });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultation Forms</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={() =>
              setEditingForm({
                name: '',
                fields: [],
                isRequired: true,
                isActive: true,
              })
            }
          >
            Add New Form
          </Button>

          {forms?.map((form) => (
            <Card key={form?.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{form?.name}</h3>
                  <p className="text-sm text-gray-500">{form?.description}</p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingForm(form);
                      setActiveTab('edit');
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingForm(form);
                      setActiveTab('preview');
                    }}
                  >
                    Preview
                  </Button>
                  <Button variant="destructive" onClick={() => form?.id && handleDelete(form?.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {editingForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <Card className="mx-4 h-[80vh] w-full max-w-4xl overflow-auto">
              <CardHeader>
                <CardTitle>{editingForm?.id ? 'Edit Form' : 'New Form'}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit" className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={editingForm?.name}
                        onChange={(e) => setEditingForm({ ...editingForm, name: e?.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editingForm?.description || ''}
                        onChange={(e) =>
                          setEditingForm({
                            ...editingForm,
                            description: e?.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingForm?.isRequired}
                        onCheckedChange={(checked) => handleSwitchChange(checked, 'isRequired')}
                      />
                      <Label>Required</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingForm?.isActive}
                        onCheckedChange={(checked) => handleSwitchChange(checked, 'isActive')}
                      />
                      <Label>Active</Label>
                    </div>

                    <div className="mt-6">
                      <Label>Form Fields</Label>
                      <FormFieldEditor
                        fields={editingForm?.fields}
                        onChange={(fields) => setEditingForm({ ...editingForm, fields })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="preview">
                    <FormPreview
                      name={editingForm?.name}
                      description={editingForm?.description}
                      fields={editingForm?.fields}
                    />
                  </TabsContent>
                </Tabs>

                <div className="mt-6 flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditingForm(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleSave(editingForm)}>Save</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
