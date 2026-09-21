"use client";

import Image from "next/image";
import { useState, useActionState } from "react";
import { signupAction } from "./actions";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(signupAction, null);

  return (
    <div className="w-full max-w-md">
      {/* Branding & Heading */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <Image
            src={"/GearSphere-Logo.png"}
            alt="GearSphere"
            width={1120}
            height={348}
            className="h-auto w-45 rounded-sm sm:w-52.5"
            loading="eager"
          />
        </div>

        <h1 className="text-3xl font-bold text-slate-900">Create an account</h1>

        <p className="mt-2 text-base text-slate-600">
          Get started with GearSphere today.
        </p>
      </div>

      {/* Signup Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <form className="space-y-5" action={formAction}>
          {/* Error Message */}
          {state?.error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {state.error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Full name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="John Doe"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

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

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                required
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.27A10.45 10.45 0 0 0 2.5 12c1.5 4 5.2 7 9.5 7 1.55 0 3-.38 4.27-1.05M6.23 6.23A10.45 10.45 0 0 1 12 5c4.3 0 8 3 9.5 7a10.45 10.45 0 0 1-1.66 2.98M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Confirm password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                required
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm your password"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {showConfirmPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.27A10.45 10.45 0 0 0 2.5 12c1.5 4 5.2 7 9.5 7 1.55 0 3-.38 4.27-1.05M6.23 6.23A10.45 10.45 0 0 1 12 5c4.3 0 8 3 9.5 7a10.45 10.45 0 0 1-1.66 2.98M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.99] disabled:opacity-50"
          >
            {isPending ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 border-t border-slate-100 pt-6 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-primary transition hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}