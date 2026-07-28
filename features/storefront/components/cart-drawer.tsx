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
import { ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { CheckoutSheet } from "../../checkout/components/checkout-sheet";

export function CartDrawer({ store }: { store: StorefrontDetails }) {
  const { items, removeItem, itemCount, subtotal } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="relative cursor-pointer p-2 rounded-full hover:bg-[#F6F6F4] dark:hover:bg-zinc-900 text-[#111111] dark:text-[#FAF9F7] transition-colors focus:outline-hidden group"
        aria-label={`Open shopping cart drawer, contains ${itemCount} items`}
      >
        <ShoppingBag className="size-5 transition-transform group-hover:scale-105" />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 size-4 bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] text-[9px] font-bold rounded-full flex items-center justify-center border border-white dark:border-[#0A0A0A]">
            {itemCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-[#FAF9F7] dark:bg-[#0A0A0A] p-0 border-l border-[#E7E7E5] dark:border-zinc-800">
        <SheetHeader className="p-6 border-b border-[#E7E7E5] dark:border-zinc-800 flex flex-row items-center justify-between bg-[#FFFFFF] dark:bg-zinc-950">
          <div className="space-y-0.5 text-left">
            <SheetTitle className="text-base font-bold text-[#111111] dark:text-[#FAF9F7] flex items-center gap-2 uppercase tracking-[0.15em]">
              <ShoppingBag className="size-4 text-[#111111] dark:text-white" />
              Shopping Bag
            </SheetTitle>
            <SheetDescription className="text-xs text-[#666666] font-normal tracking-wide">
              Review selected fashion items before checkout
            </SheetDescription>
          </div>
        </SheetHeader>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="size-16 rounded-full bg-[#F6F6F4] dark:bg-zinc-900 flex items-center justify-center border border-[#E7E7E5] dark:border-zinc-800 text-[#8A8A8A]">
                <ShoppingBag className="size-7 text-[#111111] dark:text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-[#111111] dark:text-[#FAF9F7] text-sm uppercase tracking-[0.15em]">
                  Your bag is empty
                </h4>
                <p className="text-xs text-[#666666] max-w-[220px] leading-relaxed">
                  Discover fresh vintage fashion items and add them to your order bag.
                </p>
              </div>
              <SheetClose className="inline-flex items-center justify-center rounded-lg bg-[#0A0A0A] hover:bg-[#171717] text-white text-xs font-bold uppercase tracking-[0.15em] px-6 h-11 cursor-pointer transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] shadow-xs">
                Browse Collection
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-3.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 bg-[#FFFFFF] dark:bg-zinc-900/60 border border-[#E7E7E5] dark:border-zinc-800 rounded-xl items-center relative group transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="size-16 rounded-lg bg-[#F6F6F4] dark:bg-zinc-950 overflow-hidden shrink-0 border border-[#E7E7E5] dark:border-zinc-800">
                    {item.primaryImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.primaryImageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="size-6 text-[#8A8A8A] m-auto mt-5" />
                    )}
                  </div>

                  {/* Info details */}
                  <div className="flex-1 min-w-0 space-y-1 text-left">
                    <Link
                      href={`/store/${store.slug}/product/${item.slug}`}
                      className="font-medium text-[#111111] dark:text-[#FAF9F7] text-xs tracking-tight line-clamp-1 hover:text-[#666666] transition-colors duration-200"
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-xs font-bold text-[#111111] dark:text-[#FAF9F7]">
                        {store.currencySymbol}
                        {item.price.toLocaleString("en-IN")}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-[#8A8A8A] hover:text-red-600 p-1 cursor-pointer transition-colors duration-150 rounded-md flex items-center gap-1 text-[10px]"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Remove</span>
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
          <div className="p-6 border-t border-[#E7E7E5] dark:border-zinc-800 bg-[#FFFFFF] dark:bg-zinc-950 space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-[#666666] uppercase tracking-[0.15em]">Subtotal</span>
                <span className="text-lg font-bold text-[#111111] dark:text-[#FAF9F7]">
                  {store.currencySymbol}
                  {subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[10px] text-[#8A8A8A] tracking-wide">
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

