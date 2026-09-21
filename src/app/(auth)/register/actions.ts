"use server";

import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signupAction(prevState: { error?: string } | null, formData: FormData) {
  const fullName = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate passwords match
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Redirect to dashboard or a check-email page depending on your flow 
  // (If email confirmation is turned on in Supabase, redirect to a notification page instead)
  redirect("/dashboard");
}