import { type StorefrontProduct, type StorefrontDetails } from "../types";
import { ProductCard } from "./product-card";
import { PackageSearch } from "lucide-react";

export function ProductGrid({
  products,
  store,
  title,
}: {
  products: StorefrontProduct[];
  store: StorefrontDetails;
  title?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-[#F6F6F4] dark:bg-zinc-900/40 border border-[#E7E7E5] dark:border-zinc-800 rounded-none max-w-xl mx-auto my-12 space-y-3">
        <PackageSearch className="size-8 text-[#8A8A8A] mx-auto mb-2" />
        <h4 className="text-sm font-bold text-[#111111] dark:text-[#FAF9F7] uppercase tracking-[0.15em]">
          No items found in this drop
        </h4>
        <p className="text-xs text-[#666666] leading-relaxed max-w-sm mx-auto">
          No active items match your filter. Check back soon for fresh curated drops.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {title && (
        <div className="flex items-center justify-between border-b border-[#E7E7E5] dark:border-zinc-800 pb-4">
          <h2 className="text-base sm:text-xl font-bold uppercase tracking-[0.15em] text-[#111111] dark:text-[#FAF9F7]">
            {title}
          </h2>
          <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-[0.2em]">
            {products.length} {products.length === 1 ? "Item" : "Items"}
          </span>
        </div>
      )}
      <div className="grid gap-5 sm:gap-7 lg:gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} store={store} />
        ))}
      </div>
    </div>
  );
}

