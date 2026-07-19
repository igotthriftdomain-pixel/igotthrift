"use client";

import { useState, useEffect, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type Category } from "../types";
import { CategoryTable } from "./category-table";
import { CategoryDialog } from "./category-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FolderTree, Plus, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { ITEMS_PER_PAGE } from "../constants";

interface CategoriesViewProps {
  categories: Category[];
  totalCount: number;
}

export function CategoriesView({ categories, totalCount }: CategoriesViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read URL search params
  const searchQuery = searchParams.get("q") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Debounced search syncing
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        startTransition(() => {
          const params = new URLSearchParams(searchParams);
          if (localSearch) {
            params.set("q", localSearch);
          } else {
            params.delete("q");
          }
          params.set("page", "1"); // Reset to page 1 on new search
          router.push(`${pathname}?${params.toString()}`);
        });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearch, searchQuery, searchParams, pathname, router]);

  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  if (searchQuery !== prevSearchQuery) {
    setLocalSearch(searchQuery);
    setPrevSearchQuery(searchQuery);
  }

  // Pagination bounds calculation
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const showEmptyState = categories.length === 0 && !searchQuery;

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search categories..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
            aria-label="Search categories"
          />
          {isPending && (
            <div className="absolute right-3 top-3">
              <Loader2 className="size-3.5 animate-spin text-zinc-400" />
            </div>
          )}
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold flex gap-1.5 items-center justify-center shrink-0 h-10 px-4"
        >
          <Plus className="size-4" /> Add Category
        </Button>
      </div>

      {/* Main Grid View */}
      {showEmptyState ? (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center flex flex-col items-center justify-center bg-white dark:bg-zinc-950/20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 mb-4">
            <FolderTree className="h-6 w-6 text-zinc-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No categories yet</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">
            Create your first category to organize your storefront products.
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="mt-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold size-sm px-4 h-9"
          >
            Create Category
          </Button>
        </div>
      ) : categories.length === 0 ? (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center flex flex-col items-center justify-center bg-white dark:bg-zinc-950/20">
          <Search className="h-8 w-8 text-zinc-300 mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No matching categories</h3>
          <p className="text-xs text-zinc-400 mt-1">
            We couldn&apos;t find any category matching <span className="font-semibold text-zinc-650">&ldquo;{searchQuery}&rdquo;</span>.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <CategoryTable categories={categories} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-zinc-500">
                Showing Page {currentPage} of {totalPages} ({totalCount} total results)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                  disabled={currentPage === 1 || isPending}
                  onClick={() => handlePageChange(currentPage - 1)}
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                  disabled={currentPage === totalPages || isPending}
                  onClick={() => handlePageChange(currentPage + 1)}
                  aria-label="Next Page"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Creation dialog mount */}
      {dialogOpen && <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} />}
    </div>
  );
}
