"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";

export function LivePreviewCard({
  name,
  price,
  compareAtPrice,
  featured,
  active,
  imagePublicUrl,
}: {
  name: string;
  price: number;
  compareAtPrice: number | null;
  featured: boolean;
  active: boolean;
  imagePublicUrl: string | null;
}) {
  const hasDiscount = compareAtPrice !== null && compareAtPrice > price;
  const discountPercent = hasDiscount && compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  return (
    <Card className="overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md max-w-xs mx-auto">
      <div className="relative aspect-square w-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border-b border-zinc-100 dark:border-zinc-900">
        {imagePublicUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagePublicUrl} alt={name || "Product preview"} className="w-full h-full object-cover" />
        ) : (
          <ShoppingBag className="size-12 text-zinc-300 dark:text-zinc-700" />
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {featured && <Badge className="bg-amber-500 text-white border-0 text-[10px] py-0.5 px-1.5 font-bold uppercase">Featured</Badge>}
          {!active && <Badge variant="secondary" className="text-[10px] py-0.5 px-1.5 font-semibold">Draft</Badge>}
          {active && <Badge className="bg-emerald-600 text-white border-0 text-[10px] py-0.5 px-1.5 font-semibold">Active</Badge>}
        </div>

        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-600 text-white font-bold text-[10px] py-0.5 px-1.5 rounded z-10">
            -{discountPercent}% OFF
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate" title={name || "Product Name"}>
          {name || "Distressed Vintage Denim"}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            ₹{price.toLocaleString("en-IN")}
          </span>
          {hasDiscount && compareAtPrice && (
            <span className="text-xs text-zinc-400 line-through">
              ₹{compareAtPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
