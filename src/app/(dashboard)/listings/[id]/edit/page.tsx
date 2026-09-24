import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";
import ListingForm from "../../listing-form";

type EditListingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditListingPage({
  params,
}: EditListingPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: listing, error: listingError }, { data: categories }] =
    await Promise.all([
      supabase
        .from("listings")
        .select(`
          id,
          title,
          description,
          category_id,
          price_per_day,
          city,
          state,
          country,
          latitude,
          longitude
        `)
        .eq("id", id)
        .eq("owner_id", user.id)
        .single(),

      supabase
        .from("categories")
        .select("id, name")
        .order("name"),
    ]);

  if (listingError || !listing) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/listings"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to My Listings
        </Link>

        <h1 className="mt-5 text-3xl font-bold text-slate-900">
          Edit Listing
        </h1>

        <p className="mt-2 text-slate-500">
          Update the details of your equipment listing.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <ListingForm
          listing={listing}
          categories={categories ?? []}
        />
      </div>
    </div>
  );
}