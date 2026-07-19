import { redirect } from "next/navigation";
import crypto from "crypto";
import { getCurrentUser } from "@/features/auth/service";
import { getStoreByOwner } from "@/features/store/service";
import { ProductEditorForm } from "@/features/products/components/product-editor-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewProductPage() {
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

  // Pre-generate UUID for immediate image uploads
  const productId = crypto.randomUUID();

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
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Add New Product</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Create a new catalog item. Images upload immediately to your folder.
        </p>
      </div>

      <ProductEditorForm
        productId={productId}
        categories={categories}
      />
    </div>
  );
}
