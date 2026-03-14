import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { formId, answers } = await request.json();

    if (!formId || !answers) {
      return NextResponse.json(
        { error: "Missing formId or answers" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("submissions").insert({
      form_id: formId,
      answers,
    });

    if (error) {
      console.error("Submission error:", error);
      return NextResponse.json(
        { error: "Failed to submit. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
