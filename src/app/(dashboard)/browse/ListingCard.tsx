import Link from "next/link";
import EquipmentImage from "./EquipmentImage";
import FavoriteButton from "./FavoriteButton";

type Listing = {
  id: string;
  owner_id: string;
  owner_name: string | null;
  owner_image: string | null;
  category_name: string | null;
  title: string;
  description: string;
  price_per_day: number | string;
  city: string | null;
  state: string | null;
  primary_image: string | null;
  distance_miles: number | null;
};

type Props = {
  listing: Listing;
  authenticated: boolean;
  isFavorite: boolean;
};

export default function ListingCard({
  listing,
  authenticated,
  isFavorite,
}: Props) {
  const location = [
    listing.city,
    listing.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Link
          href={`/browse/${listing.id}`}
          className="absolute inset-0 z-0"
          aria-label={`View ${listing.title}`}
        />

        <EquipmentImage
          src={listing.primary_image}
          alt={listing.title}
          fill
          sizes="(max-width: 519px) 100vw, (max-width: 1279px) 50vw, (max-width: 1535px) 33vw, 25vw"
          className="transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          {listing.category_name && (
            <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">
              {listing.category_name}
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3 z-20">
          <FavoriteButton
            listingId={listing.id}
            initialFavorite={isFavorite}
            authenticated={authenticated}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Link
          href={`/browse/${listing.id}`}
          className="block"
        >
          <h2 className="line-clamp-2 text-base font-bold leading-6 text-slate-900 transition group-hover:text-primary">
            {listing.title}
          </h2>

          <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
            {listing.description}
          </p>
        </Link>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="text-xl font-bold text-slate-900">
                ${Number(
                  listing.price_per_day
                ).toFixed(2)}
              </span>

              <span className="ml-1 text-sm text-slate-500">
                / day
              </span>
            </div>

            {listing.distance_miles !== null && (
              <span className="text-xs font-semibold text-slate-400">
                {listing.distance_miles.toFixed(1)} mi
              </span>
            )}
          </div>

          {location && (
            <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
              <span>⌖</span>
              <span className="truncate">
                {location}
              </span>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
            {listing.owner_image ? (
              <img
                src={listing.owner_image}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                {listing.owner_name
                  ?.charAt(0)
                  .toUpperCase() ?? "U"}
              </div>
            )}

            <span className="truncate text-xs font-medium text-slate-500">
              Listed by{" "}
              {listing.owner_name ||
                "GearSphere user"}
            </span>
          </div>

          <Link
            href={`/browse/${listing.id}`}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            View equipment
          </Link>
        </div>
      </div>
    </article>
  );
}