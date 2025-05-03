import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export type ContentType =
  | 'post'
  | 'story'
  | 'reel'
  | 'video'
  | 'blog'
  | 'social'
  | 'email'
  | 'image'
  | 'promotion'
  | 'testimonial'
  | 'newsletter'
  | 'other';

interface ContentTypeSelectorProps {
  value: ContentType;
  onChange: (value: ContentType) => void;
  label?: string;
  className?: string;
}

export function ContentTypeSelector({
  value,
  onChange,
  label = 'Content Type',
  className = '',
}: ContentTypeSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="contentType">{label}</Label>
      <Select value={value} onValueChange={(value) => onChange(value as ContentType)}>
        <SelectTrigger id="contentType">
          <SelectValue placeholder="Select content type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="post">Post</SelectItem>
          <SelectItem value="story">Story</SelectItem>
          <SelectItem value="reel">Reel</SelectItem>
          <SelectItem value="video">Video</SelectItem>
          <SelectItem value="blog">Blog Post</SelectItem>
          <SelectItem value="social">Social Media Post</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="image">Image</SelectItem>
          <SelectItem value="promotion">Promotion</SelectItem>
          <SelectItem value="testimonial">Testimonial</SelectItem>
          <SelectItem value="newsletter">Newsletter</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
