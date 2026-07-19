"use client";

import { useMerchant } from "@/context/merchant-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { profile } = useMerchant();

  const initial = profile.email ? profile.email[0].toUpperCase() : "M";

  return (
    <header className="h-16 border-b border-zinc-100 bg-white dark:bg-zinc-950 dark:border-zinc-900 px-8 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-zinc-800 dark:text-zinc-100">Overview</h2>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{profile.email}</span>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold text-sm">
            {initial}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
