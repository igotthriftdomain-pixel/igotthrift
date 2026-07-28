import Link from "next/link";
import { type StorefrontCategory } from "../types";
import { ArrowUpRight, Check, Grid, Sparkles } from "lucide-react";

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

  const isAllActive = activeCategory === "all";

  return (
    <div className="w-full py-4 transition-colors">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111] dark:text-[#FAF9F7] flex items-center gap-2">
          <span>Shop by Category</span>
          <span className="text-[10px] font-semibold text-[#8A8A8A] bg-[#E7E7E5]/60 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
            {categories.length + 1}
          </span>
        </h2>
      </div>

      {/* Category Cards Layout: Smooth snap carousel on mobile, Responsive grid on desktop */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar scroll-smooth snap-x snap-mandatory sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-visible">
        {/* 1. ALL PRODUCTS CARD */}
        <Link
          href={`/store/${storeSlug}?category=all#products-catalog`}
          className={`group relative rounded-xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] w-[140px] xs:w-[160px] sm:w-full shrink-0 snap-start transition-all duration-300 ease-out border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] ${
            isAllActive
              ? "border-[#0A0A0A] dark:border-white ring-2 ring-[#0A0A0A]/30 dark:ring-white/30 shadow-md scale-[1.01]"
              : "border-[#E7E7E5] dark:border-zinc-800 hover:border-[#111111] dark:hover:border-zinc-500 shadow-xs"
          }`}
        >
          {/* Background Art & Gradient for ALL PRODUCTS */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1D1D1D] via-[#0A0A0A] to-[#252525] transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_70%)]" />
          
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
            <Grid className="size-20 text-white" />
          </div>

          {/* Selected Badge */}
          {isAllActive && (
            <div className="absolute top-2.5 right-2.5 z-20 bg-[#FAF9F7] text-[#0A0A0A] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Check className="size-2.5 stroke-[3]" /> Active
            </div>
          )}

          {/* Bottom Label Overlay */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end">
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#A0A0A0] block mb-0.5">
              Full Catalog
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate mr-1">
                All Products
              </span>
              <ArrowUpRight className="size-4 text-white/80 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </div>
          </div>
        </Link>

        {/* 2. MERCHANT CATEGORY CARDS */}
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <Link
              key={cat.id}
              href={`/store/${storeSlug}?category=${cat.slug}#products-catalog`}
              className={`group relative rounded-xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] w-[140px] xs:w-[160px] sm:w-full shrink-0 snap-start transition-all duration-300 ease-out border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] ${
                isActive
                  ? "border-[#0A0A0A] dark:border-white ring-2 ring-[#0A0A0A]/30 dark:ring-white/30 shadow-md scale-[1.01]"
                  : "border-[#E7E7E5] dark:border-zinc-800 hover:border-[#111111] dark:hover:border-zinc-500 shadow-xs"
              }`}
            >
              {cat.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                /* Fallback background for category without uploaded image */
                <div className="absolute inset-0 bg-gradient-to-br from-[#222222] via-[#111111] to-[#2A2A2A] transition-transform duration-500 group-hover:scale-105 flex items-center justify-center">
                  <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-white/70 transition-colors">
                    <Sparkles className="size-5" />
                  </div>
                </div>
              )}

              {/* Gradient Vignette for Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent z-10" />

              {/* Selected Badge */}
              {isActive && (
                <div className="absolute top-2.5 right-2.5 z-20 bg-[#FAF9F7] text-[#0A0A0A] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Check className="size-2.5 stroke-[3]" /> Active
                </div>
              )}

              {/* Bottom Label Overlay */}
              <div className="absolute inset-x-0 bottom-0 z-20 p-3 flex items-end justify-between">
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate mr-1 drop-shadow-xs">
                  {cat.name}
                </span>
                <ArrowUpRight className="size-4 text-white/80 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
