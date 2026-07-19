"use client";

import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}

export function AddToCartButton({ disabled, loading, onClick }: AddToCartButtonProps) {
  return (
    <Button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className="w-full md:w-auto md:px-8 h-12 rounded-xl bg-[var(--store-theme)] hover:bg-[var(--store-theme-hover)] text-white font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
      aria-busy={loading}
      aria-live="polite"
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>Adding to Cart...</span>
        </>
      ) : (
        <>
          <ShoppingCart className="size-4" />
          <span>Add to Cart</span>
        </>
      )}
    </Button>
  );
}
