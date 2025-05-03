export interface ContentItem {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  assignedTo: string;
  platformIds: string[];
  contentType:
    | 'blog'
    | 'social'
    | 'email'
    | 'video'
    | 'image'
    | 'promotion'
    | 'testimonial'
    | 'newsletter'
    | 'other';
  attachments: ContentAttachment[];
  tags: string[];
  comments: ContentComment[];
}

export interface ContentAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ContentComment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  parentId?: string;
}

export interface ContentPlatform {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface ContentStatus {
  id: string;
  name: string;
  color: string;
}

export interface ContentTeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface ContentCalendarFilter {
  platforms?: string[];
  statuses?: string[];
  assignees?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  contentTypes?: string[];
}

export interface DraggableItemProps {
  item: ContentItem;
  teamMembers: ContentTeamMember[];
  platforms: ContentPlatform[];
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
}
