import { Response } from 'express';

export interface SSEClient {
  id: string;
  res: Response;
  userId?: string;
  isAdmin: boolean;
}

export type EventType = 'ORDER_CREATED' | 'ORDER_STATUS_UPDATED' | 'INVENTORY_UPDATED';

class SSEService {
  private clients: Map<string, SSEClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Send keep-alive ping every 15 seconds to prevent proxy / Render idle timeouts
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 15000);
  }

  /**
   * Register a new client SSE connection (Customer or Admin)
   */
  public addClient(client: SSEClient): void {
    this.clients.set(client.id, client);
    
    // Send immediate connection acknowledgment event
    this.sendToClient(client, 'connected', {
      connected: true,
      timestamp: new Date().toISOString(),
      channel: client.isAdmin ? 'admin' : 'customer',
    });
  }

  /**
   * Remove client SSE connection upon disconnect or error
   */
  public removeClient(id: string): void {
    this.clients.delete(id);
  }

  /**
   * Send heartbeat comment ping to all connected clients
   */
  private sendHeartbeat(): void {
    this.clients.forEach((client) => {
      try {
        client.res.write(': ping\n\n');
      } catch {
        this.removeClient(client.id);
      }
    });
  }

  /**
   * Helper to write formatted SSE event frame to a client
   */
  private sendToClient(client: SSEClient, event: string, data: any): void {
    try {
      client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch {
      this.removeClient(client.id);
    }
  }

  /**
   * Broadcast ORDER_CREATED event to all authorized Admin streams
   */
  public notifyOrderCreated(order: any): void {
    const payload = {
      orderNumber: order.orderNumber,
      total: order.total,
      paymentMethod: order.paymentMethod,
      customerName: order.user?.name || 'Customer',
      createdAt: order.createdAt,
    };

    this.clients.forEach((client) => {
      if (client.isAdmin) {
        this.sendToClient(client, 'ORDER_CREATED', payload);
      }
    });
  }

  /**
   * Broadcast ORDER_STATUS_UPDATED event strictly to:
   * 1. The target Customer (matching userId)
   * 2. All active Admin streams
   */
  public notifyOrderStatusUpdated(orderNumber: string, status: string, targetUserId: string, historyItem?: any): void {
    const payload = {
      orderNumber,
      status,
      updatedAt: new Date().toISOString(),
      historyItem: historyItem || null,
    };

    this.clients.forEach((client) => {
      // 1. Send to target customer (Strict IDOR Security: Match userId only)
      if (!client.isAdmin && client.userId === targetUserId) {
        this.sendToClient(client, 'ORDER_STATUS_UPDATED', payload);
      }

      // 2. Send to all active admin streams
      if (client.isAdmin) {
        this.sendToClient(client, 'ORDER_STATUS_UPDATED', payload);
      }
    });
  }

  /**
   * Broadcast INVENTORY_UPDATED event to Admin streams
   */
  public notifyInventoryUpdated(productId: string, stockQuantity: number): void {
    const payload = { productId, stockQuantity, updatedAt: new Date().toISOString() };
    this.clients.forEach((client) => {
      if (client.isAdmin) {
        this.sendToClient(client, 'INVENTORY_UPDATED', payload);
      }
    });
  }
}

export const sseService = new SSEService();
