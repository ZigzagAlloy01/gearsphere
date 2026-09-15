export default function DashboardPage() {
  const stats = [
    { label: "Listings", value: 5 },
    { label: "Requests", value: 3 },
    { label: "Rentals", value: 2 },
    { label: "Messages", value: 4 },
  ];

  const listings = [
    { name: "Power Drill", status: "Active" },
    { name: "Generator", status: "Rented" },
    { name: "Welder", status: "Active" },
  ];

  const activities = [
    "New request",
    "Rental agreed",
    "New message",
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h2 className="text-xl font-bold text-primary">
            GearSphere
          </h2>

          <div className="flex gap-6">
            <a
              href="/dashboard"
              className="font-semibold text-primary"
            >
              Dashboard
            </a>

            <a
              href="/browse"
              className="text-slate-600 hover:text-primary"
            >
              Browse
            </a>

            <a
              href="/listings"
              className="text-slate-600 hover:text-primary"
            >
              My Listings
            </a>

            <a
              href="/profile"
              className="text-slate-600 hover:text-primary"
            >
              Profile
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, user!
          </h1>

          <p className="mt-2 text-slate-500">
            Here's your current GearSphere account.
          </p>
        </section>

        {/* Statistics */}
        <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-slate-500">
                {stat.label}
              </h3>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Quick Actions
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:opacity-90"
            >
              + List Equipment
            </button>

            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Browse Equipment
            </button>
          </div>
        </section>

        {/* My Listings + Recent Activity */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* My Listings */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-5 text-xl font-semibold text-slate-900">
              My Listings
            </h2>

            <div>
              {listings.map((listing) => (
                <div
                  key={listing.name}
                  className="flex items-center justify-between border-b border-slate-100 py-4 last:border-b-0"
                >
                  <span className="font-medium text-slate-700">
                    {listing.name}
                  </span>

                  <span
                    className={
                      listing.status === "Active"
                        ? "font-semibold text-primary"
                        : "font-semibold text-accent"
                    }
                  >
                    {listing.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-slate-900">
              Recent Activity
            </h2>

            <div>
              {activities.map((activity) => (
                <div
                  key={activity}
                  className="border-b border-slate-100 py-4 last:border-b-0"
                >
                  <p className="text-slate-700">{activity}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}