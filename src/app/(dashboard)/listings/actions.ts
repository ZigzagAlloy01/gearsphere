"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export type ListingActionState = {
  error?: string;
};

function getString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, name: string) {
  const value = getString(formData, name);

  return value || null;
}

function getOptionalNumber(formData: FormData, name: string) {
  const value = getString(formData, name);

  if (!value) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

export async function saveListing(
  prevState: ListingActionState | null,
  formData: FormData,
): Promise<ListingActionState> {
  const supabase = await createClient();

  /*
   * Never trust an owner_id coming from the form.
   * We get the authenticated user's ID directly from Supabase.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const id = getString(formData, "id");

  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const categoryId = getOptionalString(formData, "category_id");
  const pricePerDay = getOptionalNumber(formData, "price_per_day");

  const city = getOptionalString(formData, "city");
  const state = getOptionalString(formData, "state");
  const country = getOptionalString(formData, "country");

  const latitude = getOptionalNumber(formData, "latitude");
  const longitude = getOptionalNumber(formData, "longitude");

  // -------------------------
  // Server-side validation
  // -------------------------

  if (!title) {
    return { error: "Please enter a listing title." };
  }

  if (title.length > 150) {
    return { error: "The title cannot exceed 150 characters." };
  }

  if (!description) {
    return { error: "Please enter a description." };
  }

  if (description.length > 5000) {
    return { error: "The description cannot exceed 5,000 characters." };
  }

  if (pricePerDay === null || pricePerDay < 0) {
    return { error: "Please enter a valid daily price." };
  }

  if (latitude !== null && (latitude < -90 || latitude > 90)) {
    return { error: "Latitude must be between -90 and 90." };
  }

  if (longitude !== null && (longitude < -180 || longitude > 180)) {
    return { error: "Longitude must be between -180 and 180." };
  }

  const listingData = {
    title,
    description,
    category_id: categoryId,
    price_per_day: pricePerDay,
    city,
    state,
    country,
    latitude,
    longitude,
    updated_at: new Date().toISOString(),
  };

  // -------------------------
  // CREATE
  // -------------------------

  if (!id) {
    /*
     * owner_id comes from the authenticated user.
     * It is deliberately NOT taken from FormData.
     */
    const { error } = await supabase.from("listings").insert({
      ...listingData,
      owner_id: user.id,
    });

    if (error) {
      console.error("Create listing error:", error);

      return {
        error: error.message,
      };
    }

    revalidatePath("/listings");
    redirect("/listings");
  }

  // -------------------------
  // UPDATE
  // -------------------------

  /*
   * The owner_id condition is important.
   *
   * Even before RLS exists, this prevents a logged-in user
   * from updating somebody else's listing through this action.
   */
  const { data, error } = await supabase
    .from("listings")
    .update(listingData)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id")
    .single();

  if (error || !data) {
    console.error("Update listing error:", error);

    return {
      error: "Listing could not be updated. It may not exist or you may not own it.",
    };
  }

  revalidatePath("/listings");
  revalidatePath(`/listings/${id}/edit`);

  redirect("/listings");
}

export async function deleteListing(
  prevState: ListingActionState | null,
  formData: FormData,
): Promise<ListingActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const id = getString(formData, "id");

  if (!id) {
    return {
      error: "Listing ID is missing.",
    };
  }

  /*
   * Again, ownership is part of the database operation.
   */
  const { data, error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id")
    .single();

  if (error || !data) {
    console.error("Delete listing error:", error);

    return {
      error: "Listing could not be deleted. It may not exist or you may not own it.",
    };
  }

  revalidatePath("/listings");

  return {};
}