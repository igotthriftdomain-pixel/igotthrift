import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/features/auth/service";
import { getStoreByOwner } from "@/features/store/service";
import { getProductById } from "@/features/products/service";
import { ProductEditorForm } from "@/features/products/components/product-editor-form";
import { getDb } from "@/lib/db";
import { type Category } from "@/features/categories/types";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: PageProps) {
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

  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const product = await getProductById(store.id, productId);
  if (!product) {
    notFound();
  }

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
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Edit Product</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Modify product pricing, images, and description.
        </p>
      </div>

      <ProductEditorForm
        productId={productId}
        categories={categories}
        initialProduct={product}
      />
    </div>
  );
}
