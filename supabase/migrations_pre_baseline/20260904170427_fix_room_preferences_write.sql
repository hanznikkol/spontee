-- =========================================
-- FIX ROOM PREFERENCES WRITE ACCESS
-- =========================================

GRANT INSERT, UPDATE
ON public.room_preferences
TO authenticated;


-- -----------------------------------------
-- INSERT — HOST ONLY
-- -----------------------------------------

CREATE POLICY "Host can insert room preferences"
ON public.room_preferences
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.participants
        WHERE participants.room_id = room_preferences.room_id
          AND participants.user_id = auth.uid()
          AND participants.is_host = true
    )
);


-- -----------------------------------------
-- UPDATE — HOST ONLY
-- -----------------------------------------

CREATE POLICY "Host can update room preferences"
ON public.room_preferences
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.participants
        WHERE participants.room_id = room_preferences.room_id
          AND participants.user_id = auth.uid()
          AND participants.is_host = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.participants
        WHERE participants.room_id = room_preferences.room_id
          AND participants.user_id = auth.uid()
          AND participants.is_host = true
    )
);