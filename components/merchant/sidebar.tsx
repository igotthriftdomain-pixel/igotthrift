"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMerchant } from "@/context/merchant-context";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderTree,
  ShoppingBag,
  Settings,
  LogOut,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: ShoppingBag },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { store } = useMerchant();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const res = await logoutAction();
    if (res.success) {
      toast.success("Successfully logged out");
      router.push("/login");
      router.refresh();
    } else {
      toast.error(res.error || "Logout failed");
      setLoading(false);
    }
  };

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-900 text-zinc-200 flex flex-col min-h-screen">
      <div className="p-6 border-b border-zinc-900 flex items-center gap-3">
        <Store className="size-6 text-zinc-100" />
        <div>
          <h1 className="font-bold text-zinc-100 truncate w-40">{store.name}</h1>
          <p className="text-xs text-zinc-400">Merchant Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-zinc-900 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-900">
        <Button
          variant="destructive"
          className="w-full justify-start gap-3 bg-red-950/20 text-red-400 border border-red-950/50 hover:bg-red-950/50"
          onClick={handleLogout}
          disabled={loading}
        >
          <LogOut className="size-4" />
          {loading ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </aside>
  );
}
