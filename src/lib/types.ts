export interface FormField {
  id: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "select";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  correctAnswer?: string | string[];
}

export interface FormSchema {
  title: string;
  description: string;
  fields: FormField[];
  is_quiz?: boolean;
}

export interface FormRecord {
  id: string;
  title: string;
  description: string;
  schema: FormField[];
  is_quiz: boolean;
  user_id?: string | null;
  created_at: string;
}

export interface SubmissionRecord {
  id: string;
  form_id: string;
  answers: Record<string, string | string[]>;
  score?: number | null;
  submitted_at: string;
}
