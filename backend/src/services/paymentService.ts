import prisma from '../db/client.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { getRazorpayInstance, verifyRazorpaySignature, verifyRazorpayWebhookSignature } from '../lib/razorpay.js';

export interface VerifyPaymentParams {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export class PaymentService {
  /**
   * Create Razorpay Order with server-authoritative amount in paise
   */
  static async createRazorpayOrder(userId: string, orderNumber: string) {
    const order = await prisma.order.findFirst({
      where: { orderNumber, userId },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestError('This order has already been paid');
    }

    // Convert total from INR rupees to paise (integer arithmetic)
    const amountInPaise = Math.round(order.total * 100);
    const razorpay = getRazorpayInstance();

    let rzpOrderId = `rzp_order_mock_${Date.now()}`;

    if (razorpay) {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: order.orderNumber,
          notes: {
            userId: order.userId,
            orderNumber: order.orderNumber,
          },
        });
        rzpOrderId = rzpOrder.id;
      } catch (err) {
        console.warn('Razorpay API offline or test credentials, falling back to deterministic test order ID:', err);
      }
    }

    // Upsert Payment record
    await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        provider: 'RAZORPAY',
        providerOrderId: rzpOrderId,
        amount: order.total,
        status: 'PENDING',
      },
      update: {
        provider: 'RAZORPAY',
        providerOrderId: rzpOrderId,
        amount: order.total,
        status: 'PENDING',
      },
    });

    return {
      razorpayOrderId: rzpOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId12345',
      orderNumber: order.orderNumber,
    };
  }

  /**
   * Verify Razorpay Payment HMAC-SHA256 signature and update order status idempotently
   */
  static async verifyRazorpayPayment(userId: string, params: VerifyPaymentParams) {
    const { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

    const order = await prisma.order.findFirst({
      where: { orderNumber, userId },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // 1. Idempotency Check: if order is already PAID, return current state
    if (order.paymentStatus === 'PAID') {
      return {
        success: true,
        message: 'Order already paid',
        order,
      };
    }

    // 2. Verify HMAC-SHA256 Signature
    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      throw new BadRequestError('Invalid payment signature');
    }

    // 3. Transactional Update & Idempotent Stock Handling
    return prisma.$transaction(async (tx) => {
      const txAny: any = tx;

      // Update Payment
      await txAny.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          provider: 'RAZORPAY',
          providerOrderId: razorpayOrderId,
          providerPaymentId: razorpayPaymentId,
          razorpaySignature,
          amount: order.total,
          status: 'PAID',
        },
        update: {
          providerPaymentId: razorpayPaymentId,
          razorpaySignature,
          status: 'PAID',
        },
      });

      // Update Order
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          paymentMethod: 'RAZORPAY',
        },
        include: {
          items: true,
        },
      });

      // Create OrderStatusHistory
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'CONFIRMED',
          note: 'Payment verified successfully via Razorpay HMAC signature',
          changedBy: 'RAZORPAY_VERIFY',
        },
      });

      // Idempotent Inventory Deduction
      for (const item of order.items) {
        const existingTx = await txAny.inventoryTransaction.findFirst({
          where: {
            orderId: order.id,
            productId: item.productId,
            type: 'SALE',
          },
        });

        if (!existingTx) {
          const updatedCount = await tx.product.updateMany({
            where: {
              id: item.productId,
              stockQuantity: { gte: item.quantity },
            },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });

          if (updatedCount.count === 0) {
            throw new BadRequestError(`Insufficient stock for product "${item.productNameSnapshot}"`);
          }

          await txAny.inventoryTransaction.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              type: 'SALE',
              quantity: item.quantity,
            },
          });
        }
      }

      return {
        success: true,
        message: 'Payment verified and order confirmed',
        order: updatedOrder,
      };
    });
  }

  /**
   * Confirm Cash on Delivery (COD) Order
   */
  static async confirmCodOrder(userId: string, orderNumber: string) {
    const order = await prisma.order.findFirst({
      where: { orderNumber, userId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return prisma.$transaction(async (tx) => {
      const txAny: any = tx;

      // Upsert Payment record as COD PENDING
      await txAny.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          provider: 'COD',
          amount: order.total,
          status: 'PENDING',
        },
        update: {
          provider: 'COD',
          amount: order.total,
          status: 'PENDING',
        },
      });

      // Update Order Status
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          status: 'CONFIRMED',
        },
        include: { items: true },
      });

      // Add Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'CONFIRMED',
          note: 'Order confirmed with Cash on Delivery option',
          changedBy: 'CUSTOMER',
        },
      });

      // Idempotent Inventory Reservation with Atomic Stock Check
      for (const item of order.items) {
        const existingTx = await txAny.inventoryTransaction.findFirst({
          where: {
            orderId: order.id,
            productId: item.productId,
            type: 'RESERVE',
          },
        });

        if (!existingTx) {
          const updatedCount = await tx.product.updateMany({
            where: {
              id: item.productId,
              stockQuantity: { gte: item.quantity },
            },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });

          if (updatedCount.count === 0) {
            throw new BadRequestError(`Insufficient stock for product "${item.productNameSnapshot}"`);
          }

          await txAny.inventoryTransaction.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              type: 'RESERVE',
              quantity: item.quantity,
            },
          });
        }
      }

      return {
        success: true,
        message: 'COD Order confirmed successfully',
        order: updatedOrder,
      };
    });
  }

  /**
   * Handle Razorpay Webhooks idempotently
   */
  static async handleWebhook(rawBody: string | Buffer, signatureHeader: string) {
    const isValid = verifyRazorpayWebhookSignature(rawBody, signatureHeader);
    if (!isValid) {
      throw new BadRequestError('Invalid webhook signature');
    }

    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf8'));
    const event = payload.event;

    if (event === 'payment.captured' || event === 'order.paid') {
      const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity;
      const razorpayOrderId = entity?.order_id || entity?.id;
      const razorpayPaymentId = entity?.id;

      if (razorpayOrderId) {
        const payment = await prisma.payment.findFirst({
          where: { providerOrderId: razorpayOrderId },
          include: { order: { include: { items: true } } },
        });

        if (payment && payment.order) {
          const order = payment.order;
          if (order.paymentStatus !== 'PAID') {
            await prisma.$transaction(async (tx) => {
              await tx.payment.update({
                where: { id: payment.id },
                data: {
                  status: 'PAID',
                  providerPaymentId: razorpayPaymentId || payment.providerPaymentId,
                  webhookVerified: true,
                },
              });

              await tx.order.update({
                where: { id: order.id },
                data: {
                  paymentStatus: 'PAID',
                  status: 'CONFIRMED',
                },
              });
            });
          }
        }
      }
    }

    return { received: true };
  }
}
