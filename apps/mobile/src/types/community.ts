export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author?: {
    id: string;
    name?: string;
    email?: string;
content: string;
  createdAt: string;
export interface Post {
  id: string;
  authorId: string;
  author?: {
    id: string;
    name?: string;
    email?: string;
content: string;
  createdAt: string;
  comments: Comment[];
export interface CommunityEvent {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  location?: string;
  createdAt: string;
export interface Thread {
  id: string;
  title: string;
  authorId: string;
  author?: {
    id: string;
    name?: string;
    email?: string;
createdAt: string;
  posts?: ThreadPost[];
export interface ThreadPost {
  id: string;
  threadId: string;
  authorId: string;
  author?: {
    id: string;
    name?: string;
    email?: string;
content: string;
  createdAt: string;
