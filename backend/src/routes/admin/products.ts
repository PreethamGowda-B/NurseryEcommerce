import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../db/client.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import { validate } from '../../middleware/validate.js';
import { createAdminProductSchema, updateAdminProductSchema } from '../../schemas/adminProduct.js';
import { sendSuccess } from '../../utils/response.js';
import { ConflictError, NotFoundError, BadRequestError } from '../../utils/errors.js';
import { AuditService } from '../../services/auditService.js';

const router = Router();

// Protect all routes with authentication and admin authorization
router.use(authenticate, requireAdmin);

/**
 * Generate a unique slug from name
 */
async function generateUniqueSlug(name: string, currentId?: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let slug = baseSlug || 'plant';
  let counter = 1;

  while (true) {
    const existing = await prisma.product.findFirst({
      where: {
        slug,
        ...(currentId ? { id: { not: currentId } } : {}),
      },
    });

    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * GET /api/admin/products
 * List all products for admin panel with search, category, published, and pagination
 */
router.get('/admin/products', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const skip = (page - 1) * limit;

    const search = req.query.search as string;
    const categoryId = req.query.categoryId as string;
    const published = req.query.published !== undefined ? req.query.published === 'true' : undefined;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (published !== undefined) where.published = published;
    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { botanicalName: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' } },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/products
 * Create a new product
 */
router.post(
  '/admin/products',
  validate(createAdminProductSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        name,
        botanicalName,
        sku,
        categoryId,
        description,
        shortDescription,
        price,
        salePrice,
        stockQuantity,
        lowStockThreshold,
        sunlight,
        watering,
        careLevel,
        plantSize,
        featured,
        published,
        imageUrl,
      } = req.body;

      const finalSku = (sku && sku.trim()) || `SKU-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*1000)}`;
      const finalDescription = (description && description.trim()) || `${name.trim()} - Healthy nursery plant specimen.`;
      const finalImageUrl = imageUrl || (Array.isArray(req.body.images) && req.body.images[0]?.url) || null;

      // Verify Category exists (or fallback/auto-create if categoryId not found)
      let targetCategoryId = categoryId;
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) {
        const categoryBySlug = await prisma.category.findFirst({
          where: { OR: [{ id: categoryId }, { slug: categoryId }] },
        });
        if (categoryBySlug) {
          targetCategoryId = categoryBySlug.id;
        } else {
          const firstCategory = await prisma.category.findFirst();
          if (firstCategory) {
            targetCategoryId = firstCategory.id;
          } else {
            // Auto-create category on the fly so foreign key constraint NEVER fails
            const newCat = await prisma.category.create({
              data: {
                name: 'Indoor Plants',
                slug: 'indoor-plants',
              },
            });
            targetCategoryId = newCat.id;
          }
        }
      }

      // Check unique SKU
      const existingSkuProduct = await prisma.product.findUnique({ where: { sku: finalSku } });
      const uniqueSku = existingSkuProduct ? `${finalSku}-${Math.floor(Math.random()*10000)}` : finalSku;

      const slug = await generateUniqueSlug(name);

      const product = await prisma.product.create({
        data: {
          name: name.trim(),
          botanicalName: botanicalName ? botanicalName.trim() : null,
          slug,
          sku: uniqueSku,
          categoryId: targetCategoryId,
          description: finalDescription,
          shortDescription: shortDescription ? shortDescription.trim() : null,
          price,
          salePrice: salePrice !== undefined ? salePrice : null,
          stockQuantity,
          lowStockThreshold: lowStockThreshold || 5,
          sunlight: sunlight || null,
          watering: watering || null,
          careLevel: careLevel || null,
          plantSize: plantSize || null,
          featured: Boolean(featured),
          published: published !== undefined ? Boolean(published) : true,
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: true,
        },
      });

      // Attach image if URL provided
      if (finalImageUrl) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: String(finalImageUrl).trim(),
            altText: product.name,
            sortOrder: 0,
          },
        });
      }

      // Fetch complete product object
      const fullProduct = await prisma.product.findUnique({
        where: { id: product.id },
        include: { category: true, images: true },
      });

      // Audit log
      if (req.user) {
        await AuditService.log({
          adminId: req.user.id,
          action: 'PRODUCT_CREATED',
          entity: 'Product',
          entityId: product.id,
          metadata: { name: product.name, sku: product.sku, price: product.price, published: product.published },
          ipAddress: req.ip,
        });
      }

      sendSuccess(res, fullProduct, 'Product created successfully', 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/admin/products/:id
 * Get single product by ID for editing
 */
router.get('/admin/products/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/products/:id
 * Update an existing product
 */
router.patch(
  '/admin/products/:id',
  validate(updateAdminProductSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;

      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Product not found');
      }

      const {
        name,
        botanicalName,
        sku,
        categoryId,
        description,
        shortDescription,
        price,
        salePrice,
        stockQuantity,
        lowStockThreshold,
        sunlight,
        watering,
        careLevel,
        plantSize,
        featured,
        published,
        imageUrl,
      } = req.body;

      // Check category if provided
      if (categoryId) {
        const catExists = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!catExists) {
          throw new BadRequestError('Selected category does not exist');
        }
      }

      // Check SKU uniqueness if changed
      if (sku && sku.trim() !== existing.sku) {
        const skuExists = await prisma.product.findUnique({ where: { sku: sku.trim() } });
        if (skuExists) {
          throw new ConflictError(`Product SKU '${sku}' already exists`);
        }
      }

      let slug = existing.slug;
      if (name && name.trim() !== existing.name) {
        slug = await generateUniqueSlug(name, id);
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (botanicalName !== undefined) updateData.botanicalName = botanicalName ? botanicalName.trim() : null;
      if (sku !== undefined) updateData.sku = sku.trim();
      if (slug !== undefined) updateData.slug = slug;
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (description !== undefined) updateData.description = description.trim();
      if (shortDescription !== undefined) updateData.shortDescription = shortDescription ? shortDescription.trim() : null;
      if (price !== undefined) updateData.price = price;
      if (salePrice !== undefined) updateData.salePrice = salePrice;
      if (stockQuantity !== undefined) updateData.stockQuantity = stockQuantity;
      if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold;
      if (sunlight !== undefined) updateData.sunlight = sunlight;
      if (watering !== undefined) updateData.watering = watering;
      if (careLevel !== undefined) updateData.careLevel = careLevel;
      if (plantSize !== undefined) updateData.plantSize = plantSize;
      if (featured !== undefined) updateData.featured = featured;
      if (published !== undefined) updateData.published = published;

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: updateData,
        include: { category: true, images: true },
      });

      // Update main image if new URL supplied
      if (imageUrl) {
        await prisma.productImage.deleteMany({ where: { productId: id } });
        await prisma.productImage.create({
          data: {
            productId: id,
            url: imageUrl.trim(),
            altText: updatedProduct.name,
            sortOrder: 0,
          },
        });
      }

      const fullUpdatedProduct = await prisma.product.findUnique({
        where: { id },
        include: { category: true, images: true },
      });

      // Audit log
      if (req.user) {
        await AuditService.log({
          adminId: req.user.id,
          action: 'PRODUCT_UPDATED',
          entity: 'Product',
          entityId: id,
          metadata: { changes: Object.keys(updateData) },
          ipAddress: req.ip,
        });
      }

      sendSuccess(res, fullUpdatedProduct, 'Product updated successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/admin/products/:id
 * Delete or archive product safely without corrupting historical orders
 */
router.get('/admin/products/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    // Check if referenced by order items
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });

    if (orderItemCount > 0) {
      // Archive/Unpublish product to preserve historical business orders
      await prisma.product.update({
        where: { id },
        data: { published: false, stockQuantity: 0 },
      });

      if (req.user) {
        await AuditService.log({
          adminId: req.user.id,
          action: 'PRODUCT_ARCHIVED',
          entity: 'Product',
          entityId: id,
          metadata: { reason: 'Referenced by historical order items' },
          ipAddress: req.ip,
        });
      }

      sendSuccess(res, null, 'Product is referenced by orders — safely archived and unpublished');
      return;
    }

    // Clean delete if no orders reference it
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    if (req.user) {
      await AuditService.log({
        adminId: req.user.id,
        action: 'PRODUCT_DELETED',
        entity: 'Product',
        entityId: id,
        metadata: { name: existing.name, sku: existing.sku },
        ipAddress: req.ip,
      });
    }

    sendSuccess(res, null, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
