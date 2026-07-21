import { type StorefrontProduct, type StorefrontDetails } from "../types";
import { ProductCard } from "./product-card";
import { Sparkles, PackageSearch } from "lucide-react";

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
      <div className="text-center py-16 px-4 bg-[#F3EFE7]/60 dark:bg-zinc-900/40 border border-[#E8E2D8] dark:border-zinc-800 rounded-3xl max-w-xl mx-auto my-12 space-y-3">
        <PackageSearch className="size-10 text-[#FFBC0A] mx-auto mb-2" />
        <h4 className="text-base font-extrabold text-[#0A0A0A] dark:text-[#FAF8F3] uppercase tracking-wider">
          No items found in this drop
        </h4>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
          No active items match your filter. Check back soon for fresh curated drops!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between border-b border-[#E8E2D8] dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[#F36B00]" />
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-[#0A0A0A] dark:text-[#FAF8F3]">
              {title}
            </h2>
          </div>
          <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">
            {products.length} {products.length === 1 ? "Item" : "Items"}
          </span>
        </div>
      )}
      <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} store={store} />
        ))}
      </div>
    </div>
  );
}
