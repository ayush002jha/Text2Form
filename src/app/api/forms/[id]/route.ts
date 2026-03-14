import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: form, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Determine if the caller is the owner
    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user && form.user_id === user.id;

    // Secure the schema - strip correct answers for non-owners
    let secureSchema = form.schema;
    if (form.is_quiz && !isOwner) {
      secureSchema = (form.schema as any[]).map((field) => {
        const { correctAnswer, ...rest } = field;
        return rest;
      });
    }

    return NextResponse.json({
      ...form,
      schema: secureSchema,
      isOwner,
    });
  } catch (err) {
    console.error("Fetch form error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
