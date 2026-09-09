DROP POLICY IF EXISTS "Anyone can insert rooms"
ON public.rooms;

DROP POLICY IF EXISTS "Anyone can read rooms"
ON public.rooms;

REVOKE INSERT ON public.rooms
FROM anon, authenticated;

CREATE POLICY "Room members can read room"
ON public.rooms
FOR SELECT
TO "authenticated"
USING(
    public.is_room_member(room_id)
)

