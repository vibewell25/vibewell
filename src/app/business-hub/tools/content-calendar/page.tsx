'use client';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { BusinessHubNavigation } from '@/components/business-hub-navigation';
import { ContentCalendarBoard } from '@/components/content-calendar/content-calendar-board';
import { ContentCalendarSidebar } from '@/components/content-calendar/content-calendar-sidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ContentItem,
  ContentPlatform,
  ContentStatus,
  ContentTeamMember,
} from '@/types/content-calendar';
import { ContentCalendarCalendar } from '@/components/content-calendar/content-calendar-calendar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
export default function ContentCalendarPage() {
  const [activeTab, setActiveTab] = useState<string>('board');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [platforms, setPlatforms] = useState<ContentPlatform[]>([
    { id: '1', name: 'Instagram', color: '#E1306C' },
    { id: '2', name: 'Facebook', color: '#4267B2' },
    { id: '3', name: 'Twitter', color: '#1DA1F2' },
    { id: '4', name: 'LinkedIn', color: '#0077B5' },
    { id: '5', name: 'TikTok', color: '#000000' },
    { id: '6', name: 'Blog', color: '#FF5722' },
    { id: '7', name: 'Email', color: '#6200EA' },
  ]);
  const [teamMembers, setTeamMembers] = useState<ContentTeamMember[]>([
    { id: '1', name: 'Sarah Johnson', avatar: '/images/team/sarah.jpg', role: 'Content Manager' },
    { id: '2', name: 'Mike Chen', avatar: '/images/team/mike.jpg', role: 'Graphic Designer' },
    { id: '3', name: 'Alex Wong', avatar: '/images/team/alex.jpg', role: 'Copywriter' },
    { id: '4', name: 'Taylor Swift', avatar: '/images/team/taylor.jpg', role: 'SEO Specialist' },
  ]);
  const statuses: ContentStatus[] = [
    { id: 'idea', name: 'Idea', color: '#9E9E9E' },
    { id: 'planning', name: 'Planning', color: '#2196F3' },
    { id: 'creating', name: 'Creating', color: '#FF9800' },
    { id: 'reviewing', name: 'Reviewing', color: '#673AB7' },
    { id: 'approved', name: 'Approved', color: '#4CAF50' },
    { id: 'scheduled', name: 'Scheduled', color: '#00BCD4' },
    { id: 'published', name: 'Published', color: '#8BC34A' },
  ];
  // Simulate fetching content calendar items
  useEffect(() => {
    // In a real app, this would be an API call
    const mockContentItems: ContentItem[] = [
      {
        id: '1',
        title: 'Spring Collection Launch',
        description: 'Announcing our new spring collection with special offers',
        status: 'planning',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: '1',
        platformIds: ['1', '2', '6'],
        contentType: 'promotion',
        attachments: [],
        tags: ['spring', 'collection', 'promotion'],
        comments: [
          {
            id: '1',
            userId: '1',
            text: "Let's focus on sustainability aspects",
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: '2',
        title: 'Customer Success Story: Emma',
        description: "Highlighting Emma's transformation with our services",
        status: 'creating',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: '3',
        platformIds: ['1', '3', '4'],
        contentType: 'testimonial',
        attachments: [],
        tags: ['success', 'testimonial', 'transformation'],
        comments: [],
      },
      {
        id: '3',
        title: 'Wellness Tips Newsletter',
        description: 'Monthly newsletter with wellness tips and product highlights',
        status: 'reviewing',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: '3',
        platformIds: ['7'],
        contentType: 'newsletter',
        attachments: [],
        tags: ['wellness', 'tips', 'newsletter'],
        comments: [],
      },
      {
        id: '4',
        title: 'Behind-the-Scenes Video',
        description: 'Video showing our team at work and product creation process',
        status: 'approved',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: '2',
        platformIds: ['1', '5', '2'],
        contentType: 'video',
        attachments: [],
        tags: ['behind-the-scenes', 'team', 'video'],
        comments: [],
      },
      {
        id: '5',
        title: 'Summer Self-Care Guide',
        description: 'Blog post with tips for summer self-care routines',
        status: 'scheduled',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: '4',
        platformIds: ['6', '2', '4'],
        contentType: 'blog',
        attachments: [],
        tags: ['summer', 'self-care', 'guide'],
        comments: [],
      },
    ];
    setContentItems(mockContentItems);
  }, []);
  // Handle drag and drop between columns
  const handleDragAndDrop = (itemId: string, newStatus: string) => {
    setContentItems(prevItems =>
      prevItems.map(item => (item.id === itemId ? { ...item, status: newStatus } : item))
    );
  };
  // Handle creating a new content item
  const handleCreateContentItem = (item: ContentItem) => {
    setContentItems(prevItems => [...prevItems, item]);
  };
  // Handle editing a content item
  const handleEditContentItem = (updatedItem: ContentItem) => {
    setContentItems(prevItems =>
      prevItems.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
  };
  // Handle deleting a content item
  const handleDeleteContentItem = (itemId: string) => {
    setContentItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };
  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <BusinessHubNavigation />
        <div className="container mx-auto py-6 px-4 space-y-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Content Calendar</h1>
              <p className="text-muted-foreground">
                Plan, create, and schedule your content across platforms
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => console.log('Implement filters')}>
                Filter
              </Button>
              <Button
                onClick={() => {
                  const newId = (contentItems.length + 1).toString();
                  handleCreateContentItem({
                    id: newId,
                    title: 'New Content Item',
                    description: '',
                    status: 'idea',
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    assignedTo: '',
                    platformIds: [],
                    contentType: 'other',
                    attachments: [],
                    tags: [],
                    comments: [],
                  });
                }}
              >
                <Icons.PlusIcon className="w-5 h-5 mr-2" />
                Create Content
              </Button>
            </div>
          </div>
          <Tabs
            defaultValue="board"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
              <TabsTrigger value="board">
                <Icons.ListBulletIcon className="w-5 h-5 mr-2" />
                Board
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Icons.CalendarDaysIcon className="w-5 h-5 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="team">
                <Icons.UsersIcon className="w-5 h-5 mr-2" />
                Team
              </TabsTrigger>
            </TabsList>
            <TabsContent value="board" className="mt-0">
              <div className="flex">
                <ContentCalendarSidebar
                  platforms={platforms}
                  teamMembers={teamMembers}
                  onAddPlatform={platform => setPlatforms([...platforms, platform])}
                  onAddTeamMember={member => setTeamMembers([...teamMembers, member])}
                />
                <div className="flex-1 ml-6">
                  <ContentCalendarBoard
                    contentItems={contentItems}
                    statuses={statuses}
                    teamMembers={teamMembers}
                    platforms={platforms}
                    onDragAndDrop={handleDragAndDrop}
                    onEditItem={handleEditContentItem}
                    onDeleteItem={handleDeleteContentItem}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="calendar" className="mt-0">
              <div className="flex">
                <ContentCalendarSidebar
                  platforms={platforms}
                  teamMembers={teamMembers}
                  onAddPlatform={platform => setPlatforms([...platforms, platform])}
                  onAddTeamMember={member => setTeamMembers([...teamMembers, member])}
                />
                <div className="flex-1 ml-6">
                  <ContentCalendarCalendar
                    contentItems={contentItems}
                    statuses={statuses}
                    teamMembers={teamMembers}
                    platforms={platforms}
                    onEditItem={handleEditContentItem}
                    onDeleteItem={handleDeleteContentItem}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="team" className="mt-0">
              <div className="flex">
                <ContentCalendarSidebar
                  platforms={platforms}
                  teamMembers={teamMembers}
                  onAddPlatform={platform => setPlatforms([...platforms, platform])}
                  onAddTeamMember={member => setTeamMembers([...teamMembers, member])}
                />
                <div className="flex-1 ml-6">
                  <div className="bg-card rounded-lg border shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Team Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teamMembers.map(member => (
                        <div
                          key={member.id}
                          className="flex items-start space-x-4 p-4 border rounded-md"
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>
                              {member.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{member.name}</h3>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                            <div className="mt-2">
                              <p className="text-sm">
                                Assigned Items:{' '}
                                {contentItems.filter(item => item.assignedTo === member.id).length}
                              </p>
                              <div className="flex gap-1 mt-1">
                                {statuses.map(status => {
                                  const count = contentItems.filter(
                                    item =>
                                      item.assignedTo === member.id && item.status === status.id
                                  ).length;
                                  if (count > 0) {
                                    return (
                                      <Badge
                                        key={status.id}
                                        style={{
                                          backgroundColor: `${status.color}20`,
                                          color: status.color,
                                        }}
                                      >
                                        {status.name}: {count}
                                      </Badge>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
