"use client";

import { useMerchant } from "@/context/merchant-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShoppingBag, FolderTree, Info } from "lucide-react";

export default function DashboardPage() {
  const { store } = useMerchant();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Welcome back, {store.name}!
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Here is an overview of your shop statistics and inventory.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Products</CardTitle>
            <ShoppingBag className="size-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">--</div>
            <p className="text-xs text-zinc-400 mt-1">Products in catalog</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Categories</CardTitle>
            <FolderTree className="size-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">--</div>
            <p className="text-xs text-zinc-400 mt-1">Product segment filters</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Store Status</CardTitle>
            <Info className="size-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-500">Active</div>
            <p className="text-xs text-zinc-400 mt-1">Storefront is publicly accessible</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Recent Inventory Updates</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No catalog changes have been logged. Begin adding items from the sidebar to populate this dashboard.
        </p>
      </Card>
    </div>
  );
}
