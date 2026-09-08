import { getDb } from "@/lib/db";
import {
  getPublicUrl,
  uploadStorageAsset,
  removeStorageAsset,
  getExtensionFromMimeType,
  getStorage,
} from "@/lib/storage";
import { type Store } from "./types";
import { type StoreSettingsInput } from "./schema";

export async function getStoreByOwner(userId: string): Promise<Store | null> {
  const db = getDb();
  const store = await db
    .prepare("SELECT * FROM stores WHERE owner_id = ?")
    .bind(userId)
    .first<Record<string, unknown>>();

  if (!store) return null;

  return {
    ...store,
    active: Boolean(store.active),
  } as unknown as Store;
}

export async function getStoreSettings(userId: string) {
  const store = await getStoreByOwner(userId);
  if (!store) return null;

  const logoPublicUrl = getPublicUrl(store.logo_url);
  const bannerPublicUrl1 = getPublicUrl(store.banner_url);

  return {
    store,
    logoPublicUrl,
    bannerPublicUrl: bannerPublicUrl1,
    bannerPublicUrl1,
    bannerPublicUrl2: null as string | null,
  };
}

export async function updateStoreSettings(userId: string, data: StoreSettingsInput) {
  const db = getDb();
  const store = await getStoreByOwner(userId);
  if (!store) throw new Error("Store not found or unauthorized");

  const tagline = data.tagline ? data.tagline.trim() || null : null;
  const description = data.description ? data.description.trim() || null : null;
  const address = data.address ? data.address.trim() || null : null;
  const website = data.website ? data.website.trim() || null : null;
  const instagram = data.instagram ? data.instagram.trim() || null : null;
  const facebook = data.facebook ? data.facebook.trim() || null : null;
  const metaTitle = data.meta_title ? data.meta_title.trim() || null : null;
  const metaDescription = data.meta_description ? data.meta_description.trim() || null : null;

  await db
    .prepare(
      `UPDATE stores SET
        name = ?,
        tagline = ?,
        description = ?,
        whatsapp_number = ?,
        address = ?,
        theme_color = ?,
        currency_code = ?,
        currency_symbol = ?,
        website = ?,
        instagram = ?,
        facebook = ?,
        meta_title = ?,
        meta_description = ?,
        updated_at = datetime('now')
      WHERE id = ? AND owner_id = ?`
    )
    .bind(
      data.name.trim(),
      tagline,
      description,
      data.whatsapp_number.trim(),
      address,
      data.theme_color,
      data.currency_code,
      data.currency_symbol,
      website,
      instagram,
      facebook,
      metaTitle,
      metaDescription,
      store.id,
      userId
    )
    .run();

  const updatedStore = await getStoreByOwner(userId);
  if (!updatedStore) throw new Error("Failed to retrieve updated store");
  return updatedStore;
}

export async function uploadLogo(userId: string, fileBuffer: Buffer, contentType: string) {
  const db = getDb();
  const store = await getStoreByOwner(userId);
  if (!store) throw new Error("Store not found or unauthorized");

  const ext = getExtensionFromMimeType(contentType);
  const storagePath = `stores/${store.id}/logo.${ext}`;

  // If previous logo exists with a different extension, delete it
  if (store.logo_url && store.logo_url !== storagePath) {
    try {
      await removeStorageAsset(store.id, store.logo_url);
    } catch {
      // Ignore if missing
    }
  }

  const { publicUrl } = await uploadStorageAsset({
    storeId: store.id,
    pathKey: storagePath,
    buffer: fileBuffer,
    contentType,
  });

  await db
    .prepare("UPDATE stores SET logo_url = ?, updated_at = datetime('now') WHERE id = ? AND owner_id = ?")
    .bind(storagePath, store.id, userId)
    .run();

  return publicUrl;
}

export async function uploadBanner(
  userId: string,
  fileBuffer: Buffer,
  contentType: string,
  slideIndex: 1 | 2 = 1
) {
  const db = getDb();
  const store = await getStoreByOwner(userId);
  if (!store) throw new Error("Store not found or unauthorized");

  const ext = getExtensionFromMimeType(contentType);
  const storagePath = `stores/${store.id}/banner_${slideIndex}.${ext}`;

  // Delete older banner variants for this slide index if different extension
  const prefix = `stores/${store.id}/banner_${slideIndex}.`;
  try {
    const storage = getStorage();
    const existing = await storage.list({ prefix });
    for (const obj of existing.objects) {
      if (obj.key !== storagePath) {
        await storage.delete(obj.key);
      }
    }
  } catch {
    // Ignore listing error
  }

  const { publicUrl } = await uploadStorageAsset({
    storeId: store.id,
    pathKey: storagePath,
    buffer: fileBuffer,
    contentType,
  });

  if (slideIndex === 1) {
    await db
      .prepare("UPDATE stores SET banner_url = ?, updated_at = datetime('now') WHERE id = ? AND owner_id = ?")
      .bind(storagePath, store.id, userId)
      .run();
  }

  return publicUrl;
}

export async function removeLogo(userId: string) {
  const db = getDb();
  const store = await getStoreByOwner(userId);
  if (!store) throw new Error("Store not found or unauthorized");

  if (store.logo_url) {
    try {
      await removeStorageAsset(store.id, store.logo_url);
    } catch {
      // Ignore missing file
    }
  }

  await db
    .prepare("UPDATE stores SET logo_url = NULL, updated_at = datetime('now') WHERE id = ? AND owner_id = ?")
    .bind(store.id, userId)
    .run();
}

export async function removeBanner(userId: string, slideIndex: 1 | 2 = 1) {
  const db = getDb();
  const store = await getStoreByOwner(userId);
  if (!store) throw new Error("Store not found or unauthorized");

  const prefix = `stores/${store.id}/banner_${slideIndex}.`;
  try {
    const storage = getStorage();
    const existing = await storage.list({ prefix });
    for (const obj of existing.objects) {
      await storage.delete(obj.key);
    }
  } catch {
    // Ignore error
  }

  if (slideIndex === 1) {
    await db
      .prepare("UPDATE stores SET banner_url = NULL, updated_at = datetime('now') WHERE id = ? AND owner_id = ?")
      .bind(store.id, userId)
      .run();
  }
}
