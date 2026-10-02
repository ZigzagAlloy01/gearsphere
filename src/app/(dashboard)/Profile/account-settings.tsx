"use client";

import { useState } from "react";
import ChangePasswordForm from "./change-password-form";

type AccountSettingsProps = {
  onSignOut: () => void;
};

export default function AccountSettings({
  onSignOut,
}: AccountSettingsProps) {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="mt-6 rounded-xl bg-white p-5 shadow-sm sm:mt-8 sm:p-8">
      <h3 className="text-lg font-semibold text-secondary sm:text-xl">
        Account Settings
      </h3>

      <p className="mt-2 text-sm text-gray-600 sm:text-base">
        Manage your account security and preferences.
      </p>

      {/* Change Password */}
      <div className="mt-6 border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => setShowChangePassword(!showChangePassword)}
          className="text-sm font-medium text-primary transition hover:underline"
        >
          {showChangePassword ? "Cancel Change Password" : "Change Password"}
        </button>

        {showChangePassword && (
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
            <h4 className="mb-1 text-lg font-semibold text-secondary">
              Change Password
            </h4>

            <p className="mb-6 text-sm text-gray-500">
              Update your password to help keep your account secure.
            </p>

            <ChangePasswordForm />
          </div>
        )}
      </div>

      {/* Sign Out */}
      <div className="mt-6 border-t border-gray-200 pt-6">
        <form action={onSignOut}>
          <button
            type="submit"
            className="w-full rounded-lg border border-red-200 px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 sm:w-auto"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}