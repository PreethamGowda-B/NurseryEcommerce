import prisma from '../db/client.js';

export interface ProductFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
}

export class ProductService {
  /**
   * Get public published products with DB-level filtering, search, pagination, and sorting
   */
  static async getPublicProducts(options: ProductFilterOptions) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 12));
    const skip = (page - 1) * limit;

    // HARD SECURITY REQUIREMENT: Only published products returned publicly
    const where: Record<string, any> = {
      published: true,
    };

    // Category filter by slug
    if (options.category) {
      const categoryRecord = await prisma.category.findFirst({
        where: { slug: options.category, active: true },
      });

      if (!categoryRecord) {
        return {
          products: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }

      where.categoryId = categoryRecord.id;
    }

    // Search filter (DB level)
    if (options.search) {
      const queryStr = options.search.trim();
      where.OR = [
        { name: { contains: queryStr } },
        { botanicalName: { contains: queryStr } },
      ];
    }

    // Price range filter
    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      where.price = {};
      if (options.minPrice !== undefined) where.price.gte = options.minPrice;
      if (options.maxPrice !== undefined) where.price.lte = options.maxPrice;
    }

    // Availability filter
    if (options.inStock) {
      where.stockQuantity = { gt: 0 };
    }

    // Featured filter
    if (options.featured) {
      where.featured = true;
    }

    // Whitelisted OrderBy
    let orderBy: Record<string, any> = { createdAt: 'desc' };
    switch (options.sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Execute queries in parallel
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          botanicalName: true,
          shortDescription: true,
          description: true,
          price: true,
          salePrice: true,
          stockQuantity: true,
          sunlight: true,
          watering: true,
          careLevel: true,
          plantSize: true,
          featured: true,
          published: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            select: {
              id: true,
              url: true,
              altText: true,
              sortOrder: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Transform products to include inStock indicator
    const formattedProducts = products.map((p: any) => ({
      ...p,
      inStock: p.stockQuantity > 0,
    }));

    return {
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get a single published product by slug with images and related products
   */
  static async getPublicProductBySlug(slug: string) {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        published: true, // HARD REQUIREMENT: 404 if unpublished
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        botanicalName: true,
        description: true,
        shortDescription: true,
        price: true,
        salePrice: true,
        stockQuantity: true,
        sunlight: true,
        watering: true,
        careLevel: true,
        plantSize: true,
        featured: true,
        published: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            altText: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) return null;

    // Fetch up to 4 related products from same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.category.id,
        id: { not: product.id },
        published: true,
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        botanicalName: true,
        price: true,
        salePrice: true,
        stockQuantity: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          select: { id: true, url: true, altText: true },
          take: 1,
        },
      },
    });

    return {
      ...product,
      inStock: product.stockQuantity > 0,
      relatedProducts: relatedProducts.map((rp: any) => ({
        ...rp,
        inStock: rp.stockQuantity > 0,
      })),
    };
  }
}
