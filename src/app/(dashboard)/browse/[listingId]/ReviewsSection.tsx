"use client";

import { FormEvent, useState } from "react";

type Review = {
  id: string;
  reviewer_name: string;
  reviewer_image: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

type Props = {
  listingId: string;
  reviews: Review[];
  averageRating: number;
  authenticated: boolean;
  eligibleRentalId: string | null;
};

export default function ReviewsSection({
  listingId,
  reviews,
  averageRating,
  authenticated,
  eligibleRentalId,
}: Props) {
  const [rating, setRating] =
    useState(5);

  const [comment, setComment] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function submitReview(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            rentalId:
              eligibleRentalId,
            listingId,
            rating,
            comment:
              comment.trim() || null,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to submit review."
        );
      }

      setMessage(
        "Your review has been submitted."
      );

      setComment("");

      window.location.reload();
    } catch (reviewError) {
      console.error(reviewError);

      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Unable to submit review."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Reviews
          </h2>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-3xl font-bold text-slate-900">
              {averageRating > 0
                ? averageRating.toFixed(1)
                : "—"}
            </span>

            <div>
              <div className="text-amber-400">
                {"★".repeat(
                  Math.round(
                    averageRating
                  )
                )}
                <span className="text-slate-200">
                  {"★".repeat(
                    Math.max(
                      0,
                      5 -
                        Math.round(
                          averageRating
                        )
                    )
                  )}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                {reviews.length}{" "}
                {reviews.length === 1
                  ? "review"
                  : "reviews"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className="mt-7 divide-y divide-slate-100">
          {reviews.map(
            (review) => (
              <article
                key={review.id}
                className="py-5 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  {review.reviewer_image ? (
                    <img
                      src={
                        review.reviewer_image
                      }
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                      {review.reviewer_name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {review.reviewer_name}
                    </p>

                    <div className="mt-0.5 text-xs text-amber-400">
                      {"★".repeat(
                        review.rating
                      )}
                      <span className="text-slate-200">
                        {"★".repeat(
                          5 -
                            review.rating
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {review.comment && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {review.comment}
                  </p>
                )}
              </article>
            )
          )}
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-500">
          No reviews yet.
        </p>
      )}

      {authenticated &&
        eligibleRentalId && (
          <form
            onSubmit={submitReview}
            className="mt-8 border-t border-slate-100 pt-7"
          >
            <h3 className="text-base font-bold text-slate-900">
              Leave a review
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Share your experience after completing a rental.
            </p>

            <div className="mt-5">
              <label className="text-sm font-semibold text-slate-800">
                Rating
              </label>

              <div className="mt-2 flex gap-1">
                {[
                  1,
                  2,
                  3,
                  4,
                  5,
                ].map(
                  (value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setRating(
                          value
                        )
                      }
                      className={`text-2xl transition ${
                        value <= rating
                          ? "text-amber-400"
                          : "text-slate-200"
                      }`}
                      aria-label={`${value} stars`}
                    >
                      ★
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="review-comment"
                className="text-sm font-semibold text-slate-800"
              >
                Comment
              </label>

              <textarea
                id="review-comment"
                rows={4}
                maxLength={2000}
                value={comment}
                onChange={(event) =>
                  setComment(
                    event.target.value
                  )
                }
                placeholder="How was your rental experience?"
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm leading-6 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            {error && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting..."
                : "Submit review"}
            </button>
          </form>
        )}
    </section>
  );
}