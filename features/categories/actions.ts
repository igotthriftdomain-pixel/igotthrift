"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/service";
import { getStoreByOwner } from "@/features/store/service";
import { categorySchema, type CategoryInput } from "./schema";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  reorderCategories,
} from "./service";

export async function createCategoryAction(data: CategoryInput) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const store = await getStoreByOwner(user.id);
  if (!store) return { success: false, error: "Store not found" };

  const validation = categorySchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    const category = await createCategory(store.id, validation.data);
    revalidatePath("/merchant", "layout");
    return { success: true, category };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create category";
    if (message === "duplicate_slug") {
      return { success: false, error: "A category with this URL slug already exists in your store." };
    }
    return { success: false, error: message };
  }
}

export async function updateCategoryAction(categoryId: string, data: CategoryInput) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const store = await getStoreByOwner(user.id);
  if (!store) return { success: false, error: "Store not found" };

  const validation = categorySchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    const category = await updateCategory(store.id, categoryId, validation.data);
    revalidatePath("/merchant", "layout");
    return { success: true, category };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update category";
    if (message === "duplicate_slug") {
      return { success: false, error: "A category with this URL slug already exists in your store." };
    }
    return { success: false, error: message };
  }
}

export async function toggleCategoryStatusAction(categoryId: string, active: boolean) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const store = await getStoreByOwner(user.id);
  if (!store) return { success: false, error: "Store not found" };

  try {
    const category = await toggleCategoryStatus(store.id, categoryId, active);
    revalidatePath("/merchant", "layout");
    return { success: true, category };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to toggle status";
    return { success: false, error: message };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const store = await getStoreByOwner(user.id);
  if (!store) return { success: false, error: "Store not found" };

  try {
    await deleteCategory(store.id, categoryId);
    revalidatePath("/merchant", "layout");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete category";
    if (message === "foreign_key_restriction") {
      return {
        success: false,
        error: "Cannot delete this category because it contains active products. Please delete or reassign the products first.",
      };
    }
    return { success: false, error: message };
  }
}

export async function updateCategoriesOrderAction(orderedIds: string[]) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const store = await getStoreByOwner(user.id);
  if (!store) return { success: false, error: "Store not found" };

  try {
    await reorderCategories(store.id, orderedIds);
    revalidatePath("/merchant", "layout");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reorder categories";
    return { success: false, error: message };
  }
}
