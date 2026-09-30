import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

type Context = {
  params: Promise<{
    listingId: string;
  }>;
};

export async function POST(
  _request: Request,
  { params }: Context
) {
  const { listingId } =
    await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "You must be signed in.",
      },
      { status: 401 }
    );
  }

  const { data: listing } =
    await supabase
      .from("available_listings")
      .select("id")
      .eq("id", listingId)
      .maybeSingle();

  if (!listing) {
    return NextResponse.json(
      {
        error:
          "This equipment is not available.",
      },
      { status: 404 }
    );
  }

  const { error } =
    await supabase
      .from("favorites")
      .upsert(
        {
          user_id: user.id,
          listing_id: listingId,
        },
        {
          onConflict:
            "user_id,listing_id",
          ignoreDuplicates: true,
        }
      );

  if (error) {
    console.error(
      "Favorite insert error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to save this favorite.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    favorite: true,
  });
}

export async function DELETE(
  _request: Request,
  { params }: Context
) {
  const { listingId } =
    await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "You must be signed in.",
      },
      { status: 401 }
    );
  }

  const { error } =
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId);

  if (error) {
    console.error(
      "Favorite delete error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to remove this favorite.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    favorite: false,
  });
}