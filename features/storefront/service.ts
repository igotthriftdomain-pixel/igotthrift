import { cache } from "react";
import { getDb } from "@/lib/db";
import { getPublicUrl } from "@/lib/storage";
import { type StorefrontDetails, type StorefrontCategory, type StorefrontProduct } from "./types";
import { STOREFRONT_LIMITS } from "./constants";

interface RawProductRow {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  stock_quantity: number;
  featured: boolean | number;
  active: boolean | number;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  category_name?: string | null;
  category_slug?: string | null;
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
  const db = getDb();
  const data = await db
    .prepare("SELECT * FROM stores WHERE LOWER(slug) = LOWER(?) AND active = 1")
    .bind(slug.trim())
    .first<Record<string, unknown>>();

  if (!data) return null;

  const logoUrl = getPublicUrl(data.logo_url ? String(data.logo_url) : null);
  const bannerUrl1 = getPublicUrl(data.banner_url ? String(data.banner_url) : null);
  const bannerUrl2: string | null = null;

  const heroSlides: Array<{ url: string; type: "image" | "video" }> = [];
  if (bannerUrl1) {
    heroSlides.push({ url: bannerUrl1, type: getMediaTypeFromUrl(bannerUrl1) });
  }
  if (bannerUrl2) {
    heroSlides.push({ url: bannerUrl2, type: getMediaTypeFromUrl(bannerUrl2) });
  }

  return {
    id: String(data.id),
    name: String(data.name),
    tagline: data.tagline ? String(data.tagline).trim() || null : null,
    slug: String(data.slug),
    description: data.description ? String(data.description) : null,
    logoUrl,
    bannerUrl: bannerUrl1,
    bannerUrl2,
    heroSlides,
    whatsappNumber: String(data.whatsapp_number),
    address: data.address ? String(data.address) : null,
    themeColor: data.theme_color ? String(data.theme_color) : "#09090b",
    instagram: data.instagram ? String(data.instagram) : null,
    facebook: data.facebook ? String(data.facebook) : null,
    website: data.website ? String(data.website) : null,
    currencyCode: String(data.currency_code || "INR"),
    currencySymbol: String(data.currency_symbol || "₹"),
    metaTitle: data.meta_title ? String(data.meta_title) : null,
    metaDescription: data.meta_description ? String(data.meta_description) : null,
  };
});

export async function getActiveCategories(storeId: string): Promise<StorefrontCategory[]> {
  const db = getDb();
  const res = await db
    .prepare("SELECT * FROM categories WHERE store_id = ? AND active = 1 ORDER BY sort_order ASC")
    .bind(storeId)
    .all<Record<string, unknown>>();

  return (res.results || []).map((cat) => {
    const imagePath = cat.image_path ? String(cat.image_path) : null;
    return {
      id: String(cat.id),
      name: String(cat.name),
      slug: String(cat.slug),
      description: cat.description ? String(cat.description) : null,
      imageUrl: getPublicUrl(imagePath),
      sortOrder: Number(cat.sort_order ?? 0),
    };
  });
}

async function mapRowsToDTOs(rows: RawProductRow[]): Promise<StorefrontProduct[]> {
  if (rows.length === 0) return [];
  const db = getDb();

  const productIds = rows.map((r) => r.id);
  const placeholders = productIds.map(() => "?").join(",");

  const imagesRes = await db
    .prepare(`SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY display_order ASC`)
    .bind(...productIds)
    .all<Record<string, unknown>>();

  const imagesByProduct: Record<
    string,
    Array<{ storagePath: string; publicUrl: string; displayOrder: number }>
  > = {};

  (imagesRes.results || []).forEach((imgRow) => {
    const pid = String(imgRow.product_id);
    if (!imagesByProduct[pid]) imagesByProduct[pid] = [];
    const storagePath = String(imgRow.storage_path);
    const pubUrl = getPublicUrl(storagePath) || storagePath;
    imagesByProduct[pid].push({
      storagePath,
      publicUrl: pubUrl,
      displayOrder: Number(imgRow.display_order ?? 0),
    });
  });

  return rows.map((item) => {
    const images = (imagesByProduct[item.id] || []).sort((a, b) => a.displayOrder - b.displayOrder);
    const primaryImage = images.find((img) => img.displayOrder === 0) || images[0] || null;
    const primaryImageUrl = primaryImage ? primaryImage.publicUrl : null;
    const stockQty = Number(item.stock_quantity ?? 0);

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      shortDescription: item.short_description,
      description: item.description,
      price: item.price,
      compareAtPrice: item.compare_at_price,
      sku: item.sku,
      stockQuantity: stockQty,
      featured: Boolean(item.featured),
      active: Boolean(item.active),
      publishedAt: item.published_at,
      metaTitle: item.meta_title,
      metaDescription: item.meta_description,
      primaryImageUrl,
      images,
      categoryName: item.category_name || null,
      categorySlug: item.category_slug || null,
    };
  });
}

