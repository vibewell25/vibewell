import { useState, useEffect } from 'react';
import { ContentTypeSelector, type ContentType } from './ContentTypeSelector';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define wellness content categories
const categories = [
  { id: 'mindfulness', name: 'Mindfulness' },
  { id: 'yoga', name: 'Yoga' },
  { id: 'nutrition', name: 'Nutrition' },
  { id: 'fitness', name: 'Fitness' },
  { id: 'sleep', name: 'Sleep' },
  { id: 'mental-health', name: 'Mental Health' },
];

// Define content levels
const levels = [
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' },
];

interface WellnessContent {
  id?: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: string;
  contentType: ContentType;
  content: string;
  tags?: string[];
  videoUrl?: string;
  image?: string;
}

interface WellnessContentEditorProps {
  content?: WellnessContent;
  onSave: (content: WellnessContent) => void;
  onCancel: () => void;
}

export function WellnessContentEditor({ content, onSave, onCancel }: WellnessContentEditorProps) {
  const [formData, setFormData] = useState<WellnessContent>({
    title: '',
    description: '',
    category: 'mindfulness',
    duration: '',
    level: 'beginner',
    contentType: 'video',
    content: '',
    tags: [],
    videoUrl: '',
    image: '/placeholder.png',
  });

  // Initialize form with content data if editing
  useEffect(() => {
    if (content) {
      setFormData(content);
    }
  }, [content]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle tags input
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map((tag) => tag.trim());
    setFormData((prev) => ({
      ...prev,
      tags,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter content title"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter content description"
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleSelectChange('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label htmlFor="duration">Duration *</Label>
        <Input
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          placeholder="e.g., 15 mins"
          required
        />
      </div>

      {/* Level */}
      <div className="space-y-2">
        <Label htmlFor="level">Level *</Label>
        <Select
          value={formData.level}
          onValueChange={(value) => handleSelectChange('level', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            {levels.map((level) => (
              <SelectItem key={level.id} value={level.id}>
                {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content Type */}
      <div className="space-y-2">
        <ContentTypeSelector
          value={formData.contentType}
          onChange={(value) => handleSelectChange('contentType', value)}
          label="Content Type *"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Enter content details"
          required
          rows={10}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          value={formData.tags?.join(', ')}
          onChange={handleTagsChange}
          placeholder="Enter tags separated by commas"
        />
      </div>

      {/* Video URL (if content type is video) */}
      {formData.contentType === 'video' && (
        <div className="space-y-2">
          <Label htmlFor="videoUrl">Video URL</Label>
          <Input
            id="videoUrl"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            placeholder="Enter video URL"
          />
        </div>
      )}

      {/* Image URL */}
      <div className="space-y-2">
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="Enter image URL"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {content ? 'Save Changes' : 'Create Content'}
        </button>
      </div>
    </form>
  );
}
