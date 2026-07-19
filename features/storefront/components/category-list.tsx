import Link from "next/link";
import { type StorefrontCategory } from "../types";

export function CategoryList({
  categories,
  activeCategory,
  storeSlug,
}: {
  categories: StorefrontCategory[];
  activeCategory: string;
  storeSlug: string;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 overflow-x-auto py-3 no-scrollbar scroll-smooth">
          <Link
            href={`/store/${storeSlug}?category=all#products-catalog`}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeCategory === "all"
                ? "bg-[var(--store-theme)] text-white"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/store/${storeSlug}?category=${cat.slug}#products-catalog`}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat.slug
                  ? "bg-[var(--store-theme)] text-white"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
