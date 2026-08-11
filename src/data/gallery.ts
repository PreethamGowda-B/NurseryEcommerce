export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  aspectRatio: "square" | "tall" | "wide";
}

export const galleryItems: GalleryItem[] = [
  {
    id: "g1",
    title: "Nursery Walkthrough Canopy",
    category: "Environment",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
    aspectRatio: "tall",
  },
  {
    id: "g2",
    title: "Architectural Palms & Foliage",
    category: "Palms",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80",
    aspectRatio: "wide",
  },
  {
    id: "g3",
    title: "Handcrafted Ceramic Planters",
    category: "Pots",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
    aspectRatio: "square",
  },
  {
    id: "g4",
    title: "Seasonal Blooming Succulents",
    category: "Flowering",
    image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80",
    aspectRatio: "tall",
  },
  {
    id: "g5",
    title: "Organic Potting Soil Mix",
    category: "Care",
    image: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=800&q=80",
    aspectRatio: "square",
  },
  {
    id: "g6",
    title: "Balcony Garden Transformation",
    category: "Landscaping",
    image: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=800&q=80",
    aspectRatio: "wide",
  },
];
