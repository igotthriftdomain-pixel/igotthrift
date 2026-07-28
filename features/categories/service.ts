import { createClient } from "@/lib/supabase/server";
import { type Category } from "./types";
import { type CategoryInput } from "./schema";
import { ITEMS_PER_PAGE } from "./constants";

export function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid characters
    .replace(/[\s_]+/g, "-")      // replace spaces and underscores with hyphens
    .replace(/-+/g, "-")          // squeeze double hyphens
    .replace(/^-+|-+$/g, "");     // trim hyphens
}

export async function checkSlugExists(
  storeId: string,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("id")
    .eq("store_id", storeId)
    .eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) return false;
  return !!data;
}

export async function getCategories(
  storeId: string,
  searchQuery: string = "",
  page: number = 1
): Promise<{ categories: Category[]; totalCount: number }> {
  const supabase = await createClient();
  const trimmedSearch = searchQuery.trim();

  let query = supabase
    .from("categories")
    .select("*", { count: "exact" })
    .eq("store_id", storeId);

  if (trimmedSearch) {
    query = query.or(`name.ilike.%${trimmedSearch}%,slug.ilike.%${trimmedSearch}%`);
  }

  // Order by sort_order first, then created_at
  query = query.order("sort_order", { ascending: true }).order("created_at", { ascending: false });

  // Pagination bounds
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const categories = ((data as Category[]) || []).map((cat) => ({
    ...cat,
    imageUrl: cat.image_path
      ? supabase.storage.from("store-assets").getPublicUrl(cat.image_path).data.publicUrl
      : null,
  }));

  return {
    categories,
    totalCount: count || 0,
  };
}

export async function createCategory(storeId: string, data: CategoryInput) {
  const supabase = await createClient();
  const normalizedSlug = normalizeSlug(data.slug || data.name);

  // Check duplicate slug
  const exists = await checkSlugExists(storeId, normalizedSlug);
  if (exists) {
    throw new Error("duplicate_slug");
  }

  // Get max sort_order
  const { data: maxSortData } = await supabase
    .from("categories")
    .select("sort_order")
    .eq("store_id", storeId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSortOrder = maxSortData ? maxSortData.sort_order + 1 : 0;

  const { data: category, error } = await supabase
    .from("categories")
    .insert({
      store_id: storeId,
      name: data.name.trim(),
      slug: normalizedSlug,
      description: data.description ? data.description.trim() : null,
      image_path: data.image_path || null,
      active: data.active,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return category as Category;
}

export async function updateCategory(
  storeId: string,
  categoryId: string,
  data: CategoryInput
) {
  const supabase = await createClient();
  const normalizedSlug = normalizeSlug(data.slug || data.name);

  // Check duplicate slug
  const exists = await checkSlugExists(storeId, normalizedSlug, categoryId);
  if (exists) {
    throw new Error("duplicate_slug");
  }

  const { data: category, error } = await supabase
    .from("categories")
    .update({
      name: data.name.trim(),
      slug: normalizedSlug,
      description: data.description ? data.description.trim() : null,
      image_path: data.image_path || null,
      active: data.active,
    })
    .eq("id", categoryId)
    .eq("store_id", storeId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return category as Category;
}

export async function toggleCategoryStatus(
  storeId: string,
  categoryId: string,
  active: boolean
) {
  const supabase = await createClient();
  const { data: category, error } = await supabase
    .from("categories")
    .update({ active })
    .eq("id", categoryId)
    .eq("store_id", storeId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return category as Category;
}

export async function deleteCategory(storeId: string, categoryId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("store_id", storeId);

  if (error) {
    if (error.code === "23503") {
      throw new Error("foreign_key_restriction");
    }
    throw new Error(error.message);
  }
}

export async function reorderCategories(storeId: string, orderedIds: string[]) {
  const supabase = await createClient();
  // Call postgres RPC transaction function to handle sequential reordering safely
  const { error } = await supabase.rpc("reorder_categories", {
    category_ids: orderedIds,
  });

  if (error) throw new Error(error.message);
}

export async function uploadCategoryImage(
  storeId: string,
  categoryId: string,
  fileBuffer: Buffer,
  contentType: string
) {
  const supabase = await createClient();
  const imageUuid = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
  const storagePath = `stores/${storeId}/categories/${categoryId}_${imageUuid}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("store-assets")
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  const publicUrl = supabase.storage.from("store-assets").getPublicUrl(storagePath).data.publicUrl;

  return { storagePath, publicUrl };
}

export async function removeCategoryImage(storeId: string, storagePath: string) {
  const supabase = await createClient();

  if (!storagePath.startsWith(`stores/${storeId}/`)) {
    throw new Error("Unauthorized storage path");
  }

  const { error } = await supabase.storage.from("store-assets").remove([storagePath]);
  if (error) throw new Error(error.message);
}