export async function getFeaturedProducts(storeId: string): Promise<StorefrontProduct[]> {
  const db = getDb();
  const nowIso = new Date().toISOString();
  const limit = STOREFRONT_LIMITS.featuredProducts;

  const res = await db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.store_id = ? AND p.active = 1 AND p.featured = 1
         AND (p.published_at IS NULL OR p.published_at <= ?)
         AND p.deleted_at IS NULL
       ORDER BY p.created_at DESC
       LIMIT ?`
    )
    .bind(storeId, nowIso, limit)
    .all<RawProductRow>();

  return mapRowsToDTOs(res.results || []);
}

export async function getNewestProducts(storeId: string): Promise<StorefrontProduct[]> {
  const db = getDb();
  const nowIso = new Date().toISOString();
  const limit = STOREFRONT_LIMITS.newestProducts;

  const res = await db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.store_id = ? AND p.active = 1
         AND (p.published_at IS NULL OR p.published_at <= ?)
         AND p.deleted_at IS NULL
       ORDER BY p.created_at DESC
       LIMIT ?`
    )
    .bind(storeId, nowIso, limit)
    .all<RawProductRow>();

  return mapRowsToDTOs(res.results || []);
}

export async function getProductsByCategory(
  storeId: string,
  categorySlug: string
): Promise<StorefrontProduct[]> {
  const db = getDb();
  const nowIso = new Date().toISOString();

  const res = await db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.store_id = ? AND LOWER(c.slug) = LOWER(?) AND c.active = 1
         AND p.active = 1 AND (p.published_at IS NULL OR p.published_at <= ?)
         AND p.deleted_at IS NULL
       ORDER BY p.created_at DESC`
    )
    .bind(storeId, categorySlug.trim(), nowIso)
    .all<RawProductRow>();

  return mapRowsToDTOs(res.results || []);
}

export async function searchProducts(
  storeId: string,
  query: string
): Promise<StorefrontProduct[]> {
  const db = getDb();
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const nowIso = new Date().toISOString();
  const likePattern = `%${trimmedQuery}%`;

  const res = await db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.store_id = ? AND p.active = 1
         AND (p.published_at IS NULL OR p.published_at <= ?)
         AND p.deleted_at IS NULL
         AND (p.name LIKE ? OR p.slug LIKE ? OR p.sku LIKE ?)
       ORDER BY p.created_at DESC`
    )
    .bind(storeId, nowIso, likePattern, likePattern, likePattern)
    .all<RawProductRow>();

  return mapRowsToDTOs(res.results || []);
}

export async function getRelatedProducts(
  storeId: string,
  productId: string
): Promise<StorefrontProduct[]> {
  const db = getDb();
  const origProduct = await db
    .prepare("SELECT category_id FROM products WHERE id = ? AND store_id = ?")
    .bind(productId, storeId)
    .first<{ category_id: string | null }>();

  if (!origProduct || !origProduct.category_id) return [];

  const nowIso = new Date().toISOString();
  const limit = STOREFRONT_LIMITS.relatedProducts;

  const res = await db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.store_id = ? AND p.category_id = ? AND p.id != ?
         AND p.active = 1 AND (p.published_at IS NULL OR p.published_at <= ?)
         AND p.deleted_at IS NULL
       LIMIT ?`
    )
    .bind(storeId, origProduct.category_id, productId, nowIso, limit)
    .all<RawProductRow>();

  return mapRowsToDTOs(res.results || []);
}

export async function getProductBySlug(
  storeId: string,
  productSlug: string
): Promise<StorefrontProduct | null> {
  const db = getDb();
  const nowIso = new Date().toISOString();

  const row = await db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.store_id = ? AND LOWER(p.slug) = LOWER(?)
         AND p.active = 1 AND (p.published_at IS NULL OR p.published_at <= ?)
         AND p.deleted_at IS NULL`
    )
    .bind(storeId, productSlug.trim(), nowIso)
    .first<RawProductRow>();

  if (!row) return null;

  const dtos = await mapRowsToDTOs([row]);
  return dtos[0] || null;
}
