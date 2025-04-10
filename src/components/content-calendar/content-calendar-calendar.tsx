'use client';

import React, { useState } from 'react';
import { ContentItem, ContentPlatform, ContentStatus, ContentTeamMember } from '@/types/content-calendar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isToday, parseISO } from 'date-fns';
import { ContentItemModal } from './content-item-modal';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger, 
  TooltipProvider 
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ContentCalendarCalendarProps {
  contentItems: ContentItem[];
  statuses: ContentStatus[];
  teamMembers: ContentTeamMember[];
  platforms: ContentPlatform[];
  onEditItem: (item: ContentItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export function ContentCalendarCalendar({
  contentItems,
  statuses,
  teamMembers,
  platforms,
  onEditItem,
  onDeleteItem
}: ContentCalendarCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);
  const [isDateSelectOpen, setIsDateSelectOpen] = useState(false);
  const [showAllItems, setShowAllItems] = useState<Record<string, boolean>>({});
  
  const openItemModal = (item: ContentItem) => {
    setCurrentItem(item);
    setIsItemModalOpen(true);
  };

  const handleAddNewItem = (date: Date) => {
    // Create a new empty item with the selected date
    const newItem: ContentItem = {
      id: `new-${Date.now()}`,
      title: 'New Content Item',
      description: '',
      status: 'idea',
      dueDate: date.toISOString(),
      assignedTo: '',
      platformIds: [],
      contentType: 'other',
      attachments: [],
      tags: [],
      comments: []
    };
    
    setCurrentItem(newItem);
    setIsItemModalOpen(true);
  };
  
  const getPlatformById = (id: string) => {
    return platforms.find(platform => platform.id === id);
  };
  
  const getTeamMemberById = (id: string) => {
    return teamMembers.find(member => member.id === id);
  };
  
  const getStatusById = (id: string) => {
    return statuses.find(status => status.id === id);
  };
  
  const getItemsForDate = (date: Date) => {
    return contentItems.filter(item => 
      item.dueDate && isSameDay(parseISO(item.dueDate), date)
    );
  };

  const toggleShowAllItems = (dateKey: string) => {
    setShowAllItems(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };
  
  // Generate days in the current month view
  const start = startOfMonth(selectedDate);
  const end = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start, end });
  
  // Adjust start day to begin on Sunday of the week that includes the first of the month
  const calendarStart = addDays(start, -start.getDay());
  
  // Generate 6 weeks (42 days) to ensure we have enough days for the calendar
  const calendarDays = Array.from({ length: 42 }, (_, i) => addDays(calendarStart, i));
  
  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {format(selectedDate, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
            <Popover open={isDateSelectOpen} onOpenChange={setIsDateSelectOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Select Month
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setIsDateSelectOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium py-2 border-b">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, i) => {
            const dayItems = getItemsForDate(day);
            const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
            const dateKey = format(day, 'yyyy-MM-dd');
            const shouldShowAll = showAllItems[dateKey] || false;
            const displayedItems = shouldShowAll ? dayItems : dayItems.slice(0, 3);
            const hasMoreItems = dayItems.length > 3 && !shouldShowAll;
            
            return (
              <div 
                key={i} 
                className={`min-h-[120px] border p-2 ${
                  isCurrentMonth 
                    ? 'bg-card' 
                    : 'bg-muted/20 text-muted-foreground'
                } ${
                  isToday(day)
                    ? 'border-primary' 
                    : 'border-border'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-medium ${isToday(day) ? 'bg-primary text-primary-foreground px-1.5 rounded-full' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:opacity-100"
                    onClick={() => handleAddNewItem(day)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-1">
                  {displayedItems.length > 0 ? (
                    displayedItems.map((item) => {
                      const status = getStatusById(item.status);
                      
                      return (
                        <Card 
                          key={item.id}
                          className="cursor-pointer hover:shadow-sm transition-shadow p-1"
                          onClick={() => openItemModal(item)}
                        >
                          <div className="flex items-start justify-between space-x-1">
                            <div 
                              className="w-1 h-full rounded-full" 
                              style={{ backgroundColor: status?.color }}
                            ></div>
                            <div className="flex-1 truncate">
                              <p className="text-xs font-medium truncate">{item.title}</p>
                              
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.platformIds.slice(0, 1).map(platformId => {
                                  const platform = getPlatformById(platformId);
                                  return platform ? (
                                    <Badge 
                                      key={platformId}
                                      className="text-[10px] h-4 px-1"
                                      style={{ 
                                        backgroundColor: `${platform.color}20`, 
                                        color: platform.color 
                                      }}
                                    >
                                      {platform.name}
                                    </Badge>
                                  ) : null;
                                })}
                                
                                {item.platformIds.length > 1 && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-[10px] h-4 px-1"
                                  >
                                    +{item.platformIds.length - 1}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {item.assignedTo && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage 
                                        src={getTeamMemberById(item.assignedTo)?.avatar} 
                                        alt={getTeamMemberById(item.assignedTo)?.name || ''} 
                                      />
                                      <AvatarFallback className="text-[8px]">
                                        {getTeamMemberById(item.assignedTo)?.name.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{getTeamMemberById(item.assignedTo)?.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  openItemModal(item);
                                }}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive" 
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    onDeleteItem(item.id);
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="h-4"></div>
                  )}
                  
                  {hasMoreItems && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs text-muted-foreground h-6 py-1"
                      onClick={() => toggleShowAllItems(dateKey)}
                    >
                      +{dayItems.length - 3} more
                    </Button>
                  )}
                  
                  {shouldShowAll && dayItems.length > 3 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs text-muted-foreground h-6 py-1"
                      onClick={() => toggleShowAllItems(dateKey)}
                    >
                      Show less
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {currentItem && (
        <ContentItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          item={currentItem}
          onSave={onEditItem}
          statuses={statuses}
          teamMembers={teamMembers}
          platforms={platforms}
        />
      )}
    </>
  );
} 