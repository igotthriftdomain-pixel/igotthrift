import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMerchantProfile, getMerchantStore } from "@/features/auth/service";
import { MerchantProvider } from "@/context/merchant-context";
import { Sidebar } from "@/components/merchant/sidebar";
import { Header } from "@/components/merchant/header";

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getMerchantProfile(user.id);
  const store = await getMerchantStore(user.id);

  if (!profile || !store) {
    return (
      <div className="flex items-center justify-center min-h-screen text-sm text-zinc-500">
        Store owner configuration not found. Please contact the platform owner.
      </div>
    );
  }

  return (
    <MerchantProvider profile={profile} store={store}>
      <div className="flex flex-col md:flex-row min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </MerchantProvider>
  );
}
