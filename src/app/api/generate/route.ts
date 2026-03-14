import { NextRequest, NextResponse } from "next/server";
import { genAI, FORM_GENERATION_PROMPT } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";
import { FormSchema } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide a valid prompt" },
        { status: 400 }
      );
    }

    // Call Gemini to generate form schema
    const response = await genAI.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `${FORM_GENERATION_PROMPT}\n\nUser request: "${prompt.trim()}"`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "";

    let formSchema: FormSchema;
    try {
      formSchema = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid format. Please try again." },
        { status: 500 }
      );
    }

    // Validate schema
    if (!formSchema.fields || !Array.isArray(formSchema.fields)) {
      return NextResponse.json(
        { error: "AI generated invalid form schema. Please try again." },
        { status: 500 }
      );
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from("forms")
      .insert({
        title: formSchema.title || "Untitled Form",
        description: formSchema.description || "",
        schema: formSchema.fields,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save form. Check Supabase connection." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      formId: data.id,
      title: formSchema.title,
      fieldsCount: formSchema.fields.length,
    });
  } catch (err) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
