create table if not exists public.book_places (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  book_slug text not null,
  name text not null,
  book_name text,
  kingdom_name text,
  place_type text,
  importance text,
  description text,
  notes text,
  photo_data text
);

create table if not exists public.book_kingdoms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  book_slug text not null,
  name text not null,
  display_order integer,
  flag_data text,
  map_data text,
  capital text,
  languages text,
  culture text,
  religion text,
  history text,
  government text,
  kingdom_type text,
  alliances text,
  enemies text,
  explored_in_book text,
  extra_info text
);

alter table public.book_places add column if not exists book_name text;
alter table public.book_places add column if not exists kingdom_name text;
alter table public.book_places add column if not exists place_type text;
alter table public.book_places add column if not exists importance text;
alter table public.book_places add column if not exists notes text;
alter table public.book_places add column if not exists photo_data text;
alter table public.book_places alter column description drop not null;

grant usage on schema public to anon, authenticated;
grant select on public.book_places to anon, authenticated;
grant select on public.book_kingdoms to anon, authenticated;
grant insert, update, delete on public.book_places to authenticated;
grant insert, update, delete on public.book_kingdoms to authenticated;

alter table public.book_places enable row level security;
alter table public.book_kingdoms enable row level security;

drop policy if exists "public read book_places" on public.book_places;
drop policy if exists "authenticated write book_places" on public.book_places;
drop policy if exists "authenticated insert book_places" on public.book_places;
drop policy if exists "authenticated update book_places" on public.book_places;
drop policy if exists "authenticated delete book_places" on public.book_places;

drop policy if exists "public read book_kingdoms" on public.book_kingdoms;
drop policy if exists "authenticated write book_kingdoms" on public.book_kingdoms;
drop policy if exists "authenticated insert book_kingdoms" on public.book_kingdoms;
drop policy if exists "authenticated update book_kingdoms" on public.book_kingdoms;
drop policy if exists "authenticated delete book_kingdoms" on public.book_kingdoms;

create policy "public read book_places"
  on public.book_places for select
  using (true);

create policy "authenticated insert book_places"
  on public.book_places for insert
  with check (auth.role() = 'authenticated');

create policy "authenticated update book_places"
  on public.book_places for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated delete book_places"
  on public.book_places for delete
  using (auth.role() = 'authenticated');

create policy "public read book_kingdoms"
  on public.book_kingdoms for select
  using (true);

create policy "authenticated insert book_kingdoms"
  on public.book_kingdoms for insert
  with check (auth.role() = 'authenticated');

create policy "authenticated update book_kingdoms"
  on public.book_kingdoms for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated delete book_kingdoms"
  on public.book_kingdoms for delete
  using (auth.role() = 'authenticated');
