export interface PlantCategory {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  badge: string;
}

export const plantCategories: PlantCategory[] = [
  {
    id: "indoor",
    slug: "indoor",
    name: "Indoor Plants",
    tagline: "Air-purifying & shade-loving flora",
    description: "Architectural foliage tailored for living rooms, bedrooms, and low-light workspace interiors.",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80",
    badge: "Popular Interior Choice",
  },
  {
    id: "outdoor",
    slug: "outdoor",
    name: "Outdoor Plants & Palms",
    tagline: "Sun-hardy palms & landscaping foliage",
    description: "Robust tropical palms, hedge shrubs, and architectural specimens built to thrive in direct sunlight.",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80",
    badge: "Landscaping Essential",
  },
  {
    id: "flowering",
    slug: "flowering",
    name: "Flowering Plants",
    tagline: "Vibrant seasonal & perennial blooms",
    description: "Add splashes of color, fragrance, and pollinator-attracting blooms to your balcony or garden.",
    image: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=800&q=80",
    badge: "Colorful Garden Accent",
  },
  {
    id: "fruit",
    slug: "fruit",
    name: "Fruit & Exotic Plants",
    tagline: "Homegrown harvests & citrus varieties",
    description: "High-yield dwarf fruit saplings, citrus trees, and exotic fruit varieties suitable for containers and plots.",
    image: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=800&q=80",
    badge: "Harvest & Fresh Produce",
  },
  {
    id: "vegetable",
    slug: "vegetable",
    name: "Vegetables & Herbs",
    tagline: "Organic kitchen garden saplings",
    description: "Culinary herbs, chili saplings, tomatoes, and organic kitchen garden essentials.",
    image: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80",
    badge: "Kitchen Garden",
  },
  {
    id: "pots",
    slug: "pots",
    name: "Pots, Planters & Soil",
    tagline: "Handcrafted ceramics & organic soil mix",
    description: "Terracotta planters, ceramic pots, coco-peat, vermicompost, and essential plant nutrient feeds.",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
    badge: "Nursery Supplies",
  },
];
