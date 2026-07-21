"use server";

import { checkoutSchema } from "./schema";
import { type CheckoutDetails } from "./types";
import { type CartItem } from "../storefront/context/cart-context";
import { verifyStockAndPrices, createOrderRecord } from "./service";
import { getStoreBySlug } from "../storefront/service";
import { formatWhatsAppMessage, generateWhatsAppLink } from "./utils";

export async function checkoutAction(
  storeId: string,
  storeSlug: string,
  details: CheckoutDetails,
  items: CartItem[]
): Promise<
  | {
      success: true;
      whatsappUrl: string;
    }
  | {
      success: false;
      error: string;
    }
> {
  try {
    const parsed = checkoutSchema.safeParse(details);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((e) => e.message).join(", ");
      return { success: false, error: errorMsg };
    }

    if (!items || items.length === 0) {
      return { success: false, error: "Your cart is empty." };
    }

    const store = await getStoreBySlug(storeSlug);
    if (!store || !store.whatsappNumber) {
      return { success: false, error: "Merchant has not configured WhatsApp number." };
    }

    const verification = await verifyStockAndPrices(storeId, items);
    if (!verification.success || verification.recalculatedSubtotal === undefined) {
      return { success: false, error: verification.error || "Stock verification failed." };
    }

    // Try logging order record to DB, but don't block WhatsApp checkout if DB insert fails
    try {
      const order = await createOrderRecord(
        storeId,
        parsed.data,
        items,
        verification.recalculatedSubtotal
      );
      if (!order.success) {
        console.warn("Order recording notice:", order.error);
      }
    } catch (orderErr) {
      console.warn("Order DB logging error (proceeding to WhatsApp):", orderErr);
    }

    const message = formatWhatsAppMessage(
      items,
      parsed.data,
      store.currencySymbol,
      verification.recalculatedSubtotal
    );
    const whatsappUrl = generateWhatsAppLink(store.whatsappNumber, message);

    return { success: true, whatsappUrl };
  } catch (e) {
    console.error("Checkout action error:", e);
    return { success: false, error: "An unexpected error occurred during checkout." };
  }
}
