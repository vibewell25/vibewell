'use client';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { useParams, useRouter } from 'next/navigation';
;
;
;
import Link from 'next/link';
import { useAuth } from '@/contexts/clerk-auth-context';
import { ContentProgress } from '@/types/progress';
import { ContentTypeSelector, type ContentType } from '@/components/wellness/ContentTypeSelector';
import { WellnessContentModal } from '@/components/wellness/WellnessContentModal';
// Dummy data for the content
const getContentData = (id: string, category: string) => {
  // This would be fetched from an API in a real app
  const contentMap: Record<string, any> = {
    '1': {
      id: '1',
      title: 'Introduction to Meditation',
      description: 'A beginner-friendly guide to starting a meditation practice.',
      category: 'mindfulness',
      duration: '15 mins',
      level: 'beginner',
      image: '/placeholder.png',
      tags: ['meditation', 'mindfulness', 'beginner'],
      contentType: 'video' as ContentType,
      videoUrl: 'https://example.com/videos/intro-meditation.mp4',
      createdBy: 'Sarah Johnson',
      createdAt: '2023-05-15',
      content: `
        <h2>Getting Started with Meditation</h2>
        <p>Meditation is a practice that has been around for thousands of years. It's a technique used to train attention and awareness, and achieve a mentally clear and emotionally calm state.</p>
        <h3>Benefits of Meditation</h3>
        <ul>
          <li>Reduced stress and anxiety</li>
          <li>Improved focus and concentration</li>
          <li>Better sleep quality</li>
          <li>Enhanced self-awareness</li>
          <li>Lower blood pressure</li>
        </ul>
        <h3>Basic Meditation Technique</h3>
        <p>Find a quiet and comfortable place to sit. You can sit on a chair, cushion, or yoga mat. Keep your back straight but not stiff.</p>
        <p>Close your eyes and focus on your breath. Notice the sensation of air moving in and out of your body.</p>
        <p>When your attention wanders, gently bring it back to your breath. Don't judge yourself for losing focus - this is normal and part of the practice.</p>
        <h3>Start Small</h3>
        <p>Begin with just 5 minutes a day. As you get more comfortable with the practice, you can gradually increase the duration.</p>
        <p>Remember that meditation is a skill that develops over time. Be patient and consistent with your practice.</p>
      `,
    },
    '2': {
      id: '2',
      title: 'Morning Yoga Flow',
      description: 'Start your day with energizing yoga poses to awaken the body.',
      category: 'yoga',
      duration: '20 mins',
      level: 'intermediate',
      image: '/placeholder.png',
      tags: ['yoga', 'morning routine', 'energy'],
      contentType: 'video' as ContentType,
      videoUrl: 'https://example.com/videos/morning-yoga.mp4',
      createdBy: 'Emma Chen',
      createdAt: '2023-06-10',
      content: `
        <h2>Morning Yoga Flow</h2>
        <p>This invigorating sequence will help you start your day with energy and focus. It's designed to awaken your body and mind, improve circulation, and boost your mood.</p>
        <h3>Preparation</h3>
        <p>Find a quiet space where you won't be disturbed. Use a yoga mat for comfort and stability. Wear comfortable clothing that allows for free movement.</p>
        <h3>The Sequence</h3>
        <ol>
          <li><strong>Child's Pose</strong> - Begin in this gentle resting pose to center yourself and connect with your breath. Hold for 1 minute.</li>
          <li><strong>Cat-Cow Stretch</strong> - Flow between these two poses to warm up your spine and core. Repeat 10 times.</li>
          <li><strong>Downward-Facing Dog</strong> - This foundational pose stretches and strengthens the entire body. Hold for 5 breaths.</li>
          <li><strong>Low Lunge</strong> - Step one foot forward between your hands, lowering your back knee for a deep hip flexor stretch. Hold each side for 3 breaths.</li>
          <li><strong>Sun Salutations</strong> - Complete 3 rounds of this classic flowing sequence to build heat in the body.</li>
          <li><strong>Warrior II</strong> - This powerful standing pose builds strength and focus. Hold each side for 5 breaths.</li>
          <li><strong>Triangle Pose</strong> - Extend and open the body while strengthening the legs. Hold each side for 3 breaths.</li>
          <li><strong>Seated Forward Fold</strong> - A calming pose that stretches the back of the body. Hold for 1 minute.</li>
          <li><strong>Final Relaxation</strong> - Lie flat on your back in Savasana to integrate the practice. Rest for 2-3 minutes.</li>
        </ol>
        <h3>Tips</h3>
        <p>Move with your breath, inhaling during expansive movements and exhaling during contractions or folds.</p>
        <p>Listen to your body and modify poses as needed. This is your practice!</p>
      `,
    },
    // Add more content as needed...
  };
  return contentMap[id] || null;
};
export default function ContentDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { id, category } = params as { id: string; category: string };
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ContentProgress | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [contentType, setContentType] = useState<ContentType>('video');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const contentData = getContentData(id, category);
      if (contentData) {
        setContent(contentData);
        setContentType(contentData.contentType);
      }
      setLoading(false);
    };
    if (id && category) {
      fetchContent();
    }
  }, [id, category]);
  // Simulate fetching user's progress data
  useEffect(() => {
    if (content && user) {
      // In a real app, this would be fetched from an API
      // Simulating that this content was started but not completed
      const userProgress: ContentProgress = {
        contentId: content.id,
        contentType: content.contentType,
        lastPosition: 180, // 3 minutes in
        completed: false,
      };
      setProgress(userProgress);
    }
  }, [content, user]);
  // Handle play/pause
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would control the actual video/audio player
    console.log(isPlaying ? 'Pausing content' : 'Playing content');
  };
  // Mark content as completed
  const markAsCompleted = () => {
    if (!progress) return;
    // Update progress
    const updatedProgress: ContentProgress = {
      ...progress,
      completed: true,
      completedDate: new Date().toISOString(),
    };
    setProgress(updatedProgress);
    // In a real app, this would be sent to an API
    console.log('Content marked as completed:', updatedProgress);
  };
  // Handle saving/bookmarking
  const toggleSave = () => {
    setIsBookmarked(!isBookmarked);
    // In a real app, this would be sent to an API
    console.log(isBookmarked ? 'Content removed from saved items' : 'Content saved');
  };
  // Handle liking
  const toggleLike = () => {
    setIsLiked(!isLiked);
    // In a real app, this would be sent to an API
    console.log(isLiked ? 'Content unliked' : 'Content liked');
  };
  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!progress || !content) return 0;
    if (progress.completed) return 100;
    if (progress.lastPosition) {
      // Convert duration string (e.g., "15 mins") to seconds
      const durationMatch = content.duration.match(/(\d+)/);
      if (durationMatch) {
        const durationMinutes = parseInt(durationMatch[1], 10);
        const durationSeconds = durationMinutes * 60;
        return Math.min(100, (progress.lastPosition / durationSeconds) * 100);
      }
    }
    return 0;
  };
  const handleEditContent = (updatedContent: any) => {
    import { updateWellnessContent } from "../../../../implementation-files/wellness-content-update";
import { Icons } from '@/components/icons';
    console.log('Updating content:', updatedContent);
    setIsEditModalOpen(false);
  };
  if (loading) {
    return (
      <Layout>
        <div className="container-app py-12">
          <div className="flex justify-center items-center h-[60vh]">
            <p className="text-muted-foreground">Loading content...</p>
          </div>
        </div>
      </Layout>
    );
  }
  if (!content) {
    return (
      <Layout>
        <div className="container-app py-12">
          <div className="flex flex-col justify-center items-center h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
            <p className="text-muted-foreground mb-6">The content you're looking for does not exist or has been removed.</p>
            <Link href="/wellness" className="btn-primary">
              Back to Wellness Library
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="container-app py-12">
        {/* Back button */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icons.ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="card">
              {/* Content header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
                <p className="text-muted-foreground">{content.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    {content.category.charAt(0).toUpperCase() + content.category.slice(1)}
                  </span>
                  <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                    {content.level.charAt(0).toUpperCase() + content.level.slice(1)}
                  </span>
                  <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full flex items-center">
                    <Icons.ClockIcon className="h-3 w-3 mr-1" />
                    {content.duration}
                  </span>
                </div>
                {/* Content Type Selector */}
                <div className="mt-4">
                  <ContentTypeSelector
                    value={contentType}
                    onChange={setContentType}
                    label="Content Type"
                  />
                </div>
              </div>
              {/* Content media */}
              <div className="aspect-video bg-muted rounded-lg mb-6 relative">
                {/* This would be replaced with an actual video/audio player in a real app */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-muted-foreground mb-4">Content Preview</p>
                  {/* Play/Pause Button */}
                  <button 
                    className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? (
                      <Icons.PauseIcon className="h-8 w-8" />
                    ) : (
                      <Icons.PlayIcon className="h-8 w-8" />
                    )}
                  </button>
                </div>
                {/* Progress bar */}
                {progress && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                )}
              </div>
              {/* Action buttons */}
              <div className="flex justify-between mb-6">
                <div className="flex gap-4">
                  <button 
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={toggleLike}
                  >
                    {isLiked ? (
                      <Icons.HeartIconSolid className="h-5 w-5 text-red-500" />
                    ) : (
                      <Icons.HeartIcon className="h-5 w-5" />
                    )}
                    <span>{isLiked ? 'Liked' : 'Like'}</span>
                  </button>
                  <button 
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={toggleSave}
                  >
                    {isBookmarked ? (
                      <Icons.BookmarkIconSolid className="h-5 w-5 text-primary" />
                    ) : (
                      <Icons.BookmarkIcon className="h-5 w-5" />
                    )}
                    <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                  </button>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Icons.ShareIcon className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
                {/* Complete button */}
                {progress && !progress.completed && (
                  <button 
                    className="btn-primary text-sm flex items-center gap-1"
                    onClick={markAsCompleted}
                  >
                    <Icons.CheckIcon className="h-4 w-4" />
                    Mark Complete
                  </button>
                )}
                {/* Completed badge */}
                {progress && progress.completed && (
                  <div className="flex items-center text-sm text-green-500">
                    <Icons.CheckIcon className="h-5 w-5 mr-1" />
                    Completed
                  </div>
                )}
              </div>
              {/* Content */}
              <div 
                className="prose prose-sm dark:prose-invert max-w-none" 
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
              {/* Tags */}
              {content.tags && content.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-sm font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.tags.map((tag: string) => (
                      <Link 
                        key={tag} 
                        href={`/wellness?tag=${tag}`} 
                        className="bg-muted hover:bg-muted-foreground/20 text-xs px-2 py-1 rounded-full transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {/* Creator info */}
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-sm font-medium mb-2">Created by</h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3">
                    <span className="text-xs text-muted-foreground">Avatar</span>
                  </div>
                  <div>
                    <div className="font-medium">{content.createdBy}</div>
                    <div className="text-xs text-muted-foreground">
                      Published on {new Date(content.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Your Progress</h2>
              {!user ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Sign in to track your progress
                  </p>
                  <Link href="/auth/signin" className="btn-primary">Sign In</Link>
                </div>
              ) : !progress ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    No progress data available
                  </p>
                </div>
              ) : (
                <div>
                  {/* Progress visualization */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm font-medium">
                        {Math.round(getProgressPercentage())}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${getProgressPercentage()}%` }}
                      />
                    </div>
                  </div>
                  {/* Status */}
                  <div className="py-2 px-3 bg-muted rounded-md text-sm mb-4">
                    {progress.completed ? (
                      <div className="flex items-center text-green-500">
                        <Icons.CheckIcon className="h-5 w-5 mr-2" />
                        <div>
                          <p>Completed</p>
                          {progress.completedDate && (
                            <p className="text-xs text-muted-foreground">
                              on {new Date(progress.completedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : progress.lastPosition ? (
                      <div className="flex items-center">
                        <Icons.ChartBarIcon className="h-5 w-5 mr-2 text-primary" />
                        <div>
                          <p>In Progress</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.floor(progress.lastPosition / 60)}:{(progress.lastPosition % 60).toString().padStart(2, '0')} watched
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Icons.PlayIcon className="h-5 w-5 mr-2 text-primary" />
                        <p>Not started yet</p>
                      </div>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="space-y-2">
                    {!progress.completed && (
                      <button 
                        className="btn-primary w-full flex items-center justify-center gap-1"
                        onClick={markAsCompleted}
                      >
                        <Icons.CheckIcon className="h-4 w-4" />
                        Mark as Completed
                      </button>
                    )}
                    <Link 
                      href="/wellness/progress" 
                      className="btn-secondary w-full flex items-center justify-center gap-1"
                    >
                      <Icons.ChartBarIcon className="h-4 w-4" />
                      View All Progress
                    </Link>
                  </div>
                </div>
              )}
            </div>
            {/* Related Content */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Related Content</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-16 h-12 bg-muted rounded flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium hover:text-primary">
                      <Link href={`/wellness/${content.category}/3`}>
                        Advanced Meditation Techniques
                      </Link>
                    </h3>
                    <p className="text-xs text-muted-foreground">12 mins</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-16 h-12 bg-muted rounded flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium hover:text-primary">
                      <Link href={`/wellness/${content.category}/4`}>
                        Breathing Exercises for Focus
                      </Link>
                    </h3>
                    <p className="text-xs text-muted-foreground">8 mins</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-16 h-12 bg-muted rounded flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium hover:text-primary">
                      <Link href={`/wellness/${content.category}/5`}>
                        Mindfulness for Stress Relief
                      </Link>
                    </h3>
                    <p className="text-xs text-muted-foreground">15 mins</p>
                  </div>
                </div>
              </div>
              <Link 
                href="/wellness" 
                className="text-primary hover:text-primary-dark transition-colors mt-4 inline-block text-sm"
              >
                Explore more content
              </Link>
            </div>
          </div>
        </div>
      </div>
      <WellnessContentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditContent}
        content={content}
      />
    </Layout>
  );
} 