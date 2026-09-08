import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/service";
import { getStoreByOwner } from "@/features/store/service";
import { getProducts } from "@/features/products/service";
import { ProductsView } from "@/features/products/components/products-view";
import { getDb } from "@/lib/db";
import { type Category } from "@/features/categories/types";

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

  const db = getDb();
  const res = await db
    .prepare("SELECT * FROM categories WHERE store_id = ? ORDER BY name ASC")
    .bind(store.id)
    .all<Record<string, unknown>>();

  const categories: Category[] = (res.results || []).map((cat) => ({
    id: String(cat.id),
    store_id: String(cat.store_id),
    name: String(cat.name),
    slug: String(cat.slug),
    description: cat.description ? String(cat.description) : null,
    image_path: cat.image_path ? String(cat.image_path) : null,
    sort_order: Number(cat.sort_order ?? 0),
    active: Boolean(cat.active),
    created_at: String(cat.created_at),
    updated_at: String(cat.updated_at),
  }));

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
