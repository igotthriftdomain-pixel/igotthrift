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
  ExternalLink,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const renderNavContent = (onNavClick?: () => void) => (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-200">
      <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
            <Store className="size-5 text-zinc-100" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-zinc-100 truncate text-sm">{store.name}</h1>
            <p className="text-xs text-zinc-400">Merchant Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-zinc-900 text-zinc-100 border border-zinc-800/60"
                  : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-900 space-y-2">
        <Link
          href={`/store/${store.slug}`}
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-zinc-900/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Store className="size-3.5" /> View Storefront
          </span>
          <ExternalLink className="size-3 text-zinc-500" />
        </Link>

        <Button
          variant="destructive"
          className="w-full justify-start gap-3 bg-red-950/20 text-red-400 border border-red-950/50 hover:bg-red-950/50 text-xs py-2"
          onClick={handleLogout}
          disabled={loading}
        >
          <LogOut className="size-4" />
          {loading ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-64 bg-zinc-950 border-r border-zinc-900 text-zinc-200 flex-col min-h-screen shrink-0">
        {renderNavContent()}
      </aside>

      {/* Mobile Header Navigation Bar */}
      <div className="md:hidden flex items-center justify-between bg-zinc-950 text-zinc-100 px-4 py-3 border-b border-zinc-900 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Store className="size-5 text-zinc-100 shrink-0" />
          <span className="font-bold text-sm truncate">{store.name}</span>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900">
                <Menu className="size-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            }
          />
          <SheetContent side="left" showCloseButton={true} className="p-0 w-72 bg-zinc-950 border-r border-zinc-900">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            {renderNavContent(() => setMobileOpen(false))}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
