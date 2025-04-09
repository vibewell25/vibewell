import { supabase } from '@/lib/supabase';
import { ReactionType } from '@/components/post-reaction';

export type PostUser = {
  id: string;
  name: string;
  avatar: string;
};

export type PostComment = {
  id: string;
  user: PostUser;
  content: string;
  createdAt: string;
};

export type Post = {
  id: number;
  user: PostUser;
  content: string;
  image: string | null;
  createdAt: string;
  reactions: {
    [key in ReactionType]?: number;
  };
  comments: PostComment[];
};

// Transform data from Supabase to our frontend model
function transformPost(post: any): Post {
  return {
    id: post.id,
    user: {
      id: post.user_id,
      name: post.user?.full_name || 'Anonymous',
      avatar: post.user?.avatar_url || '/avatar-placeholder.png',
    },
    content: post.content,
    image: post.image_url,
    createdAt: post.created_at,
    reactions: post.reactions || {
      '❤️': 0,
      '👍': 0,
      '😂': 0,
      '😮': 0,
      '😢': 0,
      '😡': 0
    },
    comments: (post.comments || []).map((comment: any) => ({
      id: comment.id,
      user: {
        id: comment.user_id,
        name: comment.user?.full_name || 'Anonymous',
        avatar: comment.user?.avatar_url || '/avatar-placeholder.png',
      },
      content: comment.content,
      createdAt: comment.created_at,
    })),
  };
}

export async function getPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:profiles(*),
        comments:post_comments(
          *,
          user:profiles(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    return (data || []).map(transformPost);
  } catch (error) {
    console.error('Error in getPosts:', error);
    return [];
  }
}

export async function createPost(userId: string, content: string, imageUrl?: string): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        content,
        image_url: imageUrl || null,
        reactions: {
          '❤️': 0,
          '👍': 0,
          '😂': 0,
          '😮': 0,
          '😢': 0,
          '😡': 0
        },
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        user:profiles(*),
        comments:post_comments(
          *,
          user:profiles(*)
        )
      `)
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return null;
    }

    return transformPost(data);
  } catch (error) {
    console.error('Error in createPost:', error);
    return null;
  }
}

export async function addComment(userId: string, postId: number, content: string): Promise<PostComment | null> {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        user_id: userId,
        post_id: postId,
        content,
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        user:profiles(*)
      `)
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }

    return {
      id: data.id,
      user: {
        id: data.user_id,
        name: data.user?.full_name || 'Anonymous',
        avatar: data.user?.avatar_url || '/avatar-placeholder.png',
      },
      content: data.content,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error in addComment:', error);
    return null;
  }
}

export async function addReaction(userId: string, postId: number, reactionType: ReactionType): Promise<boolean> {
  try {
    // First, get the current post to update its reactions
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('reactions, user_reactions')
      .eq('id', postId)
      .single();

    if (postError) {
      console.error('Error fetching post for reaction:', postError);
      return false;
    }

    // Check if user has already reacted
    const userReactions = post.user_reactions || {};
    const previousReaction = userReactions[userId];

    // Update reactions count
    const updatedReactions = { ...post.reactions };
    
    // If user had a previous reaction, decrement it
    if (previousReaction) {
      updatedReactions[previousReaction] = Math.max(0, updatedReactions[previousReaction] - 1);
    }
    
    // Increment the new reaction
    updatedReactions[reactionType] = (updatedReactions[reactionType] || 0) + 1;
    
    // Update user reactions mapping
    const updatedUserReactions = { ...userReactions, [userId]: reactionType };

    // Update the post
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        reactions: updatedReactions,
        user_reactions: updatedUserReactions
      })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating post reactions:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addReaction:', error);
    return false;
  }
}

export async function removeReaction(userId: string, postId: number): Promise<boolean> {
  try {
    // First, get the current post to update its reactions
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('reactions, user_reactions')
      .eq('id', postId)
      .single();

    if (postError) {
      console.error('Error fetching post for reaction removal:', postError);
      return false;
    }

    // Check if user has a reaction
    const userReactions = post.user_reactions || {};
    const previousReaction = userReactions[userId];

    if (!previousReaction) {
      return true; // Nothing to remove
    }

    // Update reactions count
    const updatedReactions = { ...post.reactions };
    updatedReactions[previousReaction] = Math.max(0, updatedReactions[previousReaction] - 1);
    
    // Remove user from reactions mapping
    const updatedUserReactions = { ...userReactions };
    delete updatedUserReactions[userId];

    // Update the post
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        reactions: updatedReactions,
        user_reactions: updatedUserReactions
      })
      .eq('id', postId);

    if (updateError) {
      console.error('Error removing post reaction:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in removeReaction:', error);
    return false;
  }
}

export async function savePost(userId: string, postId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_posts')
      .insert({
        user_id: userId,
        post_id: postId,
        saved_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving post:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in savePost:', error);
    return false;
  }
}

export async function unsavePost(userId: string, postId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) {
      console.error('Error unsaving post:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in unsavePost:', error);
    return false;
  }
}

export async function getSavedPosts(userId: string): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from('saved_posts')
      .select('post_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching saved posts:', error);
      return [];
    }

    return data.map(item => item.post_id);
  } catch (error) {
    console.error('Error in getSavedPosts:', error);
    return [];
  }
}

export async function getUserReactions(userId: string): Promise<{ [key: number]: ReactionType }> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, user_reactions')
      .not('user_reactions', 'is', null);

    if (error) {
      console.error('Error fetching user reactions:', error);
      return {};
    }

    const userReactions: { [key: number]: ReactionType } = {};
    
    data.forEach(post => {
      if (post.user_reactions && post.user_reactions[userId]) {
        userReactions[post.id] = post.user_reactions[userId];
      }
    });

    return userReactions;
  } catch (error) {
    console.error('Error in getUserReactions:', error);
    return {};
  }
} 