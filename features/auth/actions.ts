"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  hashPassword,
  verifyPassword,
  setAuthCookie,
  clearAuthCookie,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
} from "@/lib/auth";
import { getDb } from "@/lib/db";
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

export async function loginAction(data: LoginInput): Promise<{ success: boolean; error?: string }> {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { email, password } = result.data;
  const normalizedEmail = email.trim().toLowerCase();
  const db = getDb();

  const user = await db
    .prepare("SELECT id, email, password_hash FROM users WHERE LOWER(email) = ?")
    .bind(normalizedEmail)
    .first<{ id: string; email: string; password_hash: string }>();

  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return { success: false, error: "Invalid email or password" };
  }

  await setAuthCookie(user.id);

  revalidatePath("/dashboard");
  return { success: true };
}

export async function logoutAction(): Promise<{ success: boolean; error?: string }> {
  try {
    await clearAuthCookie();
    revalidatePath("/login");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Logout failed";
    return { success: false, error: message };
  }
}

export async function changePasswordAction(data: ChangePasswordInput): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized. Please log in first." };
  }

  const result = changePasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const db = getDb();
  const userRow = await db
    .prepare("SELECT password_hash FROM users WHERE id = ?")
    .bind(user.id)
    .first<{ password_hash: string }>();

  if (!userRow) {
    return { success: false, error: "User not found" };
  }

  if (data.currentPassword) {
    const isValid = await verifyPassword(data.currentPassword, userRow.password_hash);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect." };
    }
  }

  const newHash = await hashPassword(result.data.newPassword);

  await db
    .prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(newHash, user.id)
    .run();

  await setAuthCookie(user.id);

  return { success: true };
}

export async function requestPasswordResetAction(
  data: ForgotPasswordInput,
  clientOrigin?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const result = forgotPasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const headerList = await headers();
  const host = headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") || "http";
  const origin = host ? `${proto}://${host}` : clientOrigin || "http://localhost:3000";

  await requestPasswordReset(result.data.email, origin);

  return {
    success: true,
    message: "If an account exists for this email, a password reset link has been sent.",
  };
}

export async function resetPasswordAction(
  data: ResetPasswordInput
): Promise<{ success: boolean; error?: string }> {
  const result = resetPasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const token = data.token;
  if (!token) {
    return { success: false, error: "Invalid or missing reset token." };
  }

  const res = await resetPassword(token, result.data.newPassword);
  if (!res.success) {
    return { success: false, error: res.error || "Failed to reset password." };
  }

  return { success: true };
}
