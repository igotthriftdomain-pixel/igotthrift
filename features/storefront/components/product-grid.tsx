import { type StorefrontProduct, type StorefrontDetails } from "../types";
import { ProductCard } from "./product-card";
import { Search } from "lucide-react";

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
      <div className="text-center py-12 bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-xl mx-auto my-8">
        <Search className="size-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No products found</h4>
        <p className="text-xs text-zinc-400 mt-1">
          No items match your active filters. Check back later for fresh thrift drops!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-900 pb-3">
          {title}
        </h2>
      )}
      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} store={store} />
        ))}
      </div>
    </div>
  );
}
