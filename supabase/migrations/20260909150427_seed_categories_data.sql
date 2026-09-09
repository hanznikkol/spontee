INSERT INTO public.categories (name, label, icon)
VALUES
  ('food', 'Food', '🍔'),
  ('coffee', 'Coffee', '☕'),
  ('dessert', 'Dessert', '🍰'),
  ('drinks', 'Drinks', '🍹'),
  ('entertainment', 'Entertainment', '🎳'),
  ('shopping', 'Shopping', '🛍️'),
  ('parks', 'Parks', '🌳'),
  ('bars', 'Bars', '🍻'),
  ('karaoke', 'Karaoke', '🎤'),
  ('sports', 'Sports', '⚽'),
  ('wellness', 'Wellness', '🧘')
ON CONFLICT (name) DO NOTHING;