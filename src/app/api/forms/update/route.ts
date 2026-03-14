import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { formId, title, description, schema, is_quiz } = await request.json();

    if (!formId || !schema) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get current session
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch the form to check ownership
    const { data: form, error: fetchError } = await supabase
      .from("forms")
      .select("user_id")
      .eq("id", formId)
      .single();

    if (fetchError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // AUTH LOGIC:
    // 1. If form has no owner (unclaimed), allow anyone to edit (guest flow)
    // 2. If form has an owner, current user must match that owner
    if (form.user_id !== null) {
      if (!user || form.user_id !== user.id) {
        return NextResponse.json({ error: "Unauthorized: You do not own this form" }, { status: 403 });
      }
    }

    // Update the form
    const { error: updateError } = await supabase
      .from("forms")
      .update({
        title: title || "Untitled Form",
        description: description || "",
        schema: schema,
        is_quiz: is_quiz || false,
      })
      .eq("id", formId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update the form" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
