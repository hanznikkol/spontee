SET local check_function_bodies = off;

CREATE TABLE "public"."categories" (
  "category_id" uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"        text                     NOT NULL,
  "label"       text                     NOT NULL,
  "icon"        text,
  "created_at"  timestamp with time zone DEFAULT now(),
  CONSTRAINT "categories_name_key" UNIQUE (name),
  CONSTRAINT "categories_pkey" PRIMARY KEY (category_id)
);

ALTER TABLE "public"."categories"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."options" (
  "option_id"       uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "room_id"         uuid                     NOT NULL,
  "title"           text                     NOT NULL,
  "description"     text,
  "google_place_id" text,
  "address"         text,
  "latitude"        double precision,
  "longitude"       double precision,
  "rating"          numeric,
  "total_reviews"   integer,
  "created_at"      timestamp with time zone DEFAULT now(),
  "price_level"     integer                  DEFAULT 1,
  "image_urls"      text[],
  "distance_meters" integer,
  CONSTRAINT "options_pkey" PRIMARY KEY (option_id),
  CONSTRAINT "options_price_level_check" CHECK (((price_level >= 1) AND (price_level <= 4)))
);

ALTER TABLE "public"."options"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."participants" (
  "participant_id" uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "room_id"        uuid                     NOT NULL,
  "display_name"   text                     NOT NULL,
  "is_host"        boolean                  DEFAULT false,
  "joined_at"      timestamp with time zone DEFAULT now(),
  "user_id"        uuid                     NOT NULL,
  "status"         text                     DEFAULT '''waiting''::text'::text,
  CONSTRAINT "participants_pkey" PRIMARY KEY (participant_id),
  CONSTRAINT "participants_status_check" CHECK ((status = ANY (ARRAY['waiting'::text, 'voting'::text, 'finished'::text]))),
  CONSTRAINT "unique_room_user" UNIQUE (room_id, user_id)
);

ALTER TABLE "public"."participants"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."room_categories" (
  "room_id"     uuid NOT NULL,
  "category_id" uuid NOT NULL,
  CONSTRAINT "room_categories_pkey" PRIMARY KEY (room_id, category_id)
);

ALTER TABLE "public"."room_categories"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."room_preferences" (
  "preference_id" uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "room_id"       uuid                     NOT NULL,
  "budget"        text,
  "address"       text,
  "latitude"      double precision,
  "longitude"     double precision,
  "radius"        integer                  DEFAULT 3000,
  "created_at"    timestamp with time zone DEFAULT now(),
  CONSTRAINT "room_preferences_pkey" PRIMARY KEY (preference_id),
  CONSTRAINT "room_preferences_radius_check" CHECK ((radius > 0)),
  CONSTRAINT "room_preferences_room_id_key" UNIQUE (room_id)
);

ALTER TABLE "public"."room_preferences"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."rooms" (
  "room_id"          uuid                        NOT NULL DEFAULT gen_random_uuid(),
  "room_name"        text                        NOT NULL,
  "status"           text                        NOT NULL DEFAULT 'lobby'::text,
  "created_at"       timestamp without time zone DEFAULT now(),
  "ends_at"          timestamp with time zone,
  "room_code"        text                        NOT NULL,
  "max_participants" integer                     NOT NULL DEFAULT 2,
  "result_option_id" uuid,
  "max_options"      integer                     NOT NULL DEFAULT 10,
  CONSTRAINT "rooms_max_participants_check" CHECK ((max_participants >= 2)),
  CONSTRAINT "rooms_pkey" PRIMARY KEY (room_id),
  CONSTRAINT "rooms_room_code_key" UNIQUE (room_code),
  CONSTRAINT "rooms_status_check" CHECK ((status = ANY (ARRAY['lobby'::text, 'active'::text, 'result'::text, 'closed'::text])))
);

ALTER TABLE "public"."rooms"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."swipes" (
  "swipe_id"       uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "room_id"        uuid                     NOT NULL,
  "participant_id" uuid                     NOT NULL,
  "vote"           text                     NOT NULL,
  "swiped_at"      timestamp with time zone DEFAULT now(),
  "option_id"      uuid                     NOT NULL,
  CONSTRAINT "swipes_pkey" PRIMARY KEY (swipe_id),
  CONSTRAINT "swipes_vote_check" CHECK ((vote = ANY (ARRAY['go'::text, 'pass'::text])))
);

ALTER TABLE "public"."swipes"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
  RETURNS event_trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog'
  AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_vote (
  p_room_id        uuid,
  p_option_id      uuid,
  p_participant_id uuid,
  p_vote           text
)
  RETURNS json
  LANGUAGE plpgsql
  AS $function$
DECLARE
    v_option_count integer;
    v_vote_count integer;
    v_finished boolean;
BEGIN

    -- Save the vote
    INSERT INTO public.swipes (
        room_id,
        option_id,
        participant_id,
        vote
    )
    VALUES (
        p_room_id,
        p_option_id,
        p_participant_id,
        p_vote
    );

    -- Count how many options exist in this room
    SELECT COUNT(*)
    INTO v_option_count
    FROM public.options
    WHERE room_id = p_room_id;

    -- Count how many options this participant has voted on
    SELECT COUNT(*)
    INTO v_vote_count
    FROM public.swipes
    WHERE room_id = p_room_id
      AND participant_id = p_participant_id;

    -- Determine if participant finished
    v_finished := v_vote_count >= v_option_count;

    -- Mark participant as finished
    IF v_finished THEN
        UPDATE public.participants
        SET status = 'finished'
        WHERE participant_id = p_participant_id
          AND room_id = p_room_id;
    END IF;

    RETURN json_build_object(
        'finished', v_finished,
        'vote_count', v_vote_count,
        'option_count', v_option_count
    );

END;
$function$;

ALTER TABLE "public"."participants"
  ADD CONSTRAINT "participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE "public"."room_categories"
  ADD CONSTRAINT "room_categories_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE CASCADE;

ALTER TABLE "public"."options"
  ADD CONSTRAINT "options_room_id_fkey" FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE;

ALTER TABLE "public"."participants"
  ADD CONSTRAINT "participants_room_id_fkey" FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE;

ALTER TABLE "public"."room_categories"
  ADD CONSTRAINT "room_categories_room_id_fkey" FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE;

ALTER TABLE "public"."room_preferences"
  ADD CONSTRAINT "room_preferences_room_id_fkey" FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE;

ALTER TABLE "public"."rooms"
  ADD CONSTRAINT "rooms_result_option_id_fkey" FOREIGN KEY (result_option_id) REFERENCES public.options(option_id);

ALTER TABLE "public"."swipes"
  ADD CONSTRAINT "swipes_option_id_fkey" FOREIGN KEY (option_id) REFERENCES public.options(option_id) ON DELETE CASCADE;

ALTER TABLE "public"."swipes"
  ADD CONSTRAINT "swipes_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES public.participants(participant_id);

ALTER TABLE "public"."swipes"
  ADD CONSTRAINT "swipes_room_id_fkey" FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE;

CREATE INDEX idx_participants_room_id ON public.participants USING btree (room_id);

CREATE INDEX idx_swipes_option_id ON public.swipes USING btree (option_id);

CREATE INDEX idx_swipes_participant_id ON public.swipes USING btree (participant_id);

CREATE INDEX idx_swipes_room_id ON public.swipes USING btree (room_id);

CREATE UNIQUE INDEX participants_room_user_unique ON public.participants USING btree (room_id, user_id);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."categories"
  FOR INSERT
  TO "anon", "authenticated"
  WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."categories"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."options"
  FOR INSERT
  TO "anon", "authenticated"
  WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."options"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable insert for public users" ON "public"."participants"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."participants"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Participant can update own record" ON "public"."participants"
  FOR UPDATE
  TO "anon", "authenticated"
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."room_categories"
  FOR INSERT
  TO "anon", "authenticated"
  WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."room_categories"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."room_preferences"
  FOR INSERT
  TO "anon", "authenticated"
  WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."room_preferences"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Anyone can insert rooms" ON "public"."rooms"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Anyone can read rooms" ON "public"."rooms"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Update by the Room Host" ON "public"."rooms"
  FOR UPDATE
  TO "anon", "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.participants
  WHERE ((participants.room_id = rooms.room_id) AND (participants.user_id = auth.uid()) AND (participants.is_host = true)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.participants
  WHERE ((participants.room_id = rooms.room_id) AND (participants.user_id = auth.uid()) AND (participants.is_host = true)))));

CREATE POLICY "Anyone can insert swipes" ON "public"."swipes"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Anyone can read swipes" ON "public"."swipes"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE EVENT TRIGGER "ensure_rls"
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION "public"."rls_auto_enable"();

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."options";

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."participants";

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."rooms";

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."swipes";

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."submit_vote"(uuid, uuid, uuid, text) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."categories" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."options" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."participants" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."room_categories" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."room_preferences" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."rooms" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."swipes" TO "anon", "authenticated", "postgres", "service_role";

