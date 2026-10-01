import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";
import ListingCard from "@/src/components/listing/listing-card";

export default async function ListingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: listings, error: listingsError }, { data: categories }] =
    await Promise.all([
      supabase
        .from("listings")
        .select(
          `
          id,
          title,
          description,
          price_per_day,
          status,
          city,
          state,
          country,
          category:categories (
            name
          ),
          listing_images (
            image_url,
            display_order
          )
        `,
        )
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false }),

      supabase.from("categories").select("id, name").order("name"),
    ]);

  if (listingsError) {
    console.error("LISTINGS QUERY ERROR");
    console.error("message:", listingsError.message);
    console.error("details:", listingsError.details);
    console.error("hint:", listingsError.hint);
    console.error("code:", listingsError.code);
    console.error("full error:", listingsError);
  }

  const listingCount = listings?.length ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Page Header */}
      <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
            Equipment Management
          </p>

          <h1 className="text-3xl font-bold text-slate-900">My Listings</h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Manage the equipment you have listed on GearSphere. Create new
            listings, update existing ones, or remove equipment that is no
            longer available.
          </p>
        </div>

        <Link
          href="/listings/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          + Add Equipment
        </Link>
      </section>

      {/* Summary */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Listings</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {listingCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Available</p>

          <p className="mt-2 text-3xl font-bold text-primary">
            {listings?.filter((listing) => listing.status === "available")
              .length ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Other Status</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {listings?.filter((listing) => listing.status !== "available")
              .length ?? 0}
          </p>
        </div>
      </section>

      {/* Listings */}
      {listingsError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          We could not load your listings. Please try again.
        </div>
      ) : listingCount === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
            🧰
          </div>

          <h2 className="mt-5 text-xl font-semibold text-slate-900">
            You have no listings yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Start sharing your equipment with the GearSphere community by
            creating your first listing.
          </p>

          <Link
            href="/listings/new"
            className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            + List Your First Equipment
          </Link>
        </section>
      ) : (
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Your Equipment
            </h2>

            <span className="text-sm text-slate-500">
              {listingCount} {listingCount === 1 ? "listing" : "listings"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Categories are fetched here so the page establishes that
          the categories table is available for the create/edit form. */}
      {!categories && (
        <p className="mt-4 text-sm text-slate-500">
          Categories could not be loaded.
        </p>
      )}
    </div>
  );
}
