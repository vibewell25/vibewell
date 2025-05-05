import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  ContentItem,
  ContentPlatform,
  ContentStatus,
  ContentTeamMember,
from '@/types/content-calendar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Calendar, MessageSquare, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
from '@/components/ui/dropdown-menu';
import { ContentItemModal } from './content-item-modal';

interface ContentCalendarBoardProps {
  contentItems: ContentItem[];
  statuses: ContentStatus[];
  teamMembers: ContentTeamMember[];
  platforms: ContentPlatform[];
  onDragAndDrop: (itemId: string, newStatus: string) => void;
  onEditItem: (item: ContentItem) => void;
  onDeleteItem: (itemId: string) => void;
export function ContentCalendarBoard({
  contentItems,
  statuses,
  teamMembers,
  platforms,
  onDragAndDrop,
  onEditItem,
  onDeleteItem,
: ContentCalendarBoardProps) {
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    onDragAndDrop(draggableId, newStatus);
const openItemModal = (item: ContentItem) => {
    setCurrentItem(item);
    setIsItemModalOpen(true);
const getPlatformById = (id: string) => {
    return platforms.find((platform) => platform.id === id);
const getTeamMemberById = (id: string) => {
    return teamMembers.find((member) => member.id === id);
return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {statuses.map((status) => (
            <div key={status.id} className="flex flex-col">
              <div
                className="mb-3 flex items-center rounded-md px-2 py-1 font-medium"
                style={{ backgroundColor: `${status.color}20` }}
              >
                <div
                  className="mr-2 h-3 w-3 rounded-full"
                  style={{ backgroundColor: status.color }}
                ></div>
                <span>{status.name}</span>
                <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                  {contentItems.filter((item) => item.status === status.id).length}
                </span>
              </div>

              <Droppable droppableId={status.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[500px] flex-1"
                  >
                    {contentItems
                      .filter((item) => item.status === status.id)
                      .map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-3 cursor-pointer transition-shadow hover:shadow-md"
                              onClick={() => openItemModal(item)}
                            >
                              <CardHeader className="p-3 pb-0">
                                <div className="flex items-start justify-between">
                                  <h3 className="truncate text-sm font-medium">{item.title}</h3>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger
                                      asChild
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openItemModal(item);
>
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteItem(item.id);
>
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2 p-3 text-xs">
                                <p className="line-clamp-2 text-muted-foreground">
                                  {item.description}
                                </p>

                                {item.platformIds.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {item.platformIds.slice(0, 3).map((platformId) => {
                                      const platform = getPlatformById(platformId);
                                      return platform ? (
                                        <Badge
                                          key={platformId}
                                          className="h-4 px-1 text-[10px]"
                                          style={{
                                            backgroundColor: `${platform.color}20`,
                                            color: platform.color,
>
                                          {platform.name}
                                        </Badge>
                                      ) : null;
)}
                                    {item.platformIds.length > 3 && (
                                      <Badge variant="outline" className="h-4 px-1 text-[10px]">
                                        +{item.platformIds.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                              <CardFooter className="flex items-center justify-between p-3 pt-0 text-xs">
                                <div className="flex items-center gap-2">
                                  {item.dueDate && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center text-muted-foreground">
                                          <Calendar className="mr-1 h-3 w-3" />
                                          <span>{format(new Date(item.dueDate), 'MMM d')}</span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Due {format(new Date(item.dueDate), 'MMMM d, yyyy')}
                                      </TooltipContent>
                                    </Tooltip>
                                  )}

                                  {item.comments.length > 0 && (
                                    <div className="flex items-center text-muted-foreground">
                                      <MessageSquare className="mr-1 h-3 w-3" />
                                      <span>{item.comments.length}</span>
                                    </div>
                                  )}

                                  {item.attachments.length > 0 && (
                                    <div className="flex items-center text-muted-foreground">
                                      <Paperclip className="mr-1 h-3 w-3" />
                                      <span>{item.attachments.length}</span>
                                    </div>
                                  )}
                                </div>

                                {item.assignedTo && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage
                                          src={getTeamMemberById(item.assignedTo).avatar}
                                          alt={getTeamMemberById(item.assignedTo).name || ''}
                                        />
                                        <AvatarFallback>
                                          {getTeamMemberById(item.assignedTo)
                                            .name.slice(0, 2)
                                            .toUpperCase() || '--'}
                                        </AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {getTeamMemberById(item.assignedTo).name || 'Unassigned'}
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </CardFooter>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {currentItem && (
        <ContentItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          item={currentItem}
          teamMembers={teamMembers}
          platforms={platforms}
          statuses={statuses}
          onSave={(updatedItem) => {
            onEditItem(updatedItem);
            setIsItemModalOpen(false);
/>
      )}
    </>
