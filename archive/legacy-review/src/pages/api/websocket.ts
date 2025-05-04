import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';

import { NextApiResponse } from '@/types/api';

import { webSocketRateLimiter } from '@/lib/rate-limiter';

import { logger } from '@/lib/logger';

export {};

export default async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); handler(
  req: NextApiRequest,
  res: NextApiResponse & { socket: { server: NetServer } },
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }


  // Get server-sent events headers
  if (res.socket.server.io) {
    logger.debug('Socket is already running, reusing existing instance');
    return res.end();
  }

  try {
    // Create a new Socket.IO server
    const io = new ServerIO(res.socket.server, {

      path: '/api/socket',
      addTrailingSlash: false,
      transports: ['websocket', 'polling'],
      cors: {
        origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Set up socket.io server with rate limiting
    io.use(async (socket, next) => {
      try {

        const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
        const clientId = socket.id;
        const canConnect = await webSocketRateLimiter.canConnect(String(ip));

        if (!canConnect) {
          logger.warn(`WebSocket connection rejected due to rate limit: ${ip}`, 'websocket', {
            ip,
            clientId,
          });
          return next(new Error('Rate limit exceeded. Please try again later.'));
        }

        // Register the connection
        webSocketRateLimiter.registerConnection(String(ip), clientId);

        // Continue with connection
        next();
      } catch (error) {
        logger.error('Error in WebSocket middleware', 'websocket', { error });
        next(new Error('Internal server error'));
      }
    });

    // Connection event listener
    io.on('connection', (socket) => {

      const ip = String(socket.handshake.headers['x-forwarded-for'] || socket.handshake.address);
      const clientId = socket.id;

      logger.info(`WebSocket client connected: ${clientId}`, 'websocket', {
        ip,
        clientId,
      });

      // Message rate limiting
      socket.use(async ([event, ...args], next) => {
        try {
          const messageSize = JSON.stringify(args).length;
          const canSendMessage = await webSocketRateLimiter.canSendMessage(
            ip,
            clientId,
            messageSize,
          );

          if (!canSendMessage) {
            logger.warn(`WebSocket message blocked due to rate limit: ${clientId}`, 'websocket', {
              ip,
              clientId,
              event,
              size: messageSize,
            });
            return next(new Error('Message rate limit exceeded'));
          }

          next();
        } catch (error) {
          logger.error('Error in WebSocket message middleware', 'websocket', { error });
          next(new Error('Internal server error'));
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected: ${clientId}`, 'websocket', {
          ip,
          clientId,
        });

        // Unregister connection
        webSocketRateLimiter.unregisterConnection(ip, clientId);
      });

      // Custom event handlers
      socket.on('message', (data) => {
        // Process message and broadcast to appropriate recipients
        socket.emit('message_received', { id: Date.now(), data });
      });
    });

    // Save the io instance on the server
    res.socket.server.io = io;

    logger.info('WebSocket server initialized', 'websocket');
  } catch (error) {
    logger.error('Failed to initialize WebSocket server', 'websocket', { error });
    return res.status(500).json({ error: 'Failed to initialize WebSocket server' });
  }

  res.end();
}
