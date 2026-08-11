import prisma from '../db/client.js';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors.js';

export const DELIVERY_FEE = 99;
export const FREE_DELIVERY_THRESHOLD = 999;

export class OrderService {
  /**
   * Production-grade transactional order creation
   */
  static async createOrder(userId: string, addressId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Verify shipping address ownership (IDOR defense)
      const address = await tx.address.findFirst({
        where: { id: addressId, userId },
      });

      if (!address) {
        throw new NotFoundError('Shipping address not found');
      }

      // Snapshot shipping address safely
      const addrAny: any = address;
      const shippingAddressSnapshot = JSON.stringify({
        fullName: addrAny.fullName || addrAny.name,
        phone: addrAny.phone,
        addressLine1: addrAny.addressLine1,
        addressLine2: addrAny.addressLine2,
        city: addrAny.city,
        state: addrAny.state,
        postalCode: addrAny.postalCode,
        country: addrAny.country || 'India',
        label: addrAny.label || 'HOME',
      });

      // 2. Fetch authenticated customer's cart
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestError('Your cart is empty');
      }

      // 3. Final Stock & Publication Validation
      for (const item of cart.items) {
        const p = item.product;
        if (!p.published) {
          throw new ConflictError(`"${p.name}" is no longer available.`);
        }
        if (p.stockQuantity < item.quantity) {
          throw new ConflictError(
            `"${p.name}" is no longer available in the requested quantity (Only ${p.stockQuantity} remaining).`
          );
        }
      }

      // 4. Server-Authoritative Price & Total Calculation
      let subtotal = 0;
      const orderItemsPayload = [];

      for (const item of cart.items) {
        const p = item.product;
        const effectivePrice =
          p.salePrice !== null && p.salePrice !== undefined && p.salePrice < p.price
            ? p.salePrice
            : p.price;

        const itemSubtotal = effectivePrice * item.quantity;
        subtotal += itemSubtotal;

        orderItemsPayload.push({
          productId: p.id,
          productNameSnapshot: p.name,
          priceSnapshot: effectivePrice,
          quantity: item.quantity,
          subtotal: itemSubtotal,
        });
      }

      // Calculate server-side delivery fee
      const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
      const total = subtotal + deliveryFee;

      // 5. Generate human-friendly unique order number (e.g. SN-847291-5829)
      const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `SN-${datePart}-${randomPart}`;

      // 6. Create Order record
      const orderPayload: any = {
        orderNumber,
        userId,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'COD',
        subtotal,
        deliveryFee,
        discount: 0,
        tax: 0,
        total,
        shippingAddressSnapshot,
        idempotencyKey: `IK-${orderNumber}`,
        items: {
          create: orderItemsPayload,
        },
        statusHistory: {
          create: {
            status: 'PENDING',
            note: 'Order created by customer. Pending payment/confirmation.',
            changedBy: 'CUSTOMER',
          },
        },
      };

      const order = await tx.order.create({
        data: orderPayload,
        include: {
          items: true,
          statusHistory: true,
        },
      });

      // 7. Clear customer cart atomically
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return {
        ...order,
        shippingAddress: JSON.parse(order.shippingAddressSnapshot),
      };
    });
  }

  /**
   * Get order history for authenticated customer
   */
  static async getCustomerOrders(userId: string) {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        statusHistory: true,
      },
    });

    return orders.map((order) => ({
      ...order,
      shippingAddress: JSON.parse(order.shippingAddressSnapshot),
    }));
  }

  /**
   * Get single order detail with IDOR protection
   */
  static async getCustomerOrder(userId: string, orderNumber: string) {
    const order = await prisma.order.findFirst({
      where: { orderNumber, userId },
      include: {
        items: true,
        statusHistory: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return {
      ...order,
      shippingAddress: JSON.parse(order.shippingAddressSnapshot),
    };
  }
}
