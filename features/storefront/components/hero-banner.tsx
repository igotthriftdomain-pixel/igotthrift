import { type StorefrontDetails } from "../types";
import { MOCK_BANNER_URL } from "../constants";

export function HeroBanner({ store, totalProducts }: { store: StorefrontDetails; totalProducts?: number }) {
  const bgImage = store.bannerUrl || MOCK_BANNER_URL;

  return (
    <section className="relative min-h-[420px] flex items-center justify-center overflow-hidden bg-zinc-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Image & Gradient overlay */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgImage}
          alt={store.name}
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 flex flex-col items-center">
        {/* Store Logo */}
        {store.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.logoUrl}
            alt={store.name}
            className="size-20 rounded-full object-cover border-2 border-white shadow-xl"
          />
        ) : (
          <div className="size-20 rounded-full bg-[var(--store-theme)] text-white flex items-center justify-center font-bold text-2xl border-2 border-white shadow-xl uppercase">
            {store.name.substring(0, 2)}
          </div>
        )}

        {/* Store Name & description */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md">
            {store.name}
          </h1>
          <p className="text-zinc-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed drop-shadow-sm">
            {store.description || "Welcome to our store! Browse our handpicked thrift collection below."}
          </p>
        </div>

        {/* Action Button */}
        <a
          href="#products-catalog"
          className="inline-flex items-center justify-center rounded-lg bg-[var(--store-theme)] hover:bg-[var(--store-theme-hover)] text-white text-sm font-bold px-6 h-11 transition-all shadow-lg active:scale-95"
        >
          Browse Catalog
        </a>

        {/* Statistics section */}
        {totalProducts !== undefined && totalProducts > 0 && (
          <div className="pt-4 flex justify-center gap-8 border-t border-white/10 w-full max-w-sm mt-4">
            <div className="text-center">
              <span className="block text-2xl font-black text-[var(--store-theme)]">{totalProducts}</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Items in Stock</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-black text-[var(--store-theme)]">100%</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Authentic</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
