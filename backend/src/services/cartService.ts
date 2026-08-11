import prisma from '../db/client.js';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors.js';

export const DELIVERY_FEE = 99;
export const FREE_DELIVERY_THRESHOLD = 999;

export interface FormattedCartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  botanicalName?: string | null;
  image: string;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  quantity: number;
  stockQuantity: number;
  itemSubtotal: number;
  isAvailable: boolean;
  availabilityReason?: string;
  published: boolean;
}

export interface FormattedCartResponse {
  id: string;
  items: FormattedCartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  freeDeliveryRemaining: number;
  total: number;
  hasUnavailableItems: boolean;
}

export class CartService {
  /**
   * Get or create atomic Cart record for authenticated user
   */
  static async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    return cart;
  }

  /**
   * Return fully calculated, server-verified cart details
   */
  static async getFormattedCart(userId: string): Promise<FormattedCartResponse> {
    const cart = await this.getOrCreateCart(userId);

    const rawItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            botanicalName: true,
            price: true,
            salePrice: true,
            stockQuantity: true,
            published: true,
            images: {
              select: { url: true },
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    let subtotal = 0;
    let itemCount = 0;
    let hasUnavailableItems = false;

    const formattedItems: FormattedCartItem[] = rawItems.map((ci: any) => {
      const p = ci.product;
      const isPublished = p.published;
      const inStock = p.stockQuantity >= 1;
      const isAvailable = isPublished && inStock;

      if (!isAvailable) {
        hasUnavailableItems = true;
      }

      // Server-determined effective price
      const effectivePrice =
        p.salePrice !== null && p.salePrice !== undefined && p.salePrice < p.price
          ? p.salePrice
          : p.price;

      const itemSubtotal = effectivePrice * ci.quantity;

      // Only count available products toward cart subtotal
      if (isAvailable) {
        subtotal += itemSubtotal;
        itemCount += ci.quantity;
      }

      let availabilityReason: string | undefined;
      if (!isPublished) {
        availabilityReason = 'Product currently unavailable';
      } else if (!inStock) {
        availabilityReason = 'Out of stock';
      }

      return {
        id: ci.id,
        productId: p.id,
        name: p.name,
        slug: p.slug,
        botanicalName: p.botanicalName,
        image:
          p.images?.[0]?.url ||
          'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
        price: p.price,
        salePrice: p.salePrice,
        effectivePrice,
        quantity: ci.quantity,
        stockQuantity: p.stockQuantity,
        itemSubtotal,
        isAvailable,
        availabilityReason,
        published: p.published,
      };
    });

    // Server-determined delivery fee calculation
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
    const freeDeliveryRemaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
    const total = subtotal + deliveryFee;

    return {
      id: cart.id,
      items: formattedItems,
      itemCount,
      subtotal,
      deliveryFee,
      freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
      freeDeliveryRemaining,
      total,
      hasUnavailableItems,
    };
  }

  /**
   * Add product to customer cart with stock validation and duplicate merging
   */
  static async addItem(userId: string, productId: string, quantity: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (!product.published) {
      throw new BadRequestError('This product is currently unavailable');
    }

    if (product.stockQuantity < 1) {
      throw new ConflictError('This product is currently out of stock');
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    const newQuantity = (existingItem?.quantity || 0) + quantity;

    if (newQuantity > product.stockQuantity) {
      throw new ConflictError(`Only ${product.stockQuantity} units are currently available in stock.`);
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: newQuantity,
        },
      });
    }

    return this.getFormattedCart(userId);
  }

  /**
   * Update item quantity in customer cart with stock validation
   */
  static async updateItemQuantity(userId: string, productId: string, quantity: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (quantity > product.stockQuantity) {
      throw new ConflictError(`Only ${product.stockQuantity} units are currently available in stock.`);
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!existingItem) {
      throw new NotFoundError('Item not found in your cart');
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity },
    });

    return this.getFormattedCart(userId);
  }

  /**
   * Remove item from authenticated customer cart
   */
  static async removeItem(userId: string, productId: string) {
    const cart = await this.getOrCreateCart(userId);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      await prisma.cartItem.delete({
        where: { id: existingItem.id },
      });
    }

    return this.getFormattedCart(userId);
  }

  /**
   * Clear all items from customer cart
   */
  static async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getFormattedCart(userId);
  }

  /**
   * Merge guest local storage items into user's database cart upon login
   */
  static async mergeGuestCart(userId: string, guestItems: { productId: string; quantity: number }[]) {
    if (!guestItems || guestItems.length === 0) {
      return this.getFormattedCart(userId);
    }

    const cart = await this.getOrCreateCart(userId);

    for (const gItem of guestItems) {
      const product = await prisma.product.findFirst({
        where: {
          OR: [{ id: gItem.productId }, { slug: gItem.productId }],
        },
      });

      // Skip invalid or unpublished products
      if (!product || !product.published || product.stockQuantity < 1) {
        continue;
      }

      const existing = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: product.id,
          },
        },
      });

      // Business rule for login merge: Math.max(existingQuantity, guestQuantity) capped at stock
      const mergedQuantity = existing
        ? Math.min(product.stockQuantity, Math.max(existing.quantity, gItem.quantity))
        : Math.min(product.stockQuantity, gItem.quantity);

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: mergedQuantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            quantity: mergedQuantity,
          },
        });
      }
    }

    return this.getFormattedCart(userId);
  }
}
