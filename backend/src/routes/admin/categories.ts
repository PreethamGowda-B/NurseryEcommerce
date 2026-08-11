import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../db/client.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import { validate } from '../../middleware/validate.js';
import { createAdminCategorySchema, updateAdminCategorySchema } from '../../schemas/adminCategory.js';
import { sendSuccess } from '../../utils/response.js';
import { ConflictError, NotFoundError, BadRequestError } from '../../utils/errors.js';
import { AuditService } from '../../services/auditService.js';

const router = Router();

router.use(authenticate, requireAdmin);

/**
 * GET /api/admin/categories
 * List all categories including active and inactive
 */
router.get('/admin/categories', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/categories
 * Create a new category
 */
router.post(
  '/admin/categories',
  validate(createAdminCategorySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, slug: customSlug, description, image, sortOrder, active } = req.body;

      const slug = customSlug
        ? customSlug.toLowerCase().trim()
        : name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-');

      const existing = await prisma.category.findUnique({ where: { slug } });
      if (existing) {
        throw new ConflictError(`Category slug '${slug}' already exists`);
      }

      const category = await prisma.category.create({
        data: {
          name: name.trim(),
          slug,
          description: description ? description.trim() : null,
          image: image ? image.trim() : null,
          sortOrder: sortOrder !== undefined ? sortOrder : 0,
          active: active !== undefined ? active : true,
        },
      });

      if (req.user) {
        await AuditService.log({
          adminId: req.user.id,
          action: 'CATEGORY_CREATED',
          entity: 'Category',
          entityId: category.id,
          metadata: { name: category.name, slug: category.slug },
          ipAddress: req.ip,
        });
      }

      sendSuccess(res, category, 'Category created successfully', 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/admin/categories/:id
 * Update category details
 */
router.patch(
  '/admin/categories/:id',
  validate(updateAdminCategorySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Category not found');
      }

      const { name, slug: customSlug, description, image, sortOrder, active } = req.body;

      let slug = existing.slug;
      if (customSlug && customSlug.trim() !== existing.slug) {
        slug = customSlug.toLowerCase().trim();
        const slugExists = await prisma.category.findUnique({ where: { slug } });
        if (slugExists) {
          throw new ConflictError(`Category slug '${slug}' already exists`);
        }
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (customSlug !== undefined) updateData.slug = slug;
      if (description !== undefined) updateData.description = description ? description.trim() : null;
      if (image !== undefined) updateData.image = image ? image.trim() : null;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      if (active !== undefined) updateData.active = active;

      const updated = await prisma.category.update({
        where: { id },
        data: updateData,
      });

      if (req.user) {
        await AuditService.log({
          adminId: req.user.id,
          action: 'CATEGORY_UPDATED',
          entity: 'Category',
          entityId: id,
          metadata: { changes: Object.keys(updateData) },
          ipAddress: req.ip,
        });
      }

      sendSuccess(res, updated, 'Category updated successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/admin/categories/:id
 * Delete or deactivate category safely
 */
router.delete('/admin/categories/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!existing) {
      throw new NotFoundError('Category not found');
    }

    if (existing._count.products > 0) {
      // Deactivate rather than corrupting linked products
      await prisma.category.update({
        where: { id },
        data: { active: false },
      });

      if (req.user) {
        await AuditService.log({
          adminId: req.user.id,
          action: 'CATEGORY_DEACTIVATED',
          entity: 'Category',
          entityId: id,
          metadata: { reason: `Contains ${existing._count.products} products` },
          ipAddress: req.ip,
        });
      }

      sendSuccess(res, null, 'Category contains active products — deactivated safely instead of deleting');
      return;
    }

    await prisma.category.delete({ where: { id } });

    if (req.user) {
      await AuditService.log({
        adminId: req.user.id,
        action: 'CATEGORY_DELETED',
        entity: 'Category',
        entityId: id,
        metadata: { name: existing.name },
        ipAddress: req.ip,
      });
    }

    sendSuccess(res, null, 'Category deleted successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
