import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";
import BrowseControls from "./BrowseControls";
import ListingCard from "./ListingCard";
import Pagination from "./Pagination";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  "newest",
  "oldest",
  "price_low",
  "price_high",
  "name",
] as const;

type SortOption = (typeof SORT_OPTIONS)[number];

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

type Listing = {
  id: string;
  owner_id: string;
  owner_name: string | null;
  owner_image: string | null;
  category_id: string | null;
  category_name: string | null;
  title: string;
  description: string;
  price_per_day: number | string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  created_at: string;
  primary_image: string | null;
  distance_miles: number | null;
  total_count: number;
};

type Category = {
  id: string;
  name: string;
  description: string | null;
};

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function optionalNumber(value: string) {
  if (!value) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;

    const query = first(params.q).trim();

    const categoryId =
      first(params.category).trim() || null;

    const location =
      first(params.location).trim() || null;

    const minPrice = optionalNumber(
      first(params.min)
    );

    const maxPrice = optionalNumber(
      first(params.max)
    );

    const latitude = optionalNumber(
      first(params.lat)
    );

    const longitude = optionalNumber(
      first(params.lng)
    );

    const radius = optionalNumber(
      first(params.radius)
    );

    const startParam = first(params.start);
    const endParam = first(params.end);

    const startDate =
      startParam && validDate(startParam)
        ? startParam
        : null;

    const endDate =
      endParam && validDate(endParam)
        ? endParam
        : null;

    const requestedSort = first(params.sort);

    const sort: SortOption = SORT_OPTIONS.includes(
      requestedSort as SortOption
    )
      ? (requestedSort as SortOption)
      : "newest";

    const requestedPage = Number(
      first(params.page) || "1"
    );

    const page =
      Number.isInteger(requestedPage) &&
      requestedPage > 0
        ? requestedPage
        : 1;

    const supabase = await createClient();

    const [
      listingsResult,
      categoriesResult,
      userResult,
    ] = await Promise.all([
      supabase.rpc("search_available_listings", {
        p_query: query || null,
        p_category_id: categoryId,
        p_location: location,

        p_min_price:
          minPrice !== null && minPrice >= 0
            ? minPrice
            : null,

        p_max_price:
          maxPrice !== null && maxPrice >= 0
            ? maxPrice
            : null,

        p_lat:
          latitude !== null ? latitude : null,

        p_lng:
          longitude !== null ? longitude : null,

        p_radius_miles:
          radius !== null && radius > 0
            ? Math.min(radius, 250)
            : null,

        p_start_date: startDate,
        p_end_date: endDate,

        p_sort: sort,

        p_limit: PAGE_SIZE,
        p_offset: (page - 1) * PAGE_SIZE,
      }),

      supabase
        .from("categories")
        .select("id, name, description")
        .order("name", {
          ascending: true,
        }),

      supabase.auth.getUser(),
    ]);

    if (listingsResult.error) {
      console.error(
        "Marketplace search error:",
        listingsResult.error
      );

      throw new Error(
        "Unable to load marketplace listings."
      );
    }

    if (categoriesResult.error) {
      console.error(
        "Categories error:",
        categoriesResult.error
      );

      throw new Error(
        "Unable to load marketplace categories."
      );
    }

    const listings =
      (listingsResult.data ?? []) as Listing[];

    const categories =
      (categoriesResult.data ?? []) as Category[];

    const user = userResult.data.user;

    let favoriteIds = new Set<string>();

    if (user && listings.length > 0) {
      const { data: favorites, error } =
        await supabase
          .from("favorites")
          .select("listing_id")
          .eq("user_id", user.id)
          .in(
            "listing_id",
            listings.map((listing) => listing.id)
          );

      if (!error) {
        favoriteIds = new Set(
          (favorites ?? []).map(
            (favorite) => favorite.listing_id
          )
        );
      }
    }

    const totalCount =
      Number(listings[0]?.total_count ?? 0);

    const totalPages =
      Math.max(
        1,
        Math.ceil(totalCount / PAGE_SIZE)
      );

    const hasFilters =
      Boolean(query) ||
      Boolean(categoryId) ||
      Boolean(location) ||
      minPrice !== null ||
      maxPrice !== null ||
      Boolean(startDate) ||
      Boolean(endDate) ||
      Boolean(
        latitude !== null &&
        longitude !== null &&
        radius !== null
      );

    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-[1900px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:py-10">

          <header className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              GearSphere
            </p>

            <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Find the equipment you need
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Search local equipment, compare prices, and find
                  what works for your next project.
                </p>
              </div>

              {user && (
                <Link
                  href="/favorites"
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <span>♥</span>
                  My favorites
                </Link>
              )}
            </div>
          </header>

          <BrowseControls
            categories={categories}
          />

          <div className="mb-5 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {totalCount.toLocaleString()}{" "}
                {totalCount === 1
                  ? "equipment item"
                  : "equipment items"}{" "}
                found
              </p>

              {radius &&
                latitude !== null &&
                longitude !== null && (
                  <p className="mt-1 text-xs text-slate-400">
                    Showing equipment within{" "}
                    {radius} miles
                  </p>
                )}

              {startDate &&
                endDate && (
                  <p className="mt-1 text-xs text-slate-400">
                    Available for your selected dates
                  </p>
                )}
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
                ⌕
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                No equipment found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try a different search, expand your location radius,
                or adjust your filters.
              </p>

              {hasFilters && (
                <Link
                  href="/browse"
                  className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Clear filters
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    authenticated={Boolean(user)}
                    isFavorite={favoriteIds.has(
                      listing.id
                    )}
                  />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                searchParams={params}
              />
            </>
          )}
        </div>
      </main>
    );
}