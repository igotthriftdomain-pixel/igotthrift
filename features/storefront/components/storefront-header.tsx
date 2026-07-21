import Link from "next/link";
import { type StorefrontDetails } from "../types";
import { CartDrawer } from "./cart-drawer";
import { Sparkles } from "lucide-react";

export function StorefrontHeader({ store }: { store: StorefrontDetails }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8E2D8] dark:border-zinc-800/80 bg-[#FAF8F3]/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md transition-colors">
      {/* Top Banner Announcement Strip */}
      <div className="bg-[#0A0A0A] text-[#FFBC0A] text-[10px] font-bold tracking-widest uppercase py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="size-3 text-[#FFBC0A]" />
        <span>Handpicked Vintage & Streetwear Drops • Direct WhatsApp Checkout</span>
        <Sparkles className="size-3 text-[#FFBC0A]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Branding Logo / Name */}
        <Link href={`/store/${store.slug}`} className="flex items-center gap-3 group">
          {store.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.logoUrl}
              alt={store.name}
              className="size-9 rounded-full object-cover border-2 border-[#0A0A0A] shadow-xs transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="size-9 rounded-full bg-[#0A0A0A] text-[#FFBC0A] flex items-center justify-center font-black text-xs border border-zinc-800 shadow-xs uppercase">
              {store.name.substring(0, 2)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-extrabold text-[#0A0A0A] dark:text-[#FAF8F3] tracking-tight text-base leading-tight group-hover:text-[#F36B00] transition-colors">
              {store.name}
            </span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
              Curated Thrift
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-[#0A0A0A]/70 dark:text-zinc-300">
          <Link
            href={`/store/${store.slug}`}
            className="hover:text-[#0A0A0A] dark:hover:text-white transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#FFBC0A] hover:after:w-full after:transition-all"
          >
            Home
          </Link>
          <a
            href="#products-catalog"
            className="hover:text-[#0A0A0A] dark:hover:text-white transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#FFBC0A] hover:after:w-full after:transition-all"
          >
            Collection Catalog
          </a>
        </nav>

        {/* Right Action: Cart Drawer */}
        <div className="flex items-center gap-4">
          <CartDrawer store={store} />
        </div>
      </div>
    </header>
  );
}
