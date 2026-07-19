import { type CartItem } from "../storefront/context/cart-context";
import { type CheckoutDetails } from "./types";

export function formatWhatsAppMessage(
  items: CartItem[],
  details: CheckoutDetails,
  currencySymbol: string,
  subtotal: number
): string {
  const itemList = items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.name}\n   Qty: ${item.quantity}\n   Price: ${currencySymbol}${item.price.toLocaleString("en-IN")}`
    )
    .join("\n\n");

  const message = `Hello,

I would like to place the following order:

${itemList}

Total: ${currencySymbol}${subtotal.toLocaleString("en-IN")}

Customer Details
Name: ${details.name}
Phone: ${details.phone}
Address: ${details.address}

Thank you.`;

  return message;
}

export function generateWhatsAppLink(whatsappNumber: string, message: string): string {
  // Normalize number (strip symbols)
  const normalizedNumber = whatsappNumber.replace(/[^0-9]/g, "");
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
