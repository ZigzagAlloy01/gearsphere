import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

type RouteContext = {
    params: Promise<{
        requestId: string;
    }>;
};

export async function POST(
    _request: Request,
    { params }: RouteContext
) {
    const { requestId } = await params;

    if (!requestId) {
        return NextResponse.json(
            { error: "Rental request ID is required." },
            { status: 400 }
        );
    }

    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json(
            { error: "You must be signed in to cancel a request." },
            { status: 401 }
        );
    }

    const { data: cancelledRequest, error } = await supabase
        .from("rental_requests")
        .update({ status: "cancelled" })
        .eq("id", requestId)
        .eq("borrower_id", user.id)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();

    if (error) {
        console.error("Cancel rental request error:", error);

        return NextResponse.json(
            { error: "Unable to cancel this request." },
            { status: 500 }
        );
    }

    if (!cancelledRequest) {
        return NextResponse.json(
            {
                error:
                    "This request cannot be cancelled. It may no longer be pending."
            },
            { status: 409 }
        );
    }

    return NextResponse.json(
        {
            success: true,
            requestId: cancelledRequest.id,
            status: "cancelled",
        },
        { status: 200 }
    );
}