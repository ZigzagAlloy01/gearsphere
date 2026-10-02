"use client";

import { FormEvent, useMemo, useState } from "react";

type RentalRequestFormProps = {
  listingId: string;
  pricePerDay: number;
  authenticated: boolean;
  isOwner: boolean;
};

function getDays(start: string, end: string) {
  if (!start || !end) {
    return 0;
  }

  const startTime = new Date(
    `${start}T00:00:00Z`
  ).getTime();

  const endTime = new Date(
    `${end}T00:00:00Z`
  ).getTime();

  if (
    Number.isNaN(startTime) ||
    Number.isNaN(endTime) ||
    endTime < startTime
  ) {
    return 0;
  }

  return Math.floor(
    (endTime - startTime) / (1000 * 60 * 60 * 24)
  ) + 1;
}

export default function RentalRequestForm({
  listingId,
  pricePerDay,
  authenticated,
  isOwner,
}: RentalRequestFormProps) {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const rentalDays = useMemo(
    () => getDays(startDate, endDate),
    [startDate, endDate]
  );

  const estimatedTotal =
    rentalDays > 0 ? rentalDays * pricePerDay : 0;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!authenticated) {
      setError(
        "You must be signed in to request equipment."
      );
      return;
    }

    if (isOwner) {
      setError(
        "You cannot request your own equipment."
      );
      return;
    }

    if (!startDate || !endDate) {
      setError(
        "Please select both a start and end date."
      );
      return;
    }

    if (startDate < today) {
      setError(
        "The start date cannot be in the past."
      );
      return;
    }

    if (endDate < startDate) {
      setError(
        "The end date must be on or after the start date."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/listings/${listingId}/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate,
            endDate,
            message: message.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "We couldn't submit your rental request."
        );
      }

      setSuccess(
        "Your rental request has been sent to the owner."
      );

      setStartDate("");
      setEndDate("");
      setMessage("");
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isOwner) {
    return (
      <div className="rounded-2xl bg-slate-50 p-5">
        <p className="text-sm font-bold text-slate-900">
          This is your listing
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          You cannot send a rental request for equipment
          that you own.
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-bold text-slate-900">
            Sign in to request this equipment
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            You need an account before you can send a
            rental request to the owner.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="mt-5 w-full cursor-not-allowed rounded-xl bg-slate-200 px-4 py-3.5 text-sm font-bold text-slate-400"
        >
          Request to Rent
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Request to Rent
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose your rental dates and send a message to the owner.
        </p>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div>
          <label
            htmlFor="start-date"
            className="text-sm font-semibold text-slate-800"
          >
            Start date
          </label>
          <input
            id="start-date"
            type="date"
            min={today}
            value={startDate}
            onChange={(event) =>
              setStartDate(event.target.value)
            }
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>
        <div>
          <label
            htmlFor="end-date"
            className="text-sm font-semibold text-slate-800"
          >
            End date
          </label>
          <input
            id="end-date"
            type="date"
            min={startDate || today}
            value={endDate}
            onChange={(event) =>
              setEndDate(event.target.value)
            }
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </div>
      <div className="mt-5">
        <label
          htmlFor="rental-message"
          className="text-sm font-semibold text-slate-800"
        >
          Message to owner
        </label>
        <textarea
          id="rental-message"
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          maxLength={2000}
          rows={4}
          placeholder="Tell the owner what you'll use the equipment for..."
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
      </div>
      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Daily rate
          </span>
          <span className="font-semibold text-slate-900">
            ${pricePerDay.toFixed(2)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Rental days
          </span>
          <span className="font-semibold text-slate-900">
            {rentalDays || "—"}
          </span>
        </div>
        <div className="mt-3 border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">
              Estimated total
            </span>
            <span className="text-lg font-bold text-slate-900">
              {estimatedTotal > 0
                ? `$${estimatedTotal.toFixed(2)}`
                : "—"}
            </span>
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700">
          {success}
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Sending request..."
          : "Request to Rent"}
      </button>
    </form>
  );
}