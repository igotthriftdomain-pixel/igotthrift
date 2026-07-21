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

Customer Details:
Name: ${details.name}
Phone: ${details.phone}
Address: ${details.address}

Thank you!`;

  return message;
}

export function generateWhatsAppLink(whatsappNumber: string, message: string): string {
  // Strip all non-numeric characters
  let cleanNumber = whatsappNumber.replace(/\D/g, "");

  // Strip leading zero if present
  cleanNumber = cleanNumber.replace(/^0+/, "");

  // Prepend 91 for 10-digit Indian numbers without country code
  if (cleanNumber.length === 10) {
    cleanNumber = `91${cleanNumber}`;
  }

  const encodedMsg = encodeURIComponent(message);

  // Official wa.me short link format with recipient number and encoded message text
  return `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
}
