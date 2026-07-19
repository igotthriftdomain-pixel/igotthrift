"use client";

import { type CartItem } from "../../storefront/context/cart-context";
import { type StorefrontDetails } from "../../storefront/types";

interface OrderSummaryProps {
  items: CartItem[];
  store: StorefrontDetails;
  subtotal: number;
}

export function OrderSummary({ items, store, subtotal }: OrderSummaryProps) {
  return (
    <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-left">
      <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-150 dark:border-zinc-900 pb-2">
        Order Summary
      </h3>
      
      <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-start text-xs gap-3">
            <div className="min-w-0">
              <span className="font-bold text-zinc-900 dark:text-zinc-50 block truncate">
                {item.name}
              </span>
              <span className="text-zinc-400 dark:text-zinc-500">
                Qty: {item.quantity} x {store.currencySymbol}{item.price.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50 shrink-0 font-mono">
              {store.currencySymbol}{(item.price * item.quantity).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-baseline border-t border-zinc-150 dark:border-zinc-900 pt-3 text-xs">
        <span className="font-bold text-zinc-500">Total Amount</span>
        <span className="text-base font-black text-zinc-900 dark:text-zinc-50 font-mono">
          {store.currencySymbol}
          {subtotal.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
