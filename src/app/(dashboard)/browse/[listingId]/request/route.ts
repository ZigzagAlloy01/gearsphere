import { NextResponse } from "next/server";

import { createClient } from "@/src/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

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

function isValidDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  );
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
          error: "Invalid request body.",
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

    if (!isValidDate(startDate)) {
      return NextResponse.json(
        {
          error: "A valid start date is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidDate(endDate)) {
      return NextResponse.json(
        {
          error: "A valid end date is required.",
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

    const today = new Date()
      .toISOString()
      .split("T")[0];

    if (startDate < today) {
      return NextResponse.json(
        {
          error:
            "The rental start date cannot be in the past.",
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

    if (authError || !user) {
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
        .from("available_listings")
        .select(
          "id, owner_id, title, status"
        )
        .eq("id", listingId)
        .maybeSingle();

    if (listingError) {
      console.error(
        "Listing verification error:",
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
            "This listing is no longer available.",
        },
        {
          status: 404,
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

    const { data: conflictingRental, error: conflictError } = 
    await supabase
        .from("rentals")
        .select("id")
        .eq("listing_id", listingId)
        .in("status", ["upcoming", "active"])
        .lte("start_date", endDate)
        .gte("end_date", startDate)
        .limit(1)
        .maybeSingle();
    
    if (conflictError) {
        console.error(
            "There is an error in rental availability:",
            conflictError
        );

        return NextResponse.json(
            {
                error:
                    "It was not possible to verify equipment availability.",
            },
            {
                status: 500,
            }
        );
    }

    if (conflictingRental) {
        return NextResponse.json(
            {
                error:
                    "This equipment is already rented for part of those dates.",
            },
            {
                status: 409,
            }
        );
    }

    const { data: existingRequest, error: existingError } =
      await supabase
        .from("rental_requests")
        .select("id")
        .eq("listing_id", listingId)
        .eq("borrower_id", user.id)
        .eq("status", "pending")
        .maybeSingle();

    if (existingError) {
      console.error(
        "Existing request check error:",
        existingError
      );

      return NextResponse.json(
        {
          error:
            "We couldn't verify your existing requests.",
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

    const { data: rentalRequest, error } =
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
          "id, listing_id, borrower_id, start_date, end_date, message, status, created_at"
        )
        .single();

    if (error) {
      console.error(
        "Rental request insert error:",
        error
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
        request: rentalRequest,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Rental request API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting your request.",
      },
      {
        status: 500,
      }
    );
  }
}