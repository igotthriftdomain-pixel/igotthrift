import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/features/storefront/service";
import { StorefrontHeader } from "@/features/storefront/components/storefront-header";
import { StorefrontFooter } from "@/features/storefront/components/storefront-footer";
import { CartProvider } from "@/features/storefront/context/cart-context";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export default async function StorefrontLayout({ children, params }: LayoutProps) {
  const resolvedParams = await params;
  const store = await getStoreBySlug(resolvedParams.slug);

  if (!store) {
    notFound();
  }

  const themeStyle = {
    "--store-theme": store.themeColor,
    "--store-primary": store.themeColor,
    "--store-primary-hover": `color-mix(in srgb, ${store.themeColor} 85%, black)`,
    "--store-primary-foreground": "#ffffff",
    "--store-accent": `color-mix(in srgb, ${store.themeColor} 15%, transparent)`,
    "--store-border": `color-mix(in srgb, ${store.themeColor} 20%, #e4e4e7)`,
    "--store-ring": `color-mix(in srgb, ${store.themeColor} 50%, transparent)`,
  } as React.CSSProperties;

  return (
    <CartProvider storeId={store.id}>
      <div style={themeStyle} className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950">
        <StorefrontHeader store={store} />
        <main className="flex-1">{children}</main>
        <StorefrontFooter store={store} />
      </div>
    </CartProvider>
  );
}
