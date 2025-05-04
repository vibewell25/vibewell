import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  imageUrl?: string;
}

interface SocialPost {
  id: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
}

interface SocialEventsProps {
  events: Event[];
  posts: SocialPost[];
  userId: string;
}

export function SocialEvents({ events, posts, userId }: SocialEventsProps) {
  const { toast } = useToast();
  const [newPost, setNewPost] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const handlePostSubmit = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPost,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      toast({
        title: 'Post Created',
        description: 'Your post has been shared successfully!',
      });

      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEventRegistration = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to register for event');
      }

      toast({
        title: 'Registration Successful',
        description: 'You have been registered for the event!',
      });

      setSelectedEvent(null);
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: 'Error',
        description: 'Failed to register for event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Events Section */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Upcoming Events</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="p-4">
              {event.imageUrl && (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="mb-4 h-48 w-full rounded-md object-cover"
                />
              )}
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <p className="mb-2 text-sm text-muted-foreground">{event.description}</p>
              <div className="space-y-2 text-sm">
                <p>📅 {event.date.toLocaleDateString()}</p>
                <p>📍 {event.location}</p>
                <p>
                  👥 {event.currentAttendees}/{event.maxAttendees} attending
                </p>
              </div>
              <Button
                className="mt-4 w-full"
                disabled={event.currentAttendees >= event.maxAttendees}
                onClick={() => handleEventRegistration(event.id)}
              >
                {event.currentAttendees >= event.maxAttendees ? 'Event Full' : 'Register Now'}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Social Feed Section */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Community Feed</h2>
        <Card className="mb-6 p-4">
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your thoughts with the community..."
            className="mb-4"
          />
          <Button onClick={handlePostSubmit} disabled={!newPost.trim()}>
            Post
          </Button>
        </Card>

        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-4">
              <div className="flex items-start gap-4">
                {post.author.avatar && (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{post.author.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {post.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mb-4 text-sm">{post.content}</p>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post content"
                      className="mb-4 w-full rounded-md"
                    />
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button className="flex items-center gap-1">❤️ {post.likes}</button>
                    <button className="flex items-center gap-1">💬 {post.comments}</button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
