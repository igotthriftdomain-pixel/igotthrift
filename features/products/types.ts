import { type Category } from "@/features/categories/types";

export interface Product {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  stock_quantity: number;
  featured: boolean;
  active: boolean;
  published_at: string | null;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
  publicUrl?: string;
}

export interface ProductWithCategoryAndImages extends Product {
  categories: Category | null;
  product_images: ProductImage[];
}
