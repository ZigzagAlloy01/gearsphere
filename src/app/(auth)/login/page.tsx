"use client";

import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md">
      {/* Branding & Heading */}
      <div className="mb-8 text-center">
        <div className="mb-4 text-2xl font-bold text-primary">GearSphere</div>

        <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>

        <p className="mt-2 text-base text-slate-600">
          Sign in to continue to GearSphere.
        </p>
      </div>

      {/* Login Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <form className="space-y-5">
          {/* Error Message - Ready for Authentication */}
          <div
            role="alert"
            className="hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            Invalid email or password.
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
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <a
                href="/forgot-password"
                className="text-sm font-medium text-primary transition hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
              >
                Forgot password?
              </a>
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
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

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.99]"
          >
            Sign In
          </button>
        </form>

        {/* Registration Link */}
        <div className="mt-6 border-t border-slate-100 pt-6 text-center">
          <p className="text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="font-semibold text-primary transition hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
            >
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
