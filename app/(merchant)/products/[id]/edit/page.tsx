import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/features/auth/service";
import { getStoreByOwner } from "@/features/store/service";
import { getProductById } from "@/features/products/service";
import { ProductEditorForm } from "@/features/products/components/product-editor-form";
import { createClient } from "@/lib/supabase/server";

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
