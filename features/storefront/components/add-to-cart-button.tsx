"use client";

import { Loader2, ShoppingBag } from "lucide-react";
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
      className="w-full md:w-auto md:px-10 h-12 rounded-xl bg-[#F36B00] hover:bg-[#e06200] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none border-0"
      aria-busy={loading}
      aria-live="polite"
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>Adding to Drop Bag...</span>
        </>
      ) : (
        <>
          <ShoppingBag className="size-4" />
          <span>Add to Bag</span>
        </>
      )}
    </Button>
  );
}
