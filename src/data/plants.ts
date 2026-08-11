export interface PlantItem {
  id: string;
  name: string;
  botanicalName: string;
  categoryId: string;
  categoryName: string;
  sunlight: "Low Light" | "Indirect Light" | "Full Sun" | "Partial Shade";
  watering: "Once a week" | "Twice a week" | "When topsoil dries" | "Daily" | "Once a month";
  careLevel: "Beginner" | "Moderate" | "Expert";
  description: string;
  image: string;
  price: number;
  salePrice?: number;
  priceEstimate?: string;
  isPopular?: boolean;
}

export const plantCatalog: PlantItem[] = [
  {
    id: "prod-monstera",
    name: "Monstera Deliciosa",
    botanicalName: "Swiss Cheese Plant",
    categoryId: "cat-indoor",
    categoryName: "Indoor Plants",
    sunlight: "Indirect Light",
    watering: "When topsoil dries",
    careLevel: "Beginner",
    description: "Iconic tropical foliage with broad fenestrated leaves. A timeless interior focal point that thrives in bright indirect light.",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80",
    price: 899,
    salePrice: 749,
    priceEstimate: "₹749 (MSRP ₹899)",
    isPopular: true,
  },
  {
    id: "prod-fiddle",
    name: "Fiddle Leaf Fig",
    botanicalName: "Ficus Lyrata",
    categoryId: "cat-indoor",
    categoryName: "Indoor Plants",
    sunlight: "Indirect Light",
    watering: "Once a week",
    careLevel: "Moderate",
    description: "Tall, dramatic architectural plant featuring glossy fiddle-shaped leaves. Adds vertical elegance to living rooms and entrance halls.",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80",
    price: 1299,
    priceEstimate: "₹1,299",
    isPopular: true,
  },
  {
    id: "prod-areca",
    name: "Areca Palm",
    botanicalName: "Dypsis Lutescens",
    categoryId: "cat-outdoor",
    categoryName: "Outdoor Plants & Palms",
    sunlight: "Partial Shade",
    watering: "Twice a week",
    careLevel: "Beginner",
    description: "Feathery, lush green palm fronds that act as a natural air purifier and provide tropical screening for balconies.",
    image: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=800&q=80",
    price: 549,
    salePrice: 449,
    priceEstimate: "₹449 (MSRP ₹549)",
    isPopular: true,
  },
  {
    id: "prod-peace-lily",
    name: "Peace Lily",
    botanicalName: "Spathiphyllum",
    categoryId: "cat-indoor",
    categoryName: "Indoor Plants",
    sunlight: "Low Light",
    watering: "Once a week",
    careLevel: "Beginner",
    description: "Elegant dark green leaves with graceful white flower spaths. Excellent shade tolerance and NASA-rated air purification.",
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80",
    price: 399,
    priceEstimate: "₹399",
    isPopular: false,
  },
  {
    id: "prod-bougainvillea",
    name: "Bougainvillea Hybrid",
    botanicalName: "Bougainvillea Spectabilis",
    categoryId: "cat-flowering",
    categoryName: "Flowering Plants",
    sunlight: "Full Sun",
    watering: "When topsoil dries",
    careLevel: "Beginner",
    description: "Cascading vibrant magenta and pink paper blooms that thrive under intense sun. Perfect for arches, fences, and balcony rails.",
    image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80",
    price: 299,
    salePrice: 249,
    priceEstimate: "₹249 (MSRP ₹299)",
    isPopular: true,
  },
  {
    id: "prod-lemon",
    name: "Dwarf Lemon Sapling",
    botanicalName: "Citrus Limon",
    categoryId: "cat-fruit",
    categoryName: "Fruit & Exotic Plants",
    sunlight: "Full Sun",
    watering: "Twice a week",
    careLevel: "Moderate",
    description: "Fragrant white blossoms followed by juicy homegrown lemons. Specially grafted dwarf variety suitable for large terracotta pots.",
    image: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=800&q=80",
    price: 699,
    salePrice: 599,
    priceEstimate: "₹599 (MSRP ₹699)",
    isPopular: true,
  },
  {
    id: "prod-snake-plant",
    name: "Snake Plant Laurentii",
    botanicalName: "Sansevieria Trifasciata",
    categoryId: "cat-indoor",
    categoryName: "Indoor Plants",
    sunlight: "Low Light",
    watering: "Once a month",
    careLevel: "Beginner",
    description: "Extremely resilient upright sword-like leaves with yellow golden borders. Requires minimal care and thrives almost anywhere.",
    image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80",
    price: 349,
    priceEstimate: "₹349",
    isPopular: false,
  },
  {
    id: "prod-terracotta",
    name: "Handcrafted Terracotta Pot Set",
    botanicalName: "Natural Clay Planter",
    categoryId: "cat-pots",
    categoryName: "Pots, Planters & Soil",
    sunlight: "Full Sun",
    watering: "Daily",
    careLevel: "Beginner",
    description: "Breathable natural clay planters that promote root aeration and prevent water stagnation. Includes drainage hole.",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
    price: 799,
    salePrice: 649,
    priceEstimate: "₹649 (MSRP ₹799)",
    isPopular: false,
  },
];

export const generateWhatsAppInquiryUrl = (plantName: string, whatsappNumber: string = "918123191863") => {
  const text = encodeURIComponent(`Hi Sheeneeka Nursery, I would like to inquire about the ${plantName}. Is it currently available at your nursery?`);
  return `https://wa.me/${whatsappNumber}?text=${text}`;
};
