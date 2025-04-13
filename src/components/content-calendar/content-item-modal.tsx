'use client';

import { useState } from 'react';
import { ContentItem, ContentPlatform, ContentStatus, ContentTeamMember } from '@/types/content-calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { FileUpload } from '@/components/ui/file-upload';
import Image from 'next/image';

interface ContentItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem;
  teamMembers: ContentTeamMember[];
  platforms: ContentPlatform[];
  statuses: ContentStatus[];
  onSave: (item: ContentItem) => void;
}

export function ContentItemModal({
  isOpen,
  onClose,
  item,
  teamMembers,
  platforms,
  statuses,
  onSave
}: ContentItemModalProps) {
  const [updatedItem, setUpdatedItem] = useState<ContentItem>({...item});
  const [activeTab, setActiveTab] = useState('details');
  const [newTag, setNewTag] = useState('');
  const [newComment, setNewComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const handleSave = () => {
    onSave(updatedItem);
    onClose();
  };
  
  const handleInputChange = (field: keyof ContentItem, value: any) => {
    setUpdatedItem(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const togglePlatform = (platformId: string) => {
    setUpdatedItem(prev => {
      const platformIds = prev.platformIds.includes(platformId) 
        ? prev.platformIds.filter(id => id !== platformId)
        : [...prev.platformIds, platformId];
        
      return {
        ...prev,
        platformIds
      };
    });
  };
  
  const addTag = () => {
    if (!newTag.trim() || updatedItem.tags.includes(newTag.trim())) return;
    
    setUpdatedItem(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    
    setNewTag('');
  };
  
  const removeTag = (tagToRemove: string) => {
    setUpdatedItem(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: (updatedItem.comments.length + 1).toString(),
      userId: teamMembers[0].id, // Using first team member as current user
      text: newComment.trim(),
      createdAt: new Date().toISOString()
    };
    
    setUpdatedItem(prev => ({
      ...prev,
      comments: [...prev.comments, comment]
    }));
    
    setNewComment('');
  };
  
  const handleDueDateChange = (date: Date | undefined) => {
    handleInputChange('dueDate', date ? date.toISOString() : null);
  };
  
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    
    setUpdatedItem(prev => ({
      ...prev,
      attachments: files.map(file => ({
        id: `temp-${file.name}`,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: teamMembers[0].id // Using first team member as current user
      }))
    }));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            <Input
              value={updatedItem.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="text-xl font-semibold border-0 focus-visible:ring-0 px-0 h-auto"
              placeholder="Content Title"
            />
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="comments">
              Comments ({updatedItem.comments.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="details" className="mt-0 h-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={updatedItem.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter a description for this content"
                      className="mt-1 h-32"
                    />
                  </div>
                  
                  <div>
                    <Label>Tags</Label>
                    <div className="flex mt-1">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTag()}
                        placeholder="Add a tag"
                        className="mr-2"
                      />
                      <Button onClick={addTag} type="button">Add</Button>
                    </div>
                    
                    {updatedItem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {updatedItem.tags.map(tag => (
                          <Badge key={tag} className="flex items-center gap-1">
                            {tag}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label>Platforms</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {platforms.map(platform => (
                        <Badge
                          key={platform.id}
                          className="cursor-pointer flex items-center gap-1"
                          variant={updatedItem.platformIds.includes(platform.id) ? "default" : "outline"}
                          style={updatedItem.platformIds.includes(platform.id) ? { 
                            backgroundColor: `${platform.color}20`, 
                            color: platform.color
                          } : {}}
                          onClick={() => togglePlatform(platform.id)}
                        >
                          {platform.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Sidebar Details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={updatedItem.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(status => (
                          <SelectItem key={status.id} value={status.id}>
                            <div className="flex items-center">
                              <div 
                                className="w-2 h-2 rounded-full mr-2" 
                                style={{ backgroundColor: status.color }}
                              ></div>
                              {status.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="assignee">Assigned To</Label>
                    <Select
                      value={updatedItem.assignedTo}
                      onValueChange={(value) => handleInputChange('assignedTo', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Assign to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              {member.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="contentType">Content Type</Label>
                    <Select
                      value={updatedItem.contentType}
                      onValueChange={(value: any) => handleInputChange('contentType', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blog">Blog Post</SelectItem>
                        <SelectItem value="social">Social Media Post</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="testimonial">Testimonial</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Due Date and Time</Label>
                    <DateTimePicker
                      date={updatedItem.dueDate ? new Date(updatedItem.dueDate) : undefined}
                      setDate={handleDueDateChange}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="mt-0 h-full">
              <div className="space-y-4">
                <div>
                  <Label>Content Preview</Label>
                  <div className="border rounded-md p-4 mt-1 min-h-[200px] text-center flex items-center justify-center text-muted-foreground">
                    Content editor will be implemented in the next phase.
                  </div>
                </div>
                
                <div>
                  <Label>Attachments</Label>
                  <FileUpload
                    onFilesSelected={handleFilesSelected}
                    selectedFiles={selectedFiles}
                    maxFiles={5}
                    maxFileSize={20}
                    acceptedFileTypes={{
                      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                      'video/*': ['.mp4', '.webm', '.mov'],
                      'application/pdf': ['.pdf']
                    }}
                  />
                  
                  {selectedFiles.length > 0 && selectedFiles.some(file => file.type.startsWith('image/')) && (
                    <div className="mt-4">
                      <Label>Image Previews</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {selectedFiles
                          .filter(file => file.type.startsWith('image/'))
                          .map((file, index) => (
                            <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                              <Image
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="object-cover"
                                fill
                                sizes="(max-width: 640px) 50vw, 33vw"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                                <p className="text-white text-xs truncate">{file.name}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="comments" className="mt-0 h-full">
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-2"
                  />
                  <Button onClick={addComment}>Add Comment</Button>
                </div>
                
                <div className="space-y-3">
                  {updatedItem.comments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No comments yet
                    </p>
                  ) : (
                    updatedItem.comments.map(comment => {
                      const commenter = teamMembers.find(member => member.id === comment.userId);
                      
                      return (
                        <div key={comment.id} className="border rounded-md p-3">
                          <div className="flex items-start">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={commenter?.avatar} />
                              <AvatarFallback>
                                {commenter?.name.slice(0, 2).toUpperCase() || 'UN'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center">
                                <span className="font-medium">{commenter?.name || 'Unknown'}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                                </span>
                              </div>
                              <p className="mt-1">{comment.text}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 