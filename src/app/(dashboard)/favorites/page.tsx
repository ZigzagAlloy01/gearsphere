import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";

import ListingCard from "../browse/ListingCard";

export default async function FavoritesPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: favoriteRows } =
    await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

  const favoriteIds =
    (favoriteRows ?? []).map(
      (favorite) =>
        favorite.listing_id
    );

  if (favoriteIds.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-slate-900">
            My favorites
          </h1>

          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-bold text-slate-900">
              No favorites yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Save equipment you want to compare or rent later.
            </p>

            <Link
              href="/browse"
              className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white"
            >
              Browse equipment
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { data: listings } =
    await supabase
      .from("available_listings")
      .select("*")
      .in("id", favoriteIds);

  const orderedListings =
    favoriteIds
      .map((id) =>
        (listings ?? []).find(
          (listing) =>
            listing.id === id
        )
      )
      .filter(Boolean);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1700px]">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            GearSphere
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            My favorites
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Equipment you saved for later.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {orderedListings.map(
            (listing) => (
              <ListingCard
                key={listing!.id}
                listing={{
                  ...listing!,
                  distance_miles:
                    null,
                }}
                authenticated
                isFavorite
              />
            )
          )}
        </div>
      </div>
    </main>
  );
}