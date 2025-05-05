import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { FileUpload } from '@/components/ui/file-upload';
import { Clock, PlusCircle, Calendar as CalendarIcon, List } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
from '@/components/ui/table';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

type ContentType = 'post' | 'story' | 'reel' | 'video';
type Platform = 'instagram' | 'facebook' | 'twitter' | 'tiktok';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  platform: Platform;
  scheduledDate: Date;
  attachments: File[];
  status: 'draft' | 'scheduled' | 'published';
export function ContentCalendar() {
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<ContentItem>>({
    title: '',
    description: '',
    contentType: 'post',
    platform: 'instagram',
    status: 'draft',
const [activeTab, setActiveTab] = useState<string>('calendar');
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date()));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
const handleSelectChange = (value: string, name: string) => {
    setNewItem((prev) => ({ ...prev, [name]: value }));
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate || !newItem.title) return;

    const newContentItem: ContentItem = {
      id: Date.now().toString(),
      title: newItem.title || '',
      description: newItem.description || '',
      contentType: (newItem.contentType as ContentType) || 'post',
      platform: (newItem.platform as Platform) || 'instagram',
      scheduledDate,
      attachments: selectedFiles,
      status: 'scheduled',
setContentItems((prev) => [...prev, newContentItem]);
    setNewItem({
      title: '',
      description: '',
      contentType: 'post',
      platform: 'instagram',
      status: 'draft',
setScheduledDate(undefined);
    setSelectedFiles([]);
// Generate the weekdays for the calendar view
  const weekDays = [...Array(7)].map((_, i) => addDays(currentWeek, i));

  // Get content items for a specific day
  const getItemsForDay = (day: Date) => {
    return contentItems.filter((item) => isSameDay(item.scheduledDate, day));
// Navigate to previous or next week
  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek((prev) => {
      const days = direction === 'prev' ? -7 : 7;
      return addDays(prev, days);
return (
    <div className="container mx-auto py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="mr-2 h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Content
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content Calendar</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                    Previous Week
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                    Next Week
                  </Button>
                </div>
              </div>
              <CardDescription>
                View and manage your scheduled content for the week of{' '}
                {format(currentWeek, 'MMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div key={day.toString()} className="min-h-[12rem] rounded-md border p-2">
                    <div className="sticky top-0 mb-2 bg-background text-sm font-medium">
                      {format(day, 'EEE, MMM d')}
                    </div>
                    <div className="space-y-2">
                      {getItemsForDay(day).map((item) => (
                        <div
                          key={item.id}
                          className="bg-primary/10 hover:bg-primary/20 cursor-pointer rounded-md p-2 text-xs"
                        >
                          <div className="font-medium">{item.title}</div>
                          <div className="mt-1 flex items-center text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {format(item.scheduledDate, 'h:mm a')}
                          </div>
                          <div className="mt-1 flex items-center space-x-1">
                            <span className="bg-primary/20 rounded-full px-1.5 py-0.5 text-[10px]">
                              {item.platform}
                            </span>
                            <span className="bg-secondary/20 rounded-full px-1.5 py-0.5 text-[10px]">
                              {item.contentType}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content List</CardTitle>
              <CardDescription>View all your scheduled content in a list format</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No content items scheduled yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    contentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.contentType}</TableCell>
                        <TableCell>{item.platform}</TableCell>
                        <TableCell>{format(item.scheduledDate, 'MMM d, yyyy h:mm a')}</TableCell>
                        <TableCell>
                          <span className="bg-primary/20 rounded-full px-2 py-1 text-xs">
                            {item.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Content</CardTitle>
              <CardDescription>
                Schedule new content for your social media platforms
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newItem.title}
                    onChange={handleInputChange}
                    placeholder="Enter content title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newItem.description}
                    onChange={handleInputChange}
                    placeholder="Enter content description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contentType">Content Type</Label>
                    <Select
                      value={newItem.contentType}
                      onValueChange={(value) => handleSelectChange(value, 'contentType')}
                    >
                      <SelectTrigger id="contentType">
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="post">Post</SelectItem>
                        <SelectItem value="story">Story</SelectItem>
                        <SelectItem value="reel">Reel</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select
                      value={newItem.platform}
                      onValueChange={(value) => handleSelectChange(value, 'platform')}
                    >
                      <SelectTrigger id="platform">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Schedule Date and Time</Label>
                  <DateTimePicker date={scheduledDate} setDate={setScheduledDate} />
                </div>

                <div className="space-y-2">
                  <Label>Attachments</Label>
                  <FileUpload
                    onFilesSelected={setSelectedFiles}
                    selectedFiles={selectedFiles}
                    maxFiles={5}
                    acceptedFileTypes={{
                      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                      'video/*': ['.mp4', '.mov', '.avi'],
/>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  disabled={!scheduledDate || !newItem.title}
                  className="w-full"
                >
                  Schedule Content
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
