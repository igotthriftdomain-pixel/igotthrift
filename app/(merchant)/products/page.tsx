import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/service";
import { getStoreByOwner } from "@/features/store/service";
import { getProducts } from "@/features/products/service";

import { ProductsView } from "@/features/products/components/products-view";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    featured?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
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

  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const category = resolvedParams.category || "all";
  const status = resolvedParams.status || "all";
  const featured = resolvedParams.featured || "all";
  const sort = resolvedParams.sort || "created_desc";
  const page = Number(resolvedParams.page) || 1;

  const { products, totalCount } = await getProducts(store.id, {
    q,
    category,
    status,
    featured,
    sort,
    page,
  });

  // Fetch all categories for filtering dropdown options
  // Use page=1 and a very large page limit by bypassing pagination if we can, 
  // or fetch them with a large page query. Since getCategories uses ITEMS_PER_PAGE (10),
  // let's fetch a list of categories without bounds or let's create a getCategoriesList helper in service.
  // Wait, let's fetch using a simple query in Supabase directly, or add a helper.
  // Since we already have the categories service, we can fetch all categories directly.
  // Let's check how getCategories is implemented. It uses range(0, 9).
  // Let's create a custom select query on categories to bypass pagination bounds for the dropdown,
  // keeping the code modular and clean. We can query directly here or add a service method.
  // Let's query directly using supabase server client to avoid duplicating methods.
  // Wait, service query is better to avoid direct database calls in route files.
  // Let's add a helper `getAllCategories(storeId)` inside features/categories/service.ts!
  // Oh, wait, we don't have to edit categories/service if we can query it safely.
  // Let's check: does getCategories allow fetching all categories? No, it has pagination.
  const supabase = await createClient();
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .eq("store_id", store.id)
    .order("name", { ascending: true });

  const categories = categoriesData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Products</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage your storefront catalog item settings, pricing options, and images.
        </p>
      </div>

      <ProductsView
        products={products}
        totalCount={totalCount}
        categories={categories}
        currencySymbol={store.currency_symbol}
      />
    </div>
  );
}
