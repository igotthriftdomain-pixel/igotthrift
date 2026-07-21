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
        className="relative cursor-pointer p-2.5 rounded-full hover:bg-[#F3EFE7] dark:hover:bg-zinc-900 text-[#0A0A0A] dark:text-[#FAF8F3] transition-colors focus:outline-hidden group"
        aria-label={`Open shopping cart drawer, contains ${itemCount} items`}
      >
        <ShoppingBag className="size-5 transition-transform group-hover:scale-110" />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 size-4.5 bg-[#F36B00] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs border border-white dark:border-[#0A0A0A] animate-in scale-in duration-200">
            {itemCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-[#FAF8F3] dark:bg-[#0A0A0A] p-0 border-l border-[#E8E2D8] dark:border-zinc-800">
        <SheetHeader className="p-6 border-b border-[#E8E2D8] dark:border-zinc-800 flex flex-row items-center justify-between bg-white dark:bg-zinc-950">
          <div className="space-y-0.5 text-left">
            <SheetTitle className="text-lg font-black text-[#0A0A0A] dark:text-[#FAF8F3] flex items-center gap-2 uppercase tracking-tight">
              <ShoppingBag className="size-5 text-[#F36B00]" />
              Shopping Cart
            </SheetTitle>
            <SheetDescription className="text-xs text-zinc-500 font-medium">
              Review selected fashion items before checkout
            </SheetDescription>
          </div>
        </SheetHeader>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="size-16 rounded-full bg-[#F3EFE7] dark:bg-zinc-900 flex items-center justify-center border border-[#E8E2D8] dark:border-zinc-800 text-zinc-400">
                <ShoppingBag className="size-8 text-[#FFBC0A]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-[#0A0A0A] dark:text-[#FAF8F3] text-base uppercase tracking-wider">
                  Your cart is empty
                </h4>
                <p className="text-xs text-zinc-500 max-w-[220px] leading-relaxed">
                  Discover fresh vintage fashion items and add them to your order bag.
                </p>
              </div>
              <SheetClose className="inline-flex items-center justify-center rounded-xl bg-[#0A0A0A] hover:bg-[#F36B00] text-white text-xs font-extrabold uppercase tracking-wider px-6 h-10 cursor-pointer transition-all active:scale-95 shadow-md">
                Browse Arrivals
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-3.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 bg-white dark:bg-zinc-900/60 border border-[#E8E2D8] dark:border-zinc-800 rounded-2xl items-center relative group shadow-2xs"
                >
                  {/* Thumbnail */}
                  <div className="size-16 rounded-xl bg-[#F3EFE7] dark:bg-zinc-950 overflow-hidden shrink-0 border border-[#E8E2D8] dark:border-zinc-800">
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
                      className="font-bold text-[#0A0A0A] dark:text-[#FAF8F3] text-xs tracking-tight line-clamp-1 hover:text-[#F36B00] transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs font-black text-[#0A0A0A] dark:text-[#FAF8F3]">
                      {store.currencySymbol}
                      {item.price.toLocaleString("en-IN")}
                    </p>

                    {/* Small Inline quantity controller */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex items-center gap-1 border border-[#E8E2D8] dark:border-zinc-800 rounded-lg p-0.5 bg-[#FAF8F3] dark:bg-zinc-950 shrink-0">
                        <button
                          type="button"
                          className="size-6 rounded-md flex items-center justify-center text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-30"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-[#0A0A0A] dark:text-white font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="size-6 rounded-md flex items-center justify-center text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-30"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stockQuantity}
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Subtotal & Checkout Trigger */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#E8E2D8] dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Subtotal</span>
                <span className="text-xl font-black text-[#0A0A0A] dark:text-[#FAF8F3]">
                  {store.currencySymbol}
                  {subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Direct WhatsApp routing. No registration required.
              </p>
            </div>

            {/* Embedded Checkout Sheet trigger */}
            <CheckoutSheet store={store} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
