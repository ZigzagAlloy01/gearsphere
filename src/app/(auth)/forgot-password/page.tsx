"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "./actions";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    null,
  );

  return (
    <div className="w-full max-w-md">
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Forgot your password?
        </h1>

        <p className="mt-2 text-base text-slate-600">
          Enter your email address and we&apos;ll send you a link to
          reset your password.
        </p>
      </div>

      {/* Forgot Password Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <form action={formAction} className="space-y-5">
          {/* Error Message */}
          {state?.error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {state.error}
            </div>
          )}

          {/* Success Message */}
          {state?.success && (
            <div
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {state.success}
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Sending..." : "Send Reset Link"}
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