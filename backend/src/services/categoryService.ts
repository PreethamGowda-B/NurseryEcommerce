import prisma from '../db/client.js';

export class CategoryService {
  /**
   * Get all active categories ordered by sortOrder
   */
  static async getActiveCategories() {
    return prisma.category.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Check if a category exists and is active by slug
   */
  static async getCategoryBySlug(slug: string) {
    return prisma.category.findFirst({
      where: { slug, active: true },
    });
  }
}
