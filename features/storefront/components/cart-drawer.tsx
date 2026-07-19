"use client";

import { useState } from "react";
import { useCart } from "../context/cart-context";
import { type StorefrontDetails } from "../types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { CheckoutSheet } from "../../checkout/components/checkout-sheet";

export function CartDrawer({ store }: { store: StorefrontDetails }) {
  const { items, removeItem, updateQuantity, itemCount, subtotal } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="relative cursor-pointer p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors focus:outline-hidden focus:ring-2 focus:ring-[var(--store-theme)]"
        aria-label={`Open shopping cart drawer, contains ${itemCount} items`}
      >
        <ShoppingBag className="size-5" />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 size-4 bg-[var(--store-theme)] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-in scale-in duration-100">
            {itemCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-white dark:bg-zinc-950 p-0 border-l border-zinc-200 dark:border-zinc-800">
        <SheetHeader className="p-6 border-b border-zinc-150 dark:border-zinc-900 flex flex-row items-center justify-between">
          <div className="space-y-0.5 text-left">
            <SheetTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <ShoppingBag className="size-5 text-[var(--store-theme)]" />
              Shopping Cart
            </SheetTitle>
            <SheetDescription className="text-xs text-zinc-400 dark:text-zinc-500">
              Manage your selected vintage drop items
            </SheetDescription>
          </div>
        </SheetHeader>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="size-16 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 text-zinc-300">
                <ShoppingBag className="size-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Your cart is empty</h4>
                <p className="text-xs text-zinc-400 max-w-[200px]">
                  Browse products to get started on your thrift list!
                </p>
              </div>
              <SheetClose className="inline-flex items-center justify-center rounded-lg bg-[var(--store-theme)] hover:bg-[var(--store-theme-hover)] text-white text-xs font-bold px-5 h-9 cursor-pointer transition-all active:scale-95">
                Shop Arrivals
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-150 dark:border-zinc-900 rounded-xl items-start relative group"
                >
                  {/* Thumbnail */}
                  <div className="size-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200/50 dark:border-zinc-800">
                    {item.primaryImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.primaryImageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="size-6 text-zinc-300 m-auto mt-5" />
                    )}
                  </div>

                  {/* Info details */}
                  <div className="flex-1 min-w-0 space-y-1 text-left">
                    <Link
                      href={`/store/${store.slug}/product/${item.slug}`}
                      className="font-bold text-zinc-900 dark:text-zinc-50 text-xs tracking-tight line-clamp-1 hover:text-[var(--store-theme)] transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                      {store.currencySymbol}
                      {item.price.toLocaleString("en-IN")}
                    </p>

                    {/* Small Inline quantity controller */}
                    <div className="flex items-center gap-1.5 pt-1.5">
                      <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-md p-0.5 bg-white dark:bg-zinc-950 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="size-5 flex items-center justify-center text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-650 rounded cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-5 text-center text-[10px] font-bold font-mono">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stockQuantity}
                          className="size-5 flex items-center justify-center text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-650 rounded cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove bin button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded-md text-zinc-350 hover:text-red-500 transition-colors cursor-pointer self-start focus:outline-hidden focus:ring-1 focus:ring-red-400"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {items.length > 0 && (
          <div className="p-6 border-t border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">Subtotal</span>
              <span className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                {store.currencySymbol}
                {subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="space-y-2">
              <CheckoutSheet store={store} />

              <SheetClose className="w-full h-11 inline-flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 font-semibold text-xs tracking-wide cursor-pointer transition-all">
                Continue Shopping
              </SheetClose>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
