import { getDb } from "@/lib/db";
import {
  getPublicUrl,
  uploadStorageAsset,
  removeStorageAsset,
  getExtensionFromMimeType,
} from "@/lib/storage";
import { type Category } from "./types";
import { type CategoryInput } from "./schema";
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
  let query = "SELECT id FROM categories WHERE store_id = ? AND LOWER(slug) = LOWER(?)";
  const params: unknown[] = [storeId, slug];

  if (excludeId) {
    query += " AND id != ?";
    params.push(excludeId);
  }

  const row = await db.prepare(query).bind(...params).first<{ id: string }>();
  return !!row;
}

export async function getCategories(
  storeId: string,
  searchQuery: string = "",
  page: number = 1
): Promise<{ categories: Category[]; totalCount: number }> {
  const db = getDb();
  const trimmedSearch = searchQuery.trim();

  let whereClause = "WHERE store_id = ?";
  const params: unknown[] = [storeId];

  if (trimmedSearch) {
    whereClause += " AND (name LIKE ? OR slug LIKE ?)";
    const likePattern = `%${trimmedSearch}%`;
    params.push(likePattern, likePattern);
  }

  // Count query
  const countRow = await db
    .prepare(`SELECT COUNT(*) as total FROM categories ${whereClause}`)
    .bind(...params)
    .first<{ total: number }>();
  const totalCount = countRow ? Number(countRow.total) : 0;

  // Pagination
  const limit = ITEMS_PER_PAGE;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const dataQuery = `SELECT * FROM categories ${whereClause} ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?`;
  const dataParams = [...params, limit, offset];

  const res = await db.prepare(dataQuery).bind(...dataParams).all<Record<string, unknown>>();

  const categories: Category[] = (res.results || []).map((cat) => {
    const imagePath = cat.image_path ? String(cat.image_path) : null;
    return {
      id: String(cat.id),
      store_id: String(cat.store_id),
      name: String(cat.name),
      slug: String(cat.slug),
      description: cat.description ? String(cat.description) : null,
      image_path: imagePath,
      sort_order: Number(cat.sort_order ?? 0),
      active: Boolean(cat.active),
      created_at: String(cat.created_at),
      updated_at: String(cat.updated_at),
      imageUrl: getPublicUrl(imagePath),
    };
  });

  return {
    categories,
    totalCount,
  };
}

