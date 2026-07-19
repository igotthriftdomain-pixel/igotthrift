export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  stockQuantity: number;
  featured: boolean;
  active: boolean;
  publishedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  primaryImageUrl: string | null;
  images: Array<{
    storagePath: string;
    publicUrl: string;
    displayOrder: number;
  }>;
  categoryName: string | null;
  categorySlug: string | null;
}

export interface StorefrontCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

export interface StorefrontDetails {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  whatsappNumber: string | null;
  address: string | null;
  themeColor: string;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  currencyCode: string;
  currencySymbol: string;
  metaTitle: string | null;
  metaDescription: string | null;
}
