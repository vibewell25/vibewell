import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Trash2, Edit2, Eye } from 'lucide-react';

interface Content {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  content: string;
  author: string;
  publishedAt: string;
  tags: string[];
export function WellnessContent() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    content: '',
    tags: '',
useEffect(() => {
    const fetchContents = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
      try {
        const response = await fetch('/api/wellness/contents');
        if (!response.ok) {
          throw new Error('Failed to fetch contents');
const data = await response.json();
        setContents(data);
catch (error) {
        console.error('Error fetching contents:', error);
        toast.error('Failed to load contents');
finally {
        setLoading(false);
fetchContents();
[]);

  const handleAddContent = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (!newContent.title || !newContent.category || !newContent.type || !newContent.content) {
      toast.error('Please fill in all required fields');
      return;
try {
      const response = await fetch('/api/wellness/contents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
body: JSON.stringify({
          ...newContent,
          tags: newContent.tags.split(',').map((tag) => tag.trim()),
),
if (!response.ok) {
        throw new Error('Failed to add content');
const data = await response.json();
      setContents([...contents, data]);
      setNewContent({
        title: '',
        description: '',
        category: '',
        type: '',
        content: '',
        tags: '',
toast.success('Content added successfully!');
catch (error) {
      console.error('Error adding content:', error);
      toast.error('Failed to add content');
const handleDeleteContent = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');contentId: string) => {
    try {
      const response = await fetch(`/api/wellness/contents/${contentId}`, {
        method: 'DELETE',
if (!response.ok) {
        throw new Error('Failed to delete content');
setContents(contents.filter((content) => content.id !== contentId));
      toast.success('Content deleted successfully!');
catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newContent.category}
                onValueChange={(value) => setNewContent({ ...newContent, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                  <SelectItem value="mental">Mental Health</SelectItem>
                  <SelectItem value="sleep">Sleep</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={newContent.type}
                onValueChange={(value) => setNewContent({ ...newContent, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={newContent.tags}
                onChange={(e) => setNewContent({ ...newContent, tags: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newContent.description}
                onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newContent.content}
                onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleAddContent}>
            <Plus className="mr-2 h-4 w-4" />
            Add Content
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contents.map((content) => (
          <Card key={content.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{content.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteContent(content.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{content.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{content.category}</span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{content.type}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {content.tags.map((tag) => (
                    <span key={tag} className="bg-secondary rounded-full px-2 py-1 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  By {content.author} • {format(new Date(content.publishedAt), 'MMM d, yyyy')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
