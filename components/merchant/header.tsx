"use client";

import { useMerchant } from "@/context/merchant-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/products/new": "New Product",
  "/categories": "Categories",
  "/settings": "Settings",
};

export function Header() {
  const { profile } = useMerchant();
  const pathname = usePathname();

  const title = pageTitles[pathname] || (pathname.includes("/edit") ? "Edit Product" : "Merchant Portal");
  const initial = profile.email ? profile.email[0].toUpperCase() : "M";

  return (
    <header className="h-14 md:h-16 border-b border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-900 px-4 md:px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm md:text-base">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-block text-xs md:text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
          {profile.email}
        </span>
        <Avatar className="h-7 w-7 md:h-8 md:w-8">
          <AvatarFallback className="bg-zinc-900 dark:bg-zinc-800 text-zinc-100 font-bold text-xs">
            {initial}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
