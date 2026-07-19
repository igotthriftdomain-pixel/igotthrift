import Link from "next/link";
import { type StorefrontProduct, type StorefrontDetails } from "../types";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";

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
    <div className="group flex flex-col bg-white dark:bg-zinc-950 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-900 transition-all hover:shadow-md">
      {/* Image container */}
      <div className="relative aspect-square bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden flex items-center justify-center border-b border-zinc-100 dark:border-zinc-900">
        {product.primaryImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
          />
        ) : (
          <ShoppingBag className="size-10 text-zinc-300 dark:text-zinc-700" />
        )}

        {/* Status badges overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.featured && (
            <Badge className="bg-amber-500 text-white border-0 text-[9px] font-bold uppercase tracking-wider py-0.5 px-1.5">
              Featured
            </Badge>
          )}
          {isSoldOut && (
            <Badge className="bg-zinc-800 text-zinc-300 border-0 text-[9px] font-bold uppercase tracking-wider py-0.5 px-1.5">
              Sold Out
            </Badge>
          )}
        </div>

        {hasDiscount && !isSoldOut && product.compareAtPrice && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold py-0.5 px-1.5 rounded z-10 uppercase">
            Sale
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1">
          {product.categoryName && (
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider block">
              {product.categoryName}
            </span>
          )}
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm tracking-tight leading-snug line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="space-y-2">
          {/* Price tags */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              {store.currencySymbol}
              {product.price.toLocaleString("en-IN")}
            </span>
            {hasDiscount && product.compareAtPrice && (
              <span className="text-xs text-zinc-400 line-through">
                {store.currencySymbol}
                {product.compareAtPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Stock warnings */}
          {isLowStock && (
            <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-500">
              Only {product.stockQuantity} left in stock!
            </p>
          )}

          {/* CTA Link wrapper */}
          <Link
            href={`/store/${store.slug}/product/${product.slug}`}
            className={`w-full inline-flex items-center justify-center rounded-lg text-xs font-bold h-9 transition-all cursor-pointer ${
              isSoldOut
                ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 pointer-events-none"
                : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950"
            }`}
          >
            {isSoldOut ? "Sold Out" : "View Details"}
          </Link>
        </div>
      </div>
    </div>
  );
}
