export interface FormField {
  id: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "select";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface FormSchema {
  title: string;
  description: string;
  fields: FormField[];
}

export interface FormRecord {
  id: string;
  title: string;
  description: string;
  schema: FormField[];
  created_at: string;
}

export interface SubmissionRecord {
  id: string;
  form_id: string;
  answers: Record<string, string | string[]>;
  submitted_at: string;
}
