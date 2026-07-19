"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/service";
import { storeSettingsSchema, type StoreSettingsInput } from "./schema";
import {
  updateStoreSettings,
  uploadLogo,
  uploadBanner,
  removeLogo,
  removeBanner,
} from "./service";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "./constants";

export async function updateStoreSettingsAction(data: StoreSettingsInput) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const validation = storeSettingsSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    const updatedStore = await updateStoreSettings(user.id, validation.data);
    revalidatePath("/merchant", "layout");
    return { success: true, data: updatedStore };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update store settings";
    return { success: false, error: message };
  }
}

export async function uploadLogoAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

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
    const path = await uploadLogo(user.id, fileBuffer, file.type);
    revalidatePath("/merchant", "layout");
    return { success: true, path };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload logo";
    return { success: false, error: message };
  }
}

export async function uploadBannerAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

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
    const path = await uploadBanner(user.id, fileBuffer, file.type);
    revalidatePath("/merchant", "layout");
    return { success: true, path };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload banner";
    return { success: false, error: message };
  }
}

export async function removeLogoAction() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await removeLogo(user.id);
    revalidatePath("/merchant", "layout");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to remove logo";
    return { success: false, error: message };
  }
}

export async function removeBannerAction() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await removeBanner(user.id);
    revalidatePath("/merchant", "layout");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to remove banner";
    return { success: false, error: message };
  }
}
