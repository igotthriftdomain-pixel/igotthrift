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
import { Sparkles, Calendar, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
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
          className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-zinc-500 hover:text-[#0A0A0A] dark:hover:text-[#FAF8F3] transition-colors"
        >
          <ArrowLeft className="size-3.5 text-[#F36B00]" /> Back to Collection Catalog
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
                <Badge className="bg-[#FFBC0A] text-[#0A0A0A] border-0 text-[10px] py-1 px-2.5 font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="size-3 text-[#0A0A0A] fill-current" /> Featured Drop
                </Badge>
              )}
              {product.publishedAt && new Date(product.publishedAt) > new Date() && (
                <Badge className="bg-blue-600 text-white border-0 text-[10px] py-1 px-2.5 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="size-3" /> Scheduled
                </Badge>
              )}
            </div>

            {/* Category and Title */}
            <div className="space-y-2">
              {product.categoryName && product.categorySlug && (
                <Link
                  href={`/store/${store.slug}?category=${product.categorySlug}#products-catalog`}
                  className="text-xs font-extrabold text-[#F36B00] uppercase tracking-widest hover:underline block"
                >
                  {product.categoryName}
                </Link>
              )}
              <h1 className="text-3xl sm:text-5xl font-black text-[#0A0A0A] dark:text-[#FAF8F3] tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>
          </div>

          {/* Price details */}
          <div className="space-y-2 pb-6 border-b border-[#E8E2D8] dark:border-zinc-800">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl sm:text-4xl font-black text-[#0A0A0A] dark:text-[#FAF8F3]">
                {store.currencySymbol}
                {product.price.toLocaleString("en-IN")}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-lg text-zinc-400 line-through font-medium">
                    {store.currencySymbol}
                    {product.compareAtPrice.toLocaleString("en-IN")}
                  </span>
                  <Badge className="bg-[#F36B00] text-white border-0 text-[10px] font-extrabold uppercase tracking-wider">
                    Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                  </Badge>
                </>
              )}
            </div>
            {product.sku && (
              <p className="text-[11px] text-zinc-400 font-extrabold tracking-widest font-mono uppercase">
                ITEM SKU: {product.sku}
              </p>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed border-l-3 border-[#FFBC0A] pl-4 py-1 italic font-serif">
              &ldquo;{product.shortDescription}&rdquo;
            </p>
          )}

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-[#0A0A0A] dark:text-[#FAF8F3] uppercase tracking-wider">
                Item Description & Details
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-line font-normal">
                {product.description}
              </p>
            </div>
          )}

          {/* Key Value Trust Chips */}
          <div className="grid grid-cols-2 gap-3 py-2 border-y border-[#E8E2D8] dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-semibold">
              <ShieldCheck className="size-4 text-[#FFBC0A]" />
              <span>100% Authentic Quality</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-semibold">
              <Truck className="size-4 text-[#F36B00]" />
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
    <div className="pt-12 border-t border-[#E8E2D8] dark:border-zinc-800">
      <ProductGrid products={related} store={store} title="You May Also Like" />
    </div>
  );
}

// Loading Skeletons
function GallerySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[4/5] w-full rounded-2xl bg-[#E8E2D8] dark:bg-zinc-800" />
      <div className="flex gap-3">
        <Skeleton className="size-20 rounded-xl bg-[#E8E2D8] dark:bg-zinc-800" />
        <Skeleton className="size-20 rounded-xl bg-[#E8E2D8] dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="space-y-4 pt-10 border-t border-[#E8E2D8] dark:border-zinc-800">
      <Skeleton className="h-6 w-48 bg-[#E8E2D8] dark:bg-zinc-800" />
      <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border border-[#E8E2D8] dark:border-zinc-800 rounded-2xl overflow-hidden p-3 space-y-4 bg-white dark:bg-zinc-900"
          >
            <Skeleton className="aspect-[4/5] w-full rounded-xl bg-[#E8E2D8] dark:bg-zinc-800" />
            <Skeleton className="h-4 w-3/4 bg-[#E8E2D8] dark:bg-zinc-800" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-16 bg-[#E8E2D8] dark:bg-zinc-800" />
              <Skeleton className="h-9 w-24 rounded-xl bg-[#E8E2D8] dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
