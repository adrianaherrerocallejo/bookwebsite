create table if not exists public.book_characters (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  book_slug text not null,
  name text not null,
  birth text,
  nickname text,
  role_in_story text,
  mbti text,
  likes text,
  favorite_color text,
  favorite_food text,
  pet text,
  hates text,
  talents text,
  weaknesses text,
  fear text,
  dream text,
  secret text,
  quote text,
  description text,
  photo_data text
);

alter table public.book_characters add column if not exists birth text;
alter table public.book_characters add column if not exists nickname text;
alter table public.book_characters add column if not exists role_in_story text;
alter table public.book_characters add column if not exists mbti text;
alter table public.book_characters add column if not exists likes text;
alter table public.book_characters add column if not exists favorite_color text;
alter table public.book_characters add column if not exists favorite_food text;
alter table public.book_characters add column if not exists pet text;
alter table public.book_characters add column if not exists hates text;
alter table public.book_characters add column if not exists talents text;
alter table public.book_characters add column if not exists weaknesses text;
alter table public.book_characters add column if not exists fear text;
alter table public.book_characters add column if not exists dream text;
alter table public.book_characters add column if not exists secret text;
alter table public.book_characters add column if not exists quote text;
alter table public.book_characters add column if not exists description text;
alter table public.book_characters add column if not exists photo_data text;
alter table public.book_characters alter column description drop not null;

grant usage on schema public to anon, authenticated;
grant select on public.book_characters to anon, authenticated;
grant insert, update, delete on public.book_characters to authenticated;

alter table public.book_characters enable row level security;

drop policy if exists "public read book_characters" on public.book_characters;
drop policy if exists "authenticated write book_characters" on public.book_characters;
drop policy if exists "authenticated insert book_characters" on public.book_characters;
drop policy if exists "authenticated update book_characters" on public.book_characters;
drop policy if exists "authenticated delete book_characters" on public.book_characters;

create policy "public read book_characters"
  on public.book_characters for select
  using (true);

create policy "authenticated insert book_characters"
  on public.book_characters for insert
  with check (auth.role() = 'authenticated');

create policy "authenticated update book_characters"
  on public.book_characters for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated delete book_characters"
  on public.book_characters for delete
  using (auth.role() = 'authenticated');
