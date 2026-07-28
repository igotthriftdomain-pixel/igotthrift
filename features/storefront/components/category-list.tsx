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
    <div className="w-full border-y border-[#E7E7E5] dark:border-zinc-800 bg-[#FAF9F7]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md sticky top-16 z-40 py-3 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto py-0.5 no-scrollbar scroll-smooth items-center md:justify-center">
          <span className="text-[10px] font-semibold text-[#8A8A8A] uppercase tracking-[0.2em] shrink-0 mr-3 hidden sm:inline">
            Collections:
          </span>

          <Link
            href={`/store/${storeSlug}?category=all#products-catalog`}
            className={`shrink-0 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-[0.15em] transition-all duration-200 ease-out active:scale-95 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] ${
              activeCategory === "all"
                ? "bg-[#0A0A0A] text-[#FFFFFF] border-[#0A0A0A] dark:bg-white dark:text-[#0A0A0A] dark:border-white shadow-xs"
                : "bg-[#FFFFFF] dark:bg-zinc-900 text-[#666666] dark:text-zinc-300 hover:text-[#111111] dark:hover:text-white border-[#E7E7E5] dark:border-zinc-800 hover:border-[#111111]"
            }`}
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/store/${storeSlug}?category=${cat.slug}#products-catalog`}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-[0.15em] transition-all duration-200 ease-out active:scale-95 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] ${
                activeCategory === cat.slug
                  ? "bg-[#0A0A0A] text-[#FFFFFF] border-[#0A0A0A] dark:bg-white dark:text-[#0A0A0A] dark:border-white shadow-xs"
                  : "bg-[#FFFFFF] dark:bg-zinc-900 text-[#666666] dark:text-zinc-300 hover:text-[#111111] dark:hover:text-white border-[#E7E7E5] dark:border-zinc-800 hover:border-[#111111]"
              }`}
            >
              {cat.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="size-4 rounded-full object-cover shrink-0 border border-current opacity-90"
                />
              )}
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

