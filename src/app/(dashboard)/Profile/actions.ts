"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ProfileActionState = {
  error?: string;
  success?: string;
};

export async function updateProfileAction(
  _prevState: ProfileActionState | null,
  formData: FormData,
): Promise<ProfileActionState> {
  const fullName = formData.get("fullName")?.toString().trim();

  if (!fullName) {
    return {
      error: "Please enter your full name.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be signed in to update your profile.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
    },
  });

  if (error) {
    return {
      error: "Unable to update your profile. Please try again.",
    };
  }

  revalidatePath("/Profile");

  return {
    success: "Profile updated successfully.",
  };
}