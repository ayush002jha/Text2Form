-- Seed a "Foreign Form" owned by a dummy user for testing Access Denied states
INSERT INTO forms (id, title, description, schema, user_id, created_at)
VALUES (
  'unauthorized-form-id', 
  'SECRET_RESEARCH_DATA', 
  'This form is owned by a different entity. You should not see this.', 
  '[{"id": "q1", "type": "text", "label": "Security Clearance Code", "required": true}]', 
  '00000000-0000-0000-0000-000000000000', -- Dummy UUID
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Seed a "Public Sample Form" that is unclaimed
INSERT INTO forms (id, title, description, schema, user_id, created_at)
VALUES (
  'sample-form', 
  'COMMUNITY_FEEDBACK_POLL', 
  'This is a public sample form. Anyone can view and edit until claimed.', 
  '[{"id": "q1", "type": "radio", "label": "How is the weather?", "required": true, "options": ["Sunny", "Rainy", "Pixelated"]}]', 
  NULL, 
  NOW()
) ON CONFLICT (id) DO NOTHING;
