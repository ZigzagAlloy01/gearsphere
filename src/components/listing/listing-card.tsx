import Link from "next/link";
import { deleteListing } from "@/src/app/(dashboard)/listings/actions";

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
    category: {
      name: string;
    } | null;
  };
};

export default function ListingCard({ listing }: ListingCardProps) {
  const location = [listing.city, listing.state, listing.country]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Image placeholder */}
      <div className="flex h-40 items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
            🧰
          </div>

          <p className="text-xs font-medium text-slate-400">Equipment image</p>
        </div>
      </div>

      <div className="p-5">
        {/* Category + Status */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {listing.category?.name ?? "Uncategorized"}
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
        <h2 className="line-clamp-1 text-xl font-semibold text-slate-900">
          {listing.title}
        </h2>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {listing.description}
        </p>

        {/* Location */}
        {location && (
          <p className="mt-4 text-sm text-slate-500">📍 {location}</p>
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

          <form action={deleteListing} className="flex-1">
            <input type="hidden" name="id" value={listing.id} />

            <button
              type="submit"
              className="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
