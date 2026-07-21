import { createClient } from "@/lib/supabase/server";
import { type Store } from "./types";
import { type StoreSettingsInput } from "./schema";

export async function getStoreByOwner(userId: string): Promise<Store | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", userId)
    .single();

  if (error || !data) return null;
  return data as Store;
}

export async function getStoreSettings(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", userId)
    .single();

  if (error || !data) return null;

  const store = data as Store;
  const logoPublicUrl = store.logo_url
    ? supabase.storage.from("store-assets").getPublicUrl(store.logo_url).data.publicUrl
    : null;

  let bannerPublicUrl1 = store.banner_url
    ? supabase.storage.from("store-assets").getPublicUrl(store.banner_url).data.publicUrl
    : null;
  let bannerPublicUrl2: string | null = null;

  // Check storage files for slide 1 and slide 2
  const { data: files } = await supabase.storage
    .from("store-assets")
    .list(`stores/${store.id}`);

  if (files && files.length > 0) {
    const f1 = files.find((f) => f.name.startsWith("banner_1."));
    const f2 = files.find((f) => f.name.startsWith("banner_2."));

    if (f1) {
      bannerPublicUrl1 = supabase.storage
        .from("store-assets")
        .getPublicUrl(`stores/${store.id}/${f1.name}`).data.publicUrl;
    }
    if (f2) {
      bannerPublicUrl2 = supabase.storage
        .from("store-assets")
        .getPublicUrl(`stores/${store.id}/${f2.name}`).data.publicUrl;
    }
  }

  return {
    store,
    logoPublicUrl,
    bannerPublicUrl: bannerPublicUrl1,
    bannerPublicUrl1,
    bannerPublicUrl2,
  };
}

export async function updateStoreSettings(userId: string, data: StoreSettingsInput) {
  const supabase = await createClient();
  const store = await getStoreByOwner(userId);
  if (!store) throw new Error("Store not found");

  const { data: updated, error } = await supabase
    .from("stores")
    .update({
      name: data.name,
      description: data.description,
      whatsapp_number: data.whatsapp_number,
      address: data.address,
      theme_color: data.theme_color,
      currency_code: data.currency_code,
      currency_symbol: data.currency_symbol,
      website: data.website,
      instagram: data.instagram,
      facebook: data.facebook,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
    })
    .eq("id", store.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return updated as Store;
}

export async function uploadLogo(userId: string, fileBuffer: Buffer, contentType: string) {
  const supabase = await createClient();
  const store = await getStoreByOwner(userId);
  if (!store) throw new Error("Store not found");

  const storagePath = `stores/${store.id}/logo.png`;

  const { error: uploadError } = await supabase.storage
    .from("store-assets")
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { error: updateError } = await supabase
    .from("stores")
    .update({ logo_url: storagePath })
    .eq("id", store.id);

  if (updateError) throw new Error(updateError.message);

  return storagePath;
}

export async function uploadBanner(
  userId: string,
  fileBuffer: Buffer,
  contentType: string,
  slideIndex: 1 | 2 = 1
) {
  const supabase = await createClient();
  const store = await getStoreByOwner(userId);
  if (!store) throw new Error("Store not found");

  const extMap: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };
  const ext = extMap[contentType] || "png";

  const storagePath = `stores/${store.id}/banner_${slideIndex}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("store-assets")
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  if (slideIndex === 1) {
    await supabase
      .from("stores")
      .update({ banner_url: storagePath })
      .eq("id", store.id);
  }

  return storagePath;
}

export async function removeLogo(userId: string) {
  const supabase = await createClient();
  const store = await getStoreByOwner(userId);
  if (!store) throw new Error("Store not found");

  if (!store.logo_url) return;

  const { error: deleteError } = await supabase.storage
    .from("store-assets")
    .remove([store.logo_url]);

  if (deleteError) throw new Error(deleteError.message);

  const { error: updateError } = await supabase
    .from("stores")
    .update({ logo_url: null })
    .eq("id", store.id);

  if (updateError) throw new Error(updateError.message);
}

export async function removeBanner(userId: string, slideIndex: 1 | 2 = 1) {
  const supabase = await createClient();
  const store = await getStoreByOwner(userId);
  if (!store) throw new Error("Store not found");

  await supabase.storage.from("store-assets").remove([
    `stores/${store.id}/banner_${slideIndex}.png`,
    `stores/${store.id}/banner_${slideIndex}.jpg`,
    `stores/${store.id}/banner_${slideIndex}.jpeg`,
    `stores/${store.id}/banner_${slideIndex}.webp`,
    `stores/${store.id}/banner_${slideIndex}.mp4`,
    `stores/${store.id}/banner_${slideIndex}.webm`,
  ]);

  if (slideIndex === 1) {
    await supabase
      .from("stores")
      .update({ banner_url: null })
      .eq("id", store.id);
  }
}
