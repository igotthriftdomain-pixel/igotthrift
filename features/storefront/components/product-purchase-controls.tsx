"use client";

import { useState } from "react";
import { type StorefrontProduct, type StorefrontDetails } from "../types";
import { useCart, type CartItem } from "../context/cart-context";
import { CheckoutSheet } from "../../checkout/components/checkout-sheet";
import { ShoppingBag, Zap, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ProductPurchaseControlsProps {
  product: StorefrontProduct;
  store: StorefrontDetails;
}

export function ProductPurchaseControls({ product, store }: ProductPurchaseControlsProps) {
  const { addItem } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyNowOpen, setBuyNowOpen] = useState(false);

  const isOutOfStock = product.stockQuantity <= 0;

  const handleAddToCart = () => {
    setAddingToCart(true);
    setTimeout(() => {
      setAddingToCart(false);
      addItem(product);
    }, 300);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error("This item is currently sold out.");
      return;
    }
    setBuyNowOpen(true);
  };

  const buyNowItem: CartItem = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    primaryImageUrl: product.primaryImageUrl,
    stockQuantity: product.stockQuantity,
    quantity: 1,
  };

  return (
    <div className="space-y-6 pt-6 border-t border-[#E7E7E5] dark:border-zinc-800">
      <div className="flex flex-col gap-3">
        {isOutOfStock ? (
          <div className="space-y-3">
            <div className="w-full h-12 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center cursor-not-allowed">
              Sold Out
            </div>
            <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5" role="alert">
              This piece has been claimed and is no longer available.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {/* Primary Action: Buy Now */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full sm:flex-1 h-12 rounded-lg bg-[#0A0A0A] hover:bg-[#171717] text-white dark:bg-white dark:text-[#0A0A0A] dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-[0.15em] transition-all duration-200 ease-out flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 active:scale-[0.98] shadow-xs"
                aria-label={`Buy ${product.name} now`}
              >
                <Zap className="size-4 fill-current" />
                <span>Buy Now</span>
              </button>

              {/* Secondary Action: Add to Bag */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full sm:flex-1 h-12 rounded-lg bg-[#FAF9F7] hover:bg-[#F6F6F4] text-[#0A0A0A] dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-white border border-[#E7E7E5] dark:border-zinc-800 font-bold text-xs uppercase tracking-[0.15em] transition-all duration-200 ease-out flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] active:scale-[0.98] disabled:opacity-50"
                aria-label={`Add ${product.name} to bag`}
              >
                <ShoppingBag className="size-4" />
                <span>{addingToCart ? "Adding..." : "Add to Bag"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#666666] font-medium tracking-wide">
              <MessageCircle className="size-4 text-[#111111] dark:text-zinc-400 shrink-0" />
              <span>Direct WhatsApp order routing & fast merchant response</span>
            </div>
          </div>
        )}
      </div>

      {/* Controlled Buy Now Checkout Sheet */}
      <CheckoutSheet
        store={store}
        buyNowItem={buyNowItem}
        open={buyNowOpen}
        onOpenChange={setBuyNowOpen}
      />
    </div>
  );
}

