import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';

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

  const handlePostSubmit = async () => {
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

  const handleEventRegistration = async (eventId: string) => {
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
        <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
            <Card key={event.id} className="p-4">
              {event.imageUrl && (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
              <div className="space-y-2 text-sm">
                <p>📅 {event.date.toLocaleDateString()}</p>
                <p>📍 {event.location}</p>
                <p>
                  👥 {event.currentAttendees}/{event.maxAttendees} attending
                </p>
              </div>
              <Button
                className="w-full mt-4"
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
        <h2 className="text-2xl font-semibold mb-4">Community Feed</h2>
        <Card className="p-4 mb-6">
          <Textarea
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="Share your thoughts with the community..."
            className="mb-4"
          />
          <Button onClick={handlePostSubmit} disabled={!newPost.trim()}>
            Post
          </Button>
        </Card>

        <div className="space-y-4">
          {posts.map(post => (
            <Card key={post.id} className="p-4">
              <div className="flex items-start gap-4">
                {post.author.avatar && (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{post.author.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {post.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm mb-4">{post.content}</p>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post content"
                      className="w-full rounded-md mb-4"
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
