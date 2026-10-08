import Link from "next/link";
import { Brand } from "@/src/components/ui/header";
import Footer from "@/src/components/ui/footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center px-6 py-4">
          <Brand />
        </div>
      </header>

      {/* 404 Content */}
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-lg text-center">
          {/* Broken icon */}
          <div className="mx-auto mb-6 grid size-20 place-items-center rounded-2xl bg-primary/10 text-primary">
            <svg
              aria-hidden="true"
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.07.07l1.42-1.42a5 5 0 0 0-7.07-7.07l-.81.81" />
              <path d="M14 11a5 5 0 0 0-7.07-.07l-1.42 1.42a5 5 0 0 0 7.07 7.07l.81-.81" />
              <path d="m8 16 8-8" />
            </svg>
          </div>

          <h1 className="text-8xl font-bold tracking-tight text-slate-800">
            404
          </h1>

          <h2 className="mt-4 text-2xl font-semibold text-slate-800">
            Page Not Found
          </h2>

          <p className="mx-auto mt-3 max-w-md text-slate-500">
            Sorry, the page or piece of gear you are looking for could not be
            found.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Back to Home
            </Link>

            <Link
              href="/listings"
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
