"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logoutAction(): Promise<{ error: string } | null> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    return { error: "Unable to log out. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
