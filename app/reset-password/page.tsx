"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPasswordAction } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (newPassword.length < 6) {
      setErrors({ newPassword: "Password must be at least 6 characters" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setLoading(true);

    try {
      const res = await resetPasswordAction({
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        toast.success("Password reset successfully. Please sign in with your new password.");
        router.push("/login");
      } else {
        setErrors({ general: res.error || "Failed to reset password" });
        toast.error(res.error || "Failed to reset password");
      }
    } catch {
      toast.error("Network error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-800 border border-zinc-700/60 rounded-xl">
            <ShieldCheck className="h-5 w-5 text-zinc-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
              Set New Password
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Create a new secure password for your merchant account
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 text-xs bg-red-950/20 border border-red-900/40 text-red-400 rounded-lg">
              {errors.general}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-300">
              New Password
            </label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 h-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.newPassword && (
              <p className="text-xs text-red-400">{errors.newPassword}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300">
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 h-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-400">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-semibold h-11 mt-2 rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" /> Updating password...
              </>
            ) : (
              "Save New Password"
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
