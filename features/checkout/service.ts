import { getDb } from "@/lib/db";
import { type CartItem } from "../storefront/context/cart-context";
import { type CheckoutDetails } from "./types";

export async function verifyStockAndPrices(
  storeId: string,
  items: CartItem[]
): Promise<{
  success: boolean;
  recalculatedSubtotal?: number;
  error?: string;
}> {
  if (!items || items.length === 0) {
    return { success: false, error: "Cart is empty." };
  }

  const db = getDb();
  const productIds = items.map((item) => item.id);
  const placeholders = productIds.map(() => "?").join(",");

  const res = await db
    .prepare(
      `SELECT id, price, stock_quantity, active, deleted_at, published_at
       FROM products
       WHERE id IN (${placeholders}) AND store_id = ?`
    )
    .bind(...productIds, storeId)
    .all<Record<string, unknown>>();

  const dbProducts = res.results || [];
  if (dbProducts.length !== items.length) {
    return { success: false, error: "One or more products in your cart are no longer available." };
  }

  let recalculatedSubtotal = 0;
  const nowIso = new Date().toISOString();

  for (const item of items) {
    const dbProduct = dbProducts.find((p) => String(p.id) === item.id);
    if (!dbProduct) {
      return { success: false, error: `Product "${item.name}" not found.` };
    }

    const isPublished =
      !dbProduct.published_at || String(dbProduct.published_at) <= nowIso;

    if (!Boolean(dbProduct.active) || dbProduct.deleted_at !== null || !isPublished) {
      return { success: false, error: `Product "${item.name}" is no longer available.` };
    }

    const availableStock = Number(dbProduct.stock_quantity ?? 0);
    if (availableStock <= 0) {
      return { success: false, error: `Product "${item.name}" is currently Sold Out and no longer available.` };
    }

    recalculatedSubtotal += Number(dbProduct.price ?? 0);
  }

  return { success: true, recalculatedSubtotal };
}

export async function createOrderRecord(
  storeId: string,
  details: CheckoutDetails,
  items: CartItem[],
  totalAmount: number
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const db = getDb();
  const orderId = crypto.randomUUID();
  const cartSnapshotJson = JSON.stringify(items);

  try {
    await db
      .prepare(
        `INSERT INTO orders (
          id, store_id, customer_name, customer_phone, customer_address,
          cart_snapshot, total_amount, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))`
      )
      .bind(
        orderId,
        storeId,
        details.name.trim(),
        details.phone.trim(),
        details.address.trim(),
        cartSnapshotJson,
        totalAmount
      )
      .run();

    return { success: true, orderId };
  } catch (err) {
    console.error("Order insertion failed:", err);
    return { success: false, error: "Failed to log checkout order. Try again." };
  }
}
