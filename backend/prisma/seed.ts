import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Admin User
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@sheeneekanursery.in';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@Sheeneeka2026!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: 'ADMIN' },
    create: {
      name: 'Sheeneeka Admin',
      email: adminEmail,
      phone: '+91 81231 91863',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin account created: ${adminUser.email}`);

  // 2. Seed Categories
  const categories = [
    {
      id: 'cat-indoor',
      name: 'Indoor Plants',
      slug: 'indoor-plants',
      description: 'Architectural foliage tailored for living rooms, bedrooms, and low-light workspace interiors.',
      image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
      sortOrder: 1,
    },
    {
      id: 'cat-outdoor',
      name: 'Outdoor Plants & Palms',
      slug: 'outdoor-plants-palms',
      description: 'Robust tropical palms, hedge shrubs, and architectural specimens built to thrive in direct sunlight.',
      image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
      sortOrder: 2,
    },
    {
      id: 'cat-flowering',
      name: 'Flowering Plants',
      slug: 'flowering-plants',
      description: 'Add splashes of color, fragrance, and pollinator-attracting blooms to your balcony or garden.',
      image: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=800&q=80',
      sortOrder: 3,
    },
    {
      id: 'cat-fruit',
      name: 'Fruit & Exotic Plants',
      slug: 'fruit-exotic-plants',
      description: 'High-yield dwarf fruit saplings, citrus trees, and exotic fruit varieties suitable for containers and plots.',
      image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=800&q=80',
      sortOrder: 4,
    },
    {
      id: 'cat-vegetable',
      name: 'Vegetables & Herbs',
      slug: 'vegetables-herbs',
      description: 'Culinary herbs, chili saplings, tomatoes, and organic kitchen garden essentials.',
      image: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80',
      sortOrder: 5,
    },
    {
      id: 'cat-pots',
      name: 'Pots, Planters & Soil',
      slug: 'pots-planters-soil',
      description: 'Terracotta planters, ceramic pots, coco-peat, vermicompost, and essential plant nutrient feeds.',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
      sortOrder: 6,
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log(`✅ ${categories.length} categories seeded`);

  // 3. Seed Demo Products
  const products = [
    {
      id: 'prod-monstera',
      name: 'Monstera Deliciosa',
      botanicalName: 'Swiss Cheese Plant',
      slug: 'monstera-deliciosa',
      sku: 'PLANT-MON-001',
      categoryId: 'cat-indoor',
      description: 'Iconic tropical foliage with broad fenestrated leaves. A timeless interior focal point that thrives in bright indirect light.',
      shortDescription: 'Iconic interior plant with fenestrated leaves.',
      price: 899,
      salePrice: 749,
      stockQuantity: 25,
      sunlight: 'Indirect Light',
      watering: 'When topsoil dries',
      careLevel: 'Beginner',
      plantSize: 'Medium (2-3 ft)',
      featured: true,
      published: true,
      imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'prod-fiddle',
      name: 'Fiddle Leaf Fig',
      botanicalName: 'Ficus Lyrata',
      slug: 'fiddle-leaf-fig',
      sku: 'PLANT-FIG-002',
      categoryId: 'cat-indoor',
      description: 'Tall, dramatic architectural plant featuring glossy fiddle-shaped leaves. Adds vertical elegance to living rooms and entrance halls.',
      shortDescription: 'Dramatic architectural plant for elegant living rooms.',
      price: 1299,
      salePrice: null,
      stockQuantity: 15,
      sunlight: 'Indirect Light',
      watering: 'Once a week',
      careLevel: 'Moderate',
      plantSize: 'Large (4-5 ft)',
      featured: true,
      published: true,
      imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'prod-areca',
      name: 'Areca Palm',
      botanicalName: 'Dypsis Lutescens',
      slug: 'areca-palm',
      sku: 'PLANT-PALM-003',
      categoryId: 'cat-outdoor',
      description: 'Feathery, lush green palm fronds that act as a natural air purifier and provide tropical screening for balconies.',
      shortDescription: 'Lush feathery palm for balconies and gardens.',
      price: 549,
      salePrice: 449,
      stockQuantity: 30,
      sunlight: 'Partial Shade',
      watering: 'Twice a week',
      careLevel: 'Beginner',
      plantSize: 'Medium (3-4 ft)',
      featured: true,
      published: true,
      imageUrl: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'prod-peace-lily',
      name: 'Peace Lily',
      botanicalName: 'Spathiphyllum',
      slug: 'peace-lily',
      sku: 'PLANT-LILY-004',
      categoryId: 'cat-indoor',
      description: 'Elegant dark green leaves with graceful white flower spaths. Excellent shade tolerance and NASA-rated air purification.',
      shortDescription: 'Air-purifying shade plant with elegant white blooms.',
      price: 399,
      salePrice: null,
      stockQuantity: 20,
      sunlight: 'Low Light',
      watering: 'Once a week',
      careLevel: 'Beginner',
      plantSize: 'Compact (1-2 ft)',
      featured: false,
      published: true,
      imageUrl: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'prod-bougainvillea',
      name: 'Bougainvillea Hybrid',
      botanicalName: 'Bougainvillea Spectabilis',
      slug: 'bougainvillea-hybrid',
      sku: 'PLANT-BOU-005',
      categoryId: 'cat-flowering',
      description: 'Cascading vibrant magenta and pink paper blooms that thrive under intense sun. Perfect for arches, fences, and balcony rails.',
      shortDescription: 'Vibrant sun-hardy flowering climber.',
      price: 299,
      salePrice: 249,
      stockQuantity: 40,
      sunlight: 'Full Sun',
      watering: 'When topsoil dries',
      careLevel: 'Beginner',
      plantSize: 'Medium (2-3 ft)',
      featured: true,
      published: true,
      imageUrl: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'prod-lemon',
      name: 'Dwarf Lemon Sapling',
      botanicalName: 'Citrus Limon',
      slug: 'dwarf-lemon-sapling',
      sku: 'PLANT-LEM-006',
      categoryId: 'cat-fruit',
      description: 'Fragrant white blossoms followed by juicy homegrown lemons. Specially grafted dwarf variety suitable for large terracotta pots.',
      shortDescription: 'Grafted citrus tree yielding fresh homegrown lemons.',
      price: 699,
      salePrice: 599,
      stockQuantity: 18,
      sunlight: 'Full Sun',
      watering: 'Twice a week',
      careLevel: 'Moderate',
      plantSize: 'Medium (2-3 ft)',
      featured: true,
      published: true,
      imageUrl: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'prod-snake-plant',
      name: 'Snake Plant Laurentii',
      botanicalName: 'Sansevieria Trifasciata',
      slug: 'snake-plant-laurentii',
      sku: 'PLANT-SNK-007',
      categoryId: 'cat-indoor',
      description: 'Extremely resilient upright sword-like leaves with yellow golden borders. Requires minimal care and thrives almost anywhere.',
      shortDescription: 'Indestructible air-purifying architectural succulent.',
      price: 349,
      salePrice: null,
      stockQuantity: 35,
      sunlight: 'Low Light',
      watering: 'Once a month',
      careLevel: 'Beginner',
      plantSize: 'Compact (1.5-2 ft)',
      featured: false,
      published: true,
      imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'prod-terracotta',
      name: 'Handcrafted Terracotta Pot Set',
      botanicalName: 'Natural Clay Planter',
      slug: 'handcrafted-terracotta-pot-set',
      sku: 'POT-TER-008',
      categoryId: 'cat-pots',
      description: 'Breathable natural clay planters that promote root aeration and prevent water stagnation. Includes drainage hole.',
      shortDescription: 'Natural clay planters engineered for optimal root health.',
      price: 799,
      salePrice: 649,
      stockQuantity: 50,
      sunlight: 'Full Sun',
      watering: 'Daily',
      careLevel: 'Beginner',
      plantSize: 'Set of 3 (8", 10", 12")',
      featured: false,
      published: true,
      imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const p of products) {
    const { imageUrl, ...productData } = p;
    await prisma.product.upsert({
      where: { id: p.id },
      update: productData,
      create: productData,
    });

    // Seed product image
    await prisma.productImage.deleteMany({ where: { productId: p.id } });
    await prisma.productImage.create({
      data: {
        productId: p.id,
        url: imageUrl,
        altText: p.name,
        sortOrder: 0,
      },
    });
  }
  console.log(`✅ ${products.length} products & images seeded`);

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
