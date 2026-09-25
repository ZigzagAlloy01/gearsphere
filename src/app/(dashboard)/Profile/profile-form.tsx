"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateProfileAction,
  type ProfileActionState,
} from "./actions";

type ProfileFormProps = {
  fullName: string;
};

const initialState: ProfileActionState | null = null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 w-full rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Saving..." : "Save Changes"}
    </button>
  );
}

export default function ProfileForm({ fullName }: ProfileFormProps) {
  const [state, formAction] = useActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 max-w-xl">
      <label
        htmlFor="fullName"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Full Name
      </label>

      <input
        id="fullName"
        name="fullName"
        type="text"
        defaultValue={fullName}
        required
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-secondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />

      {state?.error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      {state?.success && (
        <p
          role="status"
          className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {state.success}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}