'use client';

import { Icons } from '@/components/icons';
import { useState } from 'react';
import { ContentPlatform, ContentTeamMember } from '@/types/content-calendar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/Input';
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
  onAddTeamMember,
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
      color: newPlatformColor,
    });
    setNewPlatformName('');
    setNewPlatformColor('#6200EA');
  };

  return (
    <div className="w-64 space-y-6">
      {/* Platforms Section */}
      <Card>
        <CardHeader className="px-4 py-3">
          <div className="flex items-center justify-between">
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
                {platforms.map((platform) => (
                  <li key={platform.id} className="flex items-center">
                    <div
                      className="mr-2 h-3 w-3 rounded-full"
                      style={{ backgroundColor: platform.color }}
                    ></div>
                    <span className="text-sm">{platform.name}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <div className="mt-3 space-y-2 border-t pt-3">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="New platform"
                    value={newPlatformName}
                    onChange={(e) => setNewPlatformName(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <ColorPicker color={newPlatformColor} onChange={setNewPlatformColor} />
              </div>
              <Button
                size="sm"
                className="h-8 w-full"
                onClick={handleAddPlatform}
                disabled={!newPlatformName.trim()}
              >
                <Icons.PlusIcon className="mr-1 h-4 w-4" />
                Add Platform
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
      {/* Team Members Section */}
      <Card>
        <CardHeader className="px-4 py-3">
          <div className="flex items-center justify-between">
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
                {teamMembers.map((member) => (
                  <li key={member.id} className="flex items-center">
                    <Avatar className="mr-2 h-6 w-6">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{member.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-8 w-full"
              onClick={() => {
                // In a real app, this would open a modal to add a team member
                alert('Team member management will be implemented in the next phase');
              }}
            >
              <Icons.PlusIcon className="mr-1 h-4 w-4" />
              Add Team Member
            </Button>
          </CardContent>
        )}
      </Card>
      {/* Content Types Filter */}
      <Card>
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-sm font-medium">Content Types</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            {['Blog', 'Social', 'Email', 'Video', 'Promotion'].map((type) => (
              <div key={type} className="flex items-center">
                <input type="checkbox" id={`type-${type}`} className="mr-2" />
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
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-sm font-medium">Popular Tags</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1 p-3 pt-0">
          {['spring', 'summer', 'promotion', 'wellness', 'tips', 'product'].map((tag) => (
            <div
              key={tag}
              className="bg-secondary hover:bg-secondary/80 cursor-pointer rounded-full px-2 py-1 text-xs"
            >
              {tag}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
