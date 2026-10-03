"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Brand } from "./header";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/browse", label: "Browse" },
  { href: "/listings", label: "My Listings" },
  { href: "/requests", label: "Rental requests" },
  { href: "/Profile", label: "Profile" },
];

export type HeaderNotification = {
  id: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  listingTitle: string;
  borrowerName: string;
};

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function DashboardHeader({
  initialNotifications,
}: {
  initialNotifications: HeaderNotification[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const normalizedPathname = pathname.toLowerCase();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [handledIds, setHandledIds] = useState<string[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const notifications = initialNotifications.filter(
    (notification) => !handledIds.includes(notification.id),
  );

  async function reviewRequest(
    requestId: string,
    decision: "approved" | "rejected",
  ) {
    setProcessingId(requestId);
    setError(null);

    try {
      const response = await fetch(`/api/rental-requests/${requestId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Unable to process this request.");
      }

      setHandledIds((current) => [...current, requestId]);
      router.refresh();
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Unable to process this request.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Brand />

        <div className="flex flex-wrap items-center justify-end gap-2">
          <nav
            aria-label="Dashboard navigation"
            className="flex flex-wrap items-center gap-1"
          >
          {navigation.map((item) => {
            const normalizedHref = item.href.toLowerCase();
            const isActive =
              normalizedPathname === normalizedHref ||
              normalizedPathname.startsWith(`${normalizedHref}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          </nav>

          <details ref={menuRef} className="group relative">
            <summary
              className="relative grid size-11 cursor-pointer list-none place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden"
              aria-label={`Notifications${notifications.length ? `, ${notifications.length} pending` : ""}`}
            >
              <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                  {notifications.length > 99 ? "99+" : notifications.length}
                </span>
              )}
            </summary>

            <div className="absolute right-0 z-50 mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="font-bold text-slate-900">Notifications</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Rental requests needing your attention</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  {notifications.length}
                </span>
              </div>

              {error && (
                <p role="alert" className="border-b border-red-100 bg-red-50 px-5 py-3 text-xs text-red-700">
                  {error}
                </p>
              )}

              {notifications.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <div className="mx-auto grid size-11 place-items-center rounded-full bg-emerald-50 text-emerald-600">✓</div>
                  <p className="mt-3 text-sm font-semibold text-slate-800">You&apos;re all caught up</p>
                  <p className="mt-1 text-xs text-slate-500">There are no rental requests waiting for review.</p>
                </div>
              ) : (
                <div className="max-h-[28rem] divide-y divide-slate-100 overflow-y-auto">
                  {notifications.map((notification) => {
                    const isProcessing = processingId === notification.id;

                    return (
                      <article key={notification.id} className="px-5 py-4">
                        <p className="text-sm leading-5 text-slate-700">
                          <span className="font-semibold">{notification.borrowerName}</span>{" "}
                          requested <span className="font-semibold">{notification.listingTitle}</span>.
                        </p>
                        <p className="mt-1.5 text-xs text-slate-500">
                          {formatShortDate(notification.startDate)} – {formatShortDate(notification.endDate)}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => reviewRequest(notification.id, "rejected")}
                            className="min-h-9 flex-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing ? "Working…" : "Reject"}
                          </button>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => reviewRequest(notification.id, "approved")}
                            className="min-h-9 flex-1 rounded-lg bg-primary px-3 text-xs font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing ? "Working…" : "Approve"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <Link
                href="/requests"
                onClick={() => menuRef.current?.removeAttribute("open")}
                className="block border-t border-slate-100 px-5 py-3 text-center text-sm font-semibold text-primary transition hover:bg-slate-50"
              >
                View all rental requests
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
