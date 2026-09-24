import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";
import ListingForm from "../listing-form";

export default async function NewListingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Categories query error:", error);
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
          List New Equipment
        </h1>

        <p className="mt-2 text-slate-500">
          Add equipment that you would like to share with the
          GearSphere community.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <ListingForm categories={categories ?? []} />
      </div>
    </div>
  );
}