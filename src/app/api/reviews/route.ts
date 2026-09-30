import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

type Body = {
  rentalId?: unknown;
  listingId?: unknown;
  rating?: unknown;
  comment?: unknown;
};

export async function POST(
  request: Request
) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error:
          "You must be signed in.",
      },
      { status: 401 }
    );
  }

  let body: Body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid request body.",
      },
      { status: 400 }
    );
  }

  if (
    typeof body.rentalId !== "string" ||
    typeof body.listingId !== "string"
  ) {
    return NextResponse.json(
      {
        error:
          "Rental and listing IDs are required.",
      },
      { status: 400 }
    );
  }

  const rating =
    typeof body.rating === "number"
      ? body.rating
      : Number(body.rating);

  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      {
        error:
          "Rating must be between 1 and 5.",
      },
      { status: 400 }
    );
  }

  const comment =
    typeof body.comment === "string"
      ? body.comment.trim()
      : null;

  const { data, error } =
    await supabase.rpc(
      "submit_listing_review",
      {
        p_rental_id:
          body.rentalId,
        p_listing_id:
          body.listingId,
        p_rating: rating,
        p_comment:
          comment || null,
      }
    );

  if (error) {
    console.error(
      "Review RPC error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to submit your review.",
      },
      { status: 500 }
    );
  }

  const result = data as {
    success?: boolean;
    code?: string;
    message?: string;
    review_id?: string;
  };

  if (!result?.success) {
    const status =
      result.code ===
      "already_reviewed"
        ? 409
        : result.code ===
            "rental_not_eligible"
          ? 403
          : 400;

    return NextResponse.json(
      {
        error:
          result.message ||
          "Unable to submit review.",
        code: result.code,
      },
      { status }
    );
  }

  return NextResponse.json(
    result,
    { status: 201 }
  );
}