import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    requestId: string;
  }>;
};

type ReviewBody = {
  decision?: unknown;
};

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { requestId } = await params;

    if (!requestId) {
      return NextResponse.json(
        {
          error: "Request ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    let body: ReviewBody;

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

    const decision = body.decision;

    if (
      decision !== "approved" &&
      decision !== "rejected"
    ) {
      return NextResponse.json(
        {
          error:
            "Decision must be approved or rejected.",
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
          error: "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    const { data, error } = await supabase.rpc(
      "review_rental_request",
      {
        p_request_id: requestId,
        p_decision: decision,
      }
    );

    if (error) {
      console.error(
        "Rental review RPC error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "We couldn't process the rental request.",
        },
        {
          status: 500,
        }
      );
    }

    const result = data as {
      success?: boolean;
      code?: string;
      message?: string;
      request_id?: string;
      rental_id?: string;
      total_price?: number;
    };

    if (!result?.success) {
      let status = 400;

      if (result.code === "unauthenticated") {
        status = 401;
      }

      if (result.code === "forbidden") {
        status = 403;
      }

      if (
        result.code === "overlap" ||
        result.code === "already_reviewed"
      ) {
        status = 409;
      }

      if (
        result.code === "request_not_found" ||
        result.code === "listing_not_found"
      ) {
        status = 404;
      }

      return NextResponse.json(
        {
          error:
            result.message ||
            "The request could not be processed.",
          code: result.code,
        },
        {
          status,
        }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Rental review route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while processing the request.",
      },
      {
        status: 500,
      }
    );
  }
}