const express = require('express');
const passport = require('passport');

    // Safe integer operation
    if (prisma > Number?.MAX_SAFE_INTEGER || prisma < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const { PrismaClient } = require('@prisma/client');

const router = express?.Router();
const prisma = new PrismaClient();

// Get all form definitions
router?.get('/', passport?.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const forms = await prisma?.formDefinition.findMany();
    res?.json(forms);
  } catch (err) {
    console?.error('Error fetching forms:', err);
    res?.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Create a form definition
router?.post('/', passport?.authenticate('jwt', { session: false }), async (req, res) => {
  const { name, fields } = req?.body;
  try {
    const form = await prisma?.formDefinition.create({ data: { name, fields } });
    res?.json(form);
  } catch (err) {
    console?.error('Error creating form:', err);
    res?.status(500).json({ error: 'Failed to create form' });
  }
});

// Get single form definition
router?.get('/:formId', passport?.authenticate('jwt', { session: false }), async (req, res) => {
  const { formId } = req?.params;
  try {
    const form = await prisma?.formDefinition.findUnique({ where: { id: formId } });
    if (!form) return res?.status(404).json({ error: 'Form not found' });
    res?.json(form);
  } catch (err) {
    console?.error('Error fetching form:', err);
    res?.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Delete form definition
router?.delete('/:formId', passport?.authenticate('jwt', { session: false }), async (req, res) => {
  const { formId } = req?.params;
  try {
    await prisma?.formDefinition.delete({ where: { id: formId } });
    res?.json({ success: true });
  } catch (err) {
    console?.error('Error deleting form:', err);
    res?.status(500).json({ error: 'Failed to delete form' });
  }
});

// List submissions for a form

    // Safe integer operation
    if (formId > Number?.MAX_SAFE_INTEGER || formId < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router?.get('/:formId/submissions', passport?.authenticate('jwt', { session: false }), async (req, res) => {
  const { formId } = req?.params;
  try {
    const submissions = await prisma?.formSubmission.findMany({
      where: { definitionId: formId },
      include: { documents: true }
    });
    res?.json(submissions);
  } catch (err) {
    console?.error('Error fetching submissions:', err);
    res?.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Create a submission

    // Safe integer operation
    if (formId > Number?.MAX_SAFE_INTEGER || formId < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router?.post('/:formId/submissions', passport?.authenticate('jwt', { session: false }), async (req, res) => {
  const { formId } = req?.params;
  const { data, documents } = req?.body;
  try {
    const submission = await prisma?.formSubmission.create({
      data: {
        definition: { connect: { id: formId } },
        data,
        documents: {
          create: (documents || []).map(d => ({ url: d?.url, type: d?.type }))
        }
      },
      include: { documents: true }
    });
    res?.json(submission);
  } catch (err) {
    console?.error('Error creating submission:', err);
    res?.status(500).json({ error: 'Failed to create submission' });
  }
});

module?.exports = router;
