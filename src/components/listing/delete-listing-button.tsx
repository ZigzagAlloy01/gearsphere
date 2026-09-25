"use client";

import { useActionState } from "react";

import {
  deleteListing,
  type ListingActionState,
} from "@/src/app/(dashboard)/listings/actions";

type DeleteListingButtonProps = {
  listingId: string;
};

const initialState: ListingActionState = {};

export default function DeleteListingButton({
  listingId,
}: DeleteListingButtonProps) {
  const [state, formAction, pending] = useActionState(
    deleteListing,
    initialState,
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This action cannot be undone.",
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <div className="flex-1">
      <form action={formAction} onSubmit={handleSubmit}>
        <input type="hidden" name="id" value={listingId} />

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Deleting..." : "Delete"}
        </button>
      </form>

      {state?.error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {state.error}
        </p>
      )}
    </div>
  );
}
