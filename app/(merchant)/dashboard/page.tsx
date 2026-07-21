import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/features/auth/service";
import { getStoreByOwner } from "@/features/store/service";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, FolderTree, ExternalLink, Plus, Package } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const store = await getStoreByOwner(user.id);
  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-sm text-zinc-500">
        Store configuration not found. Please contact support.
      </div>
    );
  }

  const supabase = await createClient();

  // Fetch real count of total active catalog products
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id)
    .is("deleted_at", null);

  // Fetch real count of store categories
  const { count: categoryCount } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id);

  // Fetch 5 most recent products
  const { data: recentProducts } = await supabase
    .from("products")
    .select("id, name, price, stock, active, created_at, categories(name)")
    .eq("store_id", store.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5);

  const totalProducts = productCount ?? 0;
  const totalCategories = categoryCount ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome back, {store.name}!
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Here is an overview of your shop statistics and inventory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/store/${store.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <span>View Storefront</span>
            <ExternalLink className="size-3.5" />
          </Link>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 rounded-lg transition-colors"
          >
            <Plus className="size-3.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Total Products
            </CardTitle>
            <ShoppingBag className="size-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {totalProducts}
            </div>
            <p className="text-xs text-zinc-400 mt-1">Active items in catalog</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Categories
            </CardTitle>
            <FolderTree className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {totalCategories}
            </div>
            <p className="text-xs text-zinc-400 mt-1">Product segment filters</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Store Status
            </CardTitle>
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-500">Live</div>
            <p className="text-xs text-zinc-400 mt-1">Storefront is publicly accessible</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
              Recent Catalog Additions
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Latest items added to your shop
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View All →
          </Link>
        </div>

        {recentProducts && recentProducts.length > 0 ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentProducts.map((p) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const categoryName = (p.categories as any)?.name || "Uncategorized";
              return (
                <div
                  key={p.id}
                  className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-950/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                      <Package className="size-4" />
                    </div>
                    <div>
                      <Link
                        href={`/products/${p.id}/edit`}
                        className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:underline line-clamp-1"
                      >
                        {p.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span>{categoryName}</span>
                        <span>•</span>
                        <span>Stock: {p.stock}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                      {store.currency_symbol}
                      {p.price.toLocaleString("en-IN")}
                    </span>
                    <Badge
                      variant={p.active ? "default" : "secondary"}
                      className="text-[10px] uppercase font-bold"
                    >
                      {p.active ? "Active" : "Draft"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center space-y-3">
            <Package className="size-8 text-zinc-300 mx-auto" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No catalog items logged yet. Begin adding items from the catalog section.
            </p>
            <Link
              href="/products/new"
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 px-4 h-9 text-xs font-semibold"
            >
              Add First Product
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
