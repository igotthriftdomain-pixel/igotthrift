"use client";

import React, { useState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await requestPasswordResetAction({ email }, origin);

      if (res.success) {
        setSubmitted(true);
        setMessage(res.message || "If an account exists for this email, a password reset link has been sent.");
      } else {
        setError(res.error || "Failed to send reset link.");
      }
    } catch {
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-800 border border-zinc-700/60 rounded-xl">
            <Lock className="h-5 w-5 text-zinc-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
              Reset Password
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Enter your merchant email to receive a password reset link
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-300 space-y-1">
                <p className="font-semibold text-emerald-200">Reset Link Dispatched</p>
                <p>{message}</p>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold h-11 flex items-center justify-center gap-2 rounded-xl transition-colors text-sm"
            >
              <ArrowLeft className="size-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs bg-red-950/20 border border-red-900/40 text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Registered Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="merchant@example.com"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-semibold h-11 mt-2 rounded-xl"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" /> Sending link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="size-3" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
