"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/service";
import { getStoreByOwner } from "@/features/store/service";
import { productSchema, type ProductInput } from "./schema";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  removeProductImage,
} from "./service";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "./constants";

export async function createProductAction(productId: string, data: ProductInput) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const store = await getStoreByOwner(user.id);
  if (!store) return { success: false, error: "Store not found" };

  const validation = productSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    await createProduct(store.id, productId, validation.data);
    revalidatePath("/merchant", "layout");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create product";
    if (message === "duplicate_slug") {
      return { success: false, error: "A product with this URL slug already exists in your store." };
    }
    return { success: false, error: message };
  }
}

export async function updateProductAction(productId: string, data: ProductInput) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const store = await getStoreByOwner(user.id);
  if (!store) return { success: false, error: "Store not found" };

  const validation = productSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    await updateProduct(store.id, productId, validation.data);
    revalidatePath("/merchant", "layout");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update product";
    if (message === "duplicate_slug") {
      return { success: false, error: "A product with this URL slug already exists in your store." };
    }
    return { success: false, error: message };
  }
}

export async function deleteProductAction(productId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const store = await getStoreByOwner(user.id);
  if (!store) return { success: false, error: "Store not found" };

  try {
    await deleteProduct(store.id, productId);
    revalidatePath("/merchant", "layout");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete product";
    return { success: false, error: message };
  }
}

export async function uploadProductImageAction(productId: string, imageUuid: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const store = await getStoreByOwner(user.id);
  if (!store) return { success: false, error: "Store not found" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: "Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "File size exceeds the 5MB limit." };
  }

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadProductImage(store.id, productId, imageUuid, fileBuffer, file.type);
    return { success: true, ...result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload image";
    return { success: false, error: message };
  }
}

export async function removeProductImageAction(storagePath: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const store = await getStoreByOwner(user.id);
  if (!store) return { success: false, error: "Store not found" };

  try {
    await removeProductImage(store.id, storagePath);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to remove image";
    return { success: false, error: message };
  }
}
