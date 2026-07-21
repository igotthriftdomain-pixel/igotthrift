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
    "--store-theme": store.themeColor || "#FFBC0A",
    "--store-yellow": "#FFBC0A",
    "--store-orange": "#F36B00",
    "--store-dark": "#0A0A0A",
    "--store-cream": "#FAF8F3",
    "--store-surface": "#F3EFE7",
    "--store-border": "rgba(10, 10, 10, 0.10)",
    "--store-primary": store.themeColor || "#FFBC0A",
    "--store-primary-hover": `color-mix(in srgb, ${store.themeColor || "#FFBC0A"} 85%, black)`,
    "--store-primary-foreground": "#0A0A0A",
  } as React.CSSProperties;

  return (
    <CartProvider storeId={store.id}>
      <div
        style={themeStyle}
        className="min-h-screen flex flex-col bg-[#FAF8F3] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAF8F3] font-sans antialiased selection:bg-[#FFBC0A] selection:text-[#0A0A0A]"
      >
        <StorefrontHeader store={store} />
        <main className="flex-1">{children}</main>
        <StorefrontFooter store={store} />
      </div>
    </CartProvider>
  );
}
