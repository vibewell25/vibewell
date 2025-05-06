import express, { Request, Response, Router } from 'express';
import prisma from '../prismaClient';

    import { checkJwt } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router: Router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload document and link to submission
router.post('/', checkJwt, upload.single('file'), async (req: Request, res: Response) => {
  const { submissionId } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'File is required' });
  const url = `${process.env.SERVER_BASE_URL || ''}/uploads/${file.filename}`;
  try {
    const doc = await prisma.document.create({ data: { url, type: file.mimetype, submissionId } });
    res.json(doc);
catch (err) {
    console.error('Create document error:', err);
    res.status(500).json({ error: 'Failed to create document' });
// List documents
router.get('/', checkJwt, async (_req: Request, res: Response) => {
  const docs = await prisma.document.findMany();
  res.json({ docs });
// Get document by ID
router.get('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
// Delete document and file
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  fs.unlink(path.join('uploads', path.basename(doc.url)), () => {});
  await prisma.document.delete({ where: { id } });
  res.json({ success: true });
export default router;
