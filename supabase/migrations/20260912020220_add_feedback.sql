CREATE TABLE public.feedback(
    feedback_id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    user_name text,
    rating smallint not null check(rating between 1 and 5),
    message text,
    created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "Anyone can submit feedback"
on public.feedback
for insert
to anon, authenticated
with check (
    user_id is null
    or user_id = auth.uid()
);