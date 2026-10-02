import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const fullName = user.user_metadata?.full_name;
  const name = typeof fullName === "string" ? fullName.trim() : "";
  const [listingResult, updateResult, sentRequestResult, receivedRequestResult, rentalResult] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, status, created_at", { count: "exact" })
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .order("id")
      .limit(5),
    supabase
      .from("listings")
      .select("id, title, created_at, updated_at")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("id")
      .limit(5),
    supabase
      .from("rental_requests")
      .select("id", { count: "exact", head: true })
      .eq("borrower_id", user.id),
    supabase
      .from("rental_requests")
      .select("id, listings!inner(owner_id)", { count: "exact", head: true })
      .eq("listings.owner_id", user.id)
      // Requests already counted as sent must not be counted twice.
      .or(`borrower_id.neq.${user.id},borrower_id.is.null`),
    supabase
      .from("rentals")
      .select("id", { count: "exact", head: true })
      .or(`owner_id.eq.${user.id},borrower_id.eq.${user.id}`),
  ]);

  const listings = listingResult.error ? [] : listingResult.data ?? [];
  const requestsUnavailable = sentRequestResult.error || receivedRequestResult.error
    || sentRequestResult.count === null || receivedRequestResult.count === null;
  const rentalsUnavailable = rentalResult.error || rentalResult.count === null;
  const stats = [
    {
      label: "Listings",
      value: listingResult.error ? "—" : listingResult.count ?? "—",
      note: listingResult.error ? "Unable to load listings." : null,
    },
    {
      label: "Requests",
      value: requestsUnavailable ? "—" : sentRequestResult.count! + receivedRequestResult.count!,
      note: requestsUnavailable ? "Unable to load requests." : "Sent and received · All statuses",
    },
    {
      label: "Rentals",
      value: rentalsUnavailable ? "—" : rentalResult.count,
      note: rentalsUnavailable ? "Unable to load rentals." : "As owner or borrower · All statuses",
    },
    { label: "Messages", value: "—", note: "Not available yet." },
  ];

  const activityError = listingResult.error || updateResult.error;
  const activities = activityError ? [] : [
    ...listings.map((listing) => ({
      id: `${listing.id}-created`,
      message: `You created ${listing.title}`,
      timestamp: Date.parse(listing.created_at),
    })),
    ...(updateResult.data ?? [])
      .filter((listing) => Date.parse(listing.updated_at) > Date.parse(listing.created_at))
      .map((listing) => ({
        id: `${listing.id}-updated`,
        message: `${listing.title} was updated`,
        timestamp: Date.parse(listing.updated_at),
      })),
  ]
    .filter((activity) => Number.isFinite(activity.timestamp))
    .sort((a, b) => b.timestamp - a.timestamp || a.id.localeCompare(b.id))
    .slice(0, 5);
  const activityDate = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Welcome */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back{name ? `, ${name}` : ""}!
        </h1>

        <p className="mt-2 text-slate-500">
          Here&apos;s your current GearSphere account.
        </p>
      </section>

      {/* Statistics */}
      <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stat.value}
            </p>
            {stat.note && <p className="mt-2 text-sm text-slate-500">{stat.note}</p>}
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Quick Actions
        </h2>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/listings/new"
            className="rounded-lg bg-primary px-5 py-3 text-center font-semibold text-white transition hover:opacity-90"
          >
            + List Equipment
          </Link>

          <Link
            href="/browse"
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Browse Equipment
          </Link>
        </div>
      </section>

      {/* My Listings + Recent Activity */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* My Listings */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-5 text-xl font-semibold text-slate-900">
            My Listings
          </h2>

          <div>
            {listingResult.error ? (
              <p className="text-sm text-red-700" role="status">
                We could not load your listings. Please refresh to try again.
              </p>
            ) : listings.length === 0 ? (
              <p className="text-sm text-slate-500">No listings yet.</p>
            ) : null}
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex items-center justify-between border-b border-slate-100 py-4 last:border-b-0"
              >
                <span className="font-medium text-slate-700">
                  {listing.title}
                </span>

                <span
                  className={
                    listing.status === "available"
                      ? "font-semibold capitalize text-primary"
                      : "font-semibold capitalize text-accent"
                  }
                >
                  {listing.status || "Unknown"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-slate-900">
            Recent Activity
          </h2>

          <p className="mb-3 text-xs text-slate-500">
            Listing creations and latest updates.
          </p>
          <div>
            {activityError ? (
              <p className="text-sm text-red-700" role="status">
                We could not load recent activity. Please refresh to try again.
              </p>
            ) : activities.length === 0 ? (
              <p className="text-sm text-slate-500">No recent listing activity.</p>
            ) : null}
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="border-b border-slate-100 py-4 last:border-b-0"
              >
                <p className="text-slate-700">{activity.message}</p>
                <time
                  dateTime={new Date(activity.timestamp).toISOString()}
                  className="mt-1 block text-xs text-slate-500"
                >
                  {activityDate.format(activity.timestamp)} UTC
                </time>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
