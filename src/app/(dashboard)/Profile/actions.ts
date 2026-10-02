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

export async function changePasswordAction(
  _prevState: ProfileActionState | null,
  formData: FormData,
): Promise<ProfileActionState> {
  const currentPassword = formData.get("currentPassword")?.toString();
  const newPassword = formData.get("newPassword")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      error: "Please complete all password fields.",
    };
  }

  if (newPassword.length < 8) {
    return {
      error: "Your new password must be at least 8 characters long.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      error: "Your new passwords do not match.",
    };
  }

  if (currentPassword === newPassword) {
    return {
      error: "Your new password must be different from your current password.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return {
      error: "You must be signed in to change your password.",
    };
  }

  // Verify the current password.
  const { error: verificationError } =
    await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

  if (verificationError) {
    return {
      error: "Your current password is incorrect.",
    };
  }

  // Update the password.
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return {
      error: updateError.message,
    };
  }

  revalidatePath("/Profile");

  return {
    success: "Your password has been changed successfully.",
  };
}