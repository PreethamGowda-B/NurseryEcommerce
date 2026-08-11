export interface ValueProposition {
  id: string;
  iconName: string;
  title: string;
  description: string;
  isPlaceholderNote?: string;
}

export const whyUsData: ValueProposition[] = [
  {
    id: "v1",
    iconName: "Sprout",
    title: "Healthy & Acclimatized Plants",
    description: "Every plant is carefully nurtured under ideal soil and shade conditions, ensuring smooth transition when placed in your home.",
    isPlaceholderNote: "Nursery core strength area",
  },
  {
    id: "v2",
    iconName: "ShieldCheck",
    title: "Curated Variety & Species",
    description: "From low-maintenance indoor foliage to sun-hardy palms, fruit saplings, and exotic blooming perennials.",
    isPlaceholderNote: "Nursery core strength area",
  },
  {
    id: "v3",
    iconName: "Compass",
    title: "Personalized Plant Guidance",
    description: "Our nursery specialists provide tailored advice on soil selection, watering frequency, sunlight orientation, and ongoing care.",
    isPlaceholderNote: "Nursery core strength area",
  },
  {
    id: "v4",
    iconName: "Sparkles",
    title: "Complete Nursery Supplies",
    description: "Handcrafted terracotta pots, ceramic planters, organic coco-peat, vermicompost, and essential bio-fertilizers under one roof.",
    isPlaceholderNote: "Nursery core strength area",
  },
];
