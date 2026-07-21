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
    <div className="w-full border-y border-[#E8E2D8] dark:border-zinc-800 bg-[#FAF8F3]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xs sticky top-16 z-40 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2.5 overflow-x-auto py-1 no-scrollbar scroll-smooth items-center">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest shrink-0 mr-2 hidden sm:inline">
            Categories:
          </span>

          <Link
            href={`/store/${storeSlug}?category=all#products-catalog`}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === "all"
                ? "bg-[#FFBC0A] text-[#0A0A0A] shadow-xs"
                : "bg-[#F3EFE7] dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-[#E8E3DA] dark:hover:bg-zinc-800 border border-[#E8E2D8] dark:border-zinc-800"
            }`}
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/store/${storeSlug}?category=${cat.slug}#products-catalog`}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === cat.slug
                  ? "bg-[#FFBC0A] text-[#0A0A0A] shadow-xs"
                  : "bg-[#F3EFE7] dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-[#E8E3DA] dark:hover:bg-zinc-800 border border-[#E8E2D8] dark:border-zinc-800"
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
