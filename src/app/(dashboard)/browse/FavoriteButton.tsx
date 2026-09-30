"use client";

import { useState } from "react";

type Props = {
  listingId: string;
  initialFavorite: boolean;
  authenticated: boolean;
};

export default function FavoriteButton({
  listingId,
  initialFavorite,
  authenticated,
}: Props) {
  const [favorite, setFavorite] =
    useState(initialFavorite);

  const [loading, setLoading] =
    useState(false);

  async function toggleFavorite() {
    if (!authenticated) {
      window.location.href = "/login";
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/favorites/${listingId}`,
        {
          method: favorite
            ? "DELETE"
            : "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to update favorite."
        );
      }

      setFavorite(
        Boolean(data.favorite)
      );
    } catch (error) {
      console.error(
        "Favorite error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={loading}
      aria-label={
        favorite
          ? "Remove from favorites"
          : "Add to favorites"
      }
      title={
        favorite
          ? "Remove from favorites"
          : "Add to favorites"
      }
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-lg shadow-md backdrop-blur transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        className={
          favorite
            ? "text-red-500"
            : "text-slate-500"
        }
      >
        {favorite ? "♥" : "♡"}
      </span>
    </button>
  );
}