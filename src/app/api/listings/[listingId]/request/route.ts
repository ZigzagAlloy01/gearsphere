import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    listingId: string;
  }>;
};

type RequestBody = {
  startDate?: unknown;
  endDate?: unknown;
  message?: unknown;
};

function isValidDateString(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  );
}

function getTodayUTC() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {

    const { listingId } = await params;

    if (!listingId) {
      return NextResponse.json(
        {
          error: "Listing ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    let body: RequestBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    const startDate = body.startDate;
    const endDate = body.endDate;

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : null;

    if (!isValidDateString(startDate)) {
      return NextResponse.json(
        {
          error: "A valid start date is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidDateString(endDate)) {
      return NextResponse.json(
        {
          error: "A valid end date is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (endDate < startDate) {
      return NextResponse.json(
        {
          error:
            "The end date must be on or after the start date.",
        },
        {
          status: 400,
        }
      );
    }

    const today = getTodayUTC();

    if (startDate < today) {
      return NextResponse.json(
        {
          error:
            "The start date cannot be in the past.",
        },
        {
          status: 400,
        }
      );
    }

    if (message && message.length > 2000) {
      return NextResponse.json(
        {
          error:
            "Your message must be 2000 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(
        "Supabase auth error:",
        authError
      );

      return NextResponse.json(
        {
          error:
            "We couldn't verify your account.",
        },
        {
          status: 500,
        }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          error:
            "You must be signed in to request equipment.",
        },
        {
          status: 401,
        }
      );
    }

    const { data: listing, error: listingError } =
      await supabase
        .from("listings")
        .select(
          "id, owner_id, title, price_per_day, status"
        )
        .eq("id", listingId)
        .maybeSingle();

    if (listingError) {
      console.error(
        "Listing lookup error:",
        listingError
      );

      return NextResponse.json(
        {
          error:
            "We couldn't verify this listing.",
        },
        {
          status: 500,
        }
      );
    }

    if (!listing) {
      return NextResponse.json(
        {
          error:
            "This listing could not be found.",
        },
        {
          status: 404,
        }
      );
    }

    if (listing.status !== "available") {
      return NextResponse.json(
        {
          error:
            "This equipment is no longer available.",
        },
        {
          status: 409,
        }
      );
    }

    if (listing.owner_id === user.id) {
      return NextResponse.json(
        {
          error:
            "You cannot request your own equipment.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: existingRequest,
      error: existingRequestError,
    } = await supabase
      .from("rental_requests")
      .select("id")
      .eq("listing_id", listingId)
      .eq("borrower_id", user.id)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();

    if (existingRequestError) {
      console.error(
        "Existing request lookup error:",
        existingRequestError
      );

      return NextResponse.json(
        {
          error:
            "We couldn't check your existing requests.",
        },
        {
          status: 500,
        }
      );
    }

    if (existingRequest) {
      return NextResponse.json(
        {
          error:
            "You already have a pending request for this equipment.",
        },
        {
          status: 409,
        }
      );
    }

    const { data: rentalRequest, error: insertError } =
      await supabase
        .from("rental_requests")
        .insert({
          listing_id: listingId,
          borrower_id: user.id,
          start_date: startDate,
          end_date: endDate,
          message: message || null,
          status: "pending",
        })
        .select(
          `
          id,
          listing_id,
          borrower_id,
          start_date,
          end_date,
          message,
          status,
          created_at
          `
        )
        .single();

    if (insertError) {
      console.error(
        "Rental request insert error:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "We couldn't submit your rental request.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Your rental request has been sent to the owner.",
        request: rentalRequest,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Rental request route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting your rental request.",
      },
      {
        status: 500,
      }
    );
  }
}