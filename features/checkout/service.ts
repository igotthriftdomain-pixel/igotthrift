import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const productIds = items.map((item) => item.id);

  const { data: dbProducts, error } = await supabase
    .from("products")
    .select("id, price, stock_quantity, active, deleted_at, published_at")
    .in("id", productIds)
    .eq("store_id", storeId);

  if (error || !dbProducts || dbProducts.length !== items.length) {
    return { success: false, error: "One or more products in your cart are no longer available." };
  }

  let recalculatedSubtotal = 0;

  for (const item of items) {
    const dbProduct = dbProducts.find((p) => p.id === item.id);
    if (!dbProduct) {
      return { success: false, error: `Product "${item.name}" not found.` };
    }

    const isPublished = !dbProduct.published_at || new Date(dbProduct.published_at) <= new Date();
    if (!dbProduct.active || dbProduct.deleted_at !== null || !isPublished) {
      return { success: false, error: `Product "${item.name}" is no longer available.` };
    }

    if (dbProduct.stock_quantity < item.quantity) {
      return { success: false, error: `Product "${item.name}" only has ${dbProduct.stock_quantity} items left in stock.` };
    }

    recalculatedSubtotal += dbProduct.price * item.quantity;
  }

  return { success: true, recalculatedSubtotal };
}

export async function createOrderRecord(
  storeId: string,
  details: CheckoutDetails,
  items: CartItem[],
  totalAmount: number
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      store_id: storeId,
      customer_name: details.name,
      customer_phone: details.phone,
      customer_address: details.address,
      cart_snapshot: items,
      total_amount: totalAmount,
      status: "pending",
    })
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Order insertion failed:", error);
    return { success: false, error: "Failed to log checkout order. Try again." };
  }

  // Safely update stocks for each item
  for (const item of items) {
    const { data: currentProduct } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", item.id)
      .maybeSingle();
      
    if (currentProduct) {
      const newStock = Math.max(0, currentProduct.stock_quantity - item.quantity);
      await supabase
        .from("products")
        .update({ stock_quantity: newStock })
        .eq("id", item.id);
    }
  }

  return { success: true, orderId: data.id };
}
