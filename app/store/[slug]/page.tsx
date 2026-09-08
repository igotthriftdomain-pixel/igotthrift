import { Suspense } from "react";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import {
  getStoreBySlug,
  getActiveCategories,
  getFeaturedProducts,
  getAllActiveProducts,
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
  const description =
    store.metaDescription ||
    store.description ||
    `Browse curated vintage thrift items at ${store.name}.`;

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
    <div className="space-y-12 pb-24">
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

  // Fetch all products to count available items accurately
  const allProducts = await getAllActiveProducts(store.id);

  return <HeroBanner store={store} totalProducts={allProducts.length} />;
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
      ? getAllActiveProducts(storeId)
      : getProductsByCategory(storeId, activeCategory),
  ]);

  const selectedCategory = categories.find((c) => c.slug === activeCategory);
  const categoryTitle = selectedCategory ? selectedCategory.name : "Collection";

  return (
    <div className="space-y-12">
      {/* Categories Horizontal Tabs Selector */}
      {categories.length > 0 && (
        <div className="space-y-3">
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
      <div id="products-catalog" className="pt-4">
        <Suspense fallback={<GridSkeleton />}>
          <ProductGrid
            products={catalogProducts}
            store={store}
            title={activeCategory === "all" ? "All Drop Arrivals" : categoryTitle}
          />
        </Suspense>
      </div>
    </div>
  );
}

// Loading Skeletons
function HeroSkeleton() {
  return (
    <div className="w-full h-[460px] sm:h-[520px] bg-[#0A0A0A] flex flex-col items-center justify-center space-y-4 p-8 border-b border-[#E7E7E5] dark:border-zinc-800">
      <Skeleton className="size-20 rounded-full bg-zinc-900" />
      <Skeleton className="h-10 w-64 bg-zinc-900 rounded-lg" />
      <Skeleton className="h-4 w-80 sm:w-96 bg-zinc-900 rounded-md" />
      <Skeleton className="h-12 w-44 bg-zinc-900 rounded-lg border border-zinc-800" />
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="space-y-10 py-4">
      <div className="space-y-3">
        <Skeleton className="h-4 w-48 bg-[#E7E7E5] dark:bg-zinc-800 rounded-md" />
        <div className="flex gap-3 overflow-hidden">
          <Skeleton className="h-24 w-32 rounded-lg bg-[#E7E7E5] dark:bg-zinc-800 shrink-0" />
          <Skeleton className="h-24 w-32 rounded-lg bg-[#E7E7E5] dark:bg-zinc-800 shrink-0" />
          <Skeleton className="h-24 w-32 rounded-lg bg-[#E7E7E5] dark:bg-zinc-800 shrink-0" />
        </div>
      </div>
      <GridSkeleton />
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48 bg-[#E7E7E5] dark:bg-zinc-800 rounded-md" />
      <div className="grid gap-5 sm:gap-7 lg:gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border border-[#E7E7E5] dark:border-zinc-800 rounded-lg overflow-hidden p-4 space-y-4 bg-[#FFFFFF] dark:bg-zinc-900"
          >
            <Skeleton className="aspect-[4/5] w-full rounded-md bg-[#E7E7E5] dark:bg-zinc-800" />
            <Skeleton className="h-4 w-3/4 bg-[#E7E7E5] dark:bg-zinc-800 rounded-md" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-5 w-16 bg-[#E7E7E5] dark:bg-zinc-800 rounded-md" />
              <Skeleton className="h-9 w-full rounded-lg bg-[#E7E7E5] dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

