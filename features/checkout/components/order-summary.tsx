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
    <div className="space-y-4 bg-white dark:bg-zinc-900 border border-[#E8E2D8] dark:border-zinc-800 rounded-2xl p-4.5 text-left shadow-2xs">
      <h3 className="text-xs font-black text-[#0A0A0A] dark:text-[#FAF8F3] uppercase tracking-widest border-b border-[#F3EFE7] dark:border-zinc-800 pb-2.5">
        Order Item Summary ({items.reduce((sum, item) => sum + item.quantity, 0)})
      </h3>
      
      <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-start text-xs gap-3">
            <div className="min-w-0">
              <span className="font-bold text-[#0A0A0A] dark:text-[#FAF8F3] block truncate">
                {item.name}
              </span>
              <span className="text-zinc-400 font-medium">
                Qty: {item.quantity} × {store.currencySymbol}{item.price.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="font-black text-[#0A0A0A] dark:text-[#FAF8F3] shrink-0 font-mono">
              {store.currencySymbol}{(item.price * item.quantity).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-baseline border-t border-[#F3EFE7] dark:border-zinc-800 pt-3 text-xs">
        <span className="font-bold text-zinc-500 uppercase tracking-wider">Total Payable</span>
        <span className="text-lg font-black text-[#0A0A0A] dark:text-[#FAF8F3] font-mono">
          {store.currencySymbol}
          {subtotal.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
