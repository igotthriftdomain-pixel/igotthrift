import { getDb } from "@/lib/db";
import {
  getPublicUrl,
  uploadStorageAsset,
  removeStorageAsset,
  removeStorageAssets,
  getExtensionFromMimeType,
} from "@/lib/storage";
import { type ProductWithCategoryAndImages, type ProductImage } from "./types";
import { type ProductInput } from "./schema";
import { type Category } from "@/features/categories/types";
import { ITEMS_PER_PAGE } from "./constants";

export function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid characters
    .replace(/[\s_]+/g, "-") // replace spaces and underscores with hyphens
    .replace(/-+/g, "-") // squeeze double hyphens
    .replace(/^-+|-+$/g, ""); // trim hyphens
}

export async function checkSlugExists(
  storeId: string,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const db = getDb();
  let query = "SELECT id FROM products WHERE store_id = ? AND LOWER(slug) = LOWER(?) AND deleted_at IS NULL";
  const params: unknown[] = [storeId, slug];

  if (excludeId) {
    query += " AND id != ?";
    params.push(excludeId);
  }

  const row = await db.prepare(query).bind(...params).first<{ id: string }>();
  return !!row;
}

export async function getProducts(
  storeId: string,
  filters: {
    q?: string;
    category?: string;
    status?: string;
    featured?: string;
    page?: number;
    sort?: string;
  }
): Promise<{ products: ProductWithCategoryAndImages[]; totalCount: number }> {
  const db = getDb();
  const page = filters.page || 1;
  const q = (filters.q || "").trim();

  let whereClause = "WHERE p.store_id = ? AND p.deleted_at IS NULL";
  const params: unknown[] = [storeId];

  if (q) {
    whereClause += " AND (p.name LIKE ? OR p.slug LIKE ? OR p.sku LIKE ?)";
    const likePattern = `%${q}%`;
    params.push(likePattern, likePattern, likePattern);
  }

  if (filters.category && filters.category !== "all") {
    whereClause += " AND p.category_id = ?";
    params.push(filters.category);
  }

  if (filters.featured === "true") {
    whereClause += " AND p.featured = 1";
  }

  const nowIso = new Date().toISOString();
  if (filters.status) {
    if (filters.status === "published") {
      whereClause += " AND p.active = 1 AND (p.published_at IS NULL OR p.published_at <= ?)";
      params.push(nowIso);
    } else if (filters.status === "draft") {
      whereClause += " AND p.active = 0";
    } else if (filters.status === "scheduled") {
      whereClause += " AND p.active = 1 AND p.published_at > ?";
      params.push(nowIso);
    }
  }

  // Count query
  const countRow = await db
    .prepare(`SELECT COUNT(*) as total FROM products p ${whereClause}`)
    .bind(...params)
    .first<{ total: number }>();
  const totalCount = countRow ? Number(countRow.total) : 0;

  // Sorting
  let orderBy = "ORDER BY p.created_at DESC";
  if (filters.sort === "price_asc") {
    orderBy = "ORDER BY p.price ASC";
  } else if (filters.sort === "price_desc") {
    orderBy = "ORDER BY p.price DESC";
  } else if (filters.sort === "stock_asc") {
    orderBy = "ORDER BY p.stock_quantity ASC";
  }

  const limit = ITEMS_PER_PAGE;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const dataQuery = `
    SELECT
      p.*,
      c.id as cat_id, c.store_id as cat_store_id, c.name as cat_name, c.slug as cat_slug,
      c.description as cat_description, c.image_path as cat_image_path, c.sort_order as cat_sort_order,
      c.active as cat_active, c.created_at as cat_created_at, c.updated_at as cat_updated_at
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const dataParams = [...params, limit, offset];
  const res = await db.prepare(dataQuery).bind(...dataParams).all<Record<string, unknown>>();

  const productRows = res.results || [];
  if (productRows.length === 0) {
    return { products: [], totalCount };
  }

  const productIds = productRows.map((r) => String(r.id));
  const placeholders = productIds.map(() => "?").join(",");

  const imagesRes = await db
    .prepare(`SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY display_order ASC`)
    .bind(...productIds)
    .all<Record<string, unknown>>();

  const imagesByProduct: Record<string, ProductImage[]> = {};
  (imagesRes.results || []).forEach((imgRow) => {
    const pid = String(imgRow.product_id);
    if (!imagesByProduct[pid]) imagesByProduct[pid] = [];
    const storagePath = String(imgRow.storage_path);
    imagesByProduct[pid].push({
      id: String(imgRow.id),
      product_id: pid,
      storage_path: storagePath,
      alt_text: imgRow.alt_text ? String(imgRow.alt_text) : null,
      display_order: Number(imgRow.display_order ?? 0),
      is_primary: Boolean(imgRow.is_primary),
      created_at: String(imgRow.created_at),
      publicUrl: getPublicUrl(storagePath) || storagePath,
    });
  });

  const products: ProductWithCategoryAndImages[] = productRows.map((r) => {
    const pid = String(r.id);
    const catImagePath = r.cat_image_path ? String(r.cat_image_path) : null;
    const category: Category | null = r.cat_id
      ? {
          id: String(r.cat_id),
          store_id: String(r.cat_store_id),
          name: String(r.cat_name),
          slug: String(r.cat_slug),
          description: r.cat_description ? String(r.cat_description) : null,
          image_path: catImagePath,
          sort_order: Number(r.cat_sort_order ?? 0),
          active: Boolean(r.cat_active),
          created_at: String(r.cat_created_at),
          updated_at: String(r.cat_updated_at),
          imageUrl: getPublicUrl(catImagePath),
        }
      : null;

    const stockQty = Number(r.stock_quantity ?? r.stock ?? 0);

    return {
      id: pid,
      store_id: String(r.store_id),
      category_id: String(r.category_id || ""),
      name: String(r.name),
      slug: String(r.slug),
      short_description: r.short_description ? String(r.short_description) : null,
      description: r.description ? String(r.description) : null,
      price: Number(r.price ?? 0),
      compare_at_price: r.compare_at_price !== null && r.compare_at_price !== undefined ? Number(r.compare_at_price) : null,
      sku: r.sku ? String(r.sku) : null,
      stock: stockQty,
      stock_quantity: stockQty,
      featured: Boolean(r.featured),
      active: Boolean(r.active),
      published_at: r.published_at ? String(r.published_at) : null,
      sort_order: Number(r.sort_order ?? 0),
      meta_title: r.meta_title ? String(r.meta_title) : null,
      meta_description: r.meta_description ? String(r.meta_description) : null,
      created_at: String(r.created_at),
      updated_at: String(r.updated_at),
      deleted_at: r.deleted_at ? String(r.deleted_at) : null,
      categories: category,
      product_images: imagesByProduct[pid] || [],
    };
  });

  return {
    products,
    totalCount,
  };
}

export async function getProductById(
  storeId: string,
  productId: string
): Promise<ProductWithCategoryAndImages | null> {
  const db = getDb();
  const dataQuery = `
    SELECT
      p.*,
      c.id as cat_id, c.store_id as cat_store_id, c.name as cat_name, c.slug as cat_slug,
      c.description as cat_description, c.image_path as cat_image_path, c.sort_order as cat_sort_order,
      c.active as cat_active, c.created_at as cat_created_at, c.updated_at as cat_updated_at
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? AND p.store_id = ? AND p.deleted_at IS NULL
  `;

  const r = await db.prepare(dataQuery).bind(productId, storeId).first<Record<string, unknown>>();
  if (!r) return null;

  const imagesRes = await db
    .prepare("SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC")
    .bind(productId)
    .all<Record<string, unknown>>();

  const product_images: ProductImage[] = (imagesRes.results || []).map((imgRow) => {
    const storagePath = String(imgRow.storage_path);
    return {
      id: String(imgRow.id),
      product_id: productId,
      storage_path: storagePath,
      alt_text: imgRow.alt_text ? String(imgRow.alt_text) : null,
      display_order: Number(imgRow.display_order ?? 0),
      is_primary: Boolean(imgRow.is_primary),
      created_at: String(imgRow.created_at),
      publicUrl: getPublicUrl(storagePath) || storagePath,
    };
  });

  const catImagePath = r.cat_image_path ? String(r.cat_image_path) : null;
  const category: Category | null = r.cat_id
    ? {
        id: String(r.cat_id),
        store_id: String(r.cat_store_id),
        name: String(r.cat_name),
        slug: String(r.cat_slug),
        description: r.cat_description ? String(r.cat_description) : null,
        image_path: catImagePath,
        sort_order: Number(r.cat_sort_order ?? 0),
        active: Boolean(r.cat_active),
        created_at: String(r.cat_created_at),
        updated_at: String(r.cat_updated_at),
        imageUrl: getPublicUrl(catImagePath),
      }
    : null;

  const stockQty = Number(r.stock_quantity ?? r.stock ?? 0);

  return {
    id: String(r.id),
    store_id: String(r.store_id),
    category_id: String(r.category_id || ""),
    name: String(r.name),
    slug: String(r.slug),
    short_description: r.short_description ? String(r.short_description) : null,
    description: r.description ? String(r.description) : null,
    price: Number(r.price ?? 0),
    compare_at_price: r.compare_at_price !== null && r.compare_at_price !== undefined ? Number(r.compare_at_price) : null,
    sku: r.sku ? String(r.sku) : null,
    stock: stockQty,
    stock_quantity: stockQty,
    featured: Boolean(r.featured),
    active: Boolean(r.active),
    published_at: r.published_at ? String(r.published_at) : null,
    sort_order: Number(r.sort_order ?? 0),
    meta_title: r.meta_title ? String(r.meta_title) : null,
    meta_description: r.meta_description ? String(r.meta_description) : null,
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
    deleted_at: r.deleted_at ? String(r.deleted_at) : null,
    categories: category,
    product_images,
  };
}

export async function generateUniqueSlug(
  storeId: string,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let candidateSlug = baseSlug;
  let count = 1;

  while (await checkSlugExists(storeId, candidateSlug, excludeId)) {
    candidateSlug = `${baseSlug}-${count}`;
    count++;
  }

  return candidateSlug;
}

export async function createProduct(storeId: string, productId: string, data: ProductInput) {
  const db = getDb();
  const rawSlug = normalizeSlug(data.slug || data.name);
  const finalSlug = await generateUniqueSlug(storeId, rawSlug);

  const stockQty = Number(data.stock ?? 0);

  await db
    .prepare(
      `INSERT INTO products (
        id, store_id, category_id, name, slug, short_description, description,
        price, compare_at_price, sku, stock_quantity, featured, active, published_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    )
    .bind(
      productId,
      storeId,
      data.category_id || null,
      data.name.trim(),
      finalSlug,
      null,
      data.description ? data.description.trim() || null : null,
      data.price,
      data.compare_at_price ?? null,
      data.sku ? data.sku.trim() || null : null,
      stockQty,
      data.featured ? 1 : 0,
      data.active ? 1 : 0,
      data.published_at || null
    )
    .run();

  if (data.images && data.images.length > 0) {
    const statements = data.images.map((img) =>
      db
        .prepare(
          `INSERT INTO product_images (id, product_id, storage_path, display_order, is_primary, created_at)
           VALUES (?, ?, ?, ?, ?, datetime('now'))`
        )
        .bind(
          crypto.randomUUID(),
          productId,
          img.storage_path,
          img.display_order,
          img.is_primary ? 1 : 0
        )
    );
    await db.batch(statements);
  }
}

