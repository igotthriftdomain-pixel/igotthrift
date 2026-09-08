import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export const AUTH_COOKIE_NAME = "merchant_session";

function getSessionSecret(): string {
  try {
    const { env } = getCloudflareContext();
    if (env && (env as unknown as Record<string, string>).SESSION_SECRET) {
      return (env as unknown as Record<string, string>).SESSION_SECRET;
    }
  } catch {
    // Ignore error when called outside of Cloudflare request context
  }

  return (
    process.env.SESSION_SECRET ||
    "dev_fallback_session_secret_change_in_production_32chars_min"
  );
}

/**
 * Hashes a plaintext password using PBKDF2-HMAC-SHA256 (100,000 iterations).
 */
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `pbkdf2:sha256:100000:${saltHex}:${hashHex}`;
}

/**
 * Verifies a plaintext password against a stored PBKDF2 hash.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split(":");
  if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[1] !== "sha256") {
    return false;
  }
  const iterations = parseInt(parts[2], 10);
  const saltHex = parts[3];
  const expectedHashHex = parts[4];

  const saltMatch = saltHex.match(/.{1,2}/g);
  if (!saltMatch) return false;
  const salt = new Uint8Array(saltMatch.map((byte) => parseInt(byte, 16)));

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex === expectedHashHex;
}

/**
 * Computes SHA-256 hash of a string (e.g. for reset tokens).
 */
export async function hashToken(rawToken: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(rawToken));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Signs a payload into a base64url.signature token.
 */
export async function signToken(payload: { userId: string; exp: number }): Promise<string> {
  const enc = new TextEncoder();
  const dataStr = JSON.stringify(payload);
  const dataB64 = Buffer.from(dataStr).toString("base64url");
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(dataB64));
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${dataB64}.${sigHex}`;
}

/**
 * Verifies and decodes an HMAC-SHA256 signed token.
 */
export async function verifyToken(
  token: string | undefined
): Promise<{ userId: string; exp: number } | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [dataB64, sigHex] = parts;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const sigMatch = sigHex.match(/.{1,2}/g);
  if (!sigMatch) return null;
  const sigBytes = new Uint8Array(sigMatch.map((b) => parseInt(b, 16)));
  const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(dataB64));
  if (!isValid) return null;

  try {
    const jsonStr = Buffer.from(dataB64, "base64url").toString("utf-8");
    const payload = JSON.parse(jsonStr) as { userId: string; exp: number };
    if (Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Sets the secure HTTP-only merchant authentication cookie.
 */
export async function setAuthCookie(userId: string): Promise<string> {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const exp = Date.now() + sevenDaysMs;
  const token = await signToken({ userId, exp });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return token;
}

/**
 * Clears the merchant authentication cookie.
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Retrieves the currently authenticated user from cookie.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const payload = await verifyToken(token);
    if (!payload) return null;

    const db = getDb();
    const user = await db
      .prepare("SELECT id, email FROM users WHERE id = ?")
      .bind(payload.userId)
      .first<{ id: string; email: string }>();

    if (!user) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Ensures merchant is logged in, or throws error.
 */
export async function requireMerchant(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Merchant login required");
  }
  return user;
}

/**
 * Triggers a password reset email for an email address.
 * Stores token hash and expiration in D1.
 */
export async function requestPasswordReset(
  email: string,
  origin: string
): Promise<{ success: boolean }> {
  const normalizedEmail = email.trim().toLowerCase();
  const db = getDb();

  const user = await db
    .prepare("SELECT id FROM users WHERE LOWER(email) = ?")
    .bind(normalizedEmail)
    .first<{ id: string }>();

  if (user) {
    const rawToken = crypto.randomUUID();
    const tokenHash = await hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await db
      .prepare(
        "UPDATE users SET reset_token_hash = ?, reset_token_expires_at = ?, updated_at = datetime('now') WHERE id = ?"
      )
      .bind(tokenHash, expiresAt, user.id)
      .run();

    const resetUrl = `${origin}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail({ to: normalizedEmail, resetUrl });
  }

  // Always return success to prevent account enumeration
  return { success: true };
}

/**
 * Verifies a reset token and updates the user's password in D1.
 */
export async function resetPassword(
  rawToken: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!rawToken) {
    return { success: false, error: "invalid_token" };
  }

  const tokenHash = await hashToken(rawToken);
  const db = getDb();
  const nowIso = new Date().toISOString();

  const user = await db
    .prepare(
      "SELECT id FROM users WHERE reset_token_hash = ? AND reset_token_expires_at > ?"
    )
    .bind(tokenHash, nowIso)
    .first<{ id: string }>();

  if (!user) {
    return { success: false, error: "invalid_or_expired_token" };
  }

  const newHash = await hashPassword(newPassword);

  await db
    .prepare(
      "UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_token_expires_at = NULL, updated_at = datetime('now') WHERE id = ?"
    )
    .bind(newHash, user.id)
    .run();

  return { success: true };
}
