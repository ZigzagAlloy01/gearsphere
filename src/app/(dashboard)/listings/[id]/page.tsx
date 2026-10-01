import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";

type ListingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: listing, error } = await supabase
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
        id,
        image_url,
        display_order
      )
    `,
    )
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const images = [...(listing.listing_images ?? [])].sort(
    (a, b) => a.display_order - b.display_order,
  );

  const categoryName = Array.isArray(listing.category)
    ? listing.category[0]?.name
    : undefined;

  const location = [listing.city, listing.state, listing.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 sm:py-10">
      {/* Page Navigation */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/listings"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary"
        >
          <span aria-hidden="true">←</span>
          Back to My Listings
        </Link>

        <Link
          href={`/listings/${listing.id}/edit`}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          Edit Listing
        </Link>
      </div>

      {/* Main Listing Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          {/* Image Gallery */}
          <section className="bg-slate-50 p-4 sm:p-6 lg:p-8">
            {images.length > 0 ? (
              <div className="space-y-4">
                {/* Primary Image */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <img
                    src={images[0].image_url}
                    alt={`${listing.title} primary image`}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>

                {/* Additional Images */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {images.slice(1).map((image, index) => (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                      >
                        <img
                          src={image.image_url}
                          alt={`${listing.title} image ${index + 2}`}
                          className="aspect-square w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white">
                <div className="text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    No images available
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Listing Information */}
          <section className="p-6 sm:p-8 lg:p-10">
            {/* Category + Status */}
            <div className="flex flex-wrap items-center gap-2">
              {categoryName && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {categoryName}
                </span>
              )}

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  listing.status === "available"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {listing.status}
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-5 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              {listing.title}
            </h1>

            {/* Price */}
            <div className="mt-6">
              <p className="text-3xl font-bold text-slate-900">
                $ {Number(listing.price_per_day).toLocaleString()}
              </p>

              <p className="mt-1 text-sm text-slate-500">/ day</p>
            </div>

            {/* Location */}
            {location && (
              <div className="mt-6 flex items-start gap-3 rounded-lg bg-slate-50 p-4">
                <svg
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {location}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-8 border-t border-slate-200 pt-7">
              <h2 className="text-lg font-semibold text-slate-900">
                About this equipment
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                {listing.description}
              </p>
            </div>

            {/* Listing Summary */}
            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-slate-200 pt-7">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">Status</p>

                <p className="mt-1 text-sm font-semibold capitalize text-slate-700">
                  {listing.status}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">Photos</p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {images.length}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
