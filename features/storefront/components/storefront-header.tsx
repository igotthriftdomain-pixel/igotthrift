import Link from "next/link";
import { type StorefrontDetails } from "../types";
import { CartDrawer } from "./cart-drawer";

export function StorefrontHeader({ store }: { store: StorefrontDetails }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Branding Logo / Name */}
        <Link href={`/store/${store.slug}`} className="flex items-center gap-2.5">
          {store.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logoUrl} alt={store.name} className="size-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800" />
          ) : (
            <div className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 text-xs uppercase">
              {store.name.substring(0, 2)}
            </div>
          )}
          <span className="font-bold text-zinc-900 dark:text-zinc-50 tracking-tight text-base">{store.name}</span>
        </Link>

        {/* Categories / Navigation links */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-650 dark:text-zinc-300">
          <Link href={`/store/${store.slug}`} className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Home</Link>
          <a href="#products-catalog" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Catalog</a>
        </nav>

        {/* Cart Drawer */}
        <div className="flex items-center gap-4">
          <CartDrawer store={store} />
        </div>
      </div>
    </header>
  );
}
