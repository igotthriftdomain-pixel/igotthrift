export interface SendResetEmailInput {
  to: string;
  resetUrl: string;
}

export interface SendResetEmailResult {
  success: boolean;
  error?: string;
}

/**
 * Transactional Email Abstraction for Password Resets.
 * Replace internal implementation when connecting an active provider (e.g., Resend, SendGrid, Postmark).
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: SendResetEmailInput): Promise<SendResetEmailResult> {
  // Console logging for local development / testing
  console.log(`[Email Abstraction] Password reset link for ${to}: ${resetUrl}`);

  // Returns success abstraction interface
  return { success: true };
}
