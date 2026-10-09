"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RentalRequest = {
  id: string;
  listing_id: string;
  borrower_id: string;
  start_date: string;
  end_date: string;
  message: string | null;
  status: string;
  created_at: string;

  listing: {
    id: string;
    title: string;
    price_per_day: number | string;
    city: string | null;
    state: string | null;
    owner_id: string;
  };

  borrower: {
    id: string;
    name: string;
    image: string | null;
  };

  rental?: {
    id: string;
    status: string;
  } | null;
};

type Props = {
  incoming: RentalRequest[];
  outgoing: RentalRequest[];
};

function formatDate(value: string) {
  if (!value) return "";
  const dateOnly = value.includes("T") ? value.split("T")[0] : value;
  const [year, month, day] = dateOnly.split("-").map(Number);

  if (!year || !month || !day) return value;

  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getRentalDays(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "approved" || status === "completed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "rejected"
        ? "bg-red-50 text-red-700"
        : status === "cancelled"
          ? "bg-slate-100 text-slate-600"
          : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${styles}`}
    >
      {status}
    </span>
  );
}

export default function RentalRequestsClient({ incoming, outgoing }: Props) {
  const router = useRouter();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reviewRequest(
    requestId: string,
    decision: "approved" | "rejected"
  ) {
    if (!requestId) return;

    setProcessingId(requestId);
    setError(null);

    try {
      const response = await fetch(
        `/api/rental-requests/${requestId}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to process this request.");
      }

      router.refresh();
    } catch (reviewError) {
      console.error(reviewError);
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Unable to process this request."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function cancelRequest(requestId: string) {
    if (!requestId) return;

    setProcessingId(requestId);
    setError(null);

    try {
      const response = await fetch(
        `/api/rental-requests/${requestId}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to cancel this request.");
      }

      router.refresh();
    } catch (cancelError) {
      console.error(cancelError);
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "Unable to cancel this request."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function completeRental(rentalId?: string | null) {
    if (!rentalId || rentalId === "undefined") {
      setError("Unable to find valid rental ID.");
      return;
    }

    setProcessingId(rentalId);
    setError(null);

    try {
      const response = await fetch(`/api/rentals/${rentalId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to complete this rental.");
      }

      router.refresh();
    } catch (completeError) {
      console.error(completeError);
      setError(
        completeError instanceof Error
          ? completeError.message
          : "Unable to complete this rental."
      );
    } finally {
      setProcessingId(null);
    }
  }

  const isAnyProcessing = processingId !== null;

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Requests for your equipment
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review requests from other GearSphere users.
            </p>
          </div>

          <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white">
            {incoming.length}
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {incoming.length === 0 ? (
          <EmptyState text="You don't have any incoming rental requests yet." />
        ) : (
          <div className="space-y-4">
            {incoming.map((request) => {
              const days = getRentalDays(
                request.start_date,
                request.end_date
              );
              const total = days * Number(request.listing.price_per_day);

              const isProcessingThis = processingId === request.id;
              const isProcessingRental =
                request.rental?.id && processingId === request.rental.id;

              const isComplete = request.rental?.status === "completed";
              const isCanComplete =
                request.rental?.id &&
                (request.rental.status === "upcoming" ||
                  request.rental.status === "active");

              return (
                <article
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          status={isComplete ? "completed" : request.status}
                        />

                        <span className="text-xs text-slate-400">
                          {formatDate(request.created_at)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-slate-900">
                        {request.listing.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Requested by{" "}
                        <span className="font-semibold text-slate-700">
                          {request.borrower.name}
                        </span>
                      </p>
                    </div>

                    <div className="shrink-0 text-left lg:text-right">
                      <p className="text-xs font-medium text-slate-400">
                        Estimated rental total
                      </p>

                      <p className="mt-1 text-xl font-bold text-slate-900">
                        ${total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
                    <InfoItem
                      label="Start date"
                      value={formatDate(request.start_date)}
                    />
                    <InfoItem
                      label="End date"
                      value={formatDate(request.end_date)}
                    />
                    <InfoItem
                      label="Daily rate"
                      value={`$${Number(
                        request.listing.price_per_day
                      ).toFixed(2)}/day (${days} ${
                        days === 1 ? "day" : "days"
                      })`}
                    />
                  </div>

                  {request.message && (
                    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Message
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {request.message}
                      </p>
                    </div>
                  )}

                  {request.status === "pending" && (
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        disabled={isAnyProcessing}
                        onClick={() => reviewRequest(request.id, "rejected")}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessingThis && processingId === request.id
                          ? "Processing..."
                          : "Reject"}
                      </button>

                      <button
                        type="button"
                        disabled={isAnyProcessing}
                        onClick={() => reviewRequest(request.id, "approved")}
                        className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessingThis && processingId === request.id
                          ? "Processing..."
                          : "Approve rental"}
                      </button>
                    </div>
                  )}

                  {isCanComplete && (
                    <div className="mt-5 flex justify-end">
                      <button
                        type="button"
                        disabled={isAnyProcessing}
                        onClick={() => completeRental(request.rental?.id)}
                        className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessingRental
                          ? "Completing..."
                          : "Mark as completed"}
                      </button>
                    </div>
                  )}

                  {isComplete && (
                    <div className="mt-5 flex justify-end">
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Rental completed
                      </span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Your rental requests
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Track requests you've sent to equipment owners.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {outgoing.length}
          </span>
        </div>

        {outgoing.length === 0 ? (
          <EmptyState text="You haven't requested any equipment yet." />
        ) : (
          <div className="space-y-4">
            {outgoing.map((request) => {
              const days = getRentalDays(
                request.start_date,
                request.end_date
              );
              const total = days * Number(request.listing.price_per_day);
              const isProcessingThis = processingId === request.id;
              const location = [request.listing.city, request.listing.state]
                .filter(Boolean)
                .join(", ");

              return (
                <article
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          status={
                            request.rental?.status === "completed"
                              ? "completed"
                              : request.status
                          }
                        />
                        {location && (
                          <span className="text-xs text-slate-400">
                            • {location}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-slate-900">
                        {request.listing.title}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        {formatDate(request.start_date)} →{" "}
                        {formatDate(request.end_date)} ({days}{" "}
                        {days === 1 ? "day" : "days"})
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        ${Number(request.listing.price_per_day).toFixed(2)}
                        /day
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs font-medium text-slate-400">
                        Estimated total
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        ${total.toFixed(2)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Requested on {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <div className="mt-5 flex justify-end">
                      <button
                        type="button"
                        disabled={isAnyProcessing}
                        onClick={() => cancelRequest(request.id)}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessingThis ? "Cancelling..." : "Cancel Request"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
      </div>
      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}