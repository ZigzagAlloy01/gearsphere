"use server";

import { createClient } from "@/src/lib/supabase/server";
import { headers } from "next/headers";

export type ForgotPasswordState = {
  error?: string;
  success?: string;
};

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState | null,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = formData.get("email")?.toString().trim().toLowerCase();

  if (!email) {
    return {
      error: "Please enter your email address.",
    };
  }

  const supabase = await createClient();
  const headersList = await headers();

  const origin =
    headersList.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    console.error("Forgot password error:", error);

    return {
      error: "Unable to send the password reset email. Please try again.",
    };
  }

  return {
    success:
      "If an account exists with that email address, a password reset link has been sent. Please check your inbox.",
  };
}