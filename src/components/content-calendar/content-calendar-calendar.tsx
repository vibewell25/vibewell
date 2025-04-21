'use client';

import React, { useState } from 'react';
import {
  ContentItem,
  ContentPlatform,
  ContentStatus,
  ContentTeamMember,
} from '@/types/content-calendar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  isToday,
  parseISO,
} from 'date-fns';
import { ContentItemModal } from './content-item-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScreenReaderOnly } from '@/components/ui/screen-reader-only';
import { LiveAnnouncer } from '@/components/ui/live-announcer';
import { AccessibleIcon } from '@/components/ui/accessible-icon';

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
  onDeleteItem,
}: ContentCalendarCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);
  const [isDateSelectOpen, setIsDateSelectOpen] = useState(false);
  const [showAllItems, setShowAllItems] = useState<Record<string, boolean>>({});

  const openItemModal = (item: ContentItem) => {
    setCurrentItem(item);
    setIsItemModalOpen(true);

    // Announce to screen readers
    if (window.announcer) {
      window.announcer.announce(`Opening content item: ${item.title}`);
    }
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
      comments: [],
    };

    setCurrentItem(newItem);
    setIsItemModalOpen(true);

    // Announce to screen readers
    if (window.announcer) {
      window.announcer.announce(`Creating new content item for ${format(date, 'MMMM d, yyyy')}`);
    }
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
    return contentItems.filter(item => item.dueDate && isSameDay(parseISO(item.dueDate), date));
  };

  const toggleShowAllItems = (dateKey: string) => {
    setShowAllItems(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));

    // Announce to screen readers
    if (window.announcer) {
      const isShowing = !showAllItems[dateKey];
      window.announcer.announce(
        isShowing ? `Showing all items for ${dateKey}` : `Showing fewer items for ${dateKey}`
      );
    }
  };

  // Generate days in the current month view
  const start = startOfMonth(selectedDate);
  const end = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start, end });

  // Adjust start day to begin on Sunday of the week that includes the first of the month
  const calendarStart = addDays(start, -start.getDay());

  // Generate 6 weeks (42 days) to ensure we have enough days for the calendar
  const calendarDays = Array.from({ length: 42 }, (_, i) => addDays(calendarStart, i));

  // Handle month change
  const handleMonthChange = (newDate: Date) => {
    setSelectedDate(newDate);

    // Announce to screen readers
    if (window.announcer) {
      window.announcer.announce(`Viewing calendar for ${format(newDate, 'MMMM yyyy')}`);
    }
  };

  return (
    <>
      {/* Include LiveAnnouncer for screen reader announcements */}
      <LiveAnnouncer />

      <div className="flex flex-col h-full" role="region" aria-label="Content Calendar">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold" id="calendar-heading">
            {format(selectedDate, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMonthChange(new Date())}
              aria-label="Go to today"
            >
              Today
            </Button>
            <Popover open={isDateSelectOpen} onOpenChange={setIsDateSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-haspopup="dialog"
                  aria-expanded={isDateSelectOpen}
                >
                  <AccessibleIcon
                    icon={<CalendarIcon className="h-4 w-4 mr-2" />}
                    label="Select Month"
                    labelPosition="after"
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={date => {
                    if (date) {
                      handleMonthChange(date);
                      setIsDateSelectOpen(false);
                    }
                  }}
                  initialFocus
                  aria-label="Month picker"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1" role="grid" aria-labelledby="calendar-heading">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="text-center text-sm font-medium py-2 border-b"
              role="columnheader"
              aria-label={day}
            >
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
            const isToday_ = isToday(day);

            return (
              <div
                key={i}
                className={`min-h-[120px] border p-2 ${
                  isCurrentMonth ? 'bg-card' : 'bg-muted/20 text-muted-foreground'
                } ${isToday_ ? 'border-primary' : 'border-border'}`}
                role="gridcell"
                aria-label={`${format(day, 'EEEE, MMMM d, yyyy')}${
                  isToday_ ? ' (Today)' : ''
                }${dayItems.length > 0 ? `, ${dayItems.length} items` : ', No items'}`}
                tabIndex={isToday_ ? 0 : -1}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-sm font-medium ${isToday_ ? 'bg-primary text-primary-foreground px-1.5 rounded-full' : ''}`}
                  >
                    {format(day, 'd')}
                    {isToday_ && <ScreenReaderOnly>Today</ScreenReaderOnly>}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:opacity-100"
                    onClick={() => handleAddNewItem(day)}
                    aria-label={`Add new item for ${format(day, 'MMMM d, yyyy')}`}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-1">
                  {displayedItems.length > 0 ? (
                    displayedItems.map(item => {
                      const status = getStatusById(item.status);
                      const assignedTeamMember = getTeamMemberById(item.assignedTo);

                      return (
                        <Card
                          key={item.id}
                          className="cursor-pointer hover:shadow-sm transition-shadow p-1"
                          onClick={() => openItemModal(item)}
                          tabIndex={0}
                          role="button"
                          aria-label={`${item.title}, status: ${status?.name || item.status}`}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openItemModal(item);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between space-x-1">
                            <div
                              className="w-1 h-full rounded-full"
                              style={{ backgroundColor: status?.color }}
                              aria-hidden="true"
                            ></div>

                            <div className="flex-1 text-xs">
                              <div className="font-medium line-clamp-1" title={item.title}>
                                {item.title}
                              </div>

                              {item.assignedTo && assignedTeamMember && (
                                <div className="flex items-center mt-1">
                                  <Tooltip content={`Assigned to: ${assignedTeamMember.name}`}>
                                    <div className="flex items-center">
                                      <Avatar className="h-4 w-4 mr-1">
                                        <AvatarImage
                                          src={assignedTeamMember.avatar}
                                          alt={assignedTeamMember.name || ''}
                                        />
                                        <AvatarFallback className="text-[8px]">
                                          {assignedTeamMember.name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="truncate max-w-[80px]">
                                        {assignedTeamMember.name}
                                      </span>
                                    </div>
                                  </Tooltip>
                                </div>
                              )}

                              {item.platformIds && item.platformIds.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.platformIds.slice(0, 2).map(platformId => {
                                    const platform = getPlatformById(platformId);
                                    return platform ? (
                                      <Badge
                                        key={platformId}
                                        variant="outline"
                                        className="px-1 py-0 text-[8px]"
                                      >
                                        {platform.name}
                                      </Badge>
                                    ) : null;
                                  })}
                                  {item.platformIds.length > 2 && (
                                    <Badge variant="outline" className="px-1 py-0 text-[8px]">
                                      +{item.platformIds.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0"
                                  aria-label={`Actions for ${item.title}`}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    openItemModal(item);
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    onDeleteItem(item.id);
                                    // Announce to screen readers
                                    if (window.announcer) {
                                      window.announcer.announce(
                                        `Deleted content item: ${item.title}`
                                      );
                                    }
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
                    <div className="h-4" aria-hidden="true"></div>
                  )}

                  {hasMoreItems && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground h-6 py-1"
                      onClick={() => toggleShowAllItems(dateKey)}
                      aria-label={`Show ${dayItems.length - 3} more items for ${format(day, 'MMMM d')}`}
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
                      aria-label={`Show fewer items for ${format(day, 'MMMM d')}`}
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
          onClose={() => {
            setIsItemModalOpen(false);
            // Announce to screen readers
            if (window.announcer) {
              window.announcer.announce('Content item modal closed');
            }
          }}
          item={currentItem}
          onSave={updatedItem => {
            onEditItem(updatedItem);
            // Announce to screen readers
            if (window.announcer) {
              window.announcer.announce(
                `Content item ${currentItem.id.startsWith('new') ? 'created' : 'updated'}: ${updatedItem.title}`
              );
            }
          }}
          statuses={statuses}
          teamMembers={teamMembers}
          platforms={platforms}
        />
      )}
    </>
  );
}
