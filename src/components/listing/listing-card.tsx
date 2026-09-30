import Link from "next/link";
import DeleteListingButton from "@/src/components/listing/delete-listing-button";

type ListingCardProps = {
  listing: {
    id: string;
    title: string;
    description: string;
    price_per_day: number;
    status: string;
    city: string | null;
    state: string | null;
    country: string | null;
    category:
      | {
          name: string;
        }
      | { name: string }[]
      | null;
    listing_images: {
      image_url: string;
      display_order: number;
    }[];
  };
};

export default function ListingCard({ listing }: ListingCardProps) {
  const location = [listing.city, listing.state, listing.country]
    .filter(Boolean)
    .join(", ");

  // Safely extract the category name whether Supabase returns an object or an array
  const categoryName = Array.isArray(listing.category)
    ? listing.category[0]?.name
    : listing.category?.name;

  const primaryImage = [...listing.listing_images].sort(
    (a, b) => a.display_order - b.display_order,
  )[0]?.image_url;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Equipment image */}
      <Link
        href={`/listings/${listing.id}`}
        className="block h-40 overflow-hidden bg-slate-100"
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  width="24"
                  height="24"
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
              <p className="text-xs font-medium text-slate-400">
                Equipment image
              </p>
            </div>
          </div>
        )}
      </Link>

      <div className="p-5">
        {/* Category + Status */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {categoryName ?? "Uncategorized"}
          </span>

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
        <Link
          href={`/listings/${listing.id}`}
          className="line-clamp-1 text-xl font-semibold text-slate-900 hover:text-primary"
        >
          {listing.title}
        </Link>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {listing.description}
        </p>

        {/* Location */}
        {location && (
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-500">
            <svg
              className="size-4 shrink-0 text-slate-400"
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
            <span>{location}</span>
          </p>
        )}

        {/* Price */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <span className="text-2xl font-bold text-slate-900">
            ${Number(listing.price_per_day).toFixed(2)}
          </span>
          <span className="ml-1 text-sm text-slate-500">/ day</span>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <Link
            href={`/listings/${listing.id}/edit`}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Edit
          </Link>

          <DeleteListingButton listingId={listing.id} />
        </div>
      </div>
    </article>
  );
}
