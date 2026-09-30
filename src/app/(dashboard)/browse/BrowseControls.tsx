"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

type Category = {
  id: string;
  name: string;
  description: string | null;
};

type Props = {
  categories: Category[];
};

export default function BrowseControls({
  categories,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [advancedOpen, setAdvancedOpen] =
    useState(false);

  const [searchValue, setSearchValue] =
    useState(
      searchParams.get("q") ?? ""
    );

  const [locationValue, setLocationValue] =
    useState(
      searchParams.get("location") ?? ""
    );

  const [minValue, setMinValue] =
    useState(
      searchParams.get("min") ?? ""
    );

  const [maxValue, setMaxValue] =
    useState(
      searchParams.get("max") ?? ""
    );

  const [startValue, setStartValue] =
    useState(
      searchParams.get("start") ?? ""
    );

  const [endValue, setEndValue] =
    useState(
      searchParams.get("end") ?? ""
    );

  const [radiusValue, setRadiusValue] =
    useState(
      searchParams.get("radius") ?? "25"
    );

  const [geoError, setGeoError] =
    useState("");

  useEffect(() => {
    setSearchValue(
      searchParams.get("q") ?? ""
    );

    setLocationValue(
      searchParams.get("location") ?? ""
    );

    setMinValue(
      searchParams.get("min") ?? ""
    );

    setMaxValue(
      searchParams.get("max") ?? ""
    );

    setStartValue(
      searchParams.get("start") ?? ""
    );

    setEndValue(
      searchParams.get("end") ?? ""
    );

    setRadiusValue(
      searchParams.get("radius") ?? "25"
    );
  }, [searchParams]);

  function navigate(
    changes: Record<string, string | null>
  ) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    Object.entries(changes).forEach(
      ([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
    );

    params.set("page", "1");

    const query = params.toString();

    router.replace(
      query
        ? `${pathname}?${query}`
        : pathname
    );
  }

  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    navigate({
      q: searchValue.trim() || null,
      location:
        locationValue.trim() || null,
    });
  }

  function applyAdvancedFilters() {
    navigate({
      min:
        minValue.trim() || null,
      max:
        maxValue.trim() || null,
      start:
        startValue.trim() || null,
      end:
        endValue.trim() || null,
      radius:
        radiusValue.trim() || null,
    });
  }

  function useMyLocation() {
    setGeoError("");

    if (!navigator.geolocation) {
      setGeoError(
        "Location services are not available in this browser."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        navigate({
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          radius:
            radiusValue.trim() || "25",
        });
      },
      () => {
        setGeoError(
          "We couldn't access your location. Check your browser permissions."
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  const selectedCategory =
    searchParams.get("category") ?? "";

  const selectedSort =
    searchParams.get("sort") ?? "newest";

  const usingRadius =
    searchParams.has("lat") &&
    searchParams.has("lng");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col gap-3 xl:flex-row"
      >
        <div className="relative min-w-0 flex-1">
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
            value={searchValue}
            onChange={(event) =>
              setSearchValue(
                event.target.value
              )
            }
            placeholder="Search cameras, drills, bikes, electronics..."
            className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row xl:w-[520px]">
          <input
            value={locationValue}
            onChange={(event) =>
              setLocationValue(
                event.target.value
              )
            }
            placeholder="City or state"
            className="h-14 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
          />

          <button
            type="submit"
            className="h-14 rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Search
          </button>
        </div>
      </form>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <select
          value={selectedCategory}
          onChange={(event) =>
            navigate({
              category:
                event.target.value || null,
            })
          }
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        >
          <option value="">
            All categories
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSort}
          onChange={(event) =>
            navigate({
              sort:
                event.target.value || null,
            })
          }
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        >
          <option value="newest">
            Newest
          </option>

          <option value="oldest">
            Oldest
          </option>

          <option value="price_low">
            Price: Low to High
          </option>

          <option value="price_high">
            Price: High to Low
          </option>

          <option value="name">
            Name
          </option>
        </select>

        <button
          type="button"
          onClick={() =>
            setAdvancedOpen(
              (current) => !current
            )
          }
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {advancedOpen
            ? "Hide advanced filters"
            : "Advanced filters"}
        </button>
      </div>
      {advancedOpen && (
        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Minimum price
              </label>

              <input
                type="number"
                min="0"
                value={minValue}
                onChange={(event) =>
                  setMinValue(
                    event.target.value
                  )
                }
                placeholder="$0"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Maximum price
              </label>

              <input
                type="number"
                min="0"
                value={maxValue}
                onChange={(event) =>
                  setMaxValue(
                    event.target.value
                  )
                }
                placeholder="$100"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Available from
              </label>

              <input
                type="date"
                value={startValue}
                onChange={(event) =>
                  setStartValue(
                    event.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Available through
              </label>

              <input
                type="date"
                value={endValue}
                onChange={(event) =>
                  setEndValue(
                    event.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Search radius
              </label>

              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="250"
                  value={radiusValue}
                  onChange={(event) =>
                    setRadiusValue(
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />

                <span className="shrink-0 text-sm text-slate-500">
                  miles
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={useMyLocation}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {usingRadius
                ? "Update my location"
                : "Use my location"}
            </button>

            <button
              type="button"
              onClick={applyAdvancedFilters}
              className="h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Apply filters
            </button>
          </div>

          {geoError && (
            <p className="mt-3 text-sm text-red-600">
              {geoError}
            </p>
          )}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-400">
          Filters are saved in the URL, so you can share or bookmark a search.
        </p>

        <button
          type="button"
          onClick={() =>
            router.replace(pathname)
          }
          className="shrink-0 text-xs font-bold text-primary hover:underline"
        >
          Clear all
        </button>
      </div>
    </section>
  );
}