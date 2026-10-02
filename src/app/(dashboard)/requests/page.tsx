import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import RentalRequestsClient from "./RentalRequestsClient";

type RentalRequest = {
  id: string;
  listing_id: string;
  borrower_id: string;
  start_date: string;
  end_date: string;
  message: string | null;
  status: string;
  created_at: string;

  listing: {
    id: string;
    title: string;
    price_per_day: number | string;
    city: string | null;
    state: string | null;
    owner_id: string;
  };

  borrower: {
    id: string;
    name: string;
    image: string | null;
  };
};

export default async function RentalRequestsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("rental_requests")
    .select(`
      id,
      listing_id,
      borrower_id,
      start_date,
      end_date,
      message,
      status,
      created_at,

      listing:listings!inner(
        id,
        title,
        price_per_day,
        city,
        state,
        owner_id
      ),

      borrower:users!rental_requests_borrower_id_fkey(
        id,
        name,
        image
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Rental requests page error:",
      JSON.stringify(error, null, 2)
    );

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Unable to load rental requests
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Please try again later.
          </p>
        </div>
      </main>
    );
  }

  const requests =
    (data ?? []) as unknown as RentalRequest[];

  const incoming = requests.filter(
    (request) =>
      request.listing.owner_id === user.id
  );

  const outgoing = requests.filter(
    (request) =>
      request.borrower_id === user.id
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            GearSphere
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Rental requests
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Manage requests for your equipment and track rentals
            you've requested.
          </p>
        </div>
        <RentalRequestsClient
          incoming={incoming}
          outgoing={outgoing}
        />
      </div>
    </main>
  );
}