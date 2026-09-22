import Footer from "@/src/components/ui/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | Gearsphere",
  description: "Sign in or create your account.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="min-h-screen bg-slate-100 flex items-center justify-center pt-6">
        <div className="bg-white p-6 my-2 rounded-lg shadow-md w-full max-w-sm">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
