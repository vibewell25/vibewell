const express = require('express');
const passport = require('passport');

    const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Equipment Items CRUD
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const items = await prisma.equipmentItem.findMany();
    res.json(items);
catch (err) {
    console.error('Error fetching equipment items:', err);
    res.status(500).json({ error: 'Failed to fetch equipment items' });
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.equipmentItem.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ error: 'Equipment not found' });
    res.json(item);
catch (err) {
    console.error('Error fetching equipment item:', err);
    res.status(500).json({ error: 'Failed to fetch equipment item' });
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { name, description, serialNumber } = req.body;
  try {
    const item = await prisma.equipmentItem.create({ data: { name, description, serialNumber } });
    res.json(item);
catch (err) {
    console.error('Error creating equipment item:', err);
    res.status(500).json({ error: 'Failed to create equipment item' });
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id } = req.params;
  const { name, description, serialNumber } = req.body;
  try {
    const item = await prisma.equipmentItem.update({ where: { id }, data: { name, description, serialNumber } });
    res.json(item);
catch (err) {
    console.error('Error updating equipment item:', err);
    res.status(500).json({ error: 'Failed to update equipment item' });
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.equipmentItem.delete({ where: { id } });
    res.json({ success: true });
catch (err) {
    console.error('Error deleting equipment item:', err);
    res.status(500).json({ error: 'Failed to delete equipment item' });
// Equipment Assignments

    router.get('/:id/assignments', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id } = req.params;
  try {
    const assignments = await prisma.equipmentAssignment.findMany({ where: { equipmentId: id } });
    res.json(assignments);
catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
router.post('/:id/assignments', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id } = req.params;
  const { assignedTo } = req.body;
  try {
    const assignment = await prisma.equipmentAssignment.create({ data: { equipmentId: id, assignedTo } });
    res.json(assignment);
catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ error: 'Failed to create assignment' });
router.put('/assignments/:assignmentId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { assignmentId } = req.params;
  const { returnedAt } = req.body;
  try {
    const assignment = await prisma.equipmentAssignment.update({ where: { id: assignmentId }, data: { returnedAt } });
    res.json(assignment);
catch (err) {
    console.error('Error updating assignment:', err);
    res.status(500).json({ error: 'Failed to update assignment' });
module.exports = router;
