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
): Promise<{
  success: true;
  whatsappUrl: string;
} | {
  success: false;
  error: string;
}> {
  try {
    const parsed = checkoutSchema.safeParse(details);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((e) => e.message).join(", ");
      return { success: false, error: errorMsg };
    }

    if (!items || items.length === 0) {
      return { success: false, error: "Your cart is empty." };
    }

    const verification = await verifyStockAndPrices(storeId, items);
    if (!verification.success || verification.recalculatedSubtotal === undefined) {
      return { success: false, error: verification.error || "Verification failed." };
    }

    const store = await getStoreBySlug(storeSlug);
    if (!store || !store.whatsappNumber) {
      return { success: false, error: "Merchant has not configured checkout details." };
    }

    const order = await createOrderRecord(
      storeId,
      parsed.data,
      items,
      verification.recalculatedSubtotal
    );

    if (!order.success || !order.orderId) {
      return { success: false, error: order.error || "Order creation failed." };
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
    console.error("Checkout action failed:", e);
    return { success: false, error: "An unexpected error occurred during checkout." };
  }
}
