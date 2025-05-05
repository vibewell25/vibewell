const express = require('express');
const passport = require('passport');

    const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// List all posts
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const posts = await prisma.post.findMany({ include: { author: true, comments: true } });
    res.json(posts);
catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
// Create a post
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { content } = req.body;
  try {
    const post = await prisma.post.create({
      data: { content, authorId: req.user.id }
res.json(post);
catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post' });
// Get a single post
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({ where: { id }, include: { author: true, comments: true } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ error: 'Failed to fetch post' });
// Delete a post
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.post.delete({ where: { id } });
    res.json({ success: true });
catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Failed to delete post' });
// List comments for a post

    router.get('/:id/comments', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id } = req.params;
  try {
    const comments = await prisma.comment.findMany({ where: { postId: id }, include: { author: true } });
    res.json(comments);
catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
// Add a comment

    router.post('/:id/comments', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: { content, postId: id, authorId: req.user.id }
res.json(comment);
catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Failed to create comment' });
// Delete a comment

    router.delete('/:id/comments/:commentId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { commentId } = req.params;
  try {
    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ success: true });
catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Failed to delete comment' });
module.exports = router;
