import prisma from '../db/client.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { AuditService } from './auditService.js';

export interface ListInventoryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  categoryId?: string;
}

export interface ListTransactionsParams {
  page?: number;
  limit?: number;
  productId?: string;
  type?: 'ALL' | 'RESERVE' | 'SALE' | 'RELEASE' | 'ADJUSTMENT';
}

export class InventoryService {
  /**
   * Aggregate inventory dashboard metrics
   */
  static async getInventoryMetrics() {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        stockQuantity: true,
        lowStockThreshold: true,
      },
    });

    const totalProducts = products.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalUnits = 0;

    for (const p of products) {
      totalUnits += p.stockQuantity;
      if (p.stockQuantity === 0) {
        outOfStock++;
      } else if (p.stockQuantity <= p.lowStockThreshold) {
        lowStock++;
      } else {
        inStock++;
      }
    }

    return {
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
      totalUnits,
    };
  }

  /**
   * Paginated inventory list with search and filters
   */
  static async listInventory(params: ListInventoryParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { sku: { contains: params.search } },
      ];
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    // Fetch all matching products to apply status filter dynamically if needed
    const allMatching = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    const filtered = allMatching.filter((p) => {
      let status = 'IN_STOCK';
      if (p.stockQuantity === 0) {
        status = 'OUT_OF_STOCK';
      } else if (p.stockQuantity <= p.lowStockThreshold) {
        status = 'LOW_STOCK';
      }

      if (params.status && params.status !== 'ALL') {
        return status === params.status;
      }
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedProducts = filtered.slice(skip, skip + limit).map((p) => {
      let status = 'IN_STOCK';
      if (p.stockQuantity === 0) {
        status = 'OUT_OF_STOCK';
      } else if (p.stockQuantity <= p.lowStockThreshold) {
        status = 'LOW_STOCK';
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        category: p.category.name,
        price: p.price,
        salePrice: p.salePrice,
        stockQuantity: p.stockQuantity,
        lowStockThreshold: p.lowStockThreshold,
        status,
        published: p.published,
      };
    });

    return {
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Atomic stock adjustment with Prisma Transaction & Audit Logging
   */
  static async adjustStock(
    adminId: string,
    productId: string,
    quantity: number,
    reason: string,
    ipAddress?: string
  ) {
    if (quantity === 0) {
      throw new BadRequestError('Adjustment quantity cannot be zero');
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      const newStock = product.stockQuantity + quantity;
      if (newStock < 0) {
        throw new BadRequestError(
          `Stock adjustment failed: current stock is ${product.stockQuantity}, adjustment of ${quantity} would result in negative stock (${newStock}).`
        );
      }

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: newStock },
      });

      const txAny: any = tx;
      await txAny.inventoryTransaction.create({
        data: {
          productId,
          type: 'ADJUSTMENT',
          quantity,
          reason,
        },
      });

      let status = 'IN_STOCK';
      if (updatedProduct.stockQuantity === 0) {
        status = 'OUT_OF_STOCK';
      } else if (updatedProduct.stockQuantity <= updatedProduct.lowStockThreshold) {
        status = 'LOW_STOCK';
      }

      return {
        product: updatedProduct,
        status,
        oldStock: product.stockQuantity,
        newStock: updatedProduct.stockQuantity,
      };
    });

    await AuditService.log({
      adminId,
      action: 'INVENTORY_ADJUSTED',
      entity: 'Product',
      entityId: productId,
      metadata: {
        productName: result.product.name,
        oldStock: result.oldStock,
        newStock: result.newStock,
        adjustment: quantity,
        reason,
      },
      ipAddress,
    });

    return result;
  }

  /**
   * List Inventory Transactions with pagination and filters
   */
  static async listTransactions(params: ListTransactionsParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.productId) {
      where.productId = params.productId;
    }

    if (params.type && params.type !== 'ALL') {
      where.type = params.type;
    }

    const txAny: any = prisma;
    const [transactions, total] = await Promise.all([
      txAny.inventoryTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
          order: {
            select: { id: true, orderNumber: true },
          },
        },
      }),
      txAny.inventoryTransaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
