/**
 * WebSocket API endpoint with rate limiting
 * 
 * This API route handles WebSocket connections and implements rate limiting
 * to prevent abuse and ensure fair resource usage.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { parse } from 'cookie';
import { WebSocketRateLimiter } from '@/lib/websocket-rate-limiter';
import { logger } from '@/lib/logger';
import { authService } from '@/services/auth-service';
import { uniqueId } from '@/lib/utils';

// Socket.io types for Next.js API
export interface SocketNextApiResponse extends NextApiResponse {
  socket: {
    server: {
      io?: SocketIOServer;
    };
  };
}

// Initialize socket.io once
const initSocketIO = (res: SocketNextApiResponse) => {
  if (!res.socket.server.io) {
    logger.info('Initializing Socket.io server', 'websocket');
    const io = new SocketIOServer(res.socket.server);
    res.socket.server.io = io;
    
    // Create rate limiter instance
    const rateLimiter = new WebSocketRateLimiter();
    
    // Authentication and connection middleware
    io.use(async (socket, next) => {
      try {
        // Extract client IP
        const clientIp = socket.handshake.headers['x-forwarded-for'] as string || 
                        socket.handshake.address;
                        
        // Check if connection is allowed by rate limiter
        const canConnect = await rateLimiter.canConnect(clientIp);
        if (!canConnect) {
          logger.warn(`WebSocket connection rejected due to rate limiting`, 'websocket', {
            ip: logger['hashSensitiveData'](clientIp),
          });
          return next(new Error('Too many connections from this IP address'));
        }
        
        // Generate a unique connection ID
        const connectionId = uniqueId('ws_');
        socket.data.connectionId = connectionId;
        socket.data.ip = clientIp;
        
        // Register the connection with the rate limiter
        rateLimiter.registerConnection(clientIp, connectionId);
        
        // Attempt to authenticate the user
        const cookies = parse(socket.handshake.headers.cookie || '');
        const sessionToken = cookies['session-token'];
        
        if (sessionToken) {
          try {
            const user = await authService.validateSessionToken(sessionToken);
            if (user) {
              socket.data.user = {
                id: user.id,
                email: user.email,
                role: user.role
              };
              
              logger.debug(`Authenticated WebSocket connection: ${user.email}`, 'websocket', {
                connectionId,
                userId: user.id
              });
            }
          } catch (authError) {
            // Authentication failed, but we'll still allow the connection
            logger.debug(`Anonymous WebSocket connection`, 'websocket', { connectionId });
          }
        } else {
          logger.debug(`Anonymous WebSocket connection`, 'websocket', { connectionId });
        }
        
        next();
      } catch (error) {
        logger.error(`WebSocket middleware error: ${error}`, 'websocket', { error });
        next(new Error('Internal server error'));
      }
    });
    
    // Handle connections
    io.on('connection', (socket) => {
      const { connectionId, ip, user } = socket.data;
      
      logger.info(`WebSocket client connected`, 'websocket', {
        connectionId,
        ip: logger['hashSensitiveData'](ip),
        userId: user?.id
      });
      
      // Join appropriate rooms based on user role
      if (user) {
        socket.join(`user:${user.id}`);
        
        if (user.role === 'admin') {
          socket.join('admins');
        }
      }
      
      // Handle messages with rate limiting
      socket.on('message', async (data) => {
        try {
          const messageSize = JSON.stringify(data).length;
          
          // Apply rate limiting to message
          const canSendMessage = await rateLimiter.canSendMessage(ip, connectionId, messageSize);
          if (!canSendMessage) {
            socket.emit('error', {
              code: 'RATE_LIMITED',
              message: 'Message rate limit exceeded. Please slow down.'
            });
            return;
          }
          
          // Process the message
          // ...additional message handling logic would go here
          
          // Echo message back for demonstration
          socket.emit('message', {
            id: uniqueId('msg_'),
            timestamp: new Date().toISOString(),
            sender: user?.id || 'anonymous',
            content: data,
            acknowledged: true
          });
          
        } catch (error) {
          logger.error(`WebSocket message handler error: ${error}`, 'websocket', { error });
          
          socket.emit('error', {
            code: 'INTERNAL_ERROR',
            message: 'Failed to process message'
          });
        }
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        rateLimiter.unregisterConnection(ip, connectionId);
        
        logger.info(`WebSocket client disconnected`, 'websocket', {
          connectionId,
          ip: logger['hashSensitiveData'](ip),
          userId: user?.id
        });
      });
    });
  }
  
  return res.socket.server.io;
};

const handler = async (req: NextApiRequest, res: SocketNextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const io = initSocketIO(res);
      
      // Return a simple status for health checks
      res.status(200).json({ 
        status: 'ok',
        connections: io.engine.clientsCount,
        uptime: process.uptime()
      });
    } catch (error) {
      logger.error(`WebSocket API error: ${error}`, 'websocket', { error });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default handler; 