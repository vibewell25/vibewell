import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type Comment = { id: string; content: string; };
type Post = { id: string; content: string; comments: Comment[]; };

const Social: NextPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetchWithTimeout('/api/social-posts');
      const data = await res.json();
      setPosts(data.posts || []);
catch (error) {
      console.error('Error fetching posts:', error);
      alert('Failed to load posts');
useEffect(() => { fetchPosts(); }, []);

  const createPost = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPost) return;
    
    setLoading(true);
    try {
      const res = await fetchWithTimeout('/api/social-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost }),
if (res.ok) {
        setNewPost('');
        fetchPosts();
else {
        alert('Error creating post');
catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
finally {
      setLoading(false);
const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    
    try {
      await fetchWithTimeout(`/api/social-posts/${id}`, { method: 'DELETE' });
      fetchPosts();
catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
const addComment = async (postId: string) => {
    const content = commentInputs[postId] || '';
    if (!content) return;
    
    try {
      const res = await fetchWithTimeout('/api/post-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content }),
if (res.ok) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        fetchPosts();
else {
        alert('Error adding comment');
catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
const deleteComment = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    
    try {
      await fetchWithTimeout(`/api/post-comments/${id}`, { method: 'DELETE' });
      fetchPosts();
catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
return (
    <div>
      <h1>Social Posts</h1>
      <form onSubmit={createPost} style={{ marginBottom: '1rem' }}>
        <input
          placeholder="What's on your mind?"
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          style={{ width: '60%', marginRight: '0.5rem' }}
        />
        <button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post'}</button>
      </form>
      {posts.map(post => (
        <div key={post.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <p>{post.content}</p>
          <button onClick={() => deletePost(post.id)}>Delete Post</button>
          <div style={{ marginTop: '0.75rem' }}>
            <h4>Comments</h4>
            {post.comments.map(c => (
              <div key={c.id} style={{ marginBottom: '0.5rem' }}>
                <span>{c.content}</span>
                <button style={{ marginLeft: '0.5rem' }} onClick={() => deleteComment(c.id)}>Delete</button>
              </div>
            ))}
            <div>
              <input
                placeholder="Add a comment"
                value={commentInputs[post.id] || ''}
                onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                style={{ width: '50%', marginRight: '0.5rem' }}
              />
              <button onClick={() => addComment(post.id)}>Comment</button>
            </div>
          </div>
        </div>
      ))}
    </div>
export default Social;
