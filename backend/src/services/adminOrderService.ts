import prisma from '../db/client.js';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors.js';
import { AuditService } from './auditService.js';
import { sseService } from './sseService.js';

export interface ListAdminOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}

export class AdminOrderService {
  /**
   * Controlled state machine transitions dictionary
   */
  private static VALID_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'OUT_FOR_DELIVERY', 'CANCELLED'],
    SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED'],
    OUT_FOR_DELIVERY: ['DELIVERED'],
    DELIVERED: [], // Terminal state - immutable
    CANCELLED: [], // Terminal state - immutable
  };

  /**
   * Paginated order list with search, multi-filter & safety projection
   */
  static async listOrders(params: ListAdminOrdersParams) {
    const page = typeof params.page === 'number' ? params.page : parseInt(params.page as any || '1', 10);
    const limit = typeof params.limit === 'number' ? params.limit : parseInt(params.limit as any || '20', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params.paymentStatus && params.paymentStatus !== 'ALL') {
      where.paymentStatus = params.paymentStatus;
    }

    if (params.paymentMethod && params.paymentMethod !== 'ALL') {
      where.paymentMethod = params.paymentMethod;
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        where.createdAt.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (params.search) {
      where.OR = [
        { orderNumber: { contains: params.search, mode: 'insensitive' } },
        { shippingAddressSnapshot: { contains: params.search, mode: 'insensitive' } },
        { user: { name: { contains: params.search, mode: 'insensitive' } } },
        { user: { email: { contains: params.search, mode: 'insensitive' } } },
        { user: { phone: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          items: true,
          payment: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const formattedOrders = orders.map((o) => {
      let parsedAddress = null;
      try {
        parsedAddress = JSON.parse(o.shippingAddressSnapshot);
      } catch {
        parsedAddress = null;
      }

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        discount: o.discount,
        tax: o.tax,
        total: o.total,
        itemCount: o.items.length,
        user: o.user,
        shippingAddress: parsedAddress,
        internalNotes: (o as any).internalNotes ?? null,
      };
    });

    return {
      data: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get single order details for admin with historical snapshots & payment details
   */
  static async getOrder(orderNumber: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, images: { take: 1 } },
            },
          },
        },
        payment: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    let shippingAddress = null;
    try {
      shippingAddress = JSON.parse(order.shippingAddressSnapshot);
    } catch {
      shippingAddress = null;
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      tax: order.tax,
      total: order.total,
      idempotencyKey: order.idempotencyKey,
      internalNotes: (order as any).internalNotes ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: order.user,
      shippingAddress,
      items: order.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productNameSnapshot: i.productNameSnapshot,
        priceSnapshot: i.priceSnapshot,
        quantity: i.quantity,
        subtotal: i.subtotal,
        currentProduct: i.product
          ? {
              id: i.product.id,
              name: i.product.name,
              sku: i.product.sku,
              image: i.product.images[0]?.url || null,
            }
          : null,
      })),
      payment: order.payment,
      statusHistory: order.statusHistory,
    };
  }

  /**
   * Controlled Order Status Transition with Inventory Release & Audit Log
   */
  static async updateOrderStatus(
    adminId: string,
    orderNumber: string,
    nextStatus: string,
    note?: string,
    internalNotes?: string,
    ipAddress?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const currentStatus = order.status;

    if (currentStatus === nextStatus) {
      return this.getOrder(orderNumber);
    }

    // Enforce terminal immutability
    if (currentStatus === 'DELIVERED') {
      throw new ConflictError('Delivered orders are immutable and cannot change status');
    }
    if (currentStatus === 'CANCELLED') {
      throw new ConflictError('Cancelled orders are terminal and cannot be reopened');
    }

    // Validate state machine transition
    const allowed = this.VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestError(
        `Invalid status transition from "${currentStatus}" to "${nextStatus}". Allowed transitions: ${allowed.join(', ') || 'None'}`
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update Order record
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: nextStatus,
          ...(internalNotes !== undefined ? { internalNotes } : {}),
        },
      });

      // 2. Add Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: nextStatus,
          note: note || `Status updated to ${nextStatus} by Admin`,
          changedBy: `ADMIN_${adminId}`,
        },
      });

      // 3. Handle Inventory Release if order is CANCELLED
      if (nextStatus === 'CANCELLED') {
        const txAny: any = tx;
        for (const item of order.items) {
          // Check if stock was previously deducted or reserved
          const priorSaleTx = await txAny.inventoryTransaction.findFirst({
            where: {
              orderId: order.id,
              productId: item.productId,
              type: { in: ['SALE', 'RESERVE'] },
            },
          });

          if (priorSaleTx) {
            // Check if already released
            const priorReleaseTx = await txAny.inventoryTransaction.findFirst({
              where: {
                orderId: order.id,
                productId: item.productId,
                type: 'RELEASE',
              },
            });

            if (!priorReleaseTx) {
              await txAny.inventoryTransaction.create({
                data: {
                  orderId: order.id,
                  productId: item.productId,
                  type: 'RELEASE',
                  quantity: item.quantity,
                  reason: `Order ${order.orderNumber} cancelled by Admin`,
                },
              });

              // Restore stock
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stockQuantity: { increment: item.quantity },
                },
              });
            }
          }
        }
      }
    });

    // Non-blocking background Audit Log
    AuditService.log({
      adminId,
      action: nextStatus === 'CANCELLED' ? 'ORDER_CANCELLED' : 'ORDER_STATUS_UPDATED',
      entity: 'Order',
      entityId: order.id,
      metadata: {
        orderNumber: order.orderNumber,
        oldStatus: currentStatus,
        newStatus: nextStatus,
        note,
        internalNotes,
      },
      ipAddress,
    }).catch((err) => console.error('Audit log background error:', err));

    const updatedOrder = await this.getOrder(orderNumber);

    // Broadcast SSE real-time event ONLY AFTER DB commit completes
    sseService.notifyOrderStatusUpdated(
      orderNumber,
      nextStatus,
      order.userId,
      updatedOrder.statusHistory?.[0]
    );

    return updatedOrder;
  }

  /**
   * Controlled COD Payment Collection
   */
  static async collectCodPayment(adminId: string, orderNumber: string, ipAddress?: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.paymentMethod !== 'COD') {
      throw new BadRequestError('COD payment collection endpoint is only valid for Cash on Delivery orders');
    }

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestError('COD payment for this order has already been collected');
    }

    await prisma.$transaction(async (tx) => {
      const txAny: any = tx;
      await txAny.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          provider: 'COD',
          amount: order.total,
          status: 'PAID',
        },
        update: {
          status: 'PAID',
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: order.status,
          note: 'COD cash payment collected upon delivery',
          changedBy: `ADMIN_${adminId}`,
        },
      });
    });

    await AuditService.log({
      adminId,
      action: 'COD_PAYMENT_COLLECTED',
      entity: 'Order',
      entityId: order.id,
      metadata: {
        orderNumber: order.orderNumber,
        totalCollected: order.total,
      },
      ipAddress,
    });

    return this.getOrder(orderNumber);
  }

  /**
   * Update internal admin notes
   */
  static async updateInternalNotes(
    adminId: string,
    orderNumber: string,
    internalNotes: string,
    ipAddress?: string
  ) {
    const order = await prisma.order.findUnique({ where: { orderNumber } });
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { internalNotes } as any,
    });

    await AuditService.log({
      adminId,
      action: 'ORDER_NOTES_UPDATED',
      entity: 'Order',
      entityId: order.id,
      metadata: { orderNumber, internalNotes },
      ipAddress,
    });

    return this.getOrder(orderNumber);
  }
}
