"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

// Type for the state returned by the saveListing action
export type ListingActionState = {
  error?: string;
  listingId?: string;
};

// Helper function to get a string value from FormData
function getString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

// Helper function to get an optional string value from FormData
function getOptionalString(formData: FormData, name: string) {
  const value = getString(formData, name);

  return value || null;
}

// Helper function to get an optional number value from FormData
function getOptionalNumber(formData: FormData, name: string) {
  const value = getString(formData, name);

  if (!value) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

// -------------------------
// SAVE LISTING ACTION
// -------------------------

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

  // -------------------------
  // Extract form data
  // -------------------------

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

  // -------------------------
  // Prepare data for insertion or update
  // -------------------------

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
  // CREATE LISTING ACTION
  // -------------------------

  if (!id) {
    /*
     * owner_id comes from the authenticated user.
     * It is deliberately NOT taken from FormData.
     */
    const { data, error } = await supabase
      .from("listings")
      .insert({
        ...listingData,
        owner_id: user.id,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Create listing error:", error);

      return {
        error: error?.message ?? "The listing could not be created.",
      };
    }

    revalidatePath("/listings");

    return {
      listingId: data.id,
    };
  }

  // -------------------------
  // UPDATE LISTING ACTION
  // -------------------------

  /*
   * The owner_id condition is important.
   *
   * Even before RLS exists, this prevents a logged-in user
   * from updating somebody else's listing through this action.
   */
  const removedImageIdsValue = getString(formData, "removed_image_ids");

  let removedImageIds: string[] = [];

  if (removedImageIdsValue) {
    try {
      const parsed = JSON.parse(removedImageIdsValue);

      if (Array.isArray(parsed)) {
        removedImageIds = parsed.filter(
          (value): value is string => typeof value === "string",
        );
      }
    } catch {
      return {
        error: "The selected images could not be processed.",
      };
    }
  }

  /*
   * Verify that the listing belongs to the current user
   * before touching any of its images.
   */
  const { data: ownedListing, error: ownershipError } = await supabase
    .from("listings")
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (ownershipError || !ownedListing) {
    return {
      error: "Listing could not be found or you do not own it.",
    };
  }

  /*
   * Remove selected images.
   */
  if (removedImageIds.length > 0) {
    const { data: images, error: imagesError } = await supabase
      .from("listing_images")
      .select("id, storage_path")
      .eq("listing_id", id)
      .in("id", removedImageIds);

    if (imagesError) {
      console.error("Get images for removal error:", imagesError);

      return {
        error: "The selected images could not be found.",
      };
    }

    const storagePaths =
      images
        ?.map((image) => image.storage_path)
        .filter((path): path is string => Boolean(path)) ?? [];

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("listing-images")
        .remove(storagePaths);

      if (storageError) {
        console.error(
          "Remove listing images from storage error:",
          storageError,
        );

        return {
          error: "The selected images could not be deleted.",
        };
      }
    }

    const { error: deleteImagesError } = await supabase
      .from("listing_images")
      .delete()
      .eq("listing_id", id)
      .in("id", removedImageIds);

    if (deleteImagesError) {
      console.error("Delete listing image records error:", deleteImagesError);

      return {
        error: "The selected image records could not be deleted.",
      };
    }
  }

  /*
   * Update the listing itself.
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
      error: error?.message ?? "The listing could not be updated.",
    };
  }

  revalidatePath("/listings");
  revalidatePath(`/listings/${id}/edit`);

  return {
    listingId: data.id,
  };
}

// -------------------------
// DELETE LISTING ACTION
// -------------------------
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
   * Get the Storage paths belonging to this listing.
   */
  const { data: images, error: imagesError } = await supabase
    .from("listing_images")
    .select("storage_path")
    .eq("listing_id", id);

  if (imagesError) {
    console.error("Get listing images error:", imagesError);

    return {
      error: "Listing images could not be found.",
    };
  }

  /*
   * Remove the actual image files from Supabase Storage.
   *
   * Only storage_path values are sent to Storage.
   * Records with no storage_path are ignored.
   */
  const storagePaths =
    images
      ?.map((image) => image.storage_path)
      .filter((path): path is string => Boolean(path)) ?? [];

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("listing-images")
      .remove(storagePaths);

    if (storageError) {
      console.error("Delete listing images error:", storageError);

      return {
        error: "Listing images could not be deleted.",
      };
    }
  }

  /*
   * Delete the listing itself.
   *
   * The listing_images database records will be removed
   * automatically because listing_id uses ON DELETE CASCADE.
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
      error:
        "Listing could not be deleted. It may not exist or you may not own it.",
    };
  }

  revalidatePath("/listings");

  return {};
}
