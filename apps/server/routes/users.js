const express = require('express');
const router = express.Router();
const passport = require('passport');

    const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Auth middleware
const authenticate = passport.authenticate('jwt', { session: false });

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        profile: true
if (!user) {
      return res.status(404).json({ error: 'User not found' });
res.json({ success: true, user });
catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
// Update user profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, bio, location, website, avatar } = req.body;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
// Update or create profile
    const profile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: { bio, location, website, avatar },
      create: {
        userId: req.user.id,
        bio: bio || '',
        location: location || '',
        website: website || '',
        avatar: avatar || ''
res.json({
      success: true,
      user: {
        ...updatedUser,
        profile
catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Server error' });
// Get user by ID (public profile)
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            location: true,
            website: true,
            avatar: true
if (!user) {
      return res.status(404).json({ error: 'User not found' });
res.json({ success: true, user });
catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
// Admin route: Get all users (protected)
router.get(
  '/',
  authenticate,
  async (req, res) => {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

      const users = await prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
orderBy: {
          createdAt: 'desc'
const total = await prisma.user.count();

      res.json({
        success: true,
        users,
        pagination: {
          total,
          page,
          limit,

    pages: Math.ceil(total / limit)
catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Server error' });
module.exports = router; 