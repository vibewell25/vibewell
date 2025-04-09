import { useState } from 'react';
import { Event } from '@/types/events';
import { format, parseISO } from 'date-fns';
import { 
  DocumentTextIcon, 
  VideoCameraIcon,
  LinkIcon,
  PhotoIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EventMaterialsAgendaProps {
  event: Event;
  onMaterialAdd: (material: {
    title: string;
    type: 'document' | 'video' | 'link' | 'image';
    url: string;
    description?: string;
  }) => void;
  onAgendaAdd: (agendaItem: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    speaker?: {
      name: string;
      title?: string;
      avatar?: string;
    };
  }) => void;
}

export function EventMaterialsAgenda({ event, onMaterialAdd, onAgendaAdd }: EventMaterialsAgendaProps) {
  const [activeTab, setActiveTab] = useState('materials');
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    type: 'document' as const,
    url: '',
    description: ''
  });
  const [newAgendaItem, setNewAgendaItem] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    speaker: {
      name: '',
      title: '',
      avatar: ''
    }
  });

  const handleMaterialSubmit = () => {
    if (newMaterial.title && newMaterial.url) {
      onMaterialAdd(newMaterial);
      setNewMaterial({
        title: '',
        type: 'document',
        url: '',
        description: ''
      });
    }
  };

  const handleAgendaSubmit = () => {
    if (newAgendaItem.title && newAgendaItem.startTime && newAgendaItem.endTime) {
      onAgendaAdd(newAgendaItem);
      setNewAgendaItem({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        speaker: {
          name: '',
          title: '',
          avatar: ''
        }
      });
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'video':
        return <VideoCameraIcon className="h-5 w-5" />;
      case 'link':
        return <LinkIcon className="h-5 w-5" />;
      case 'image':
        return <PhotoIcon className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="materials">
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Materials
            </TabsTrigger>
            <TabsTrigger value="agenda">
              <ClockIcon className="h-4 w-4 mr-2" />
              Agenda
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <TabsContent value="materials">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Add New Material</Label>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                      placeholder="Material title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={newMaterial.type}
                      onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value as any })}
                    >
                      <option value="document">Document</option>
                      <option value="video">Video</option>
                      <option value="link">Link</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={newMaterial.url}
                    onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                    placeholder="Material URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    placeholder="Material description"
                    rows={2}
                  />
                </div>
                <Button onClick={handleMaterialSubmit}>
                  Add Material
                </Button>
              </div>
            </div>

            {event.materials && event.materials.length > 0 && (
              <div className="space-y-2">
                <Label>Event Materials</Label>
                <div className="space-y-2">
                  {event.materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        {getMaterialIcon(material.type)}
                        <div>
                          <p className="font-medium">{material.title}</p>
                          {material.description && (
                            <p className="text-sm text-muted-foreground">
                              {material.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(material.url, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="agenda">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Add Agenda Item</Label>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newAgendaItem.title}
                    onChange={(e) => setNewAgendaItem({ ...newAgendaItem, title: e.target.value })}
                    placeholder="Agenda item title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={newAgendaItem.description}
                    onChange={(e) => setNewAgendaItem({ ...newAgendaItem, description: e.target.value })}
                    placeholder="Agenda item description"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={newAgendaItem.startTime}
                      onChange={(e) => setNewAgendaItem({ ...newAgendaItem, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={newAgendaItem.endTime}
                      onChange={(e) => setNewAgendaItem({ ...newAgendaItem, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Speaker (Optional)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      value={newAgendaItem.speaker.name}
                      onChange={(e) => setNewAgendaItem({
                        ...newAgendaItem,
                        speaker: { ...newAgendaItem.speaker, name: e.target.value }
                      })}
                      placeholder="Speaker name"
                    />
                    <Input
                      value={newAgendaItem.speaker.title}
                      onChange={(e) => setNewAgendaItem({
                        ...newAgendaItem,
                        speaker: { ...newAgendaItem.speaker, title: e.target.value }
                      })}
                      placeholder="Speaker title"
                    />
                  </div>
                </div>
                <Button onClick={handleAgendaSubmit}>
                  Add Agenda Item
                </Button>
              </div>
            </div>

            {event.agenda && event.agenda.length > 0 && (
              <div className="space-y-2">
                <Label>Event Agenda</Label>
                <div className="space-y-2">
                  {event.agenda.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-md"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">
                          {item.startTime} - {item.endTime}
                        </Badge>
                      </div>
                      {item.speaker && (
                        <div className="flex items-center gap-2 mt-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {item.speaker.name}
                            {item.speaker.title && `, ${item.speaker.title}`}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  );
} 