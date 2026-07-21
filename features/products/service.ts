import { createClient } from "@/lib/supabase/server";
import { type ProductWithCategoryAndImages } from "./types";
import { type ProductInput } from "./schema";
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
    .from("products")
    .select("id")
    .eq("store_id", storeId)
    .eq("slug", slug)
    .is("deleted_at", null);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) return false;
  return !!data;
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
  const supabase = await createClient();
  const page = filters.page || 1;
  const q = filters.q || "";

  let query = supabase
    .from("products")
    .select("*, categories(*), product_images(*)", { count: "exact" })
    .eq("store_id", storeId)
    .is("deleted_at", null);

  if (q.trim()) {
    query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%,sku.ilike.%${q}%`);
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category_id", filters.category);
  }

  if (filters.featured === "true") {
    query = query.eq("featured", true);
  }

  if (filters.status) {
    if (filters.status === "published") {
      query = query.eq("active", true).lte("published_at", new Date().toISOString());
    } else if (filters.status === "draft") {
      query = query.eq("active", false);
    } else if (filters.status === "scheduled") {
      query = query.eq("active", true).gt("published_at", new Date().toISOString());
    }
  }

  // Sorting logic
  if (filters.sort) {
    if (filters.sort === "price_asc") {
      query = query.order("price", { ascending: true });
    } else if (filters.sort === "price_desc") {
      query = query.order("price", { ascending: false });
    } else if (filters.sort === "stock_asc") {
      query = query.order("stock", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const products = (data || []) as ProductWithCategoryAndImages[];

  // Server-side Public URL resolution & ordering
  products.forEach((product) => {
    if (product.product_images) {
      product.product_images.forEach((img) => {
        img.publicUrl = supabase.storage.from("store-assets").getPublicUrl(img.storage_path).data.publicUrl;
      });
      product.product_images.sort((a, b) => a.display_order - b.display_order);
    }
  });

  return {
    products,
    totalCount: count || 0,
  };
}

export async function getProductById(
  storeId: string,
  productId: string
): Promise<ProductWithCategoryAndImages | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*), product_images(*)")
    .eq("id", productId)
    .eq("store_id", storeId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;

  const product = data as ProductWithCategoryAndImages;
  if (product.product_images) {
    product.product_images.forEach((img) => {
      img.publicUrl = supabase.storage.from("store-assets").getPublicUrl(img.storage_path).data.publicUrl;
    });
    product.product_images.sort((a, b) => a.display_order - b.display_order);
  }

  return product;
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
  const supabase = await createClient();
  const rawSlug = normalizeSlug(data.slug || data.name);
  const finalSlug = await generateUniqueSlug(storeId, rawSlug);

  const { error: productError } = await supabase.from("products").insert({
    id: productId,
    store_id: storeId,
    category_id: data.category_id,
    name: data.name.trim(),
    slug: finalSlug,
    description: data.description ? data.description.trim() : null,
    price: data.price,
    compare_at_price: data.compare_at_price ?? null,
    sku: data.sku ? data.sku.trim() : null,
    stock: data.stock,
    featured: data.featured,
    active: data.active,
    published_at: data.published_at || null,
  });

  if (productError) throw new Error(productError.message);

  // Bulk insert images
  if (data.images && data.images.length > 0) {
    const imagesToInsert = data.images.map((img) => ({
      product_id: productId,
      storage_path: img.storage_path,
      display_order: img.display_order,
    }));

    const { error: imagesError } = await supabase.from("product_images").insert(imagesToInsert);
    if (imagesError) throw new Error(imagesError.message);
  }
}

export async function updateProduct(storeId: string, productId: string, data: ProductInput) {
  const supabase = await createClient();
  const rawSlug = normalizeSlug(data.slug || data.name);
  const finalSlug = await generateUniqueSlug(storeId, rawSlug, productId);

  const { error: productError } = await supabase
    .from("products")
    .update({
      category_id: data.category_id,
      name: data.name.trim(),
      slug: finalSlug,
      description: data.description ? data.description.trim() : null,
      price: data.price,
      compare_at_price: data.compare_at_price ?? null,
      sku: data.sku ? data.sku.trim() : null,
      stock: data.stock,
      featured: data.featured,
      active: data.active,
      published_at: data.published_at || null,
    })
    .eq("id", productId)
    .eq("store_id", storeId);

  if (productError) throw new Error(productError.message);

  // Sync images
  const { error: deleteImagesError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);

  if (deleteImagesError) throw new Error(deleteImagesError.message);

  if (data.images && data.images.length > 0) {
    const imagesToInsert = data.images.map((img) => ({
      product_id: productId,
      storage_path: img.storage_path,
      display_order: img.display_order,
    }));

    const { error: imagesError } = await supabase.from("product_images").insert(imagesToInsert);
    if (imagesError) throw new Error(imagesError.message);
  }
}

export async function deleteProduct(storeId: string, productId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", productId)
    .eq("store_id", storeId);

  if (error) throw new Error(error.message);
}

export async function uploadProductImage(
  storeId: string,
  productId: string,
  imageUuid: string,
  fileBuffer: Buffer,
  contentType: string
) {
  const supabase = await createClient();
  const storagePath = `products/${storeId}/${productId}/${imageUuid}.webp`;

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

export async function removeProductImage(storeId: string, storagePath: string) {
  const supabase = await createClient();

  if (!storagePath.startsWith(`products/${storeId}/`)) {
    throw new Error("Unauthorized storage path");
  }

  const { error } = await supabase.storage.from("store-assets").remove([storagePath]);
  if (error) throw new Error(error.message);
}
