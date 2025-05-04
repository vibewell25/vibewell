import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/Card';
import { Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'file';
  required: boolean;
  options?: string[];
}

interface FormFieldEditorProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

export function FormFieldEditor({ fields, onChange }: FormFieldEditorProps) {
  const [newOption, setNewOption] = useState('');

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
    };
    onChange([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    onChange(newFields);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    onChange(newFields);
  };

  const addOption = (fieldIndex: number) => {
    if (!newOption.trim()) return;
    const field = fields[fieldIndex];
    const options = [...(field.options || []), newOption.trim()];
    updateField(fieldIndex, { options });
    setNewOption('');
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = fields[fieldIndex];
    const options = field.options.filter((_, i) => i !== optionIndex);
    updateField(fieldIndex, { options });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  return (
    <div className="space-y-4">
      <Button onClick={addField} type="button">
        Add Field
      </Button>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided) => (
                    <Card className="mb-4 p-4" ref={provided.innerRef} {...provided.draggableProps}>
                      <div className="flex items-start space-x-4">
                        <div {...provided.dragHandleProps} className="mt-2 cursor-move">
                          <GripVertical size={20} />
                        </div>
                        <div className="flex-grow space-y-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-grow">
                              <Label>Field Label</Label>
                              <Input
                                value={field.label}
                                onChange={(e) => updateField(index, { label: e.target.value })}
                                placeholder="Enter field label"
                              />
                            </div>
                            <div className="w-40">
                              <Label>Field Type</Label>
                              <Select
                                value={field.type}
                                onValueChange={(value: any) => updateField(index, { type: value })}
                              >
                                <option value="text">Text</option>
                                <option value="textarea">Text Area</option>
                                <option value="select">Select</option>
                                <option value="checkbox">Checkbox</option>
                                <option value="file">File Upload</option>
                              </Select>
                            </div>
                            <div className="mt-6 flex items-center space-x-2">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) =>
                                  updateField(index, { required: checked })
                                }
                              />
                              <Label>Required</Label>
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => removeField(index)}
                              className="mt-4"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>

                          {field.type === 'select' && (
                            <div className="space-y-2">
                              <Label>Options</Label>
                              <div className="flex space-x-2">
                                <Input
                                  value={newOption}
                                  onChange={(e) => setNewOption(e.target.value)}
                                  placeholder="Add new option"
                                />
                                <Button type="button" onClick={() => addOption(index)}>
                                  Add
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {field.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center space-x-2">
                                    <span>{option}</span>
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => removeOption(index, optionIndex)}
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
