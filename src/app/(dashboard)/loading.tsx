export default function DashboardLoading() {
  return (
    <div
      className="mx-auto w-full max-w-7xl px-6 py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3 text-primary">
        <span
          className="size-5 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
          aria-hidden="true"
        />
        <p className="text-sm font-semibold">Loading your page…</p>
      </div>

      <div className="mt-8 animate-pulse" aria-hidden="true">
        <div className="h-9 w-64 max-w-full rounded-lg bg-slate-200" />
        <div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-200" />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-8 w-16 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-36 max-w-full rounded bg-slate-100" />
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-72 rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2" />
          <div className="h-72 rounded-xl border border-slate-200 bg-white shadow-sm" />
        </div>
      </div>
    </div>
  );
}
