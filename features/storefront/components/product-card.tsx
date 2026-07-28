import Link from "next/link";
import { type StorefrontProduct, type StorefrontDetails } from "../types";
import { ShoppingBag, ArrowUpRight } from "lucide-react";

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
    <div className="group flex flex-col bg-[#FFFFFF] dark:bg-zinc-900/90 border border-[#E7E7E5] dark:border-zinc-800 rounded-xl overflow-hidden transition-all duration-200 ease-out hover:border-[#111111] dark:hover:border-zinc-600 hover:shadow-xs relative">
      {/* Image container with 4:5 editorial aspect ratio */}
      <Link
        href={`/store/${store.slug}/product/${product.slug}`}
        className="relative aspect-[4/5] bg-[#F6F6F4] dark:bg-zinc-950 overflow-hidden flex items-center justify-center border-b border-[#E7E7E5] dark:border-zinc-800 block"
      >
        {product.primaryImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <ShoppingBag className="size-10 text-[#8A8A8A]" />
        )}

        {/* Status badges overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.featured && (
            <span className="bg-[#0A0A0A] text-[#FFFFFF] text-[9px] font-bold uppercase tracking-[0.2em] py-1 px-2.5 rounded-md shadow-xs">
              Featured
            </span>
          )}
          {isSoldOut && (
            <span className="bg-[#171717] text-[#FAF9F7] text-[9px] font-bold uppercase tracking-[0.2em] py-1 px-2.5 rounded-md shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {hasDiscount && !isSoldOut && product.compareAtPrice && (
          <div className="absolute top-3 right-3 bg-[#0A0A0A] text-white text-[9px] font-bold py-1 px-2.5 z-10 uppercase tracking-[0.15em] rounded-md shadow-xs">
            -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
          </div>
        )}

        {/* Quick view hover indicator */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out bg-[#0A0A0A] text-[#FFFFFF] size-8 rounded-md flex items-center justify-center shadow-xs">
          <ArrowUpRight className="size-4" />
        </div>
      </Link>

      {/* Details Container */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-1">
          {product.categoryName && (
            <span className="text-[9px] font-semibold text-[#8A8A8A] uppercase tracking-[0.2em] block">
              {product.categoryName}
            </span>
          )}
          <Link href={`/store/${store.slug}/product/${product.slug}`}>
            <h3 className="font-medium text-[#111111] dark:text-[#FAF9F7] text-sm tracking-tight leading-snug line-clamp-2 hover:text-[#666666] transition-colors duration-200">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="space-y-3 pt-2 border-t border-[#E7E7E5] dark:border-zinc-800">
          {/* Price tags */}
          <div className="flex flex-wrap items-baseline justify-between gap-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#111111] dark:text-[#FAF9F7]">
                {store.currencySymbol}
                {product.price.toLocaleString("en-IN")}
              </span>
              {hasDiscount && product.compareAtPrice && (
                <span className="text-xs text-[#8A8A8A] line-through font-normal">
                  {store.currencySymbol}
                  {product.compareAtPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Stock warnings */}
            {isLowStock && (
              <span className="text-[9px] font-semibold text-[#111111] dark:text-zinc-300 uppercase tracking-[0.15em]">
                Only {product.stockQuantity} left
              </span>
            )}
          </div>

          {/* CTA Link button */}
          <Link
            href={`/store/${store.slug}/product/${product.slug}`}
            className={`w-full inline-flex items-center justify-center text-xs font-bold uppercase tracking-[0.15em] h-10 rounded-lg transition-all duration-200 ease-out cursor-pointer border ${
              isSoldOut
                ? "bg-[#F6F6F4] dark:bg-zinc-800 text-[#8A8A8A] border-[#E7E7E5] dark:border-zinc-700 pointer-events-none"
                : "bg-[#0A0A0A] hover:bg-[#171717] text-white border-[#0A0A0A] dark:bg-zinc-50 dark:hover:bg-white dark:text-zinc-950 dark:border-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2"
            }`}
          >
            {isSoldOut ? "Sold Out" : "View Drop Item"}
          </Link>
        </div>
      </div>
    </div>
  );
}

