"use client";

import React, { useState } from "react";
import { changePasswordAction } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { ShieldCheck, Lock, Loader2 } from "lucide-react";

export function ChangePasswordForm() {
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
      const res = await changePasswordAction({
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        toast.success("Password updated successfully");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrors({ general: res.error || "Failed to update password" });
        toast.error(res.error || "Failed to update password");
      }
    } catch {
      toast.error("Network error updating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <ShieldCheck className="size-5 text-zinc-500" />
          Account Security
        </CardTitle>
        <CardDescription>Update your merchant account login password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 text-xs bg-red-950/20 border border-red-950/50 text-red-400 rounded-lg">
              {errors.general}
            </div>
          )}

          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium flex items-center gap-1.5">
                <Lock className="size-3.5 text-zinc-400" /> New Password
              </FieldLabel>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-label="New Password"
              />
              {errors.newPassword && (
                <p className="text-xs text-red-400 mt-1">{errors.newPassword}</p>
              )}
            </Field>

            <Field>
              <FieldLabel className="text-zinc-700 dark:text-zinc-300 font-medium flex items-center gap-1.5">
                <Lock className="size-3.5 text-zinc-400" /> Confirm New Password
              </FieldLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-label="Confirm New Password"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>
              )}
            </Field>
          </FieldGroup>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" /> Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
