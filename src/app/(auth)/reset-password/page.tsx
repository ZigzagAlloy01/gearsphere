"use client";

import { useState } from "react";
import { createClient } from "@/src/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 6) {
      setError("Your password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsPending(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setIsPending(false);

    if (error) {
      console.error("Reset password error:", error);

      setError(
        "Unable to reset your password. The recovery link may have expired. Please request a new one.",
      );

      return;
    }

    setPassword("");
    setConfirmPassword("");

    setSuccess(
      "Your password has been reset successfully. You can now sign in with your new password.",
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Reset your password
        </h1>

        <p className="mt-2 text-base text-slate-600">
          Enter a new password for your GearSphere account.
        </p>
      </div>

      {/* Reset Password Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          {/* New Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              New password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your new password"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Confirm new password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirm your new password"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Reset Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 border-t border-slate-100 pt-6 text-center">
          <a
            href="/login"
            className="text-sm font-semibold text-primary transition hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}