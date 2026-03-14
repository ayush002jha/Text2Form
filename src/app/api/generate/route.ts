import { NextRequest, NextResponse } from "next/server";
import { genAI, FORM_GENERATION_PROMPT } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { FormSchema } from "@/lib/types";
import mammoth from "mammoth";

// Load pdf-parse via its internal entry point to avoid browser-polyfill crash in Next.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const parsePdf: (buf: Buffer) => Promise<{ text: string }> = require("pdf-parse/lib/pdf-parse.js");

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    try {
      const { text } = await parsePdf(buffer);
      return `[PDF: ${file.name}]\n${text.trim()}\n`;
    } catch (e) {
      console.error("PDF parse error", e);
      return `[Could not extract text from ${file.name}]\n`;
    }
  }

  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const { value } = await mammoth.extractRawText({ buffer });
    return `[Word: ${file.name}]\n${value.trim()}\n`;
  }

  if (file.type === "text/plain") {
    return `[Text: ${file.name}]\n${buffer.toString("utf-8").trim()}\n`;
  }

  return "";
}

export async function POST(request: NextRequest) {
  try {
    // Accept both JSON (old path) and FormData (new path with files)
    const contentType = request.headers.get("content-type") ?? "";
    let prompt = "";
    let files: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const fd = await request.formData();
      prompt = (fd.get("prompt") as string | null) ?? "";
      files = fd.getAll("files") as File[];
    } else {
      const body = await request.json();
      prompt = body.prompt ?? "";
    }

    if (!prompt.trim() && files.length === 0) {
      return NextResponse.json(
        { error: "Please provide a prompt or upload a file for context." },
        { status: 400 }
      );
    }

    // Extract text from documents
    const contextParts = await Promise.all(files.filter((f) => !f.type.startsWith("image/")).map(extractText));
    const documentContext = contextParts.join("\n").trim();

    // Build the user message parts for Gemini
    type ContentPart = { text: string } | { inlineData: { data: string; mimeType: string } };
    const userParts: ContentPart[] = [{ text: FORM_GENERATION_PROMPT }];

    if (documentContext) {
      userParts.push({ text: `DOCUMENT CONTEXT:\n${documentContext}` });
    }

    // Attach images as inline data (Gemini vision)
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const buf = Buffer.from(await file.arrayBuffer());
        userParts.push({
          inlineData: { data: buf.toString("base64"), mimeType: file.type },
        });
      }
    }

    const userInstruction = prompt.trim()
      ? `User instructions: "${prompt.trim()}"`
      : "Based on the provided context, generate a well-structured professional form.";
    userParts.push({ text: userInstruction });

    // Call Gemini with the same model/config as before
    const response = await genAI.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [{ role: "user", parts: userParts }],
      config: { responseMimeType: "application/json" },
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

    if (!formSchema.fields || !Array.isArray(formSchema.fields)) {
      return NextResponse.json(
        { error: "AI generated invalid form schema. Please try again." },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("forms")
      .insert({
        title: formSchema.title || "Untitled Form",
        description: formSchema.description || "",
        schema: formSchema.fields,
        user_id: user?.id || null,
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
      { error: err instanceof Error ? err.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
