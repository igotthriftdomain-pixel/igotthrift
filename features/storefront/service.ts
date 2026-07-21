import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { type SupabaseClient } from "@supabase/supabase-js";
import { type StorefrontDetails, type StorefrontCategory, type StorefrontProduct } from "./types";
import { STOREFRONT_LIMITS } from "./constants";

interface RawProductSelect {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  stock?: number;
  stock_quantity?: number;
  featured: boolean;
  active: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  categories: { name: string; slug: string } | null;
  product_images: Array<{ storage_path: string; display_order: number }> | null;
}

function getMediaTypeFromUrl(url: string | null): "image" | "video" {
  if (!url) return "image";
  const cleanUrl = url.split("?")[0].toLowerCase();
  if (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.includes("video")
  ) {
    return "video";
  }
  return "image";
}

export const getStoreBySlug = cache(async (slug: string): Promise<StorefrontDetails | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  // Resolve CDN paths directly inside the service layer
  const logoUrl = data.logo_url
    ? supabase.storage.from("store-assets").getPublicUrl(data.logo_url).data.publicUrl
    : null;

  let bannerUrl1 = data.banner_url
    ? supabase.storage.from("store-assets").getPublicUrl(data.banner_url).data.publicUrl
    : null;
  let bannerUrl2: string | null = null;

  // Check storage bucket for slide 2 (or alternative format slide 1)
  const { data: storeFiles } = await supabase.storage
    .from("store-assets")
    .list(`stores/${data.id}`);

  if (storeFiles && storeFiles.length > 0) {
    const file1 = storeFiles.find((f) => f.name.startsWith("banner_1."));
    const file2 = storeFiles.find((f) => f.name.startsWith("banner_2."));

    if (file1) {
      bannerUrl1 = supabase.storage
        .from("store-assets")
        .getPublicUrl(`stores/${data.id}/${file1.name}`).data.publicUrl;
    }
    if (file2) {
      bannerUrl2 = supabase.storage
        .from("store-assets")
        .getPublicUrl(`stores/${data.id}/${file2.name}`).data.publicUrl;
    }
  }

  const heroSlides: Array<{ url: string; type: "image" | "video" }> = [];
  if (bannerUrl1) {
    heroSlides.push({ url: bannerUrl1, type: getMediaTypeFromUrl(bannerUrl1) });
  }
  if (bannerUrl2) {
    heroSlides.push({ url: bannerUrl2, type: getMediaTypeFromUrl(bannerUrl2) });
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    logoUrl,
    bannerUrl: bannerUrl1,
    bannerUrl2,
    heroSlides,
    whatsappNumber: data.whatsapp_number,
    address: data.address,
    themeColor: data.theme_color || "#09090b",
    instagram: data.instagram,
    facebook: data.facebook,
    website: data.website,
    currencyCode: data.currency_code,
    currencySymbol: data.currency_symbol,
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
  };
});

export async function getActiveCategories(storeId: string): Promise<StorefrontCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("store_id", storeId)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return data.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    sortOrder: cat.sort_order,
  }));
}

function mapProductToDTO(supabase: SupabaseClient, item: RawProductSelect): StorefrontProduct {
  const images = (item.product_images || [])
    .map((img) => ({
      storagePath: img.storage_path,
      publicUrl: supabase.storage.from("store-assets").getPublicUrl(img.storage_path).data.publicUrl,
      displayOrder: img.display_order,
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Fallback to first image if displayOrder=0 is not flagged
  const primaryImage = images.find((img) => img.displayOrder === 0) || images[0] || null;
  const primaryImageUrl = primaryImage ? primaryImage.publicUrl : null;

  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    shortDescription: item.short_description,
    description: item.description,
    price: item.price,
    compareAtPrice: item.compare_at_price,
    sku: item.sku,
    stockQuantity: item.stock ?? item.stock_quantity ?? 0,
    featured: item.featured,
    active: item.active,
    publishedAt: item.published_at,
    metaTitle: item.meta_title,
    metaDescription: item.meta_description,
    primaryImageUrl,
    images,
    categoryName: item.categories?.name || null,
    categorySlug: item.categories?.slug || null,
  };
}

export async function getFeaturedProducts(storeId: string): Promise<StorefrontProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*), product_images(*)")
    .eq("store_id", storeId)
    .eq("active", true)
    .eq("featured", true)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .limit(STOREFRONT_LIMITS.featuredProducts);

  if (error || !data) return [];
  return data.map((item) => mapProductToDTO(supabase, item));
}

export async function getNewestProducts(storeId: string): Promise<StorefrontProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*), product_images(*)")
    .eq("store_id", storeId)
    .eq("active", true)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(STOREFRONT_LIMITS.newestProducts);

  if (error || !data) return [];
  return data.map((item) => mapProductToDTO(supabase, item));
}

export async function getProductsByCategory(
  storeId: string,
  categorySlug: string
): Promise<StorefrontProduct[]> {
  const supabase = await createClient();
  
  // Resolve category ID first
  const { data: categoryData } = await supabase
    .from("categories")
    .select("id")
    .eq("store_id", storeId)
    .eq("slug", categorySlug)
    .maybeSingle();

  if (!categoryData) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*), product_images(*)")
    .eq("store_id", storeId)
    .eq("category_id", categoryData.id)
    .eq("active", true)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((item) => mapProductToDTO(supabase, item));
}

export async function searchProducts(
  storeId: string,
  query: string
): Promise<StorefrontProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*), product_images(*)")
    .eq("store_id", storeId)
    .eq("active", true)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .or(`name.ilike.%${query}%,slug.ilike.%${query}%,sku.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((item) => mapProductToDTO(supabase, item));
}

export async function getRelatedProducts(
  storeId: string,
  productId: string
): Promise<StorefrontProduct[]> {
  const supabase = await createClient();
  
  // Resolve original category
  const { data: originalProduct } = await supabase
    .from("products")
    .select("category_id")
    .eq("id", productId)
    .maybeSingle();

  if (!originalProduct) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*), product_images(*)")
    .eq("store_id", storeId)
    .eq("category_id", originalProduct.category_id)
    .neq("id", productId)
    .eq("active", true)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .limit(STOREFRONT_LIMITS.relatedProducts);

  if (error || !data) return [];
  return data.map((item) => mapProductToDTO(supabase, item));
}

export async function getProductBySlug(
  storeId: string,
  productSlug: string
): Promise<StorefrontProduct | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*), product_images(*)")
    .eq("store_id", storeId)
    .eq("slug", productSlug)
    .eq("active", true)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;

  return mapProductToDTO(supabase, data);
}
