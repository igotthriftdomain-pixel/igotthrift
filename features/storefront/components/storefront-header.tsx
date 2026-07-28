import Link from "next/link";
import { type StorefrontDetails } from "../types";
import { CartDrawer } from "./cart-drawer";

export function StorefrontHeader({ store }: { store: StorefrontDetails }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E7E7E5] dark:border-zinc-800 bg-[#FAF9F7]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md transition-colors">
      {/* Top Banner Announcement Strip */}
      <div className="bg-[#0A0A0A] text-[#FAF9F7] text-[10px] font-medium tracking-[0.2em] uppercase py-2 px-4 text-center flex items-center justify-center gap-2 border-b border-[#171717]">
        <span className="inline-block size-1 rounded-full bg-[#FAF9F7] opacity-60" />
        <span>Curated Vintage & Streetwear Drops • Direct WhatsApp Checkout</span>
        <span className="inline-block size-1 rounded-full bg-[#FAF9F7] opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
        {/* Branding Logo / Name */}
        <Link href={`/store/${store.slug}`} className="flex items-center gap-3 group shrink-0 min-w-0">
          {store.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.logoUrl}
              alt={store.name}
              className="size-9 rounded-full object-cover border border-[#0A0A0A] dark:border-white transition-transform group-hover:scale-105 shrink-0"
            />
          ) : (
            <div className="size-9 rounded-full bg-[#0A0A0A] text-[#FFFFFF] flex items-center justify-center font-bold text-xs border border-[#171717] uppercase tracking-wider shrink-0">
              {store.name.substring(0, 2)}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[#111111] dark:text-[#FAF9F7] tracking-tight text-sm sm:text-base leading-tight group-hover:text-[#666666] dark:group-hover:text-zinc-300 transition-colors truncate max-w-[140px] sm:max-w-none">
              {store.name}
            </span>
            <span className="text-[9px] font-medium text-[#8A8A8A] uppercase tracking-[0.2em] leading-none pt-0.5 truncate">
              Boutique Store
            </span>
          </div>
        </Link>

        {/* Navigation Links - Centered */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.15em] text-[#666666] dark:text-zinc-400 absolute left-1/2 -translate-x-1/2">
          <Link
            href={`/store/${store.slug}`}
            className="hover:text-[#111111] dark:hover:text-white transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#0A0A0A] dark:after:bg-white hover:after:w-full after:transition-all"
          >
            Home
          </Link>
          <a
            href="#products-catalog"
            className="hover:text-[#111111] dark:hover:text-white transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#0A0A0A] dark:after:bg-white hover:after:w-full after:transition-all"
          >
            Catalog
          </a>
        </nav>

        {/* Right Action: Cart Drawer */}
        <div className="flex items-center gap-4 shrink-0">
          <CartDrawer store={store} />
        </div>
      </div>
    </header>
  );
}

