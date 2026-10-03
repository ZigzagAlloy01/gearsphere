import DashboardHeader from "@/src/components/ui/dashboard-header";
import Footer from "@/src/components/ui/footer";
import { createClient } from "@/src/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Gearsphere",
  description:
    "Your dashboard for managing listings, requests, rentals, and messages.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: pendingRequests, error } = user
    ? await supabase
        .from("rental_requests")
        .select(`
          id,
          created_at,
          start_date,
          end_date,
          listing:listings!inner(title, owner_id),
          borrower:users!rental_requests_borrower_id_fkey(name)
        `)
        .eq("status", "pending")
        .eq("listings.owner_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  if (error) {
    console.error("Header notifications error:", error);
  }

  return (
    <div className="antialiased">
      <DashboardHeader
        initialNotifications={(pendingRequests ?? []).map((request) => {
          const listing = Array.isArray(request.listing)
            ? request.listing[0]
            : request.listing;
          const borrower = Array.isArray(request.borrower)
            ? request.borrower[0]
            : request.borrower;

          return {
            id: request.id,
            createdAt: request.created_at,
            startDate: request.start_date,
            endDate: request.end_date,
            listingTitle: listing?.title ?? "Equipment listing",
            borrowerName: borrower?.name ?? "A GearSphere user",
          };
        })}
      />
      <main className="min-h-screen bg-slate-50 text-slate-800">
        <div className="">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
