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
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
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
  const description =
    product.metaDescription ||
    product.shortDescription ||
    `Buy ${product.name} from ${store.name}.`;

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
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#666666] hover:text-[#111111] dark:hover:text-[#FAF9F7] transition-colors"
        >
          <ArrowLeft className="size-3.5 text-[#111111] dark:text-white" /> Back to Catalog
        </Link>
      </div>

      {/* Product Details Grid */}
      <div className="grid gap-12 lg:grid-cols-2 items-start">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <Suspense fallback={<GallerySkeleton />}>
            <ProductGallery images={product.images} />
          </Suspense>
        </div>

        {/* Right: Product Details Information */}
        <div className="space-y-7">
          <div className="space-y-3">
            {/* Badges overlay */}
            <div className="flex flex-wrap gap-2">
              {product.featured && (
                <span className="bg-[#0A0A0A] text-[#FFFFFF] text-[9px] py-1 px-2.5 font-semibold uppercase tracking-[0.2em] shadow-none">
                  Featured Drop
                </span>
              )}
              {product.publishedAt && new Date(product.publishedAt) > new Date() && (
                <span className="bg-[#171717] text-[#FAF9F7] text-[9px] py-1 px-2.5 font-semibold uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <Calendar className="size-3" /> Scheduled
                </span>
              )}
            </div>

            {/* Category and Title */}
            <div className="space-y-2">
              {product.categoryName && product.categorySlug && (
                <Link
                  href={`/store/${store.slug}?category=${product.categorySlug}#products-catalog`}
                  className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-[0.2em] hover:text-[#111111] block transition-colors"
                >
                  {product.categoryName}
                </Link>
              )}
              <h1 className="text-3xl sm:text-5xl font-bold text-[#111111] dark:text-[#FAF9F7] tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>
          </div>

          {/* Price details */}
          <div className="space-y-2 pb-6 border-b border-[#E7E7E5] dark:border-zinc-800">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl sm:text-4xl font-bold text-[#111111] dark:text-[#FAF9F7]">
                {store.currencySymbol}
                {product.price.toLocaleString("en-IN")}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-lg text-[#8A8A8A] line-through font-normal">
                    {store.currencySymbol}
                    {product.compareAtPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="bg-[#0A0A0A] text-white text-[9px] font-semibold uppercase tracking-[0.15em] py-1 px-2.5">
                    Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                  </span>
                </>
              )}
            </div>
            {product.sku && (
              <p className="text-[10px] text-[#8A8A8A] font-medium tracking-[0.2em] font-mono uppercase">
                ITEM SKU: {product.sku}
              </p>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-[#666666] dark:text-zinc-300 text-sm leading-relaxed border-l-2 border-[#0A0A0A] dark:border-white pl-4 py-1 italic font-serif">
              &ldquo;{product.shortDescription}&rdquo;
            </p>
          )}

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[#111111] dark:text-[#FAF9F7] uppercase tracking-[0.15em]">
                Item Description & Details
              </h3>
              <p className="text-[#666666] dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-line font-normal">
                {product.description}
              </p>
            </div>
          )}

          {/* Key Value Trust Chips */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#E7E7E5] dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2 text-[#666666] dark:text-zinc-300 font-medium">
              <ShieldCheck className="size-4 text-[#111111] dark:text-white" />
              <span>100% Authentic Quality</span>
            </div>
            <div className="flex items-center gap-2 text-[#666666] dark:text-zinc-300 font-medium">
              <Truck className="size-4 text-[#111111] dark:text-white" />
              <span>Direct WhatsApp Routing</span>
            </div>
          </div>

          {/* Purchase details (Quantity selector & Cart CTA) */}
          <ProductPurchaseControls product={product} />
        </div>
      </div>

      {/* Bottom: Related Products Section */}
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
    <div className="pt-12 border-t border-[#E7E7E5] dark:border-zinc-800">
      <ProductGrid products={related} store={store} title="You May Also Like" />
    </div>
  );
}

// Loading Skeletons
function GallerySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[4/5] w-full bg-[#E7E7E5] dark:bg-zinc-800" />
      <div className="flex gap-3">
        <Skeleton className="size-20 bg-[#E7E7E5] dark:bg-zinc-800" />
        <Skeleton className="size-20 bg-[#E7E7E5] dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="space-y-4 pt-10 border-t border-[#E7E7E5] dark:border-zinc-800">
      <Skeleton className="h-6 w-48 bg-[#E7E7E5] dark:bg-zinc-800" />
      <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border border-[#E7E7E5] dark:border-zinc-800 overflow-hidden p-3 space-y-4 bg-white dark:bg-zinc-900"
          >
            <Skeleton className="aspect-[4/5] w-full bg-[#E7E7E5] dark:bg-zinc-800" />
            <Skeleton className="h-4 w-3/4 bg-[#E7E7E5] dark:bg-zinc-800" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-16 bg-[#E7E7E5] dark:bg-zinc-800" />
              <Skeleton className="h-9 w-24 bg-[#E7E7E5] dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

