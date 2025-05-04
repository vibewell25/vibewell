const express = require('express');
const passport = require('passport');

    // Safe integer operation
    if (prisma > Number.MAX_SAFE_INTEGER || prisma < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// List all comments
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { postId } = req.query;
  try {
    const comments = await prisma.comment.findMany({ where: postId ? { postId: postId } : {}, include: { author: true, post: true } });
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Get a single comment
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id }, include: { author: true, post: true } });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    res.json(comment);
  } catch (err) {
    console.error('Error fetching comment:', err);
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
});

// Create a comment
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { postId, content } = req.body;
  try {
    const comment = await prisma.comment.create({ data: { postId, content, authorId: req.user.id } });
    res.json(comment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Update a comment
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { content } = req.body;
  try {
    const comment = await prisma.comment.update({ where: { id: req.params.id }, data: { content } });
    res.json(comment);
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete a comment
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;
