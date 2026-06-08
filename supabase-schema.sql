create table if not exists public.filosofia_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  entry_date date not null,
  title text not null,
  body text not null
);

create table if not exists public.recommendation_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  entry_date date not null,
  category text not null,
  title text not null,
  rating text not null,
  photo_data text,
  body text not null
);

create table if not exists public.web_todo_tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  body text not null,
  category text not null default 'general',
  priority text not null default 'normal',
  done boolean not null default false
);

create table if not exists public.book_characters (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  book_slug text not null,
  name text not null,
  birth text,
  mbti text,
  likes text,
  favorite_color text,
  talents text,
  weaknesses text,
  description text not null,
  photo_data text
);

create table if not exists public.book_places (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  book_slug text not null,
  name text not null,
  book_name text,
  description text not null,
  notes text,
  photo_data text
);

create table if not exists public.book_synopsis (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  book_slug text not null,
  title text not null,
  type text not null,
  body text not null
);

alter table public.filosofia_entries enable row level security;
alter table public.recommendation_entries enable row level security;
alter table public.web_todo_tasks enable row level security;
alter table public.book_characters enable row level security;
alter table public.book_places enable row level security;
alter table public.book_synopsis enable row level security;

drop policy if exists "public read filosofia_entries" on public.filosofia_entries;
drop policy if exists "authenticated write filosofia_entries" on public.filosofia_entries;
drop policy if exists "public read recommendation_entries" on public.recommendation_entries;
drop policy if exists "authenticated write recommendation_entries" on public.recommendation_entries;
drop policy if exists "public read web_todo_tasks" on public.web_todo_tasks;
drop policy if exists "authenticated write web_todo_tasks" on public.web_todo_tasks;
drop policy if exists "public read book_characters" on public.book_characters;
drop policy if exists "authenticated write book_characters" on public.book_characters;
drop policy if exists "public read book_places" on public.book_places;
drop policy if exists "authenticated write book_places" on public.book_places;
drop policy if exists "public read book_synopsis" on public.book_synopsis;
drop policy if exists "authenticated write book_synopsis" on public.book_synopsis;

create policy "public read filosofia_entries"
  on public.filosofia_entries for select
  using (true);

create policy "authenticated write filosofia_entries"
  on public.filosofia_entries for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "public read recommendation_entries"
  on public.recommendation_entries for select
  using (true);

create policy "authenticated write recommendation_entries"
  on public.recommendation_entries for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "public read web_todo_tasks"
  on public.web_todo_tasks for select
  using (true);

create policy "authenticated write web_todo_tasks"
  on public.web_todo_tasks for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "public read book_characters"
  on public.book_characters for select
  using (true);

create policy "authenticated write book_characters"
  on public.book_characters for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "public read book_places"
  on public.book_places for select
  using (true);

create policy "authenticated write book_places"
  on public.book_places for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "public read book_synopsis"
  on public.book_synopsis for select
  using (true);

create policy "authenticated write book_synopsis"
  on public.book_synopsis for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
