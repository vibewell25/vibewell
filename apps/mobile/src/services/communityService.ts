import axios from 'axios';

    import { Post, Comment, CommunityEvent, Thread, ThreadPost } from '@/types/community';

    const API_URL = process.env.REACT_APP_API_URL || 'https://api.vibewell.com/v1';

export const communityApi = {
  getPosts: async (): Promise<Post[]> => {
    const res = await axios.get(`${API_URL}/posts`);
    return res.data;
getPostById: async (id: string): Promise<Post> => {
    const res = await axios.get(`${API_URL}/posts/${id}`);
    return res.data;
createPost: async (content: string): Promise<Post> => {
    const res = await axios.post(`${API_URL}/posts`, { content });
    return res.data;
updatePost: async (id: string, data: { content: string }): Promise<Post> => {
    const res = await axios.put(`${API_URL}/posts/${id}`, data);
    return res.data;
deletePost: async (id: string): Promise<{ success: boolean }> => {
    const res = await axios.delete(`${API_URL}/posts/${id}`);
    return res.data;
getComments: async (postId: string): Promise<Comment[]> => {
    const res = await axios.get(`${API_URL}/comments?postId=${postId}`);
    return res.data;
addComment: async (postId: string, content: string): Promise<Comment> => {
    const res = await axios.post(`${API_URL}/comments`, { postId, content });
    return res.data;
getEvents: async (): Promise<CommunityEvent[]> => {
    const res = await axios.get(`${API_URL}/events`);
    return res.data;
getEventById: async (id: string): Promise<CommunityEvent> => {
    const res = await axios.get(`${API_URL}/events/${id}`);
    return res.data;
createEvent: async (
    eventData: Omit<CommunityEvent, 'id' | 'createdAt'>
  ): Promise<CommunityEvent> => {
    const res = await axios.post(`${API_URL}/events`, eventData);
    return res.data;
updateEvent: async (
    id: string,
    data: Partial<Omit<CommunityEvent, 'id' | 'createdAt'>>
  ): Promise<CommunityEvent> => {
    const res = await axios.put(`${API_URL}/events/${id}`, data);
    return res.data;
deleteEvent: async (id: string): Promise<{ success: boolean }> => {
    const res = await axios.delete(`${API_URL}/events/${id}`);
    return res.data;
getThreads: async (): Promise<Thread[]> => {
    const res = await axios.get(`${API_URL}/threads`);
    return res.data;
getThreadById: async (id: string): Promise<Thread> => {
    const res = await axios.get(`${API_URL}/threads/${id}`);
    return res.data;
createThread: async (title: string): Promise<Thread> => {
    const res = await axios.post(`${API_URL}/threads`, { title });
    return res.data;
updateThread: async (id: string, data: { title: string }): Promise<Thread> => {
    const res = await axios.put(`${API_URL}/threads/${id}`, data);
    return res.data;
deleteThread: async (id: string): Promise<{ success: boolean }> => {
    const res = await axios.delete(`${API_URL}/threads/${id}`);
    return res.data;
getThreadPosts: async (threadId: string): Promise<ThreadPost[]> => {
    const res = await axios.get(`${API_URL}/threads/${threadId}/posts`);
    return res.data;
addThreadPost: async (threadId: string, content: string): Promise<ThreadPost> => {
    const res = await axios.post(`${API_URL}/threads/${threadId}/posts`, { content });
    return res.data;
export default communityApi;
