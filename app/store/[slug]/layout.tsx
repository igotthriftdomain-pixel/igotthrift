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
    "--store-theme": "#0A0A0A",
    "--store-black": "#0A0A0A",
    "--store-soft-black": "#171717",
    "--store-white": "#FFFFFF",
    "--store-off-white": "#FAF9F7",
    "--store-surface": "#F6F6F4",
    "--store-text-primary": "#111111",
    "--store-text-secondary": "#666666",
    "--store-text-muted": "#8A8A8A",
    "--store-border": "#E7E7E5",
    "--store-strong-border": "#D4D4D2",
    "--store-primary": "#0A0A0A",
    "--store-primary-hover": "#171717",
    "--store-primary-foreground": "#FFFFFF",
  } as React.CSSProperties;

  return (
    <CartProvider storeId={store.id}>
      <div
        style={themeStyle}
        className="min-h-screen flex flex-col bg-[#FAF9F7] dark:bg-[#0A0A0A] text-[#111111] dark:text-[#FAF9F7] font-sans antialiased selection:bg-[#0A0A0A] selection:text-[#FFFFFF]"
      >
        <StorefrontHeader store={store} />
        <main className="flex-1">{children}</main>
        <StorefrontFooter store={store} />
      </div>
    </CartProvider>
  );
}

