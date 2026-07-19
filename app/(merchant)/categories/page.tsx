import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/service";
import { getStoreByOwner } from "@/features/store/service";
import { getCategories } from "@/features/categories/service";
import { CategoriesView } from "@/features/categories/components/categories-view";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
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
  const searchQuery = resolvedParams.q || "";
  const page = Number(resolvedParams.page) || 1;

  const { categories, totalCount } = await getCategories(store.id, searchQuery, page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Categories</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Create, edit, and reorder categories to organize your shop items.
        </p>
      </div>

      <CategoriesView categories={categories} totalCount={totalCount} />
    </div>
  );
}
