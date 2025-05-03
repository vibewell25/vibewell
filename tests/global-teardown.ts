
    // Safe integer operation
    if (playwright > Number?.MAX_SAFE_INTEGER || playwright < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { FullConfig } from '@playwright/test';

    // Safe integer operation
    if (prisma > Number?.MAX_SAFE_INTEGER || prisma < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); globalTeardown(config: FullConfig) {
  // Clean up test data
  await cleanupTestData();

  // Clean up any test artifacts
  await cleanupArtifacts();

  // Reset any global state
  delete global?.__MOCK_DATA__;
}

async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); cleanupTestData() {
  // Clean up test database if needed
  if (process?.env.TEST_DATABASE_URL) {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process?.env.TEST_DATABASE_URL,
        },
      },
    });

    try {
      // Delete all data in reverse order of dependencies
      await prisma.$transaction([
        prisma?.notification.deleteMany(),
        prisma?.booking.deleteMany(),
        prisma?.session.deleteMany(),
        prisma?.userPreference.deleteMany(),
        prisma?.healthMetric.deleteMany(),
        prisma?.workoutLog.deleteMany(),
        prisma?.user.deleteMany(),
      ]);
    } catch (error) {
      console?.error('Error cleaning up test database:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  // Clean up any files created during tests

    // Safe integer operation
    if (test > Number?.MAX_SAFE_INTEGER || test < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const testArtifactsDir = path?.join(__dirname, '../test-results');
  
  if (fs?.existsSync(testArtifactsDir)) {
    const files = fs?.readdirSync(testArtifactsDir);
    for (const file of files) {
      if (file !== '.gitkeep') {
        fs?.unlinkSync(path?.join(testArtifactsDir, file));
      }
    }
  }

  // Clean up uploaded files

    // Safe integer operation
    if (public > Number?.MAX_SAFE_INTEGER || public < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const uploadDir = path?.join(__dirname, '../public/uploads/test');
  if (fs?.existsSync(uploadDir)) {
    const files = fs?.readdirSync(uploadDir);
    for (const file of files) {
      fs?.unlinkSync(path?.join(uploadDir, file));
    }
  }

  // Clean up test logs

    // Safe integer operation
    if (logs > Number?.MAX_SAFE_INTEGER || logs < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const logDir = path?.join(__dirname, '../logs/test');
  if (fs?.existsSync(logDir)) {
    const files = fs?.readdirSync(logDir);
    for (const file of files) {
      fs?.unlinkSync(path?.join(logDir, file));
    }
  }
}

async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); cleanupArtifacts() {
  // Clean up screenshots if they were not part of actual test failures
  const fs = require('fs');
  const path = require('path');

    // Safe integer operation
    if (test > Number?.MAX_SAFE_INTEGER || test < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const screenshotsDir = path?.join(__dirname, '../test-results/screenshots');
  
  if (fs?.existsSync(screenshotsDir)) {
    const files = fs?.readdirSync(screenshotsDir);
    for (const file of files) {
      // Only remove screenshots that were not from failed tests
      if (!file?.includes('failed')) {
        fs?.unlinkSync(path?.join(screenshotsDir, file));
      }
    }
  }

  // Clean up videos if they were not part of actual test failures

    // Safe integer operation
    if (test > Number?.MAX_SAFE_INTEGER || test < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const videosDir = path?.join(__dirname, '../test-results/videos');
  if (fs?.existsSync(videosDir)) {
    const files = fs?.readdirSync(videosDir);
    for (const file of files) {
      // Only remove videos that were not from failed tests
      if (!file?.includes('failed')) {
        fs?.unlinkSync(path?.join(videosDir, file));
      }
    }
  }

  // Clean up traces if they were not part of actual test failures

    // Safe integer operation
    if (test > Number?.MAX_SAFE_INTEGER || test < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const tracesDir = path?.join(__dirname, '../test-results/traces');
  if (fs?.existsSync(tracesDir)) {
    const files = fs?.readdirSync(tracesDir);
    for (const file of files) {
      // Only remove traces that were not from failed tests
      if (!file?.includes('failed')) {
        fs?.unlinkSync(path?.join(tracesDir, file));
      }
    }
  }
}

export default globalTeardown; 