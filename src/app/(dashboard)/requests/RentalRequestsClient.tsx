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
};

type Props = {
  incoming: RentalRequest[];
  outgoing: RentalRequest[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(
    new Date(`${value}T00:00:00`)
  );
}

function getRentalDays(
  startDate: string,
  endDate: string
) {
  const start = new Date(
    `${startDate}T00:00:00Z`
  );

  const end = new Date(
    `${endDate}T00:00:00Z`
  );

  return (
    Math.floor(
      (end.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles =
    status === "approved"
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

export default function RentalRequestsClient({
  incoming,
  outgoing,
}: Props) {
  const router = useRouter();

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function reviewRequest(
    requestId: string,
    decision: "approved" | "rejected"
  ) {
    setProcessingId(requestId);
    setError(null);

    try {
      const response = await fetch(
        `/api/rental-requests/${requestId}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            decision,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to process this request."
        );
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
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
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

              const total =
                days *
                Number(
                  request.listing.price_per_day
                );

              const isProcessing =
                processingId === request.id;

              return (
                <article
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          status={request.status}
                        />

                        <span className="text-xs text-slate-400">
                          {formatDate(
                            request.created_at
                              .split("T")[0]
                          )}
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
                      value={formatDate(
                        request.start_date
                      )}
                    />

                    <InfoItem
                      label="End date"
                      value={formatDate(
                        request.end_date
                      )}
                    />

                    <InfoItem
                      label="Daily rate"
                      value={`$${Number(
                        request.listing.price_per_day
                      ).toFixed(2)}/day`}
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
                        disabled={isProcessing}
                        onClick={() =>
                          reviewRequest(
                            request.id,
                            "rejected"
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing
                          ? "Processing..."
                          : "Reject"}
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          reviewRequest(
                            request.id,
                            "approved"
                          )
                        }
                        className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing
                          ? "Processing..."
                          : "Approve rental"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            Your rental requests
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track requests you've sent to equipment owners.
          </p>
        </div>
        {outgoing.length === 0 ? (
          <EmptyState text="You haven't requested any equipment yet." />
        ) : (
          <div className="space-y-4">
            {outgoing.map((request) => (
              <article
                key={request.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        status={request.status}
                      />
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-slate-900">
                      {request.listing.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {formatDate(
                        request.start_date
                      )}{" "}
                      →{" "}
                      {formatDate(
                        request.end_date
                      )}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      ${Number(
                        request.listing.price_per_day
                      ).toFixed(2)}
                      /day
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-medium text-slate-400">
                      Requested
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {formatDate(
                        request.created_at.split(
                          "T"
                        )[0]
                      )}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
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