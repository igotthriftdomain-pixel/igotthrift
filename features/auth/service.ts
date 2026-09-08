import { getCurrentUser as getAuthUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { type Profile, type Store } from "./types";

export async function getCurrentUser() {
  return getAuthUser();
}

export async function getMerchantProfile(userId: string): Promise<Profile | null> {
  const db = getDb();
  const profile = await db
    .prepare("SELECT id, email, created_at, updated_at FROM profiles WHERE id = ?")
    .bind(userId)
    .first<Profile>();

  if (!profile) return null;
  return profile;
}

export async function getMerchantStore(userId: string): Promise<Store | null> {
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
