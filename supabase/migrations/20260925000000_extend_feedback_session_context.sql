ALTER TABLE public.feedback
ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'home' CHECK (source IN ('home', 'session')),
ADD COLUMN IF NOT EXISTS helpful_response text CHECK (helpful_response IN ('yes', 'a_little', 'not_really')),
ADD COLUMN IF NOT EXISTS room_code text,
ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES public.rooms(room_id) ON DELETE SET NULL;
