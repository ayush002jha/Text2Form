import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { formId } = await request.json();

    if (!formId) {
      return NextResponse.json({ error: "Missing formId" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Attempt to delete the form. RLS policy will also enforce that user must be the owner.
    const { data, error, count } = await supabase
      .from("forms")
      .delete({ count: "exact" })
      .eq("id", formId)
      .eq("user_id", user.id)
      .select();

    if (error) {
      return NextResponse.json({ error: "Failed to delete the form" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Form not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
