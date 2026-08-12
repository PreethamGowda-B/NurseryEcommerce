import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { sseService } from '../services/sseService.js';

const router = Router();

/**
 * GET /api/sse/customer
 * Authenticated SSE stream for customer live order updates (strictly scoped to req.user.id)
 */
router.get('/customer', authenticate, (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Set SSE Headers for long-lived HTTP stream
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const clientId = `customer-${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  sseService.addClient({
    id: clientId,
    res,
    userId,
    isAdmin: false,
  });

  // Handle client disconnect
  req.on('close', () => {
    sseService.removeClient(clientId);
  });
});

/**
 * GET /api/sse/admin
 * Authenticated SSE stream for Super Admin real-time store monitoring
 */
router.get('/admin', authenticate, requireAdmin, (req: Request, res: Response) => {
  // Set SSE Headers for long-lived HTTP stream
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const clientId = `admin-${req.user?.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  sseService.addClient({
    id: clientId,
    res,
    userId: req.user?.id,
    isAdmin: true,
  });

  // Handle client disconnect
  req.on('close', () => {
    sseService.removeClient(clientId);
  });
});

export default router;
