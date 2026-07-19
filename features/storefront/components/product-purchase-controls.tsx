"use client";

import { useState } from "react";
import { type StorefrontProduct } from "../types";
import { QuantitySelector } from "./quantity-selector";
import { AddToCartButton } from "./add-to-cart-button";
import { useCart } from "../context/cart-context";

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
    }, 600);
  };

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="space-y-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
      {!isOutOfStock && (
        <QuantitySelector
          quantity={quantity}
          max={product.stockQuantity}
          onChange={setQuantity}
        />
      )}

      <div className="flex flex-col gap-2.5">
        <AddToCartButton
          disabled={isOutOfStock}
          loading={loading}
          onClick={handleAddToCart}
        />
        
        {isOutOfStock ? (
          <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 mt-1" role="alert">
            This item is currently sold out.
          </p>
        ) : (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            Complete checkout instantly on WhatsApp after adding items.
          </p>
        )}
      </div>
    </div>
  );
}
