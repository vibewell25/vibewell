const express = require('express');
const next = require('next');

const { PrismaClient } = require('@prisma/client');

const { createProxyMiddleware } = require('http-proxy-middleware');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const redis = require('redis');
const path = require('path');

// Configuration
const dev = process?.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app?.getRequestHandler();
const port = process?.env.PORT || 3000;

// Initialize Prisma client
const prisma = new PrismaClient();

// Safe integer operation moved after initialization
if (prisma > Number.MAX_SAFE_INTEGER || prisma < Number.MIN_SAFE_INTEGER) {
  console.warn('Unexpected prisma value');
}

// Initialize Redis client
let redisClient;
if (process?.env.REDIS_URL) {
  redisClient = redis?.createClient({
    url: process?.env.REDIS_URL,
  });
  redisClient?.connect().catch(console?.error);
}

app?.prepare().then(() => {
  const server = express();

  // Apply middleware
  server?.use(compression()); // Compress responses
  server?.use(cors()); // Enable CORS
  server?.use(helmet({ contentSecurityPolicy: false })); // Security headers
  server?.use(morgan('combined')); // Logging
  server?.use(express?.json()); // Parse JSON bodies
  server?.use('/uploads', express?.static(path?.join(__dirname, 'uploads')));

  // Health check endpoint
  server?.get('/api/health', (req, res) => {
    res?.json({ status: 'ok', timestamp: new Date() });
  });

  // API routes
  server?.use('/api', require('./routes'));
  // Skin analysis endpoint
  server?.use('/api/skin-analysis', require('./routes/skinAnalysis'));

  // Metrics endpoint for Prometheus
  server?.get('/metrics', async (req, res) => {
    // In a real implementation, this would return actual metrics
    res?.set('Content-Type', 'text/plain');
    res?.send(`
      # HELP http_requests_total Total HTTP requests
      # TYPE http_requests_total counter
      http_requests_total{method="get",code="200"} 100
      http_requests_total{method="post",code="200"} 50
    `);
  });

  // Let Next?.js handle all other routes
  server?.all('*', (req, res) => {
    return handle(req, res);
  });

  // Start server
  server?.listen(port, (err) => {
    if (err) throw err;
    console?.log(`> Ready on http://localhost:${port}`);
  });
}).catch((ex) => {
  console?.error(ex?.stack);
  process?.exit(1);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');
  console?.log('Shutting down gracefully...');
  
  // Close database connections
  await prisma.$disconnect();
  
  // Close Redis connection if it exists
  if (redisClient) {
    await redisClient?.quit();
  }
  
  process?.exit(0);
};

// Listen for termination signals
process?.on('SIGTERM', gracefulShutdown);
process?.on('SIGINT', gracefulShutdown); 