"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantitySelectorProps {
  quantity: number;
  max: number;
  onChange: (qty: number) => void;
}

export function QuantitySelector({ quantity, max, onChange }: QuantitySelectorProps) {
  const handleMinus = () => {
    if (quantity > 1) {
      onChange(quantity - 1);
    }
  };

  const handlePlus = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      onChange(1);
    } else if (val > max) {
      onChange(max);
    } else {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-[#111111] dark:text-[#FAF9F7] uppercase tracking-[0.15em]">
        Quantity
      </span>
      <div className="flex items-center gap-1 w-36 border border-[#E7E7E5] dark:border-zinc-800 rounded-md p-1 bg-[#FFFFFF] dark:bg-zinc-950 transition-colors">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-[#111111] dark:text-white hover:bg-[#F6F6F4] dark:hover:bg-zinc-900 shrink-0 cursor-pointer rounded-md transition-all duration-200 ease-out active:scale-95"
          disabled={quantity <= 1}
          onClick={handleMinus}
          aria-label="Decrease quantity"
        >
          <Minus className="size-3.5" />
        </Button>
        
        <input
          type="number"
          value={quantity}
          onChange={handleManualInput}
          min="1"
          max={max}
          className="w-full text-center text-sm font-bold text-[#111111] dark:text-[#FAF9F7] bg-transparent border-0 outline-hidden focus:ring-0 p-0 font-mono"
          aria-label="Quantity selector input"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-[#111111] dark:text-white hover:bg-[#F6F6F4] dark:hover:bg-zinc-900 shrink-0 cursor-pointer rounded-md transition-all duration-200 ease-out active:scale-95"
          disabled={quantity >= max}
          onClick={handlePlus}
          aria-label="Increase quantity"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

