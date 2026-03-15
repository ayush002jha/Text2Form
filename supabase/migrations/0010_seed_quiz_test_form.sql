-- Seed a specialized Quiz Form for TC017
INSERT INTO forms (id, title, description, schema, user_id, is_quiz, created_at)
VALUES (
  '1db2cfd6-7d4b-42b8-a407-68f1c14619d3', 
  'PIXEL_KNOWLEDGE_QUIZ', 
  'Test your knowledge of the pixel grid.', 
  '[{"id": "q1", "type": "radio", "label": "What color is #FF0000?", "required": true, "options": ["Red", "Green", "Blue"], "correctAnswer": "Red"}]', 
  '00000000-0000-0000-0000-000000000000', -- Dummy owner
  true,
  NOW()
) ON CONFLICT (id) DO NOTHING;
