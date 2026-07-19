import { Suspense } from "react";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import Link from "next/link";
import {
  getStoreBySlug,
  getProductBySlug,
  getRelatedProducts,
  getNewestProducts,
} from "@/features/storefront/service";
import { ProductGallery } from "@/features/storefront/components/product-gallery";
import { ProductPurchaseControls } from "@/features/storefront/components/product-purchase-controls";
import { ProductGrid } from "@/features/storefront/components/product-grid";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Calendar, ArrowLeft } from "lucide-react";
import { type StorefrontDetails, type StorefrontProduct } from "@/features/storefront/types";

interface PageProps {
  params: Promise<{
    slug: string;
    productSlug: string;
  }>;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const store = await getStoreBySlug(resolvedParams.slug);
  if (!store) return {};

  const product = await getProductBySlug(store.id, resolvedParams.productSlug);
  if (!product) return {};

  const title = product.metaTitle || product.name;
  const description = product.metaDescription || product.shortDescription || `Buy ${product.name} from ${store.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: product.primaryImageUrl ? [{ url: product.primaryImageUrl }] : [],
    },
  };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const store = await getStoreBySlug(resolvedParams.slug);

  if (!store) {
    notFound();
  }

  const product = await getProductBySlug(store.id, resolvedParams.productSlug);
  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          href={`/store/${store.slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Storefront
        </Link>
      </div>

      {/* Product Details Grid */}
      <div className="grid gap-10 md:grid-cols-2 items-start">
        {/* Left: Gallery (Suspensed) */}
        <div className="space-y-4">
          <Suspense fallback={<GallerySkeleton />}>
            <ProductGallery images={product.images} />
          </Suspense>
        </div>

        {/* Right: Product Details Information (Suspensed) */}
        <div className="space-y-6">
          <div className="space-y-3">
            {/* Badges overlay */}
            <div className="flex flex-wrap gap-2">
              {product.featured && (
                <Badge className="bg-amber-500 text-white border-0 text-[10px] py-0.5 px-2 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="size-3 fill-current" /> Featured Drop
                </Badge>
              )}
              {product.publishedAt && new Date(product.publishedAt) > new Date() && (
                <Badge className="bg-blue-600 text-white border-0 text-[10px] py-0.5 px-2 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="size-3" /> Scheduled
                </Badge>
              )}
            </div>

            {/* Category and Title */}
            <div className="space-y-1">
              {product.categoryName && product.categorySlug && (
                <Link
                  href={`/store/${store.slug}?category=${product.categorySlug}#products-catalog`}
                  className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest hover:text-[var(--store-theme)] transition-colors"
                >
                  {product.categoryName}
                </Link>
              )}
              <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>
          </div>

          {/* Price details */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50">
                {store.currencySymbol}
                {product.price.toLocaleString("en-IN")}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-base text-zinc-400 line-through">
                    {store.currencySymbol}
                    {product.compareAtPrice.toLocaleString("en-IN")}
                  </span>
                  <Badge variant="destructive" className="text-[10px] font-bold uppercase">
                    Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                  </Badge>
                </>
              )}
            </div>
            {product.sku && (
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold tracking-wider font-mono">
                SKU: {product.sku}
              </p>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-zinc-650 dark:text-zinc-300 text-sm leading-relaxed border-l-2 border-zinc-200 dark:border-zinc-800 pl-3">
              {product.shortDescription}
            </p>
          )}

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Product Details</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-line font-medium">
                {product.description}
              </p>
            </div>
          )}

          {/* Purchase details (Quantity selector & Cart CTA) */}
          <ProductPurchaseControls product={product} />
        </div>
      </div>

      {/* Bottom: Related Products Section (Suspensed) */}
      <Suspense fallback={<GridSkeleton />}>
        <RelatedProductsWrapper store={store} product={product} />
      </Suspense>
    </div>
  );
}

// Wrapper for related products to allow streaming
async function RelatedProductsWrapper({
  store,
  product,
}: {
  store: StorefrontDetails;
  product: StorefrontProduct;
}) {
  let related = await getRelatedProducts(store.id, product.id);

  // Fallback to newest products if related products is empty
  if (related.length === 0) {
    const newest = await getNewestProducts(store.id);
    // Exclude the current product being viewed
    related = newest.filter((item) => item.id !== product.id).slice(0, 4);
  }

  if (related.length === 0) return null;

  return (
    <div className="pt-10 border-t border-zinc-200 dark:border-zinc-900">
      <ProductGrid products={related} store={store} title="You May Also Like" />
    </div>
  );
}

// Loading Skeletons
function GallerySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-square w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex gap-3">
        <Skeleton className="size-16 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <Skeleton className="size-16 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="space-y-4 pt-10 border-t border-zinc-200 dark:border-zinc-800">
      <Skeleton className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
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
