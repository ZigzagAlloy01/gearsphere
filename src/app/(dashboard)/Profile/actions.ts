"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData): Promise<void> {
  const fullName = formData.get("fullName")?.toString().trim();

  if (!fullName) {
    return;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
    },
  });

  if (error) {
    return;
  }

  revalidatePath("/Profile");
}
