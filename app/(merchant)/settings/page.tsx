import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/service";
import { getStoreSettings } from "@/features/store/service";
import { StoreSettingsForm } from "@/features/store/components/store-settings-form";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const result = await getStoreSettings(user.id);
  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-sm text-zinc-500">
        Store settings configuration not found. Please contact support.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Store Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage your brand assets, contact details, currency parameters, and account security.
        </p>
      </div>

      <StoreSettingsForm
        initialStore={result.store}
        initialLogoUrl={result.logoPublicUrl}
        initialBannerUrl={result.bannerPublicUrl}
      />

      <div className="max-w-4xl">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
