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
    <div className="space-y-4 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E7E7E5] dark:border-zinc-800 rounded-xl p-4.5 text-left shadow-none">
      <h3 className="text-xs font-semibold text-[#111111] dark:text-[#FAF9F7] uppercase tracking-[0.15em] border-b border-[#E7E7E5] dark:border-zinc-800 pb-2.5">
        Order Item Summary ({items.length})
      </h3>
      
      <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center text-xs gap-3">
            <div className="min-w-0">
              <span className="font-medium text-[#111111] dark:text-[#FAF9F7] block truncate">
                {item.name}
              </span>
            </div>
            <span className="font-bold text-[#111111] dark:text-[#FAF9F7] shrink-0 font-mono">
              {store.currencySymbol}{item.price.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-baseline border-t border-[#E7E7E5] dark:border-zinc-800 pt-3 text-xs">
        <span className="font-semibold text-[#666666] uppercase tracking-[0.15em]">Total Payable</span>
        <span className="text-lg font-bold text-[#111111] dark:text-[#FAF9F7] font-mono">
          {store.currencySymbol}
          {subtotal.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}

