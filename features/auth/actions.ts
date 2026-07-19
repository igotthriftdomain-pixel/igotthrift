"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./service";
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type ChangePasswordInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "./schema";

export async function loginAction(data: LoginInput) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { email, password } = result.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/login");
  return { success: true };
}

export async function changePasswordAction(data: ChangePasswordInput) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized. Please log in first." };
  }

  const result = changePasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: result.data.newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function requestPasswordResetAction(data: ForgotPasswordInput, origin: string) {
  const result = forgotPasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const supabase = await createClient();
  const redirectUrl = `${origin}/auth/callback?next=/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    console.error("Password reset error:", error.message);
  }

  // Always return neutral response to prevent user enumeration
  return {
    success: true,
    message: "If an account exists for this email, a password reset link has been sent.",
  };
}

export async function resetPasswordAction(data: ResetPasswordInput) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Session expired or invalid token. Please request a new link." };
  }

  const result = resetPasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: result.data.newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
