import Link from "next/link";
import { type StorefrontProduct, type StorefrontDetails } from "../types";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ArrowUpRight, Sparkles } from "lucide-react";

export function ProductCard({
  product,
  store,
}: {
  product: StorefrontProduct;
  store: StorefrontDetails;
}) {
  const isSoldOut = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity < 3;
  const hasDiscount = product.compareAtPrice !== null && product.compareAtPrice > product.price;

  return (
    <div className="group flex flex-col bg-white dark:bg-zinc-900/90 rounded-2xl overflow-hidden border border-[#E8E2D8] dark:border-zinc-800 transition-all duration-300 hover:border-[#FFBC0A]/60 hover:shadow-xl relative">
      {/* Image container with 4:5 editorial aspect ratio */}
      <Link
        href={`/store/${store.slug}/product/${product.slug}`}
        className="relative aspect-[4/5] bg-[#F3EFE7] dark:bg-zinc-950 overflow-hidden flex items-center justify-center border-b border-[#E8E2D8] dark:border-zinc-800/80 block"
      >
        {product.primaryImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <ShoppingBag className="size-10 text-zinc-300 dark:text-zinc-700" />
        )}

        {/* Status badges overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.featured && (
            <Badge className="bg-[#FFBC0A] text-[#0A0A0A] border-0 text-[9px] font-extrabold uppercase tracking-widest py-1 px-2.5 shadow-sm flex items-center gap-1">
              <Sparkles className="size-3 text-[#0A0A0A] fill-current" />
              Featured
            </Badge>
          )}
          {isSoldOut && (
            <Badge className="bg-[#0A0A0A] text-white border-0 text-[9px] font-extrabold uppercase tracking-widest py-1 px-2.5 shadow-sm">
              Sold Out
            </Badge>
          )}
        </div>

        {hasDiscount && !isSoldOut && product.compareAtPrice && (
          <div className="absolute top-3 right-3 bg-[#F36B00] text-white text-[9px] font-extrabold py-1 px-2.5 rounded-full z-10 uppercase tracking-wider shadow-sm">
            -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
          </div>
        )}

        {/* Hover Quick View Icon Overlay */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#0A0A0A]/90 text-[#FFBC0A] size-9 rounded-full flex items-center justify-center shadow-lg backdrop-blur-xs">
          <ArrowUpRight className="size-4" />
        </div>
      </Link>

      {/* Details Container */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-1.5">
          {product.categoryName && (
            <span className="text-[10px] font-extrabold text-[#F36B00] uppercase tracking-widest block">
              {product.categoryName}
            </span>
          )}
          <Link href={`/store/${store.slug}/product/${product.slug}`}>
            <h3 className="font-bold text-[#0A0A0A] dark:text-[#FAF8F3] text-sm sm:text-base tracking-tight leading-snug line-clamp-2 hover:text-[#F36B00] transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="space-y-3 pt-1 border-t border-[#F3EFE7] dark:border-zinc-800/60">
          {/* Price tags */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-[#0A0A0A] dark:text-[#FAF8F3]">
                {store.currencySymbol}
                {product.price.toLocaleString("en-IN")}
              </span>
              {hasDiscount && product.compareAtPrice && (
                <span className="text-xs text-zinc-400 line-through font-medium">
                  {store.currencySymbol}
                  {product.compareAtPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Stock warnings */}
            {isLowStock && (
              <span className="text-[10px] font-extrabold text-[#F36B00] uppercase tracking-wider">
                Only {product.stockQuantity} left
              </span>
            )}
          </div>

          {/* CTA Link button */}
          <Link
            href={`/store/${store.slug}/product/${product.slug}`}
            className={`w-full inline-flex items-center justify-center rounded-xl text-xs font-extrabold uppercase tracking-wider h-10 transition-all cursor-pointer ${
              isSoldOut
                ? "bg-[#F3EFE7] dark:bg-zinc-800 text-zinc-400 pointer-events-none"
                : "bg-[#0A0A0A] hover:bg-[#F36B00] text-white dark:bg-zinc-50 dark:hover:bg-[#FFBC0A] dark:text-zinc-950 dark:hover:text-[#0A0A0A] shadow-xs active:scale-98"
            }`}
          >
            {isSoldOut ? "Sold Out" : "View Drop Item"}
          </Link>
        </div>
      </div>
    </div>
  );
}
