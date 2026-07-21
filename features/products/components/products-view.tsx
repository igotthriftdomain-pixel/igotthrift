"use client";

import { useState, useEffect, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { type ProductWithCategoryAndImages } from "../types";
import { type Category } from "@/features/categories/types";
import { ProductsTable } from "./products-table";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ShoppingBag, Plus, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { ITEMS_PER_PAGE } from "../constants";

interface ProductsViewProps {
  products: ProductWithCategoryAndImages[];
  totalCount: number;
  categories: Category[];
  currencySymbol: string;
}

export function ProductsView({
  products,
  totalCount,
  categories,
  currencySymbol,
}: ProductsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read URL params
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const status = searchParams.get("status") || "all";
  const featured = searchParams.get("featured") || "all";
  const sort = searchParams.get("sort") || "created_desc";
  const currentPage = Number(searchParams.get("page")) || 1;

  const [localSearch, setLocalSearch] = useState(q);

  // Sync state if URL changes externally
  const [prevSearchQuery, setPrevSearchQuery] = useState(q);
  if (q !== prevSearchQuery) {
    setLocalSearch(q);
    setPrevSearchQuery(q);
  }

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== q) {
        startTransition(() => {
          const params = new URLSearchParams(searchParams);
          if (localSearch) {
            params.set("q", localSearch);
          } else {
            params.delete("q");
          }
          params.set("page", "1");
          router.push(`${pathname}?${params.toString()}`);
        });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, q, searchParams, pathname, router]);

  const updateParam = (key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("page", "1"); // Reset to page 1
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;
  const showEmptyState =
    products.length === 0 &&
    !q &&
    category === "all" &&
    status === "all" &&
    featured === "all";

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search bar */}
        <div className="relative w-full md:max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search products by name, slug or SKU..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
            aria-label="Search products"
          />
          {isPending && (
            <div className="absolute right-3 top-3">
              <Loader2 className="size-3.5 animate-spin text-zinc-400" />
            </div>
          )}
        </div>

        <div className="flex gap-3 shrink-0">
          <Link
            href="/products/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-50 dark:hover:bg-zinc-205 dark:text-zinc-950 font-semibold h-10 flex gap-1.5 items-center justify-center px-4 rounded-lg text-sm w-full sm:w-auto"
            )}
          >
            <Plus className="size-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters Toolbar */}
      {!showEmptyState && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center bg-zinc-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
          {/* Category Filter */}
          <div className="w-full">
            <Select value={category} onValueChange={(val) => updateParam("category", val || "all")}>
              <SelectTrigger className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                <SelectItem value="all" className="cursor-pointer">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="cursor-pointer">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full">
            <Select value={status} onValueChange={(val) => updateParam("status", val || "all")}>
              <SelectTrigger className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
                <SelectItem value="published" className="cursor-pointer">Published</SelectItem>
                <SelectItem value="draft" className="cursor-pointer">Draft</SelectItem>
                <SelectItem value="scheduled" className="cursor-pointer">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Featured Filter */}
          <div className="w-full">
            <Select value={featured} onValueChange={(val) => updateParam("featured", val || "all")}>
              <SelectTrigger className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                <SelectValue placeholder="All Featured" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                <SelectItem value="all" className="cursor-pointer">All Featured</SelectItem>
                <SelectItem value="true" className="cursor-pointer">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sorting */}
          <div className="w-full">
            <Select value={sort} onValueChange={(val) => updateParam("sort", val || "created_desc")}>
              <SelectTrigger className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                <SelectItem value="created_desc" className="cursor-pointer">Newest Added</SelectItem>
                <SelectItem value="price_asc" className="cursor-pointer">Price: Low to High</SelectItem>
                <SelectItem value="price_desc" className="cursor-pointer">Price: High to Low</SelectItem>
                <SelectItem value="stock_asc" className="cursor-pointer">Stock: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Main Grid View / Table */}
      {showEmptyState ? (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center flex flex-col items-center justify-center bg-white dark:bg-zinc-950/20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 mb-4">
            <ShoppingBag className="h-6 w-6 text-zinc-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No products yet</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">
            Add your first catalog product to start showcasing on your storefront.
          </p>
          <Link
            href="/products/new"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "mt-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-50 dark:hover:bg-zinc-205 dark:text-zinc-950 font-semibold px-4 h-9 flex items-center justify-center rounded-lg text-sm"
            )}
          >
            Add Product
          </Link>
        </div>
      ) : products.length === 0 ? (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center flex flex-col items-center justify-center bg-white dark:bg-zinc-950/20">
          <Search className="h-8 w-8 text-zinc-300 mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No matching products</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Try adjusting your search query or catalog filter parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <ProductsTable products={products} currencySymbol={currencySymbol} />

          {/* Pagination */}
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
    </div>
  );
}
