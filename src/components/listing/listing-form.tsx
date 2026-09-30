"use client";

import { useActionState, useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import {
  saveListing,
  type ListingActionState,
} from "@/src/app/(dashboard)/listings/actions";

type Category = {
  id: string;
  name: string;
};

type ListingImage = {
  id: string;

  image_url: string;
  storage_path: string | null;
  display_order: number;
};

type Listing = {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  price_per_day: number;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  listing_images: ListingImage[];
};

type SelectedImage = {
  file: File;
  preview: string;
};

type ListingFormProps = {
  categories: Category[];
  listing?: Listing;
};

const initialState: ListingActionState = {};

// -------------------------
// LISTING FORM COMPONENT
// -------------------------

export default function ListingForm({ categories, listing }: ListingFormProps) {
  const [state, formAction, pending] = useActionState(
    saveListing,
    initialState,
  );

  const isEditing = Boolean(listing);

  const [SelectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [RemovedImageIds, setRemovedImageIds] = useState<string[]>([]);

  useEffect(() => {
    if (!state?.listingId || SelectedImages.length === 0) {
      return;
    }

    async function uploadImages() {
      const supabase = createClient();

      for (const [index, selectedImage] of SelectedImages.entries()) {
        const file = selectedImage.file;

        const fileExtension = file.name.split(".").pop();
        const uniqueFileName = `${crypto.randomUUID()}.${fileExtension}`;

        const filePath = `listings/${state.listingId}/${uniqueFileName}`;

        const { error } = await supabase.storage
          .from("listing-images")
          .upload(filePath, file);

        if (error) {
          console.error("Image upload error:", error);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(filePath);

        const imageUrl = publicUrlData.publicUrl;

        const { error: imageRecordError } = await supabase
          .from("listing_images")
          .insert({
            listing_id: state.listingId,
            image_url: imageUrl,
            storage_path: filePath,
            display_order: index,
          });

        if (imageRecordError) {
          console.error("Listing image record error:", imageRecordError);

          await supabase.storage.from("listing-images").remove([filePath]);

          return;
        }
      }
    }

    uploadImages();
  }, [state?.listingId, SelectedImages]);

  return (
    <form action={formAction} className="space-y-6">
      {listing && <input type="hidden" name="id" value={listing.id} />}

      {isEditing && (
        <input
          type="hidden"
          name="removed_image_ids"
          value={JSON.stringify(RemovedImageIds)}
        />
      )}

      {state?.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      {/* Basic Information */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">
            Equipment Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Tell renters what equipment you are making available.
          </p>
        </div>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Equipment name
            </label>

            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={150}
              defaultValue={listing?.title ?? ""}
              placeholder="e.g. Makita Power Drill"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              required
              maxLength={5000}
              rows={5}
              defaultValue={listing?.description ?? ""}
              placeholder="Describe the equipment, its condition, what it is suitable for, and anything renters should know."
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Category + Price */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category_id"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Category
              </label>

              <select
                id="category_id"
                name="category_id"
                defaultValue={listing?.category_id ?? ""}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Select a category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="price_per_day"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Price per day
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  $
                </span>

                <input
                  id="price_per_day"
                  name="price_per_day"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  defaultValue={listing?.price_per_day ?? ""}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-8 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="border-t border-slate-100 pt-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">Location</h2>

          <p className="mt-1 text-sm text-slate-500">
            Help renters know where the equipment is located.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label
              htmlFor="city"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              City
            </label>

            <input
              id="city"
              name="city"
              type="text"
              defaultValue={listing?.city ?? ""}
              placeholder="e.g. Lilongwe"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <label
              htmlFor="state"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              State / Region
            </label>

            <input
              id="state"
              name="state"
              type="text"
              defaultValue={listing?.state ?? ""}
              placeholder="e.g. Central Region"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <label
              htmlFor="country"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Country
            </label>

            <input
              id="country"
              name="country"
              type="text"
              defaultValue={listing?.country ?? ""}
              placeholder="Country"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>
      </section>

      {/* Coordinates */}
      <section className="border-t border-slate-100 pt-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">
            Map Location
            <span className="ml-2 text-sm font-normal text-slate-400">
              Optional
            </span>
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Coordinates can be used later for GearSphere&apos;s map feature.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="latitude"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Latitude
            </label>

            <input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              min="-90"
              max="90"
              defaultValue={listing?.latitude ?? ""}
              placeholder="e.g. -13.9626"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <label
              htmlFor="longitude"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Longitude
            </label>

            <input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              min="-180"
              max="180"
              defaultValue={listing?.longitude ?? ""}
              placeholder="e.g. 33.7741"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="border-t border-slate-100 pt-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">
            Equipment Images
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add photos of the equipment to help renters know what they are
            renting.
          </p>
        </div>

        <div className="space-y-4">
          <label
            htmlFor="listing-images"
            className="block cursor-pointer rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-primary hover:bg-slate-100"
          >
            <span className="block text-sm font-medium text-slate-700">
              Choose equipment images
            </span>

            <span className="mt-1 block text-xs text-slate-500">
              JPEG, PNG, WebP or GIF — up to 5 MB per image
            </span>

            <input
              id="listing-images"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="sr-only"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);

                const validImages = files.filter((file) => {
                  const validType = [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif",
                  ].includes(file.type);

                  const validSize = file.size <= 5 * 1024 * 1024;

                  return validType && validSize;
                });

                const newImages = validImages.map((file) => ({
                  file,
                  preview: URL.createObjectURL(file),
                }));

                setSelectedImages((current) => [...current, ...newImages]);

                event.target.value = "";
              }}
            />
          </label>

          {(listing?.listing_images.length > 0 ||
            SelectedImages.length > 0) && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {listing?.listing_images
                .filter((image) => !RemovedImageIds.includes(image.id))
                .sort((a, b) => a.display_order - b.display_order)
                .map((image, index) => (
                  <div
                    key={image.id}
                    className="relative overflow-hidden rounded-lg border border-slate-200 bg-white"
                  >
                    <img
                      src={image.image_url}
                      alt={`Equipment image ${index + 1}`}
                      className="aspect-square w-full object-cover"
                    />

                    <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white">
                      Existing
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setRemovedImageIds((current) => [...current, image.id]);
                      }}
                      className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white transition hover:bg-black"
                    >
                      Remove
                    </button>
                  </div>
                ))}

              {SelectedImages.map((image, index) => (
                <div
                  key={`${image.file.name}-${index}`}
                  className="relative overflow-hidden rounded-lg border border-slate-200 bg-white"
                >
                  <img
                    src={image.preview}
                    alt={`New equipment image ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(image.preview);

                      setSelectedImages((current) =>
                        current.filter((_, imageIndex) => imageIndex !== index),
                      );
                    }}
                    className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white transition hover:bg-black"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Submit */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
        <a
          href="/listings"
          className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </a>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {pending
            ? isEditing
              ? "Saving changes..."
              : "Creating listing..."
            : isEditing
              ? "Save Changes"
              : "Create Listing"}
        </button>
      </div>
    </form>
  );
}