export async function updateProduct(storeId: string, productId: string, data: ProductInput) {
  const db = getDb();
  const rawSlug = normalizeSlug(data.slug || data.name);
  const finalSlug = await generateUniqueSlug(storeId, rawSlug, productId);

  const stockQty = Number(data.stock ?? 0);

  // Fetch existing product images to identify removed images for R2 deletion
  const existingImagesRes = await db
    .prepare("SELECT storage_path FROM product_images WHERE product_id = ?")
    .bind(productId)
    .all<{ storage_path: string }>();

  const existingPaths = (existingImagesRes.results || []).map((img) => img.storage_path);
  const newPaths = new Set((data.images || []).map((img) => img.storage_path));
  const removedPaths = existingPaths.filter((pathKey) => !newPaths.has(pathKey));

  if (removedPaths.length > 0) {
    try {
      await removeStorageAssets(storeId, removedPaths);
    } catch {
      // Ignore deletion errors for missing files
    }
  }

  await db
    .prepare(
      `UPDATE products SET
        category_id = ?,
        name = ?,
        slug = ?,
        description = ?,
        price = ?,
        compare_at_price = ?,
        sku = ?,
        stock_quantity = ?,
        featured = ?,
        active = ?,
        published_at = ?,
        updated_at = datetime('now')
      WHERE id = ? AND store_id = ?`
    )
    .bind(
      data.category_id || null,
      data.name.trim(),
      finalSlug,
      data.description ? data.description.trim() || null : null,
      data.price,
      data.compare_at_price ?? null,
      data.sku ? data.sku.trim() || null : null,
      stockQty,
      data.featured ? 1 : 0,
      data.active ? 1 : 0,
      data.published_at || null,
      productId,
      storeId
    )
    .run();

  // Sync images
  await db
    .prepare("DELETE FROM product_images WHERE product_id = ?")
    .bind(productId)
    .run();

  if (data.images && data.images.length > 0) {
    const statements = data.images.map((img) =>
      db
        .prepare(
          `INSERT INTO product_images (id, product_id, storage_path, display_order, is_primary, created_at)
           VALUES (?, ?, ?, ?, ?, datetime('now'))`
        )
        .bind(
          crypto.randomUUID(),
          productId,
          img.storage_path,
          img.display_order,
          img.is_primary ? 1 : 0
        )
    );
    await db.batch(statements);
  }
}

export async function deleteProduct(storeId: string, productId: string) {
  const db = getDb();
  await db
    .prepare("UPDATE products SET deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ? AND store_id = ?")
    .bind(productId, storeId)
    .run();
}

export async function uploadProductImage(
  storeId: string,
  productId: string,
  imageUuid: string,
  fileBuffer: Buffer,
  contentType: string
) {
  const ext = getExtensionFromMimeType(contentType);
  const storagePath = `products/${storeId}/${productId}/${imageUuid}.${ext}`;

  const { publicUrl } = await uploadStorageAsset({
    storeId,
    pathKey: storagePath,
    buffer: fileBuffer,
    contentType,
  });

  return { storagePath, publicUrl };
}

export async function removeProductImage(storeId: string, storagePath: string) {
  await removeStorageAsset(storeId, storagePath);
}
