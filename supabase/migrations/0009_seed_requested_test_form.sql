-- Seed the specific Foreign Form requested by the user
INSERT INTO forms (id, title, description, schema, user_id, created_at)
VALUES (
  '18c55747-844d-45a9-92f5-c443103fe5ad', 
  'PROTECTED_FORM', 
  'This form is owned by another test entity. Access Denied expected.', 
  '[{"id": "q1", "type": "text", "label": "Secret Key", "required": true}]', 
  '00000000-0000-0000-0000-000000000000', -- Dummy UUID
  NOW()
) ON CONFLICT (id) DO NOTHING;
