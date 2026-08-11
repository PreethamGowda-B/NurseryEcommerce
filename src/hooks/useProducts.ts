import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  botanicalName?: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
  inStock: boolean;
  sunlight?: string;
  watering?: string;
  careLevel?: string;
  plantSize?: string;
  featured: boolean;
  published: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: {
    id: string;
    url: string;
    altText?: string;
  }[];
  relatedProducts?: ApiProduct[];
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sort?: string;
}

export interface ProductsApiResponse {
  success: boolean;
  data: ApiProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useCategories() {
  return useQuery<ApiCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProducts(params: ProductsQueryParams = {}) {
  return useQuery<ProductsApiResponse>({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await api.get('/products', { params });
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useProduct(slug: string) {
  return useQuery<ApiProduct>({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await api.get(`/products/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
    staleTime: 60 * 1000,
  });
}
