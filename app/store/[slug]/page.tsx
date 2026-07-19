import { Suspense } from "react";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import {
  getStoreBySlug,
  getActiveCategories,
  getFeaturedProducts,
  getNewestProducts,
  getProductsByCategory,
} from "@/features/storefront/service";
import { HeroBanner } from "@/features/storefront/components/hero-banner";
import { CategoryList } from "@/features/storefront/components/category-list";
import { ProductGrid } from "@/features/storefront/components/product-grid";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    category?: string;
  }>;
}

// Dynamic SEO metadata resolution
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const store = await getStoreBySlug(resolvedParams.slug);

  if (!store) {
    return {
      title: "Store Not Found",
    };
  }

  const title = store.metaTitle || store.name;
  const description = store.metaDescription || store.description || `Browse curated vintage thrift items at ${store.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: store.logoUrl ? [{ url: store.logoUrl }] : [],
    },
  };
}

export default async function StorefrontPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const store = await getStoreBySlug(resolvedParams.slug);

  if (!store) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const activeCategory = resolvedSearchParams.category || "all";

  return (
    <div className="space-y-12 pb-20">
      {/* Streamed Hero Section */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSectionWrapper slug={resolvedParams.slug} />
      </Suspense>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Streamed Categories & Catalog Catalog Grid */}
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogSectionWrapper
            storeId={store.id}
            slug={resolvedParams.slug}
            activeCategory={activeCategory}
          />
        </Suspense>
      </div>
    </div>
  );
}

// Wrapper components for streaming
async function HeroSectionWrapper({ slug }: { slug: string }) {
  const store = await getStoreBySlug(slug);
  if (!store) return null;

  // Fetch newest products just to count total items
  const newest = await getNewestProducts(store.id);

  return <HeroBanner store={store} totalProducts={newest.length} />;
}

async function CatalogSectionWrapper({
  storeId,
  slug,
  activeCategory,
}: {
  storeId: string;
  slug: string;
  activeCategory: string;
}) {
  const store = await getStoreBySlug(slug);
  if (!store) return null;

  const [categories, featuredProducts, catalogProducts] = await Promise.all([
    getActiveCategories(storeId),
    getFeaturedProducts(storeId),
    activeCategory === "all"
      ? getNewestProducts(storeId)
      : getProductsByCategory(storeId, activeCategory),
  ]);

  return (
    <div className="space-y-12">
      {/* Categories Horizontal Tabs Selector */}
      {categories.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Browse Categories</h2>
          <CategoryList
            categories={categories}
            activeCategory={activeCategory}
            storeSlug={slug}
          />
        </div>
      )}

      {/* Featured Items (Shown only on the home root list "All") */}
      {activeCategory === "all" && featuredProducts.length > 0 && (
        <Suspense fallback={<GridSkeleton />}>
          <ProductGrid products={featuredProducts} store={store} title="Featured Thrift Drops" />
        </Suspense>
      )}

      {/* Catalog items */}
      <div id="products-catalog" className="pt-6">
        <Suspense fallback={<GridSkeleton />}>
          <ProductGrid
            products={catalogProducts}
            store={store}
            title={activeCategory === "all" ? "All Arrivals" : "Category Items"}
          />
        </Suspense>
      </div>
    </div>
  );
}

// Loading Skeletons
function HeroSkeleton() {
  return (
    <div className="w-full h-[420px] bg-zinc-900 dark:bg-zinc-950 flex flex-col items-center justify-center space-y-4 p-8">
      <Skeleton className="size-20 rounded-full bg-zinc-800" />
      <Skeleton className="h-10 w-64 bg-zinc-800" />
      <Skeleton className="h-4 w-96 bg-zinc-800" />
      <Skeleton className="h-10 w-36 bg-zinc-800 rounded-lg" />
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="space-y-10 py-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex gap-3 overflow-hidden">
          <Skeleton className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
          <Skeleton className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
          <Skeleton className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        </div>
      </div>
      <GridSkeleton />
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-36 bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
        {[1, 2, 4, 4].map((i) => (
          <div key={i} className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden p-3 space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <Skeleton className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800" />
              <Skeleton className="h-8 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
