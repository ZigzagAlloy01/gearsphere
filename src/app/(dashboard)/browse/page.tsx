"use client"

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/src/lib/supabase/client"

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
}; 

type Category = {
  id: string;
  name: string;
  description: string | null;
};

type SortOption =
  | "newest"
  | "oldest"
  | "price_low"
  | "price_high"
  | "name";

const supabase = createClient();

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    async function loadBrowseData() {
      setLoading(true);
      setError("");

      try {
        const [listingsResult, categoriesResult] = await Promise.all([
          supabase
            .from("available_listings")
            .select("*")
            .order("created_at", { ascending: false }),

          supabase
            .from("categories")
            .select("id, name, description")
            .order("name", { ascending: true }),
        ]);

        if (listingsResult.error) {
          throw listingsResult.error;
        }

        if (categoriesResult.error) {
          throw categoriesResult.error;
        }

        setListings((listingsResult.data ?? []) as Listing[]);
        setCategories((categoriesResult.data ?? []) as Category[]);
      } catch (err) {
        console.error("Browse loading error: ", err);

        setError(
          "It was not possible to load the equipment right now. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBrowseData();
  }, []);

  const locations = useMemo(() => {
    const uniqueLocations = new Set<string>();

    listings.forEach((listing) => {
      if (listing.city) {
        uniqueLocations.add(listing.city);
      }
    });

    return Array.from(uniqueLocations).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [listings]);

  const filteredListings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const result = listings.filter((listing) => {
      if (normalizedSearch) {
        const searchableText = [
          listing.title,
          listing.description,
          listing.category_name,
          listing.city,
          listing.state,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(normalizedSearch)) {
          return false;
        }
      }

      if (
        selectedCategory !== "all" &&
        listing.category_id !== selectedCategory
      ) {
        return false;
      }

      if (
        selectedLocation !== "all" &&
        listing.city !== selectedLocation
      ) {
        return false;
      }

      if (minPrice !== "") {
        const minimum = Number(minPrice);

        if (!Number.isNaN(minimum)) {
          if (Number(listing.price_per_day) < minimum) {
            return false;
          }
        }
      }

      if (maxPrice !== "") {
        const maximum = Number(maxPrice);

        if (!Number.isNaN(maximum)) {
          if (Number(listing.price_per_day) > maximum) {
            return false;
          }
        }
      }

      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );
        
        case "price_low":
          return (
            Number(a.price_per_day) -
            Number(b.price_per_day)
          );

        case "price_high":
          return (
            Number(b.price_per_day) -
            Number(a.price_per_day)
          );

        case "name":
          return a.title.localeCompare(b.title);

        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
      }
    });

    return result;
  }, [
    listings,
    search,
    selectedCategory,
    selectedLocation,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  function clearFilters() {
    setSearch("");
    setSelectedCategory("all");
    setSelectedLocation("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedLocation !== "all" ||
    minPrice !== "" ||
    maxPrice !== "";

  
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-slate-200" />

            <div className="mt-3 h-5 w-80 max-w-full rounded bg-slate-200" />

            <div className="mt-8 h-14 w-full rounded-2xl bg-slate-200" />

            <div className="mt-6 flex gap-3 overflow-hidden">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-10 w-28 shrink-0 rounded-full bg-slate-200"
                />
              ))}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="aspect-[4/3] bg-slate-200" />

                  <div className="space-y-3 p-5">
                    <div className="h-4 w-24 rounded bg-slate-200" />
                    <div className="h-6 w-3/4 rounded bg-slate-200" />
                    <div className="h-4 w-full rounded bg-slate-200" />
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-6">
          <div className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
              !
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Something went wrong. Try again later.
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:py-10">
        <header className="mb-7">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              GearSphere
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Browse equipment
            </h1>

            <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Find the equipment you need from people in your area.
            </p>
          </div>
        </header>
        <section className="mb-6">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search equipment, tools, cameras, electronics..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen((current) => !current)}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 lg:hidden"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="7" x2="17" y1="12" y2="12" />
                <line x1="10" x2="14" y1="18" y2="18" />
              </svg>

              Filters
            </button>
          </div>
        </section>
        <section className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={
                selectedCategory === "all"
                  ? "shrink-0 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                  : "shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              }
            >
              All equipment
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={
                  selectedCategory === category.id
                    ? "shrink-0 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                    : "shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                }
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside
            className={
              filtersOpen
                ? "block"
                : "hidden lg:block"
            }
          >
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  Filters
                </h2>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="mt-6">
                <label
                  htmlFor="category"
                  className="text-sm font-semibold text-slate-800"
                >
                  Category
                </label>

                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                >
                  <option value="all">All categories</option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-5">
                <label
                  htmlFor="location"
                  className="text-sm font-semibold text-slate-800"
                >
                  Location
                </label>

                <select
                  id="location"
                  value={selectedLocation}
                  onChange={(event) =>
                    setSelectedLocation(event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                >
                  <option value="all">All locations</option>

                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-5">
                <p className="text-sm font-semibold text-slate-800">
                  Price per day
                </p>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(event) =>
                      setMinPrice(event.target.value)
                    }
                    placeholder="Min"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />

                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(event) =>
                      setMaxPrice(event.target.value)
                    }
                    placeholder="Max"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white lg:hidden"
              >
                Apply filters
              </button>
            </div>
          </aside>
          <section className="min-w-0">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {filteredListings.length}{" "}
                  {filteredListings.length === 1
                    ? "item"
                    : "items"}{" "}
                  available
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label
                  htmlFor="sort"
                  className="hidden text-sm font-medium text-slate-500 sm:block"
                >
                  Sort by
                </label>

                <select
                  id="sort"
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as SortOption)
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 sm:w-auto"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="price_low">
                    Price: Low to High
                  </option>
                  <option value="price_high">
                    Price: High to Low
                  </option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {search && (
                  <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                    Search: {search}
                  </span>
                )}

                {selectedCategory !== "all" && (
                  <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                    {
                      categories.find(
                        (category) =>
                          category.id === selectedCategory
                      )?.name
                    }
                  </span>
                )}

                {selectedLocation !== "all" && (
                  <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                    {selectedLocation}
                  </span>
                )}

                {(minPrice || maxPrice) && (
                  <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                    ${minPrice || "0"} - $
                    {maxPrice || "∞"}
                  </span>
                )}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Clear
                </button>
              </div>
            )}

            {filteredListings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
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
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  No equipment found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Try adjusting your search or filters to find
                  equipment that matches your needs.
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredListings.map((listing) => {
                  const price = Number(listing.price_per_day);

                  return (
                    <article
                      key={listing.id}
                      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        {listing.primary_image ? (
                          <img
                            src={listing.primary_image}
                            alt={listing.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <svg
                              width="42"
                              height="42"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                width="18"
                                height="18"
                                x="3"
                                y="3"
                                rx="2"
                              />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="m21 15-5-5L5 21" />
                            </svg>
                          </div>
                        )}

                        {listing.category_name && (
                          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                            {listing.category_name}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-base font-bold leading-6 text-slate-900">
                            {listing.title}
                          </h3>

                          <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
                            {listing.description}
                          </p>
                        </div>

                        <div className="mt-auto pt-5">
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <span className="text-xl font-bold text-slate-900">
                                ${price.toFixed(2)}
                              </span>

                              <span className="ml-1 text-sm text-slate-500">
                                / day
                              </span>
                            </div>
                        </div>
                        {(listing.city || listing.state) && (
                            <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                              <svg
                                width="16"
                                height="16"
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

                              <span className="truncate">
                                {[listing.city, listing.state]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </div>
                          )}

                          <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                            {listing.owner_image ? (
                              <img
                                src={listing.owner_image}
                                alt=""
                                loading="lazy"
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
                              {listing.owner_name || "GearSphere user"}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            View equipment
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
