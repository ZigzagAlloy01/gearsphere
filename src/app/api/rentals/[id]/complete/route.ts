import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;
    
    if (!id || id === "undefined" || id === "null") {
        return NextResponse.json(
        { error: "ID de alquiler inválido o no proporcionado." },
        { status: 400 }
        );
    }

  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "There is no authorization." }, { status: 401 });
    }

    const { error: updateError } = await supabase
      .from("rentals")
      .update({ status: "completed" })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error." },
      { status: 500 }
    );
  }
}