import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;

export const genAI = new GoogleGenAI({ apiKey });

export const FORM_GENERATION_PROMPT = `You are an AI form/quiz builder. Given a user's description, generate a JSON form schema.

Return a JSON object with the following structure:
{
  "title": "Form Title",
  "description": "Brief description of the form",
  "fields": [
    {
      "id": "field_1",
      "type": "text | textarea | radio | checkbox | select",
      "label": "Question or field label",
      "placeholder": "Optional placeholder text",
      "required": true,
      "options": ["Option A", "Option B"] 
    }
  ]
}

Rules:
- "options" is ONLY required for "radio", "checkbox", and "select" types
- Each field MUST have a unique "id" (use snake_case like field_1, field_2, etc.)
- Generate between 3-10 fields based on complexity of the request
- Use appropriate field types (text for short answers, textarea for long answers, radio for single choice, checkbox for multiple choice, select for dropdowns)
- Make labels clear and professional
- Always return valid JSON only, no markdown, no code fences
`;
