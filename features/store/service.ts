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
  const bannerPublicUrl = store.banner_url
    ? supabase.storage.from("store-assets").getPublicUrl(store.banner_url).data.publicUrl
    : null;

  return {
    store,
    logoPublicUrl,
    bannerPublicUrl,
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

export async function uploadBanner(userId: string, fileBuffer: Buffer, contentType: string) {
  const supabase = await createClient();
  const store = await getStoreByOwner(userId);
  if (!store) throw new Error("Store not found");

  const storagePath = `stores/${store.id}/banner.png`;

  const { error: uploadError } = await supabase.storage
    .from("store-assets")
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { error: updateError } = await supabase
    .from("stores")
    .update({ banner_url: storagePath })
    .eq("id", store.id);

  if (updateError) throw new Error(updateError.message);

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

export async function removeBanner(userId: string) {
  const supabase = await createClient();
  const store = await getStoreByOwner(userId);
  if (!store) throw new Error("Store not found");

  if (!store.banner_url) return;

  const { error: deleteError } = await supabase.storage
    .from("store-assets")
    .remove([store.banner_url]);

  if (deleteError) throw new Error(deleteError.message);

  const { error: updateError } = await supabase
    .from("stores")
    .update({ banner_url: null })
    .eq("id", store.id);

  if (updateError) throw new Error(updateError.message);
}
