import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { formId, answers } = await request.json();

    if (!formId || !answers) {
      return NextResponse.json(
        { error: "Missing formId or answers" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch form basic info (without is_quiz first to be safe)
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("id, schema")
      .eq("id", formId)
      .single();

    if (formError || !form) {
      console.error("Form fetch error:", formError);
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }

    // Try to fetch is_quiz separately (may not exist if migration not run)
    let isQuiz = false;
    try {
      const { data: quizData } = await supabase
        .from("forms")
        .select("is_quiz")
        .eq("id", formId)
        .single();
      isQuiz = quizData?.is_quiz || false;
    } catch {
      // Migration not run yet, treat as regular form
      isQuiz = false;
    }

    let score: number | null = null;
    let totalScore = 0;

    if (isQuiz) {
      score = 0;
      const schema = form.schema as any[];
      
      schema.forEach((field) => {
        if (field.correctAnswer) {
          totalScore++;
          const userAnswer = answers[field.id];
          if (!userAnswer) return;

          if (Array.isArray(field.correctAnswer)) {
            const userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
            const isCorrect = 
              field.correctAnswer.length === userArr.length &&
              field.correctAnswer.every((val: string) => userArr.includes(val));
            if (isCorrect) score!++;
          } else {
            if (userAnswer === field.correctAnswer) score!++;
          }
        }
      });
    }

    // Insert submission - try with score, fall back without if column missing
    const insertPayload: any = { form_id: formId, answers };
    if (isQuiz && score !== null) insertPayload.score = score;

    const { error: insertError } = await supabase.from("submissions").insert(insertPayload);

    if (insertError) {
      // Retry without score if column doesn't exist
      if (insertError.code === "42703" || insertError.message?.includes("score")) {
        const { error: retryError } = await supabase.from("submissions").insert({
          form_id: formId,
          answers,
        });
        if (retryError) {
          console.error("Submission retry error:", retryError);
          return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
        }
      } else {
        console.error("Submission error:", insertError);
        return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      is_quiz: isQuiz,
      score,
      totalScore
    });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
