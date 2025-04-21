import { Icons } from '@/components/icons';
import { useState } from 'react';
import { Event } from '@/types/events';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

interface EventGroupsNetworkingProps {
  event: Event;
  onGroupCreate: (name: string, description: string) => void;
  onMessageSend: (message: string) => void;
  onPhotoUpload: (file: File) => void;
  onNetworkingMatch: () => void;
}

export function EventGroupsNetworking({
  event,
  onGroupCreate,
  onMessageSend,
  onPhotoUpload,
  onNetworkingMatch,
}: EventGroupsNetworkingProps) {
  const [activeTab, setActiveTab] = useState('groups');
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
  });
  const [newMessage, setNewMessage] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const handleGroupCreate = () => {
    if (newGroup.name.trim()) {
      onGroupCreate(newGroup.name, newGroup.description);
      setNewGroup({ name: '', description: '' });
    }
  };

  const handleMessageSend = () => {
    if (newMessage.trim()) {
      onMessageSend(newMessage);
      setNewMessage('');
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      onPhotoUpload(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="groups">
              <Icons.UserGroupIcon className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="chat">
              <Icons.ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="photos">
              <Icons.PhotoIcon className="h-4 w-4 mr-2" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="networking">
              <Icons.SparklesIcon className="h-4 w-4 mr-2" />
              Networking
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <TabsContent value="groups">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Create New Group</Label>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Group Name</Label>
                  <Input
                    value={newGroup.name}
                    onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="Group name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input
                    value={newGroup.description}
                    onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Group description"
                  />
                </div>
                <Button onClick={handleGroupCreate}>Create Group</Button>
              </div>
            </div>
            {event.groupId && (
              <div className="space-y-2">
                <Label>Event Group</Label>
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium">{event.groupName}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Join the group to connect with other participants
                  </p>
                  <Button className="mt-2">Join Group</Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="chat">
          <div className="space-y-4">
            {event.chatEnabled ? (
              <>
                <div className="space-y-2">
                  <Label>Send Message</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                    />
                    <Button onClick={handleMessageSend}>Send</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Chat Messages</Label>
                  <div className="space-y-2">
                    {/* Sample chat messages - in a real app, these would come from a chat service */}
                    <div className="p-2 border rounded-md">
                      <div className="flex items-start gap-2">
                        <Avatar>
                          <AvatarImage src="/images/avatars/user1.jpg" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">John Doe</p>
                          <p className="text-sm">Hello everyone! Looking forward to the event.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Chat is not enabled for this event
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="photos">
          <div className="space-y-4">
            {event.photoGalleryEnabled ? (
              <>
                <div className="space-y-2">
                  <Label>Upload Photo</Label>
                  <Input type="file" accept="image/*" onChange={handlePhotoSelect} />
                </div>
                {event.photos && event.photos.length > 0 && (
                  <div className="space-y-2">
                    <Label>Event Photos</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {event.photos.map(photo => (
                        <div
                          key={photo.id}
                          className="relative aspect-square rounded-md overflow-hidden"
                        >
                          <Image
                            src={photo.url}
                            alt={photo.caption || 'Event photo'}
                            className="object-cover"
                            fill
                            sizes="(max-width: 640px) 50vw, 33vw"
                          />
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                            <p className="text-white text-sm">{photo.caption}</p>
                            <p className="text-white/70 text-xs">By {photo.uploadedBy.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Photo gallery is not enabled for this event
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="networking">
          <div className="space-y-4">
            {event.networkingEnabled ? (
              <>
                <div className="space-y-2">
                  <Label>Networking Preferences</Label>
                  <div className="p-4 border rounded-md space-y-2">
                    <p className="text-sm">Match with other participants based on:</p>
                    <div className="flex gap-2">
                      {event.networkingPreferences?.matchBy.map(criteria => (
                        <Badge key={criteria} variant="secondary">
                          {criteria}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button onClick={onNetworkingMatch} className="w-full">
                  Find Networking Matches
                </Button>
                {/* Sample matches - in a real app, these would come from a matching service */}
                <div className="space-y-2">
                  <Label>Suggested Matches</Label>
                  <div className="space-y-2">
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src="/images/avatars/user2.jpg" />
                          <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Jane Smith</p>
                          <p className="text-sm text-muted-foreground">Wellness Coach</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Networking features are not enabled for this event
              </div>
            )}
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  );
}
