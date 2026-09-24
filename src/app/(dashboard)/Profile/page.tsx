export default function ProfilePage() {
  const user = {
    name: "Attah Collins",
    email: "attah@example.com",
    phone: "+234 800 000 0000",
    location: "Port Harcourt, Nigeria",
    memberSince: "September 2026",
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Profile Content */}
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-secondary sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Manage your GearSphere account information.
          </p>
        </div>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          {/* Profile Header */}
          <div className="bg-primary px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-bold text-primary sm:h-24 sm:w-24 sm:text-3xl">
                AC
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  {user.name}
                </h2>

                <p className="mt-1 text-sm text-green-100 sm:text-base">
                  GearSphere Member
                </p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-secondary sm:text-xl">
                Account Information
              </h3>

              <button
                type="button"
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 sm:w-auto"
              >
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Full Name
                </p>
                <p className="mt-1 break-words text-base text-secondary">
                  {user.name}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Email Address
                </p>
                <p className="mt-1 break-words text-base text-secondary">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Phone Number
                </p>
                <p className="mt-1 break-words text-base text-secondary">
                  {user.phone}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Location
                </p>
                <p className="mt-1 break-words text-base text-secondary">
                  {user.location}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Member Since
                </p>
                <p className="mt-1 text-base text-secondary">
                  {user.memberSince}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Account Type
                </p>
                <p className="mt-1 break-words text-base text-secondary">
                  Equipment Renter & Lister
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="mt-6 rounded-xl bg-white p-5 shadow-sm sm:mt-8 sm:p-8">
          <h3 className="text-lg font-semibold text-secondary sm:text-xl">
            Account Settings
          </h3>

          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Manage your account security and preferences.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              className="w-full rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-secondary transition hover:bg-gray-50 sm:w-auto"
            >
              Change Password
            </button>

            <button
              type="button"
              className="w-full rounded-lg border border-red-200 px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 sm:w-auto"
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
