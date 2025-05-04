import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

import { AvailabilityService } from './availability-service';

export class WebSocketService {
  private static instance: WebSocketService;
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();

  private constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
  }

  public static getInstance(server?: Server): WebSocketService {
    if (!WebSocketService.instance && server) {
      WebSocketService.instance = new WebSocketService(server);
    }
    return WebSocketService.instance;
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = Math.random().toString(36).substring(7);
      this.clients.set(clientId, ws);

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(data, clientId);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
      });
    });
  }

  private handleMessage(data: any, clientId: string) {
    switch (data.type) {
      case 'subscribe':
        this.handleSubscribe(data, clientId);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(data, clientId);
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  }

  private handleSubscribe(data: any, clientId: string) {
    const { providerId, date } = data;
    if (!providerId || !date) return;

    const availabilityService = AvailabilityService.getInstance();
    availabilityService.subscribe((updatedDate: string) => {
      if (updatedDate === date) {
        this.notifyClient(clientId, {
          type: 'availabilityUpdate',
          date: updatedDate,
          providerId,
        });
      }
    });
  }

  private handleUnsubscribe(data: any, clientId: string) {
    const { providerId, date } = data;
    if (!providerId || !date) return;

    const availabilityService = AvailabilityService.getInstance();
    availabilityService.unsubscribe(clientId);
  }

  private notifyClient(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  public broadcastToProvider(providerId: string, data: any) {
    this.clients.forEach((client, clientId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: 'providerUpdate',
            providerId,
            data,
          }),
        );
      }
    });
  }
}