export async function createCategory(storeId: string, data: CategoryInput): Promise<Category> {
  const db = getDb();
  const normalizedSlug = normalizeSlug(data.slug || data.name);

  // Check duplicate slug
  const exists = await checkSlugExists(storeId, normalizedSlug);
  if (exists) {
    throw new Error("duplicate_slug");
  }

  // Get max sort_order
  const maxSortRow = await db
    .prepare("SELECT MAX(sort_order) as max_sort FROM categories WHERE store_id = ?")
    .bind(storeId)
    .first<{ max_sort: number | null }>();

  const nextSortOrder =
    maxSortRow && maxSortRow.max_sort !== null ? Number(maxSortRow.max_sort) + 1 : 0;

  const id = crypto.randomUUID();
  const activeInt = data.active ? 1 : 0;
  const description = data.description ? data.description.trim() || null : null;
  const imagePath = data.image_path || null;

  await db
    .prepare(
      `INSERT INTO categories (id, store_id, name, slug, description, image_path, active, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    )
    .bind(id, storeId, data.name.trim(), normalizedSlug, description, imagePath, activeInt, nextSortOrder)
    .run();

  const created = await db
    .prepare("SELECT * FROM categories WHERE id = ? AND store_id = ?")
    .bind(id, storeId)
    .first<Record<string, unknown>>();

  if (!created) throw new Error("Failed to create category");

  return {
    ...created,
    active: Boolean(created.active),
    imageUrl: getPublicUrl(imagePath),
  } as unknown as Category;
}

export async function updateCategory(
  storeId: string,
  categoryId: string,
  data: CategoryInput
): Promise<Category> {
  const db = getDb();
  const normalizedSlug = normalizeSlug(data.slug || data.name);

  const exists = await checkSlugExists(storeId, normalizedSlug, categoryId);
  if (exists) {
    throw new Error("duplicate_slug");
  }

  const activeInt = data.active ? 1 : 0;
  const description = data.description ? data.description.trim() || null : null;
  const imagePath = data.image_path || null;

  // Check if image changed and delete old image if replaced
  const existingCat = await db
    .prepare("SELECT image_path FROM categories WHERE id = ? AND store_id = ?")
    .bind(categoryId, storeId)
    .first<{ image_path: string | null }>();

  if (existingCat?.image_path && existingCat.image_path !== imagePath) {
    try {
      await removeStorageAsset(storeId, existingCat.image_path);
    } catch {
      // Ignore missing image
    }
  }

  await db
    .prepare(
      `UPDATE categories SET
        name = ?,
        slug = ?,
        description = ?,
        image_path = ?,
        active = ?,
        updated_at = datetime('now')
      WHERE id = ? AND store_id = ?`
    )
    .bind(data.name.trim(), normalizedSlug, description, imagePath, activeInt, categoryId, storeId)
    .run();

  const updated = await db
    .prepare("SELECT * FROM categories WHERE id = ? AND store_id = ?")
    .bind(categoryId, storeId)
    .first<Record<string, unknown>>();

  if (!updated) throw new Error("Category not found");

  return {
    ...updated,
    active: Boolean(updated.active),
    imageUrl: getPublicUrl(imagePath),
  } as unknown as Category;
}

export async function toggleCategoryStatus(
  storeId: string,
  categoryId: string,
  active: boolean
): Promise<Category> {
  const db = getDb();
  const activeInt = active ? 1 : 0;

  await db
    .prepare("UPDATE categories SET active = ?, updated_at = datetime('now') WHERE id = ? AND store_id = ?")
    .bind(activeInt, categoryId, storeId)
    .run();

  const updated = await db
    .prepare("SELECT * FROM categories WHERE id = ? AND store_id = ?")
    .bind(categoryId, storeId)
    .first<Record<string, unknown>>();

  if (!updated) throw new Error("Category not found");

  return {
    ...updated,
    active: Boolean(updated.active),
    imageUrl: getPublicUrl(updated.image_path ? String(updated.image_path) : null),
  } as unknown as Category;
}

export async function deleteCategory(storeId: string, categoryId: string): Promise<void> {
  const db = getDb();

  const productCheck = await db
    .prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ? AND store_id = ? AND deleted_at IS NULL")
    .bind(categoryId, storeId)
    .first<{ count: number }>();

  if (productCheck && Number(productCheck.count) > 0) {
    throw new Error("foreign_key_restriction");
  }

  const existingCat = await db
    .prepare("SELECT image_path FROM categories WHERE id = ? AND store_id = ?")
    .bind(categoryId, storeId)
    .first<{ image_path: string | null }>();

  if (existingCat?.image_path) {
    try {
      await removeStorageAsset(storeId, existingCat.image_path);
    } catch {
      // Ignore missing file
    }
  }

  await db
    .prepare("DELETE FROM categories WHERE id = ? AND store_id = ?")
    .bind(categoryId, storeId)
    .run();
}

export async function reorderCategories(storeId: string, orderedIds: string[]): Promise<void> {
  const db = getDb();
  const statements = orderedIds.map((id, index) =>
    db
      .prepare(
        "UPDATE categories SET sort_order = ?, updated_at = datetime('now') WHERE id = ? AND store_id = ?"
      )
      .bind(index, id, storeId)
  );

  await db.batch(statements);
}

export async function uploadCategoryImage(
  storeId: string,
  categoryId: string,
  fileBuffer: Buffer,
  contentType: string
) {
  const imageUuid = crypto.randomUUID();
  const ext = getExtensionFromMimeType(contentType);
  const storagePath = `stores/${storeId}/categories/${categoryId}_${imageUuid}.${ext}`;

  const { publicUrl } = await uploadStorageAsset({
    storeId,
    pathKey: storagePath,
    buffer: fileBuffer,
    contentType,
  });

  return { storagePath, publicUrl };
}

export async function removeCategoryImage(storeId: string, storagePath: string) {
  await removeStorageAsset(storeId, storagePath);
}
