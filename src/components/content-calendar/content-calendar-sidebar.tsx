'use client';

import { useState } from 'react';
import { ContentPlatform, ContentTeamMember } from '@/types/content-calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ColorPicker } from '@/components/ui/color-picker';

interface ContentCalendarSidebarProps {
  platforms: ContentPlatform[];
  teamMembers: ContentTeamMember[];
  onAddPlatform: (platform: ContentPlatform) => void;
  onAddTeamMember: (member: ContentTeamMember) => void;
}

export function ContentCalendarSidebar({
  platforms,
  teamMembers,
  onAddPlatform,
  onAddTeamMember
}: ContentCalendarSidebarProps) {
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformColor, setNewPlatformColor] = useState('#6200EA');
  const [platformsExpanded, setPlatformsExpanded] = useState(true);
  const [teamExpanded, setTeamExpanded] = useState(true);
  
  const handleAddPlatform = () => {
    if (!newPlatformName.trim()) return;
    
    onAddPlatform({
      id: (platforms.length + 1).toString(),
      name: newPlatformName,
      color: newPlatformColor
    });
    
    setNewPlatformName('');
    setNewPlatformColor('#6200EA');
  };
  
  return (
    <div className="w-64 space-y-6">
      {/* Platforms Section */}
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">Platforms</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPlatformsExpanded(!platformsExpanded)}
              className="h-7 w-7 p-0"
            >
              {platformsExpanded ? '-' : '+'}
            </Button>
          </div>
        </CardHeader>
        
        {platformsExpanded && (
          <CardContent className="p-3 pt-0">
            <ScrollArea className="h-40 pr-3">
              <ul className="space-y-2">
                {platforms.map(platform => (
                  <li key={platform.id} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: platform.color }}
                    ></div>
                    <span className="text-sm">{platform.name}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            
            <div className="mt-3 pt-3 border-t space-y-2">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="New platform"
                    value={newPlatformName}
                    onChange={(e) => setNewPlatformName(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <ColorPicker
                  color={newPlatformColor}
                  onChange={setNewPlatformColor}
                />
              </div>
              
              <Button
                size="sm"
                className="w-full h-8"
                onClick={handleAddPlatform}
                disabled={!newPlatformName.trim()}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Platform
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Team Members Section */}
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTeamExpanded(!teamExpanded)}
              className="h-7 w-7 p-0"
            >
              {teamExpanded ? '-' : '+'}
            </Button>
          </div>
        </CardHeader>
        
        {teamExpanded && (
          <CardContent className="p-3 pt-0">
            <ScrollArea className="h-40 pr-3">
              <ul className="space-y-2">
                {teamMembers.map(member => (
                  <li key={member.id} className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 h-8"
              onClick={() => {
                // In a real app, this would open a modal to add a team member
                alert("Team member management will be implemented in the next phase");
              }}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Team Member
            </Button>
          </CardContent>
        )}
      </Card>
      
      {/* Content Types Filter */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium">Content Types</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            {['Blog', 'Social', 'Email', 'Video', 'Promotion'].map(type => (
              <div key={type} className="flex items-center">
                <input 
                  type="checkbox" 
                  id={`type-${type}`} 
                  className="mr-2"
                />
                <Label htmlFor={`type-${type}`} className="text-sm">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Tags Filter */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium">Popular Tags</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 flex flex-wrap gap-1">
          {['spring', 'summer', 'promotion', 'wellness', 'tips', 'product'].map(tag => (
            <div 
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-secondary cursor-pointer hover:bg-secondary/80"
            >
              {tag}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
} 