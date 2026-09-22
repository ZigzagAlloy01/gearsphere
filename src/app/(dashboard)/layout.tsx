import DashboardHeader from "@/src/components/ui/dashboard-header";
import Footer from "@/src/components/ui/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Gearsphere",
  description:
    "Your dashboard for managing listings, requests, rentals, and messages.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="antialiased">
      <DashboardHeader />
      <main className="min-h-screen bg-slate-50 text-slate-800">
        <div className="">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
