"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  changePasswordAction,
  type ProfileActionState,
} from "./actions";

const initialState: ProfileActionState | null = null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Changing Password..." : "Change Password"}
    </button>
  );
}

export default function ChangePasswordForm() {
  const [state, formAction] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 max-w-xl space-y-5">
      <div>
        <label
          htmlFor="currentPassword"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Current Password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-secondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label
          htmlFor="newPassword"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          New Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-secondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-secondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      {state?.success && (
        <p
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {state.success}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}