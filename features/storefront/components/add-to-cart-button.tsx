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
      className="w-full md:w-auto md:px-10 h-12 rounded-lg bg-[#0A0A0A] hover:bg-[#171717] text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-[#0A0A0A] font-bold text-xs uppercase tracking-[0.15em] transition-all duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none border-0 shadow-xs"
      aria-busy={loading}
      aria-live="polite"
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>Adding to Bag...</span>
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

