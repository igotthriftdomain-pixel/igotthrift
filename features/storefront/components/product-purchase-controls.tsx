"use client";

import { useState } from "react";
import { type StorefrontProduct } from "../types";
import { QuantitySelector } from "./quantity-selector";
import { AddToCartButton } from "./add-to-cart-button";
import { useCart } from "../context/cart-context";
import { MessageCircle } from "lucide-react";

interface ProductPurchaseControlsProps {
  product: StorefrontProduct;
}

export function ProductPurchaseControls({ product }: ProductPurchaseControlsProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addItem(product, quantity);
    }, 400);
  };

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="space-y-6 pt-6 border-t border-[#E7E7E5] dark:border-zinc-800">
      {!isOutOfStock && (
        <QuantitySelector
          quantity={quantity}
          max={product.stockQuantity}
          onChange={setQuantity}
        />
      )}

      <div className="flex flex-col gap-3">
        <AddToCartButton
          disabled={isOutOfStock}
          loading={loading}
          onClick={handleAddToCart}
        />
        
        {isOutOfStock ? (
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1.5 pt-1" role="alert">
            This item is currently sold out.
          </p>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#666666] font-medium tracking-wide">
            <MessageCircle className="size-4 text-[#111111] dark:text-zinc-400" />
            <span>Direct WhatsApp order routing & fast merchant response</span>
          </div>
        )}
      </div>
    </div>
  );
}

