-- Remove broad UPDATE privilege
REVOKE UPDATE ON public.rooms
FROM anon, authenticated;

-- Allow authenticated clients to update only the fields
-- actually used by the frontend.
GRANT UPDATE (status, max_options, result_option_id)
ON public.rooms
TO authenticated;

-- Replace the broad host UPDATE policy
DROP POLICY IF EXISTS "Update by the Room Host"
ON public.rooms;

CREATE POLICY "Host can update room"
ON public.rooms
FOR UPDATE
TO authenticated
USING (
    public.is_room_member(room_id)
    AND EXISTS (
        SELECT 1
        FROM public.participants
        WHERE participants.room_id = rooms.room_id
          AND participants.user_id = auth.uid()
          AND participants.is_host = true
    )
)
WITH CHECK (
    public.is_room_member(room_id)
    AND EXISTS (
        SELECT 1
        FROM public.participants
        WHERE participants.room_id = rooms.room_id
          AND participants.user_id = auth.uid()
          AND participants.is_host = true
    )
);